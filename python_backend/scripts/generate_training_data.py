"""
generate_training_data.py
─────────────────────────
Mines the SQLite analogy_engine.db to produce:

1. Contrastive Triplets  (anchor, positive, negative)  → fine-tune SentenceTransformer
2. GIN Calibration Pairs  (struct_A, struct_B, label)   → optional GIN tuning
3. Weight Optimization Queries  (query, candidates, expected_rank) → grid search

All output is saved as JSON in trained_models/training_data/
"""

import os
import sys
import json
import random
import sqlite3
import re
from collections import defaultdict
from typing import List, Dict, Any, Tuple

# Add parent to path so we can import from services/models
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.structural_extractor import extract_problem_structure


# ── Paths ────────────────────────────────────────────────────────────────────
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BACKEND_DIR, "..", "src", "data", "analogy_engine.db")
OUTPUT_DIR = os.path.join(BACKEND_DIR, "trained_models", "training_data")


def load_case_studies() -> List[Dict[str, Any]]:
    """Load all case studies from the SQLite database."""
    if not os.path.exists(DB_PATH):
        print(f"[ERROR] Database not found at {DB_PATH}")
        sys.exit(1)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, domain, title, problem, solution, abstract_pattern, url FROM case_studies"
    )
    rows = cursor.fetchall()
    conn.close()

    studies = []
    for row in rows:
        studies.append({
            "id": row[0],
            "domain": row[1] or "General",
            "title": row[2] or "",
            "problem": row[3] or "",
            "solution": row[4] or "",
            "abstract_pattern": row[5] or "",
            "url": row[6] or "",
        })
    return studies


def build_structural_text(study: Dict[str, Any]) -> str:
    """Build the text representation used for embedding — same format as the serving pipeline."""
    pattern = study.get("abstract_pattern", "")
    domain = study.get("domain", "")
    problem = study.get("problem", "")
    return f"Pattern: {pattern}. Domain: {domain}. Problem: {problem}"


def compute_keyword_overlap(text_a: str, text_b: str) -> float:
    """Jaccard keyword overlap between two texts (for hard negative mining)."""
    stop = {"the", "and", "for", "are", "was", "that", "this", "with", "from",
            "have", "been", "has", "its", "can", "will", "which", "their", "more",
            "also", "into", "than", "other", "not", "but", "our", "such", "these"}
    words_a = set(re.findall(r'\b[a-z]{3,}\b', text_a.lower())) - stop
    words_b = set(re.findall(r'\b[a-z]{3,}\b', text_b.lower())) - stop
    if not words_a or not words_b:
        return 0.0
    return len(words_a & words_b) / len(words_a | words_b)


