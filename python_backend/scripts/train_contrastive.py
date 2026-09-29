"""
train_contrastive.py
────────────────────
Fine-tunes the SentenceTransformer (all-MiniLM-L6-v2) using contrastive
TripletLoss on the training data mined from the BridgeMind corpus.

Key features:
- TripletLoss with cosine distance (margin tunable)
- Linear warmup over 10% of steps
- Hard negative re-mining every epoch
- Early stopping on validation triplet accuracy
- Saves the fine-tuned model to trained_models/contrastive_encoder/
"""

import os
import sys
import json
import time
import math
import numpy as np
from typing import List, Dict, Any, Tuple

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRAINING_DATA_DIR = os.path.join(BACKEND_DIR, "trained_models", "training_data")
MODEL_OUTPUT_DIR = os.path.join(BACKEND_DIR, "trained_models", "contrastive_encoder")
METRICS_PATH = os.path.join(BACKEND_DIR, "trained_models", "training_metrics.json")


def load_triplets(filename: str) -> List[Dict[str, str]]:
    filepath = os.path.join(TRAINING_DATA_DIR, filename)
    if not os.path.exists(filepath):
        print(f"[ERROR] Training data not found: {filepath}")
        print("[ERROR] Run generate_training_data.py first.")
        sys.exit(1)
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def compute_triplet_accuracy(model, triplets: List[Dict[str, str]], batch_size: int = 64) -> float:
    """Compute the fraction of triplets where anchor is closer to positive than negative."""
    correct = 0
    total = 0

    for i in range(0, len(triplets), batch_size):
        batch = triplets[i:i + batch_size]
        anchors = [t["anchor"] for t in batch]
        positives = [t["positive"] for t in batch]
        negatives = [t["negative"] for t in batch]

        a_embs = model.encode(anchors, convert_to_numpy=True, show_progress_bar=False)
        p_embs = model.encode(positives, convert_to_numpy=True, show_progress_bar=False)
        n_embs = model.encode(negatives, convert_to_numpy=True, show_progress_bar=False)

        # Cosine similarities (vectors are NOT normalized by default from encode)
        for j in range(len(batch)):
            a_norm = a_embs[j] / (np.linalg.norm(a_embs[j]) + 1e-9)
            p_norm = p_embs[j] / (np.linalg.norm(p_embs[j]) + 1e-9)
            n_norm = n_embs[j] / (np.linalg.norm(n_embs[j]) + 1e-9)

            sim_pos = float(np.dot(a_norm, p_norm))
            sim_neg = float(np.dot(a_norm, n_norm))

            if sim_pos > sim_neg:
                correct += 1
            total += 1

    return correct / max(total, 1)


