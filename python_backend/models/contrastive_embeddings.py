import os
import re
import sqlite3
import math
import numpy as np
from typing import List, Dict, Any
from collections import Counter

# Domain hierarchy and distance matrix for Inverse Domain Distance Weighting (IDDW)
DOMAIN_GROUPS = {
    "Healthcare": 1, "Medicine": 1, "Epidemiology": 1,
    "Computer Science": 2, "Networking": 2, "Cybersecurity": 2, "Quantum Computing": 2,
    "Biomimicry": 3, "Biology": 3, "Ecology": 3,
    "Aviation": 4, "Aerospace Engineering": 4, "Mechanical Engineering": 4,
    "Economics & Finance": 5, "Urban Planning": 5, "Logistics": 5,
    "Neuroscience": 6, "Cybernetics": 6,
    "Energy Systems": 7, "Chemical Engineering": 7,
    "Marine Hydrodynamics": 8,
    "Nanotechnology": 9, "Materials Science": 9,
    "Robotics & Autonomous Swarms": 10,
    "Architecture": 11,
}

# More granular inter-group distances (1.0 = maximally different)
GROUP_DISTANCES = {
    # Same group is always 0.0
    # Cross-group distances capture semantic similarity between domain clusters
    (1, 2): 0.7,  (1, 3): 0.5,  (1, 4): 0.8,  (1, 5): 0.75,
    (1, 6): 0.4,  (1, 7): 0.6,  (1, 8): 0.85, (1, 9): 0.7,
    (1, 10): 0.65, (1, 11): 0.8,
    (2, 3): 0.6,  (2, 4): 0.65, (2, 5): 0.55, (2, 6): 0.45,
    (2, 7): 0.7,  (2, 8): 0.75, (2, 9): 0.65, (2, 10): 0.4,
    (2, 11): 0.7,
    (3, 4): 0.7,  (3, 5): 0.75, (3, 6): 0.5,  (3, 7): 0.6,
    (3, 8): 0.45, (3, 9): 0.55, (3, 10): 0.5, (3, 11): 0.65,
    (4, 5): 0.7,  (4, 6): 0.75, (4, 7): 0.5,  (4, 8): 0.55,
    (4, 9): 0.6,  (4, 10): 0.5, (4, 11): 0.65,
    (5, 6): 0.65, (5, 7): 0.6,  (5, 8): 0.75, (5, 9): 0.7,
    (5, 10): 0.7, (5, 11): 0.5,
    (6, 7): 0.65, (6, 8): 0.7,  (6, 9): 0.6,  (6, 10): 0.5,
    (6, 11): 0.7,
    (7, 8): 0.55, (7, 9): 0.45, (7, 10): 0.65, (7, 11): 0.5,
    (8, 9): 0.6,  (8, 10): 0.65, (8, 11): 0.7,
    (9, 10): 0.55, (9, 11): 0.6,
    (10, 11): 0.65,
}