def generate_contrastive_triplets(
    studies: List[Dict[str, Any]],
    max_triplets: int = 5000,
    hard_negative_ratio: float = 0.5,
) -> List[Dict[str, str]]:
    """
    Generate (anchor, positive, negative) triplets:
    - Positive: same abstract_pattern, different domain
    - Negative: different abstract_pattern
    - Hard negatives: different pattern but high keyword overlap with anchor
    """
    print(f"\n[Training Data] Generating contrastive triplets from {len(studies)} case studies...")

    # Group by abstract_pattern
    pattern_groups: Dict[str, List[Dict]] = defaultdict(list)
    for s in studies:
        pat = s["abstract_pattern"].strip()
        if pat:
            pattern_groups[pat].append(s)

    # Filter to patterns with at least 2 members
    valid_patterns = {p: members for p, members in pattern_groups.items() if len(members) >= 2}
    all_patterns = list(valid_patterns.keys())

    print(f"  → {len(valid_patterns)} patterns with ≥2 members, {len(all_patterns)} total patterns")

    if len(all_patterns) < 2:
        print("[WARNING] Need at least 2 distinct patterns to generate triplets")
        return []

    triplets = []
    attempts = 0
    max_attempts = max_triplets * 10

    while len(triplets) < max_triplets and attempts < max_attempts:
        attempts += 1

        # Pick anchor pattern
        anchor_pattern = random.choice(all_patterns)
        anchor_members = valid_patterns[anchor_pattern]
        anchor = random.choice(anchor_members)

        # Pick positive: same pattern, prefer different domain
        positive_candidates = [
            m for m in anchor_members
            if m["id"] != anchor["id"]
        ]
        # Prefer cross-domain positives
        cross_domain = [m for m in positive_candidates if m["domain"] != anchor["domain"]]
        if cross_domain:
            positive = random.choice(cross_domain)
        elif positive_candidates:
            positive = random.choice(positive_candidates)
        else:
            continue

        # Pick negative: different pattern
        neg_pattern = random.choice([p for p in all_patterns if p != anchor_pattern])
        neg_candidates = valid_patterns[neg_pattern]

        # Hard negative mining: pick negatives with highest keyword overlap
        use_hard = random.random() < hard_negative_ratio
        if use_hard and len(neg_candidates) > 1:
            anchor_text = build_structural_text(anchor)
            overlaps = [
                (compute_keyword_overlap(anchor_text, build_structural_text(n)), n)
                for n in neg_candidates
            ]
            overlaps.sort(key=lambda x: x[0], reverse=True)
            negative = overlaps[0][1]
        else:
            negative = random.choice(neg_candidates)

        triplets.append({
            "anchor": build_structural_text(anchor),
            "positive": build_structural_text(positive),
            "negative": build_structural_text(negative),
            "anchor_pattern": anchor_pattern,
            "positive_pattern": anchor_pattern,
            "negative_pattern": neg_pattern,
            "anchor_domain": anchor["domain"],
            "positive_domain": positive["domain"],
            "negative_domain": negative["domain"],
            "is_cross_domain_positive": anchor["domain"] != positive["domain"],
            "is_hard_negative": use_hard,
        })

    print(f"  → Generated {len(triplets)} triplets ({sum(1 for t in triplets if t['is_hard_negative'])} hard negatives)")
    print(f"  → Cross-domain positives: {sum(1 for t in triplets if t['is_cross_domain_positive'])}/{len(triplets)}")

    return triplets


