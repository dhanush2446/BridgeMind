import os
import sqlite3
import numpy as np
from typing import List, Dict, Any, Tuple

class FaissSearchEngine:
    def __init__(self, db_path: str, encoder):
        self.db_path = db_path
        self.encoder = encoder
        self.dim = 384
        self.index = None
        self.items: List[Dict[str, Any]] = []
        self._initialize_index()

    def _initialize_index(self):
        print("[FAISS Engine] Initializing vector index...")
        try:
            import faiss
            self.index = faiss.IndexFlatIP(self.dim)
            use_faiss = True
        except ImportError:
            print("[FAISS Warning] 'faiss' package not installed. Using numpy cosine similarity index.")
            use_faiss = False
            self.index = None

        embeddings_list = []
        
        # Load from SQLite database if available
        if os.path.exists(self.db_path):
            try:
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                cursor.execute("SELECT id, domain, title, problem, solution, abstract_pattern, url FROM case_studies")
                rows = cursor.fetchall()
                conn.close()
                
                for row in rows:
                    item = {
                        "id": row[0],
                        "domain": row[1],
                        "title": row[2],
                        "problem": row[3],
                        "solution": row[4],
                        "abstract_pattern": row[5],
                        "url": row[6] if len(row) > 6 and row[6] else f"https://scholar.google.com/scholar?q={row[2]}"
                    }
                    text_for_embedding = f"Pattern: {item['abstract_pattern']}. Domain: {item['domain']}. Problem: {item['problem']}"
                    vec = self.encoder.encode_text(text_for_embedding)
                    embeddings_list.append(vec)
                    self.items.append(item)
            except Exception as e:
                print(f"[FAISS DB Warning] Could not load SQLite DB: {e}")

        # Fallback to seed corpus if DB is empty
        if not self.items:
            default_items = [
                {"id": "cs-1", "domain": "Computer Science", "title": "TCP Window Flow Congestion Control", "problem": "Packet loss under network saturation", "solution": "Exponential backoff and dynamic window scaling", "abstract_pattern": "Distributed Flow Under Variable Demand"},
                {"id": "bio-1", "domain": "Biomimicry", "title": "Ant Colony Pheromone Foraging Trails", "problem": "Decentralized path optimization without central controller", "solution": "Stigmergic pheromone decay dynamic routing", "abstract_pattern": "Distributed Flow Under Variable Demand"},
                {"id": "med-1", "domain": "Healthcare", "title": "Emergency Room Triage Telemetry", "problem": "Patient waiting room bottlenecks during surge events", "solution": "Severity-tiered dynamic routing and overflow allocation", "abstract_pattern": "Triaging Queue Under Capacity Limits"},
                {"id": "av-1", "domain": "Aviation", "title": "Air Traffic Control Runway Slot Allocation", "problem": "Airspace congestion and collision hazard in terminal areas", "solution": "Time-slotted trajectory smoothing and speed metering", "abstract_pattern": "Distributed Flow Under Variable Demand"},
                {"id": "fin-1", "domain": "Economics & Finance", "title": "Flash Crash High-Frequency Circuit Breakers", "problem": "Automated liquidation cascades in algorithmic trading", "solution": "Hysteresis damping and dynamic trading halt thresholds", "abstract_pattern": "Cascading Failure Containment"}
            ]
            for item in default_items:
                vec = self.encoder.encode_text(item["problem"] + " " + item["abstract_pattern"])
                embeddings_list.append(vec)
                self.items.append(item)

        if embeddings_list:
            matrix = np.array(embeddings_list, dtype=np.float32)
            if use_faiss and self.index is not None:
                self.index.add(matrix)
                print(f"[FAISS Engine] Successfully indexed {self.index.ntotal} vectors in FAISS index.")
            else:
                self.embeddings_matrix = matrix
                print(f"[FAISS Engine] Fallback vector matrix created with shape {matrix.shape}.")

    def search(self, query_vec: np.ndarray, top_k: int = 10) -> List[Dict[str, Any]]:
        query_vec = np.array([query_vec], dtype=np.float32)
        results = []

        if self.index is not None:
            distances, indices = self.index.search(query_vec, top_k)
            for score, idx in zip(distances[0], indices[0]):
                if idx < len(self.items) and idx >= 0:
                    item = dict(self.items[idx])
                    item["structuralSimilarity"] = round(float(score), 4)
                    results.append(item)
        elif hasattr(self, 'embeddings_matrix'):
            scores = np.dot(self.embeddings_matrix, query_vec[0])
            top_indices = np.argsort(scores)[::-1][:top_k]
            for idx in top_indices:
                item = dict(self.items[idx])
                item["structuralSimilarity"] = round(float(scores[idx]), 4)
                results.append(item)

        return results
