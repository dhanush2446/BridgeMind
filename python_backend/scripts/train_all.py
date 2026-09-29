"""
train_all.py
────────────
Master orchestrator that runs the full BridgeMind training pipeline:

  1. Generate training data (contrastive triplets, GIN pairs, eval queries)
  2. Fine-tune contrastive encoder (SentenceTransformer + TripletLoss)
  3. Rebuild FAISS index with fine-tuned embeddings
  4. Optimize scoring weights (grid search over FAISS/GIN/IDDW)
  5. Evaluate with MAP@5, NDCG@5, cross-domain recall
  6. Print final metrics report

Usage:
  cd python_backend
  python scripts/train_all.py
"""

import os
import sys
import json
import time
import sqlite3
import numpy as np

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRAINED_DIR = os.path.join(BACKEND_DIR, "trained_models")
FAISS_INDEX_PATH = os.path.join(TRAINED_DIR, "faiss_index.bin")
FAISS_ITEMS_PATH = os.path.join(TRAINED_DIR, "faiss_items.json")
MODEL_DIR = os.path.join(TRAINED_DIR, "contrastive_encoder")
DB_PATH = os.path.join(BACKEND_DIR, "..", "src", "data", "analogy_engine.db")


def step_header(step_num: int, title: str):
    print(f"\n{'╔' + '═' * 58 + '╗'}")
    print(f"{'║'} Step {step_num}: {title:<50} {'║'}")
    print(f"{'╚' + '═' * 58 + '╝'}")