def generate_gin_calibration_pairs(
    studies: List[Dict[str, Any]],
    max_pairs: int = 2000,
) -> List[Dict[str, Any]]:
    """
    Generate (structure_A, structure_B, label) pairs for GIN calibration:
    - Same pattern → label closer to 1.0
    - Different pattern → label closer to 0.0
    """
    print(f"\n[Training Data] Generating GIN calibration pairs...")

    pattern_groups: Dict[str, List[Dict]] = defaultdict(list)
    for s in studies:
        pat = s["abstract_pattern"].strip()
        if pat:
            pattern_groups[pat].append(s)

    valid_patterns = {p: m for p, m in pattern_groups.items() if len(m) >= 2}
    all_patterns = list(valid_patterns.keys())

    pairs = []
    # Positive pairs: same pattern
    for pattern, members in valid_patterns.items():
        for i in range(min(len(members) - 1, max_pairs // (2 * len(valid_patterns)))):
            a = random.choice(members)
            b = random.choice([m for m in members if m["id"] != a["id"]])
            cross_domain = 1.0 if a["domain"] != b["domain"] else 0.0
            pairs.append({
                "text_a": a["problem"],
                "text_b": b["problem"],
                "label": 0.85 + 0.15 * cross_domain,  # 0.85 for same-domain, 1.0 for cross-domain
                "pattern_a": pattern,
                "pattern_b": pattern,
                "same_pattern": True,
            })

    # Negative pairs: different pattern
    neg_target = len(pairs)
    for _ in range(neg_target):
        p1, p2 = random.sample(all_patterns, 2)
        a = random.choice(valid_patterns[p1])
        b = random.choice(valid_patterns[p2])
        pairs.append({
            "text_a": a["problem"],
            "text_b": b["problem"],
            "label": 0.1,
            "pattern_a": p1,
            "pattern_b": p2,
            "same_pattern": False,
        })

    random.shuffle(pairs)
    pairs = pairs[:max_pairs]
    print(f"  → Generated {len(pairs)} GIN calibration pairs")
    return pairs


def generate_eval_queries(
    studies: List[Dict[str, Any]],
    num_queries: int = 50,
) -> List[Dict[str, Any]]:
    """
    Generate evaluation queries with expected relevant results.
    Each query is a case study, and the expected results are other case studies
    with the same abstract pattern (preferably from different domains).
    """
    print(f"\n[Training Data] Generating evaluation queries...")

    pattern_groups: Dict[str, List[Dict]] = defaultdict(list)
    for s in studies:
        pat = s["abstract_pattern"].strip()
        if pat:
            pattern_groups[pat].append(s)

    valid_patterns = {p: m for p, m in pattern_groups.items() if len(m) >= 3}

    eval_queries = []
    patterns_used = list(valid_patterns.keys())
    random.shuffle(patterns_used)

    for pattern in patterns_used[:num_queries]:
        members = valid_patterns[pattern]
        # Use one member as the query, the rest as expected relevant results
        query_study = random.choice(members)
        relevant = [m for m in members if m["id"] != query_study["id"]]

        # Rank relevant results: cross-domain first (more valuable)
        relevant.sort(
            key=lambda m: (0 if m["domain"] != query_study["domain"] else 1),
        )

        eval_queries.append({
            "query_text": build_structural_text(query_study),
            "query_id": query_study["id"],
            "query_domain": query_study["domain"],
            "query_pattern": pattern,
            "relevant_ids": [m["id"] for m in relevant],
            "relevant_domains": [m["domain"] for m in relevant],
            "num_relevant": len(relevant),
        })

    print(f"  → Generated {len(eval_queries)} evaluation queries across {len(set(q['query_pattern'] for q in eval_queries))} patterns")
    return eval_queries


def split_train_val(
    triplets: List[Dict],
    val_ratio: float = 0.2,
) -> Tuple[List[Dict], List[Dict]]:
    """Split triplets into train/val sets, stratified by anchor pattern."""
    pattern_triplets: Dict[str, List[Dict]] = defaultdict(list)
    for t in triplets:
        pattern_triplets[t["anchor_pattern"]].append(t)

    train, val = [], []
    for pattern, pt_list in pattern_triplets.items():
        random.shuffle(pt_list)
        split_idx = max(1, int(len(pt_list) * (1 - val_ratio)))
        train.extend(pt_list[:split_idx])
        val.extend(pt_list[split_idx:])

    random.shuffle(train)
    random.shuffle(val)
    return train, val


def main():
    print("=" * 60)
    print("  BridgeMind Training Data Generator")
    print("=" * 60)

    random.seed(42)  # Reproducibility

    # Load data
    studies = load_case_studies()
    print(f"\n[Database] Loaded {len(studies)} case studies")

    # Count patterns and domains
    patterns = set(s["abstract_pattern"] for s in studies if s["abstract_pattern"])
    domains = set(s["domain"] for s in studies if s["domain"])
    print(f"[Database] {len(patterns)} distinct patterns, {len(domains)} distinct domains")

    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # 1. Generate contrastive triplets
    triplets = generate_contrastive_triplets(studies, max_triplets=5000)
    train_triplets, val_triplets = split_train_val(triplets, val_ratio=0.2)

    # 2. Generate GIN calibration pairs
    gin_pairs = generate_gin_calibration_pairs(studies, max_pairs=2000)

    # 3. Generate evaluation queries
    eval_queries = generate_eval_queries(studies, num_queries=50)

    # Save all outputs
    outputs = {
        "train_triplets.json": train_triplets,
        "val_triplets.json": val_triplets,
        "gin_calibration_pairs.json": gin_pairs,
        "eval_queries.json": eval_queries,
    }

    for filename, data in outputs.items():
        filepath = os.path.join(OUTPUT_DIR, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"  → Saved {filename}: {len(data)} items")

    # Save metadata
    metadata = {
        "total_studies": len(studies),
        "total_patterns": len(patterns),
        "total_domains": len(domains),
        "train_triplets": len(train_triplets),
        "val_triplets": len(val_triplets),
        "gin_pairs": len(gin_pairs),
        "eval_queries": len(eval_queries),
        "cross_domain_positive_ratio": (
            sum(1 for t in triplets if t["is_cross_domain_positive"]) / max(len(triplets), 1)
        ),
        "hard_negative_ratio": (
            sum(1 for t in triplets if t["is_hard_negative"]) / max(len(triplets), 1)
        ),
    }
    meta_path = os.path.join(OUTPUT_DIR, "metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"\n{'=' * 60}")
    print(f"  Training data generation complete!")
    print(f"  Output directory: {OUTPUT_DIR}")
    print(f"  Train: {len(train_triplets)} | Val: {len(val_triplets)} | Eval: {len(eval_queries)}")
    print(f"{'=' * 60}")

    return metadata


if __name__ == "__main__":
    main()