class ContrastiveStructuralEncoder:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = None
        self.vector_dim = 384
        self._fallback_vocab: Dict[str, int] = {}
        self._fallback_idf: Dict[str, float] = {}
        self._learned_iddw_alpha: float = None  # Will be loaded from optimal_weights.json if available

        # Check for fine-tuned model first
        trained_model_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "trained_models", "contrastive_encoder"
        )
        resolved_model = model_name
        if model_name == "all-MiniLM-L6-v2" and os.path.exists(os.path.join(trained_model_dir, "config.json")):
            resolved_model = trained_model_dir
            print(f"[ML Engine] Fine-tuned model found at {trained_model_dir}")

        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(resolved_model)
            if resolved_model != model_name:
                print(f"[ML Engine] Loaded FINE-TUNED SentenceTransformer from {resolved_model}")
            else:
                print(f"[ML Engine] SentenceTransformer '{model_name}' initialized successfully.")
        except Exception as e:
            print(f"[ML Engine Warning] Could not load SentenceTransformer ({e}). Building TF-IDF fallback vectorizer.")
            self._build_tfidf_vocabulary()

        # Load learned IDDW alpha from optimal weights if available
        self._load_learned_weights()
    def _load_learned_weights(self):
        """Load learned IDDW alpha from optimal_weights.json if available."""
        import json
        weights_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "trained_models", "optimal_weights.json"
        )
        if os.path.exists(weights_path):
            try:
                with open(weights_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                opt = data.get("optimal_weights", {})
                if "iddw_alpha" in opt:
                    self._learned_iddw_alpha = float(opt["iddw_alpha"])
                    print(f"[ML Engine] Loaded learned IDDW alpha: {self._learned_iddw_alpha}")
            except Exception as e:
                print(f"[ML Engine] Could not load optimal weights: {e}")

    def _build_tfidf_vocabulary(self):
        """Build a vocabulary and IDF weights from the database corpus for meaningful fallback vectors."""
        corpus_texts: List[str] = []

        # Try loading from database
        db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                               "src", "data", "analogy_engine.db")
        if os.path.exists(db_path):
            try:
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                cursor.execute("SELECT title, problem, solution, abstract_pattern FROM case_studies")
                for row in cursor.fetchall():
                    for field in row:
                        if field:
                            corpus_texts.append(str(field).lower())
                conn.close()
            except Exception as e:
                print(f"[ML Engine] Could not load DB for vocabulary: {e}")

        if not corpus_texts:
            # Minimal fallback vocabulary from known domain terms
            corpus_texts = [
                "flow network routing congestion throughput bottleneck capacity optimization",
                "feedback oscillation control stability damping resonance",
                "cascade failure propagation spread epidemic diffusion",
                "resource allocation scheduling priority queue triage",
                "swarm decentralized multi-agent cooperative autonomous",
                "energy power grid renewable battery storage solar",
                "neural brain synapse plasticity learning memory",
                "quantum qubit entanglement decoherence superposition error",
                "robot navigation planning manipulation locomotion",
                "material polymer composite self-healing nanotechnology",
            ]

        # Build vocabulary: map each unique word to an index (capped at vector_dim)
        word_doc_count: Counter = Counter()
        all_words: Counter = Counter()
        num_docs = len(corpus_texts)

        for text in corpus_texts:
            words = set(re.findall(r'\b[a-z]{3,}\b', text))
            for w in words:
                word_doc_count[w] += 1
            all_words.update(re.findall(r'\b[a-z]{3,}\b', text))

        # Select top words by frequency, map to vector dimensions
        stop_words = {"the", "and", "for", "are", "was", "that", "this", "with", "from", "have",
                      "been", "has", "its", "can", "will", "which", "their", "more", "also",
                      "into", "than", "other", "not", "but", "our", "such", "these", "may",
                      "each", "some", "use", "used", "using", "based", "about"}
        candidates = [(w, c) for w, c in all_words.items() if w not in stop_words and len(w) >= 3]
        candidates.sort(key=lambda x: x[1], reverse=True)

        for idx, (word, _) in enumerate(candidates[:self.vector_dim]):
            self._fallback_vocab[word] = idx
            # IDF = log(N / df)
            df = word_doc_count.get(word, 1)
            self._fallback_idf[word] = math.log(max(num_docs, 1) / max(df, 1))

        print(f"[ML Engine] TF-IDF fallback vocabulary built: {len(self._fallback_vocab)} terms from {num_docs} documents.")

    def _tfidf_encode(self, text: str) -> np.ndarray:
        """Encode text using the TF-IDF fallback vectorizer. Produces meaningful, input-dependent vectors."""
        vec = np.zeros(self.vector_dim, dtype=np.float32)
        words = re.findall(r'\b[a-z]{3,}\b', text.lower())
        if not words:
            return vec

        # Compute term frequencies
        tf = Counter(words)
        max_tf = max(tf.values()) if tf else 1

        for word, count in tf.items():
            if word in self._fallback_vocab:
                idx = self._fallback_vocab[word]
                # Augmented TF * IDF
                tf_score = 0.5 + 0.5 * (count / max_tf)
                idf_score = self._fallback_idf.get(word, 1.0)
                vec[idx] = tf_score * idf_score

        # L2 normalize
        norm = np.linalg.norm(vec)
        return vec / norm if norm > 0 else vec

    def encode_text(self, text: str) -> np.ndarray:
        if self.model:
            emb = self.model.encode([text], convert_to_numpy=True)[0]
            norm = np.linalg.norm(emb)
            return emb / norm if norm > 0 else emb
        else:
            return self._tfidf_encode(text)

    def encode_batch(self, texts: List[str]) -> np.ndarray:
        if self.model:
            embs = self.model.encode(texts, convert_to_numpy=True, batch_size=64, show_progress_bar=False)
            norms = np.linalg.norm(embs, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            return embs / norms
        else:
            vecs = [self._tfidf_encode(text) for text in texts]
            return np.array(vecs, dtype=np.float32)

    def encode_structure(self, structure: Dict[str, Any]) -> np.ndarray:
        """
        Encodes the structural components (8 slots + abstract pattern)
        rather than raw domain-specific words.
        """
        abstract_pattern = structure.get("abstractPattern", "")
        elements_summary = " ".join([e.get("name", "") + " " + e.get("description", "") for e in structure.get("elements", [])])

        structural_prompt = f"Pattern: {abstract_pattern}. Elements: {elements_summary}"
        return self.encode_text(structural_prompt)

    @staticmethod
    def compute_domain_distance(domain_a: str, domain_b: str) -> float:
        """
        Computes domain distance using the granular inter-group distance matrix.
        Returns 0.0 for identical domains, and a value between 0.1 and 1.0 for
        cross-domain pairs. Uses the GROUP_DISTANCES lookup table for nuanced
        distances rather than a binary same/different classification.
        """
        if domain_a == domain_b:
            return 0.0

        group_a = DOMAIN_GROUPS.get(domain_a, 0)
        group_b = DOMAIN_GROUPS.get(domain_b, 0)

        if group_a == 0 or group_b == 0:
            return 0.85  # Unknown domain — treat as far

        if group_a == group_b:
            return 0.1  # Same domain cluster

        # Look up granular distance
        key = (min(group_a, group_b), max(group_a, group_b))
        return GROUP_DISTANCES.get(key, 0.8)

    def rank_with_iddw(self, query_domain: str, candidate_results: List[Dict[str, Any]], alpha: float = 0.35) -> List[Dict[str, Any]]:
        """
        Applies Inverse Domain Distance Weighting (IDDW):
        FinalScore = StructuralSimilarity * (1 + alpha * DomainDistance)
        Uses learned alpha from optimal_weights.json if available.
        """
        # Use learned alpha if available, otherwise fall back to parameter default
        effective_alpha = self._learned_iddw_alpha if self._learned_iddw_alpha is not None else alpha

        for item in candidate_results:
            cand_domain = item.get("sourceDomain", item.get("domain", "General"))
            dist = self.compute_domain_distance(query_domain, cand_domain)
            base_score = item.get("structuralSimilarity", item.get("score", 0.5))

            # Boost far-domain matches
            boosted_score = base_score * (1.0 + effective_alpha * dist)
            item["iddwScore"] = round(min(0.99, boosted_score), 4)
            item["domainDistance"] = round(dist, 2)

        candidate_results.sort(key=lambda x: x.get("iddwScore", 0), reverse=True)
        return candidate_results