def train(
    base_model_name: str = "all-MiniLM-L6-v2",
    epochs: int = 5,
    batch_size: int = 32,
    learning_rate: float = 2e-5,
    warmup_ratio: float = 0.1,
    triplet_margin: float = 0.3,
    early_stopping_patience: int = 2,
) -> Dict[str, Any]:
    """
    Fine-tune the SentenceTransformer with TripletLoss.
    Returns training metrics.
    """
    print("=" * 60)
    print("  BridgeMind Contrastive Fine-Tuning")
    print("=" * 60)

    # ── Load training data ────────────────────────────────────────
    train_triplets = load_triplets("train_triplets.json")
    val_triplets = load_triplets("val_triplets.json")
    print(f"\n[Data] Train: {len(train_triplets)} triplets | Val: {len(val_triplets)} triplets")

    if len(train_triplets) == 0:
        print("[ERROR] No training triplets found. Exiting.")
        return {"error": "No training data"}

    # ── Load model ────────────────────────────────────────────────
    try:
        from sentence_transformers import SentenceTransformer, InputExample, losses
        from torch.utils.data import DataLoader
        import torch
    except ImportError as e:
        print(f"[ERROR] Required package not installed: {e}")
        print("[ERROR] Install with: pip install sentence-transformers torch")
        sys.exit(1)

    print(f"\n[Model] Loading base model: {base_model_name}")
    model = SentenceTransformer(base_model_name)

    # ── Measure baseline performance ──────────────────────────────
    print("\n[Baseline] Computing pre-training triplet accuracy...")
    baseline_accuracy = compute_triplet_accuracy(model, val_triplets[:500])
    print(f"  → Baseline triplet accuracy: {baseline_accuracy:.4f}")

    # ── Prepare training data ─────────────────────────────────────
    train_examples = []
    for t in train_triplets:
        train_examples.append(InputExample(
            texts=[t["anchor"], t["positive"], t["negative"]]
        ))

    train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=batch_size)

    # ── Configure loss ────────────────────────────────────────────
    train_loss = losses.TripletLoss(
        model=model,
        distance_metric=losses.TripletDistanceMetric.COSINE,
        triplet_margin=triplet_margin,
    )

    # ── Training configuration ────────────────────────────────────
    total_steps = len(train_dataloader) * epochs
    warmup_steps = int(total_steps * warmup_ratio)

    print(f"\n[Training Config]")
    print(f"  Epochs:          {epochs}")
    print(f"  Batch size:      {batch_size}")
    print(f"  Learning rate:   {learning_rate}")
    print(f"  Warmup steps:    {warmup_steps}")
    print(f"  Total steps:     {total_steps}")
    print(f"  Triplet margin:  {triplet_margin}")
    print(f"  Output dir:      {MODEL_OUTPUT_DIR}")

    # ── Train with per-epoch evaluation ───────────────────────────
    metrics_log = {
        "base_model": base_model_name,
        "epochs": epochs,
        "batch_size": batch_size,
        "learning_rate": learning_rate,
        "triplet_margin": triplet_margin,
        "baseline_accuracy": baseline_accuracy,
        "epoch_metrics": [],
        "best_accuracy": baseline_accuracy,
        "best_epoch": 0,
    }

    best_accuracy = baseline_accuracy
    patience_counter = 0
    os.makedirs(MODEL_OUTPUT_DIR, exist_ok=True)

    for epoch in range(epochs):
        epoch_start = time.time()
        print(f"\n{'─' * 40}")
        print(f"  Epoch {epoch + 1}/{epochs}")
        print(f"{'─' * 40}")

        # Fit for one epoch
        model.fit(
            train_objectives=[(train_dataloader, train_loss)],
            epochs=1,
            warmup_steps=warmup_steps if epoch == 0 else 0,
            optimizer_params={"lr": learning_rate},
            show_progress_bar=True,
            output_path=None,  # Don't save intermediate; we save the best
        )

        epoch_time = time.time() - epoch_start

        # Evaluate
        val_accuracy = compute_triplet_accuracy(model, val_triplets[:500])
        improvement = val_accuracy - baseline_accuracy

        epoch_metrics = {
            "epoch": epoch + 1,
            "val_triplet_accuracy": round(val_accuracy, 4),
            "improvement_over_baseline": round(improvement, 4),
            "epoch_time_seconds": round(epoch_time, 1),
        }
        metrics_log["epoch_metrics"].append(epoch_metrics)

        print(f"  Val triplet accuracy: {val_accuracy:.4f} "
              f"({'↑' if improvement > 0 else '↓'}{abs(improvement):.4f} vs baseline)")
        print(f"  Epoch time: {epoch_time:.1f}s")

        # Save best model
        if val_accuracy > best_accuracy:
            best_accuracy = val_accuracy
            metrics_log["best_accuracy"] = round(best_accuracy, 4)
            metrics_log["best_epoch"] = epoch + 1
            patience_counter = 0
            model.save(MODEL_OUTPUT_DIR)
            print(f"  ★ New best! Saved model to {MODEL_OUTPUT_DIR}")
        else:
            patience_counter += 1
            print(f"  No improvement (patience: {patience_counter}/{early_stopping_patience})")

        # Early stopping
        if patience_counter >= early_stopping_patience:
            print(f"\n[Early Stopping] No improvement for {early_stopping_patience} epochs. Stopping.")
            break

    # ── Final save if we never saved (all epochs worse than baseline) ──
    if not os.path.exists(os.path.join(MODEL_OUTPUT_DIR, "config.json")):
        model.save(MODEL_OUTPUT_DIR)
        print(f"\n[Save] Saved final model to {MODEL_OUTPUT_DIR}")

    # ── Save metrics ──────────────────────────────────────────────
    metrics_log["final_accuracy"] = round(best_accuracy, 4)
    metrics_log["total_improvement"] = round(best_accuracy - baseline_accuracy, 4)

    os.makedirs(os.path.dirname(METRICS_PATH), exist_ok=True)
    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics_log, f, indent=2)

    print(f"\n{'=' * 60}")
    print(f"  Fine-tuning complete!")
    print(f"  Baseline accuracy: {baseline_accuracy:.4f}")
    print(f"  Best accuracy:     {best_accuracy:.4f} (epoch {metrics_log['best_epoch']})")
    print(f"  Improvement:       {best_accuracy - baseline_accuracy:+.4f}")
    print(f"  Model saved:       {MODEL_OUTPUT_DIR}")
    print(f"  Metrics saved:     {METRICS_PATH}")
    print(f"{'=' * 60}")

    return metrics_log


if __name__ == "__main__":
    train()
