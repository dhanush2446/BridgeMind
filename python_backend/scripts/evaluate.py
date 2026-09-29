"""
evaluate.py
───────────
Standalone evaluation of the BridgeMind ML pipeline.
Measures retrieval quality using:
  - Triplet accuracy
  - MAP@5 (Mean Average Precision at 5)
  - NDCG@5 (Normalized Discounted Cumulative Gain at 5)
  - Cross-Domain Recall@5
  - Pattern Precision@5

Outputs a detailed evaluation report to trained_models/evaluation_report.json
"""

import os
import sys
import json
import time
import numpy as np
from typing import List, Dict, Any

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRAINING_DATA_DIR = os.path.join(BACKEND_DIR, "trained_models", "training_data")
MODEL_DIR = os.path.join(BACKEND_DIR, "trained_models", "contrastive_encoder")
WEIGHTS_PATH = os.path.join(BACKEND_DIR, "trained_models", "optimal_weights.json")
REPORT_PATH = os.path.join(BACKEND_DIR, "trained_models", "evaluation_report.json")
DB_PATH = os.path.join(BACKEND_DIR, "..", "src", "data", "analogy_engine.db")


def dcg_at_k(relevances: List[float], k: int) -> float:
    rel = relevances[:k]
    return sum((2**r - 1) / np.log2(i + 2) for i, r in enumerate(rel))


def ndcg_at_k(relevances: List[float], k: int) -> float:
    actual = dcg_at_k(relevances, k)
    ideal = dcg_at_k(sorted(relevances, reverse=True), k)
    return actual / ideal if ideal > 0 else 0.0


def ap_at_k(relevant: set, retrieved: List[str], k: int) -> float:
    hits = 0
    total = 0.0
    for i, r in enumerate(retrieved[:k]):
        if r in relevant:
            hits += 1
            total += hits / (i + 1)
    return total / min(len(relevant), k) if relevant else 0.0