def main():
    total_start = time.time()
    print()
    print("████████████████████████████████████████████████████████████")
    print("██                                                      ██")
    print("██  BridgeMind — Full ML Training Pipeline               ██")
    print("██  Training contrastive encoder, optimizing weights,    ██")
    print("██  building FAISS index, and evaluating metrics.        ██")
    print("██                                                      ██")
    print("████████████████████████████████████████████████████████████")

    os.makedirs(TRAINED_DIR, exist_ok=True)

    # ══════════════════════════════════════════════════════════════
    #  STEP 1: Generate Training Data
    # ══════════════════════════════════════════════════════════════
    step_header(1, "Generate Training Data")
    from scripts.generate_training_data import main as generate_data
    data_meta = generate_data()
    print(f"\n  ✓ Training data generated: {data_meta['train_triplets']} train, "
          f"{data_meta['val_triplets']} val, {data_meta['eval_queries']} eval queries")

    # ══════════════════════════════════════════════════════════════
    #  STEP 2: Fine-Tune Contrastive Encoder
    # ══════════════════════════════════════════════════════════════
    step_header(2, "Fine-Tune Contrastive Encoder")
    try:
        from scripts.train_contrastive import train as train_contrastive
        train_metrics = train_contrastive(
            base_model_name="all-MiniLM-L6-v2",
            epochs=5,
            batch_size=32,
            learning_rate=2e-5,
            warmup_ratio=0.1,
            triplet_margin=0.3,
            early_stopping_patience=2,
        )
        print(f"\n  ✓ Fine-tuning complete. "
              f"Baseline: {train_metrics.get('baseline_accuracy', 'N/A'):.4f} → "
              f"Best: {train_metrics.get('best_accuracy', 'N/A'):.4f}")
    except Exception as e:
        print(f"\n  ⚠ Fine-tuning failed: {e}")
        print("  Continuing with base model...")
        train_metrics = {"error": str(e)}

    # ══════════════════════════════════════════════════════════════
    #  STEP 3: Rebuild FAISS Index with Fine-Tuned Embeddings
    # ══════════════════════════════════════════════════════════════
    step_header(3, "Rebuild FAISS Index")
    try:
        from models.contrastive_embeddings import ContrastiveStructuralEncoder

        # Load fine-tuned model if available
        if os.path.exists(os.path.join(MODEL_DIR, "config.json")):
            print("  Loading fine-tuned encoder...")
            encoder = ContrastiveStructuralEncoder(model_name=MODEL_DIR)
        else:
            print("  Loading base encoder...")
            encoder = ContrastiveStructuralEncoder()

        # Load all case studies
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT id, domain, title, problem, solution, abstract_pattern, url FROM case_studies")
        rows = cursor.fetchall()
        conn.close()

        items = []
        texts = []
        for row in rows:
            item = {
                "id": row[0], "domain": row[1], "title": row[2],
                "problem": row[3], "solution": row[4],
                "abstract_pattern": row[5],
                "url": row[6] if row[6] else f"https://scholar.google.com/scholar?q={row[2]}",
            }
            items.append(item)
            texts.append(f"Pattern: {item['abstract_pattern']}. Domain: {item['domain']}. Problem: {item['problem']}")

        print(f"  Encoding {len(items)} case studies...")
        embeddings = encoder.encode_batch(texts)
        print(f"  Embeddings shape: {embeddings.shape}")

        # Save FAISS index
        try:
            import faiss
            index = faiss.IndexFlatIP(embeddings.shape[1])
            index.add(embeddings.astype(np.float32))
            faiss.write_index(index, FAISS_INDEX_PATH)
            print(f"  ✓ FAISS index saved: {FAISS_INDEX_PATH} ({index.ntotal} vectors)")
        except ImportError:
            # Save as numpy fallback
            np_path = os.path.join(TRAINED_DIR, "embeddings_matrix.npy")
            np.save(np_path, embeddings)
            print(f"  ✓ Embeddings matrix saved: {np_path} (faiss not installed, using numpy fallback)")

        # Save items metadata
        with open(FAISS_ITEMS_PATH, "w", encoding="utf-8") as f:
            json.dump(items, f, indent=2, ensure_ascii=False)
        print(f"  ✓ Items metadata saved: {FAISS_ITEMS_PATH}")

    except Exception as e:
        print(f"\n  ⚠ FAISS index build failed: {e}")

    # ══════════════════════════════════════════════════════════════
    #  STEP 4: Optimize Scoring Weights
    # ══════════════════════════════════════════════════════════════
    step_header(4, "Optimize Scoring Weights")
    try:
        from scripts.optimize_weights import optimize
        weight_results = optimize()
        optimal = weight_results["optimal_weights"]
        print(f"\n  ✓ Optimal weights: FAISS={optimal['faiss_weight']}, "
              f"GIN={optimal['gin_weight']}, α={optimal['iddw_alpha']}")
    except Exception as e:
        print(f"\n  ⚠ Weight optimization failed: {e}")
        weight_results = {"error": str(e)}

    # ══════════════════════════════════════════════════════════════
    #  STEP 5: Full Evaluation
    # ══════════════════════════════════════════════════════════════
    step_header(5, "Full Evaluation")
    try:
        from scripts.evaluate import evaluate
        eval_results = evaluate()
    except Exception as e:
        print(f"\n  ⚠ Evaluation failed: {e}")
        eval_results = {"error": str(e)}

    # ══════════════════════════════════════════════════════════════
    #  FINAL REPORT
    # ══════════════════════════════════════════════════════════════
    total_time = time.time() - total_start
    print()
    print("████████████████████████████████████████████████████████████")
    print("██                                                      ██")
    print("██  Training Pipeline Complete                           ██")
    print("██                                                      ██")
    print("████████████████████████████████████████████████████████████")
    print(f"\n  Total time: {total_time:.1f}s ({total_time/60:.1f} min)")
    print(f"\n  Outputs in: {TRAINED_DIR}")
    print(f"    ├── contrastive_encoder/    (fine-tuned SentenceTransformer)")
    print(f"    ├── training_data/          (triplets, eval queries)")

    if os.path.exists(FAISS_INDEX_PATH):
        size_mb = os.path.getsize(FAISS_INDEX_PATH) / (1024 * 1024)
        print(f"    ├── faiss_index.bin         ({size_mb:.1f} MB)")
    elif os.path.exists(os.path.join(TRAINED_DIR, "embeddings_matrix.npy")):
        size_mb = os.path.getsize(os.path.join(TRAINED_DIR, "embeddings_matrix.npy")) / (1024 * 1024)
        print(f"    ├── embeddings_matrix.npy   ({size_mb:.1f} MB)")

    print(f"    ├── optimal_weights.json")
    print(f"    ├── training_metrics.json")
    print(f"    └── evaluation_report.json")

    if isinstance(eval_results, dict) and "aggregate_metrics" in eval_results:
        agg = eval_results["aggregate_metrics"]
        print(f"\n  Final Metrics:")
        ta = agg.get("triplet_accuracy")
        if ta is not None:
            print(f"    Triplet Accuracy:     {ta:.4f}")
        print(f"    NDCG@5:              {agg.get('mean_ndcg_at_5', 'N/A')}")
        print(f"    MAP@5:               {agg.get('mean_map_at_5', 'N/A')}")
        print(f"    Cross-Domain R@5:    {agg.get('mean_cross_domain_recall_at_5', 'N/A')}")
        print(f"    Pattern Prec@5:      {agg.get('mean_pattern_precision_at_5', 'N/A')}")

    print()
    return eval_results


if __name__ == "__main__":
    main()
