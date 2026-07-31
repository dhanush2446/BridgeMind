import numpy as np
import networkx as nx
from typing import List, Dict, Any

class GraphIsomorphismNetwork:
    """
    Graph Neural Network / GIN-inspired structural graph matcher.
    Converts 8-slot structural elements into directed dependency graphs
    and computes graph isomorphism embeddings and similarity scores.
    """
    def __init__(self):
        print("[GIN Engine] Graph Isomorphism Network module initialized.")

    def build_structural_graph(self, elements: List[Dict[str, str]]) -> nx.DiGraph:
        G = nx.DiGraph()
        
        # Add nodes for each structural element
        for i, el in enumerate(elements):
            node_id = f"{el.get('type', 'node')}_{i}"
            G.add_node(node_id, type=el.get('type', 'generic'), name=el.get('name', ''))

        # Construct dependency edges reflecting relational topology
        node_list = list(G.nodes)
        for i in range(len(node_list) - 1):
            G.add_edge(node_list[i], node_list[i+1])
        
        # Add feedback loop edge if feedback element present
        feedback_nodes = [n for n, attr in G.nodes(data=True) if attr.get('type') == 'feedback']
        if feedback_nodes and len(node_list) > 2:
            G.add_edge(feedback_nodes[0], node_list[0])

        return G

    def compute_gin_embedding(self, G: nx.DiGraph) -> np.ndarray:
        """
        Computes a graph-level embedding using node degree histograms 
        and structural neighborhood aggregation (inspired by Weisfeiler-Lehman / GIN).
        """
        num_nodes = G.number_of_nodes()
        num_edges = G.number_of_edges()
        in_degrees = [d for _, d in G.in_degree()]
        out_degrees = [d for _, d in G.out_degree()]
        
        # 16-dimensional graph topology signature vector
        vec = np.zeros(16, dtype=np.float32)
        vec[0] = num_nodes / 10.0
        vec[1] = num_edges / 10.0
        vec[2] = np.mean(in_degrees) if in_degrees else 0.0
        vec[3] = np.max(in_degrees) if in_degrees else 0.0
        vec[4] = np.mean(out_degrees) if out_degrees else 0.0
        vec[5] = np.max(out_degrees) if out_degrees else 0.0
        vec[6] = 1.0 if nx.is_directed_acyclic_graph(G) else 0.0
        
        # Cycle / Feedback loop count
        try:
            cycles = len(list(nx.simple_cycles(G)))
            vec[7] = cycles / 5.0
        except Exception:
            vec[7] = 0.0

        # Feature vector normalization
        norm = np.linalg.norm(vec)
        return vec / norm if norm > 0 else vec

    def compute_graph_similarity(self, elements_a: List[Dict[str, str]], elements_b: List[Dict[str, str]]) -> float:
        G_a = self.build_structural_graph(elements_a)
        G_b = self.build_structural_graph(elements_b)
        
        emb_a = self.compute_gin_embedding(G_a)
        emb_b = self.compute_gin_embedding(G_b)
        
        # Cosine similarity of graph topological embeddings
        similarity = float(np.dot(emb_a, emb_b))
        return round(max(0.0, min(1.0, similarity)), 4)