def evaluate() -> Dict[str, Any]:
    print("=" * 60)
    print("  BridgeMind ML Pipeline — Full Evaluation")
    print("=" * 60)

    # ── Load eval queries ─────────────────────────────────────────
    eval_path = os.path.join(TRAINING_DATA_DIR, "eval_queries.json")
    if not os.path.exists(eval_path):
        print(f"[ERROR] Evaluation queries not found: {eval_path}")
        sys.exit(1)

    with open(eval_path, "r", encoding="utf-8") as f:
        eval_queries = json.load(f)
    print(f"\n[Data] {len(eval_queries)} evaluation queries loaded")

    # ── Load optimal weights ──────────────────────────────────────
    weights = {"faiss_weight": 0.6, "gin_weight": 0.4, "iddw_alpha": 0.35}
    if os.path.exists(WEIGHTS_PATH):
        with open(WEIGHTS_PATH, "r", encoding="utf-8") as f:
            w_data = json.load(f)
            weights = w_data.get("optimal_weights", weights)
        print(f"[Weights] Using optimized: FAISS={weights['faiss_weight']}, "
              f"GIN={weights['gin_weight']}, α={weights['iddw_alpha']}")
    else:
        print(f"[Weights] Using defaults: FAISS=0.6, GIN=0.4, α=0.35")

    # ── Load encoder ──────────────────────────────────────────────
    from models.contrastive_embeddings import ContrastiveStructuralEncoder, DOMAIN_GROUPS, GROUP_DISTANCES
    from models.gin_model import GraphIsomorphismNetwork
    from services.structural_extractor import extract_problem_structure

    if os.path.exists(os.path.join(MODEL_DIR, "config.json")):
        print(f"[Model] Loading fine-tuned model from {MODEL_DIR}")
        encoder = ContrastiveStructuralEncoder(model_name=MODEL_DIR)
        model_type = "fine-tuned"
    else:
        print("[Model] Using base model (no fine-tuned model found)")
        encoder = ContrastiveStructuralEncoder()
        model_type = "base"

    gin = GraphIsomorphismNetwork()

    # ── Load case studies ─────────────────────────────────────────
    import sqlite3
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, domain, title, problem, solution, abstract_pattern FROM case_studies")
    rows = cursor.fetchall()
    conn.close()

    studies = []
    texts = []
    for row in rows:
        study = {
            "id": row[0], "domain": row[1] or "General",
            "title": row[2] or "", "problem": row[3] or "",
            "solution": row[4] or "", "abstract_pattern": row[5] or "",
        }
        studies.append(study)
        texts.append(f"Pattern: {study['abstract_pattern']}. Domain: {study['domain']}. Problem: {study['problem']}")

    print(f"[Index] Encoding {len(studies)} case studies...")
    start = time.time()
    all_embs = encoder.encode_batch(texts)
    encoding_time = time.time() - start
    print(f"[Index] Encoded in {encoding_time:.1f}s")

    # GIN embeddings
    print("[Index] Computing GIN embeddings...")
    gin_embs = []
    for s in studies:
        struct = extract_problem_structure(s["problem"])
        G = gin.build_structural_graph(struct["elements"])
        gin_embs.append(gin.compute_gin_embedding(G))
    gin_embs = np.array(gin_embs, dtype=np.float32)

    study_id_map = {s["id"]: i for i, s in enumerate(studies)}

    # ── Triplet accuracy ──────────────────────────────────────────
    print("\n[Eval] Computing triplet accuracy...")
    val_path = os.path.join(TRAINING_DATA_DIR, "val_triplets.json")
    triplet_accuracy = None
    if os.path.exists(val_path):
        with open(val_path, "r", encoding="utf-8") as f:
            val_triplets = json.load(f)

        correct = 0
        for t in val_triplets:
            a = encoder.encode_text(t["anchor"])
            p = encoder.encode_text(t["positive"])
            n = encoder.encode_text(t["negative"])
            a_n = a / (np.linalg.norm(a) + 1e-9)
            p_n = p / (np.linalg.norm(p) + 1e-9)
            n_n = n / (np.linalg.norm(n) + 1e-9)
            if float(np.dot(a_n, p_n)) > float(np.dot(a_n, n_n)):
                correct += 1
        triplet_accuracy = correct / max(len(val_triplets), 1)
        print(f"  Triplet accuracy: {triplet_accuracy:.4f} ({correct}/{len(val_triplets)})")

    # ── Retrieval metrics ─────────────────────────────────────────
    print("\n[Eval] Computing retrieval metrics (MAP@5, NDCG@5, Cross-Domain, Pattern Prec)...")
    fw = weights["faiss_weight"]
    gw = weights["gin_weight"]
    alpha = weights["iddw_alpha"]

    query_embs = encoder.encode_batch([q["query_text"] for q in eval_queries])
    query_gin_embs = []
    for q in eval_queries:
        struct = extract_problem_structure(q["query_text"])
        G = gin.build_structural_graph(struct["elements"])
        query_gin_embs.append(gin.compute_gin_embedding(G))
    query_gin_embs = np.array(query_gin_embs, dtype=np.float32)

    ndcg_list = []
    map_list = []
    cross_domain_list = []
    pattern_prec_list = []
    per_query_results = []

    for qi, q in enumerate(eval_queries):
        q_emb = query_embs[qi]
        q_gin = query_gin_embs[qi]
        q_domain = q["query_domain"]
        q_pattern = q["query_pattern"]
        relevant_ids = set(q["relevant_ids"])

        faiss_scores = np.dot(all_embs, q_emb)
        gin_scores = np.dot(gin_embs, q_gin)
        combined = fw * faiss_scores + gw * gin_scores

        final = np.zeros_like(combined)
        for si in range(len(studies)):
            s_dom = studies[si]["domain"]
            if q_domain == s_dom:
                dist = 0.0
            else:
                g_a = DOMAIN_GROUPS.get(q_domain, 0)
                g_b = DOMAIN_GROUPS.get(s_dom, 0)
                if g_a == 0 or g_b == 0:
                    dist = 0.85
                elif g_a == g_b:
                    dist = 0.1
                else:
                    key = (min(g_a, g_b), max(g_a, g_b))
                    dist = GROUP_DISTANCES.get(key, 0.8)
            final[si] = combined[si] * (1.0 + alpha * dist)

        # Exclude self
        if q["query_id"] in study_id_map:
            final[study_id_map[q["query_id"]]] = -999

        top_idx = np.argsort(final)[::-1][:5]
        ret_ids = [studies[i]["id"] for i in top_idx]
        ret_domains = [studies[i]["domain"] for i in top_idx]
        ret_patterns = [studies[i]["abstract_pattern"] for i in top_idx]

        rels = []
        for i in top_idx:
            s = studies[i]
            if s["abstract_pattern"] == q_pattern:
                rels.append(2.0 if s["domain"] != q_domain else 1.0)
            else:
                rels.append(0.0)

        ndcg = ndcg_at_k(rels, 5)
        mAP = ap_at_k(relevant_ids, ret_ids, 5)
        cdr = sum(1 for d in ret_domains[:5] if d != q_domain) / 5.0
        pp = sum(1 for p in ret_patterns[:5] if p == q_pattern) / 5.0

        ndcg_list.append(ndcg)
        map_list.append(mAP)
        cross_domain_list.append(cdr)
        pattern_prec_list.append(pp)

        per_query_results.append({
            "query_id": q["query_id"],
            "query_domain": q_domain,
            "query_pattern": q_pattern,
            "ndcg_at_5": round(ndcg, 4),
            "map_at_5": round(mAP, 4),
            "cross_domain_recall_at_5": round(cdr, 4),
            "pattern_precision_at_5": round(pp, 4),
            "retrieved_ids": ret_ids,
            "retrieved_domains": ret_domains,
        })

    # ── Aggregate metrics ─────────────────────────────────────────
    metrics = {
        "model_type": model_type,
        "num_queries": len(eval_queries),
        "num_case_studies": len(studies),
        "weights_used": weights,
        "encoding_time_seconds": round(encoding_time, 2),
        "aggregate_metrics": {
            "triplet_accuracy": round(triplet_accuracy, 4) if triplet_accuracy is not None else None,
            "mean_ndcg_at_5": round(float(np.mean(ndcg_list)), 4),
            "mean_map_at_5": round(float(np.mean(map_list)), 4),
            "mean_cross_domain_recall_at_5": round(float(np.mean(cross_domain_list)), 4),
            "mean_pattern_precision_at_5": round(float(np.mean(pattern_prec_list)), 4),
            "median_ndcg_at_5": round(float(np.median(ndcg_list)), 4),
            "std_ndcg_at_5": round(float(np.std(ndcg_list)), 4),
        },
        "per_domain_metrics": {},
        "per_query_details": per_query_results,
    }

    # Per-domain breakdown
    from collections import defaultdict
    domain_ndcg = defaultdict(list)
    for pq in per_query_results:
        domain_ndcg[pq["query_domain"]].append(pq["ndcg_at_5"])
    for domain, scores in sorted(domain_ndcg.items()):
        metrics["per_domain_metrics"][domain] = {
            "num_queries": len(scores),
            "mean_ndcg_at_5": round(float(np.mean(scores)), 4),
        }

    # ── Target comparison ─────────────────────────────────────────
    targets = {
        "triplet_accuracy": 0.85,
        "mean_ndcg_at_5": 0.75,
        "mean_map_at_5": 0.70,
        "mean_cross_domain_recall_at_5": 0.60,
        "mean_pattern_precision_at_5": 0.70,
    }
    meets_targets = {}
    agg = metrics["aggregate_metrics"]
    for metric_name, target in targets.items():
        actual = agg.get(metric_name)
        if actual is not None:
            meets_targets[metric_name] = {
                "target": target,
                "actual": actual,
                "met": actual >= target,
            }
    metrics["target_comparison"] = meets_targets

    # ── Save ──────────────────────────────────────────────────────
    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print(f"\n{'=' * 60}")
    print(f"  Evaluation Results")
    print(f"{'=' * 60}")
    if triplet_accuracy is not None:
        status = "✓" if triplet_accuracy >= 0.85 else "✗"
        print(f"  {status} Triplet Accuracy:     {triplet_accuracy:.4f}  (target ≥ 0.85)")
    print(f"  {'✓' if agg['mean_ndcg_at_5'] >= 0.75 else '✗'} NDCG@5:              {agg['mean_ndcg_at_5']:.4f}  (target ≥ 0.75)")
    print(f"  {'✓' if agg['mean_map_at_5'] >= 0.70 else '✗'} MAP@5:               {agg['mean_map_at_5']:.4f}  (target ≥ 0.70)")
    print(f"  {'✓' if agg['mean_cross_domain_recall_at_5'] >= 0.60 else '✗'} Cross-Domain R@5:    {agg['mean_cross_domain_recall_at_5']:.4f}  (target ≥ 0.60)")
    print(f"  {'✓' if agg['mean_pattern_precision_at_5'] >= 0.70 else '✗'} Pattern Precision@5: {agg['mean_pattern_precision_at_5']:.4f}  (target ≥ 0.70)")
    print(f"\n  Report saved to: {REPORT_PATH}")
    print(f"{'=' * 60}")

    return metrics


if __name__ == "__main__":
    evaluate()
