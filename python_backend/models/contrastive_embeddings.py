import numpy as np
from typing import List, Dict, Any

# Domain hierarchy and distance matrix for Inverse Domain Distance Weighting (IDDW)
DOMAIN_GROUPS = {
    "Healthcare": 1, "Medicine": 1, "Epidemiology": 1,
    "Computer Science": 2, "Networking": 2, "Cybersecurity": 2, "Quantum Computing": 2,
    "Biomimicry": 3, "Biology": 3, "Ecology": 3,
    "Aviation": 4, "Aerospace Engineering": 4, "Mechanical Engineering": 4,
    "Economics & Finance": 5, "Urban Planning": 5, "Logistics": 5
}

class ContrastiveStructuralEncoder:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = None
        self.vector_dim = 384
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(model_name)
            print(f"[ML Engine] SentenceTransformer '{model_name}' initialized successfully.")
        except Exception as e:
            print(f"[ML Engine Warning] Could not load SentenceTransformer ({e}). Falling back to feature vectorizer.")

    def encode_text(self, text: str) -> np.ndarray:
        if self.model:
            emb = self.model.encode([text], convert_to_numpy=True)[0]
            # Normalize vector for Cosine Similarity / Inner Product
            norm = np.linalg.norm(emb)
            return emb / norm if norm > 0 else emb
        else:
            # Deterministic fallback pseudo-embedding
            np.random.seed(abs(hash(text)) % (2**32))
            vec = np.random.randn(self.vector_dim).astype(np.float32)
            return vec / np.linalg.norm(vec)

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
        Computes domain distance (0.0 = same domain, 1.0 = highly distinct domain).
        Used by IDDW to penalize obvious near-domain matches and reward far-domain matches.
        """
        group_a = DOMAIN_GROUPS.get(domain_a, 0)
        group_b = DOMAIN_GROUPS.get(domain_b, 0)
        if group_a == group_b and group_a != 0:
            return 0.1  # Same domain cluster
        return 0.95     # Far cross-domain

    def rank_with_iddw(self, query_domain: str, candidate_results: List[Dict[str, Any]], alpha: float = 0.35) -> List[Dict[str, Any]]:
        """
        Applies Inverse Domain Distance Weighting (IDDW):
        FinalScore = StructuralSimilarity * (1 + alpha * DomainDistance)
        """
        for item in candidate_results:
            cand_domain = item.get("sourceDomain", item.get("domain", "General"))
            dist = self.compute_domain_distance(query_domain, cand_domain)
            base_score = item.get("structuralSimilarity", item.get("score", 0.5))
            
            # Boost far-domain matches
            boosted_score = base_score * (1.0 + alpha * dist)
            item["iddwScore"] = round(min(0.99, boosted_score), 4)
            item["domainDistance"] = round(dist, 2)

        candidate_results.sort(key=lambda x: x.get("iddwScore", 0), reverse=True)
        return candidate_results
