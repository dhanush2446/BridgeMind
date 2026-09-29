"""
optimize_weights.py
───────────────────
Grid search over the scoring weights used in the analogy pipeline:
  - faiss_weight: weight of embedding similarity in combined score
  - gin_weight:   weight of graph topology similarity (= 1 - faiss_weight)
  - iddw_alpha:   far-domain boost strength

Optimizes NDCG@5 on evaluation queries, where relevance is defined as
same abstract pattern (with cross-domain bonus).

Saves optimal weights to trained_models/optimal_weights.json
"""

import os
import sys
import json
import time
import itertools
import numpy as np
from typing import List, Dict, Any, Tuple

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRAINING_DATA_DIR = os.path.join(BACKEND_DIR, "trained_models", "training_data")
MODEL_DIR = os.path.join(BACKEND_DIR, "trained_models", "contrastive_encoder")
WEIGHTS_PATH = os.path.join(BACKEND_DIR, "trained_models", "optimal_weights.json")
DB_PATH = os.path.join(BACKEND_DIR, "..", "src", "data", "analogy_engine.db")


def dcg_at_k(relevances: List[float], k: int) -> float:
    """Compute Discounted Cumulative Gain at rank k."""
    rel = relevances[:k]
    gains = [(2**r - 1) / np.log2(i + 2) for i, r in enumerate(rel)]
    return sum(gains)


def ndcg_at_k(relevances: List[float], k: int) -> float:
    """Compute Normalized DCG at rank k."""
    actual_dcg = dcg_at_k(relevances, k)
    ideal_rels = sorted(relevances, reverse=True)
    ideal_dcg = dcg_at_k(ideal_rels, k)
    return actual_dcg / ideal_dcg if ideal_dcg > 0 else 0.0


def average_precision_at_k(relevant_ids: set, retrieved_ids: List[str], k: int) -> float:
    """Compute Average Precision at rank k."""
    hits = 0
    sum_precisions = 0.0
    for i, rid in enumerate(retrieved_ids[:k]):
        if rid in relevant_ids:
            hits += 1
            sum_precisions += hits / (i + 1)
    return sum_precisions / min(len(relevant_ids), k) if relevant_ids else 0.0


def cross_domain_recall_at_k(query_domain: str, retrieved_domains: List[str], k: int) -> float:
    """Fraction of top-k results from different domains than the query."""
    top_domains = retrieved_domains[:k]
    if not top_domains:
        return 0.0
    cross = sum(1 for d in top_domains if d != query_domain)
    return cross / len(top_domains)


def optimize(
    faiss_weight_range: List[float] = None,
    iddw_alpha_range: List[float] = None,
) -> Dict[str, Any]:
    """
    Grid search over scoring weights to maximize NDCG@5.
    """
    print("=" * 60)
    print("  BridgeMind Scoring Weight Optimization")
    print("=" * 60)

    # Default search ranges
    if faiss_weight_range is None:
        faiss_weight_range = [0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75]
    if iddw_alpha_range is None:
        iddw_alpha_range = [0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50]

    # ── Load evaluation queries ───────────────────────────────────
    eval_path = os.path.join(TRAINING_DATA_DIR, "eval_queries.json")
    if not os.path.exists(eval_path):
        print(f"[ERROR] Evaluation queries not found: {eval_path}")
        print("[ERROR] Run generate_training_data.py first.")
        sys.exit(1)

    with open(eval_path, "r", encoding="utf-8") as f:
        eval_queries = json.load(f)
    print(f"\n[Data] Loaded {len(eval_queries)} evaluation queries")

    # ── Load encoder ──────────────────────────────────────────────
    try:
        from models.contrastive_embeddings import ContrastiveStructuralEncoder, DOMAIN_GROUPS, GROUP_DISTANCES
        from models.gin_model import GraphIsomorphismNetwork
        from services.structural_extractor import extract_problem_structure
    except ImportError as e:
        print(f"[ERROR] Could not import models: {e}")
        sys.exit(1)

    # Use the fine-tuned encoder if available
    if os.path.exists(os.path.join(MODEL_DIR, "config.json")):
        print(f"[Model] Loading fine-tuned model from {MODEL_DIR}")
        encoder = ContrastiveStructuralEncoder(model_name=MODEL_DIR)
    else:
        print("[Model] No fine-tuned model found, using base model")
        encoder = ContrastiveStructuralEncoder()

    gin = GraphIsomorphismNetwork()

    # ── Load all case studies and build index ─────────────────────
    import sqlite3
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, domain, title, problem, solution, abstract_pattern FROM case_studies")
    rows = cursor.fetchall()
    conn.close()

    studies = []
    texts_for_embedding = []
    for row in rows:
        study = {
            "id": row[0],
            "domain": row[1] or "General",
            "title": row[2] or "",
            "problem": row[3] or "",
            "solution": row[4] or "",
            "abstract_pattern": row[5] or "",
        }
        studies.append(study)
        texts_for_embedding.append(
            f"Pattern: {study['abstract_pattern']}. Domain: {study['domain']}. Problem: {study['problem']}"
        )

    print(f"[Index] Encoding {len(studies)} case studies...")
    all_embeddings = encoder.encode_batch(texts_for_embedding)
    print(f"[Index] Embeddings shape: {all_embeddings.shape}")

    # Pre-compute GIN embeddings for all case studies
    print("[Index] Pre-computing GIN embeddings...")
    gin_embeddings = []
    for study in studies:
        struct = extract_problem_structure(study["problem"])
        G = gin.build_structural_graph(struct["elements"])
        gin_emb = gin.compute_gin_embedding(G)
        gin_embeddings.append(gin_emb)
    gin_embeddings = np.array(gin_embeddings, dtype=np.float32)

    # ── Pre-compute query embeddings & structures ─────────────────
    print("[Queries] Pre-computing query embeddings...")
    query_embeddings = encoder.encode_batch([q["query_text"] for q in eval_queries])

    query_gin_embeddings = []
    query_structures = []
    for q in eval_queries:
        struct = extract_problem_structure(q["query_text"])
        query_structures.append(struct)
        G = gin.build_structural_graph(struct["elements"])
        gin_emb = gin.compute_gin_embedding(G)
        query_gin_embeddings.append(gin_emb)
    query_gin_embeddings = np.array(query_gin_embeddings, dtype=np.float32)

    # ── Grid search ───────────────────────────────────────────────
    total_combos = len(faiss_weight_range) * len(iddw_alpha_range)
    print(f"\n[Grid Search] Testing {total_combos} weight combinations...")
    print(f"  FAISS weight range: {faiss_weight_range}")
    print(f"  IDDW alpha range:   {iddw_alpha_range}")

    best_ndcg = -1.0
    best_params = {"faiss_weight": 0.6, "gin_weight": 0.4, "iddw_alpha": 0.35}
    all_results = []

    study_id_to_idx = {s["id"]: i for i, s in enumerate(studies)}

    start_time = time.time()
    combo_count = 0

    for faiss_w in faiss_weight_range:
        gin_w = round(1.0 - faiss_w, 2)

        for alpha in iddw_alpha_range:
            combo_count += 1

            # Evaluate this parameter combination
            ndcg_scores = []
            map_scores = []
            cross_domain_scores = []
            pattern_precisions = []

            for qi, q in enumerate(eval_queries):
                q_emb = query_embeddings[qi]
                q_gin_emb = query_gin_embeddings[qi]
                q_domain = q["query_domain"]
                q_pattern = q["query_pattern"]
                relevant_ids = set(q["relevant_ids"])

                # Compute FAISS-style cosine similarities
                faiss_scores = np.dot(all_embeddings, q_emb)

                # Compute GIN similarities
                gin_scores = np.dot(gin_embeddings, q_gin_emb)

                # Combined score
                combined = faiss_w * faiss_scores + gin_w * gin_scores

                # Apply IDDW
                final_scores = np.zeros_like(combined)
                for si in range(len(studies)):
                    s_domain = studies[si]["domain"]
                    if q_domain == s_domain:
                        dist = 0.0
                    else:
                        from models.contrastive_embeddings import DOMAIN_GROUPS, GROUP_DISTANCES
                        g_a = DOMAIN_GROUPS.get(q_domain, 0)
                        g_b = DOMAIN_GROUPS.get(s_domain, 0)
                        if g_a == 0 or g_b == 0:
                            dist = 0.85
                        elif g_a == g_b:
                            dist = 0.1
                        else:
                            key = (min(g_a, g_b), max(g_a, g_b))
                            dist = GROUP_DISTANCES.get(key, 0.8)
                    final_scores[si] = combined[si] * (1.0 + alpha * dist)

                # Exclude the query itself from results
                if q["query_id"] in study_id_to_idx:
                    final_scores[study_id_to_idx[q["query_id"]]] = -999

                # Get top-5 results
                top_indices = np.argsort(final_scores)[::-1][:5]
                retrieved_ids = [studies[i]["id"] for i in top_indices]
                retrieved_domains = [studies[i]["domain"] for i in top_indices]
                retrieved_patterns = [studies[i]["abstract_pattern"] for i in top_indices]

                # Compute relevance labels: 2 for same pattern + cross domain, 1 for same pattern, 0 for different
                relevances = []
                for i in top_indices:
                    s = studies[i]
                    if s["abstract_pattern"] == q_pattern:
                        if s["domain"] != q_domain:
                            relevances.append(2.0)  # Best: same pattern, different domain
                        else:
                            relevances.append(1.0)  # Good: same pattern, same domain
                    else:
                        relevances.append(0.0)

                ndcg_scores.append(ndcg_at_k(relevances, 5))
                map_scores.append(average_precision_at_k(relevant_ids, retrieved_ids, 5))
                cross_domain_scores.append(cross_domain_recall_at_k(q_domain, retrieved_domains, 5))
                pattern_precisions.append(
                    sum(1 for p in retrieved_patterns if p == q_pattern) / 5.0
                )

            mean_ndcg = float(np.mean(ndcg_scores))
            mean_map = float(np.mean(map_scores))
            mean_cross_domain = float(np.mean(cross_domain_scores))
            mean_pattern_prec = float(np.mean(pattern_precisions))

            result = {
                "faiss_weight": faiss_w,
                "gin_weight": gin_w,
                "iddw_alpha": alpha,
                "ndcg_at_5": round(mean_ndcg, 4),
                "map_at_5": round(mean_map, 4),
                "cross_domain_recall_at_5": round(mean_cross_domain, 4),
                "pattern_precision_at_5": round(mean_pattern_prec, 4),
            }
            all_results.append(result)

            if mean_ndcg > best_ndcg:
                best_ndcg = mean_ndcg
                best_params = {
                    "faiss_weight": faiss_w,
                    "gin_weight": gin_w,
                    "iddw_alpha": alpha,
                }

            if combo_count % 10 == 0 or combo_count == total_combos:
                elapsed = time.time() - start_time
                print(f"  [{combo_count}/{total_combos}] Best NDCG@5: {best_ndcg:.4f} "
                      f"(fw={best_params['faiss_weight']}, gw={best_params['gin_weight']}, "
                      f"α={best_params['iddw_alpha']}) [{elapsed:.1f}s]")

    # ── Find the best result's full metrics ───────────────────────
    best_result = None
    for r in all_results:
        if (r["faiss_weight"] == best_params["faiss_weight"]
            and r["iddw_alpha"] == best_params["iddw_alpha"]):
            best_result = r
            break

    # ── Save results ──────────────────────────────────────────────
    output = {
        "optimal_weights": best_params,
        "best_metrics": best_result,
        "search_space": {
            "faiss_weight_range": faiss_weight_range,
            "iddw_alpha_range": iddw_alpha_range,
            "total_combinations": total_combos,
        },
        "all_results": sorted(all_results, key=lambda x: x["ndcg_at_5"], reverse=True),
    }

    os.makedirs(os.path.dirname(WEIGHTS_PATH), exist_ok=True)
    with open(WEIGHTS_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

    print(f"\n{'=' * 60}")
    print(f"  Weight optimization complete!")
    print(f"  Best NDCG@5:     {best_result['ndcg_at_5']:.4f}")
    print(f"  Best MAP@5:      {best_result['map_at_5']:.4f}")
    print(f"  Cross-Domain:    {best_result['cross_domain_recall_at_5']:.4f}")
    print(f"  Pattern Prec:    {best_result['pattern_precision_at_5']:.4f}")
    print(f"  Optimal weights: FAISS={best_params['faiss_weight']}, "
          f"GIN={best_params['gin_weight']}, α={best_params['iddw_alpha']}")
    print(f"  Saved to:        {WEIGHTS_PATH}")
    print(f"{'=' * 60}")

    return output


if __name__ == "__main__":
    optimize()
