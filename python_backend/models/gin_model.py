import numpy as np
import networkx as nx
from typing import List, Dict, Any

class GraphIsomorphismNetwork:
    """
    Graph Neural Network / GIN-inspired structural graph matcher.
    Converts 8-slot structural elements into directed dependency graphs
    and computes graph isomorphism embeddings and similarity scores.

    All 16 dimensions of the topology vector are now populated with
    real graph-theoretic features computed from the input structure.
    """
    def __init__(self):
        print("[GIN Engine] Graph Isomorphism Network module initialized.")

        # Element type interaction rules: which element types typically connect
        self.type_edges = {
            "entity": ["constraint", "flow", "goal", "risk"],
            "constraint": ["bottleneck", "goal", "risk"],
            "goal": ["flow", "feedback"],
            "flow": ["bottleneck", "dependency"],
            "bottleneck": ["feedback", "risk"],
            "feedback": ["entity", "flow", "goal"],  # feedback loops back
            "dependency": ["entity", "constraint", "risk"],
            "risk": ["feedback", "dependency"],
        }

    def build_structural_graph(self, elements: List[Dict[str, str]]) -> nx.DiGraph:
        G = nx.DiGraph()

        if not elements:
            G.add_node("empty_0", type="generic", name="Empty")
            return G

        # Add nodes for each structural element
        type_to_nodes: Dict[str, List[str]] = {}
        for i, el in enumerate(elements):
            el_type = el.get('type', 'generic')
            node_id = f"{el_type}_{i}"
            G.add_node(node_id, type=el_type, name=el.get('name', ''),
                       description=el.get('description', ''))
            type_to_nodes.setdefault(el_type, []).append(node_id)

        # Construct dependency edges based on element type interaction rules
        node_list = list(G.nodes)
        for node_id in node_list:
            node_type = G.nodes[node_id].get('type', 'generic')
            target_types = self.type_edges.get(node_type, [])
            for target_type in target_types:
                if target_type in type_to_nodes:
                    for target_node in type_to_nodes[target_type]:
                        if target_node != node_id:
                            G.add_edge(node_id, target_node, relation=f"{node_type}_to_{target_type}")

        # Add sequential edges for elements of same type
        for type_name, nodes in type_to_nodes.items():
            for i in range(len(nodes) - 1):
                if not G.has_edge(nodes[i], nodes[i+1]):
                    G.add_edge(nodes[i], nodes[i+1], relation="sequential")

        # Add feedback loop edges
        feedback_nodes = type_to_nodes.get('feedback', [])
        entity_nodes = type_to_nodes.get('entity', [])
        if feedback_nodes and entity_nodes:
            for fb_node in feedback_nodes:
                for ent_node in entity_nodes:
                    if not G.has_edge(fb_node, ent_node):
                        G.add_edge(fb_node, ent_node, relation="feedback_loop")

        return G

    def compute_gin_embedding(self, G: nx.DiGraph) -> np.ndarray:
        """
        Computes a graph-level embedding using comprehensive graph-theoretic
        features. All 16 dimensions are populated with real computed values:

        [0]  num_nodes (normalized)
        [1]  num_edges (normalized)
        [2]  mean in-degree
        [3]  max in-degree (normalized)
        [4]  mean out-degree
        [5]  max out-degree (normalized)
        [6]  is DAG (binary)
        [7]  cycle count (normalized)
        [8]  graph density
        [9]  reciprocity (fraction of mutual edges)
        [10] avg clustering coefficient (undirected)
        [11] number of strongly connected components (normalized)
        [12] number of weakly connected components (normalized)
        [13] degree assortativity coefficient
        [14] fraction of feedback-type nodes
        [15] fraction of risk-type nodes
        """
        num_nodes = G.number_of_nodes()
        num_edges = G.number_of_edges()
        in_degrees = [d for _, d in G.in_degree()]
        out_degrees = [d for _, d in G.out_degree()]

        vec = np.zeros(16, dtype=np.float32)
        vec[0] = num_nodes / 10.0
        vec[1] = num_edges / 20.0
        vec[2] = np.mean(in_degrees) if in_degrees else 0.0
        vec[3] = (np.max(in_degrees) / max(num_nodes, 1)) if in_degrees else 0.0
        vec[4] = np.mean(out_degrees) if out_degrees else 0.0
        vec[5] = (np.max(out_degrees) / max(num_nodes, 1)) if out_degrees else 0.0
        vec[6] = 1.0 if nx.is_directed_acyclic_graph(G) else 0.0

        # Cycle count
        try:
            cycles = list(nx.simple_cycles(G))
            vec[7] = min(len(cycles) / 5.0, 1.0)
        except Exception:
            vec[7] = 0.0

        # Graph density
        vec[8] = nx.density(G)

        # Reciprocity: fraction of edges that have a reciprocal edge
        if num_edges > 0:
            try:
                vec[9] = nx.reciprocity(G)
            except Exception:
                vec[9] = 0.0
        else:
            vec[9] = 0.0

        # Clustering coefficient on undirected version
        try:
            undirected = G.to_undirected()
            vec[10] = nx.average_clustering(undirected)
        except Exception:
            vec[10] = 0.0

        # Strongly connected components (normalized)
        try:
            scc = list(nx.strongly_connected_components(G))
            vec[11] = len(scc) / max(num_nodes, 1)
        except Exception:
            vec[11] = 0.0

        # Weakly connected components (normalized)
        try:
            wcc = list(nx.weakly_connected_components(G))
            vec[12] = len(wcc) / max(num_nodes, 1)
        except Exception:
            vec[12] = 0.0

        # Degree assortativity
        try:
            vec[13] = nx.degree_assortativity_coefficient(G)
            if np.isnan(vec[13]):
                vec[13] = 0.0
        except Exception:
            vec[13] = 0.0

        # Fraction of feedback-type nodes
        if num_nodes > 0:
            feedback_count = sum(1 for _, attr in G.nodes(data=True) if attr.get('type') == 'feedback')
            vec[14] = feedback_count / num_nodes

        # Fraction of risk-type nodes
        if num_nodes > 0:
            risk_count = sum(1 for _, attr in G.nodes(data=True) if attr.get('type') == 'risk')
            vec[15] = risk_count / num_nodes

        # L2 normalization
        norm = np.linalg.norm(vec)
        return vec / norm if norm > 0 else vec

    def compute_graph_similarity(self, elements_a: List[Dict[str, str]], elements_b: List[Dict[str, str]]) -> float:
        """Compute similarity between two structural element sets using graph topology embeddings."""
        G_a = self.build_structural_graph(elements_a)
        G_b = self.build_structural_graph(elements_b)

        emb_a = self.compute_gin_embedding(G_a)
        emb_b = self.compute_gin_embedding(G_b)

        # Cosine similarity of graph topological embeddings
        similarity = float(np.dot(emb_a, emb_b))
        return round(max(0.0, min(1.0, similarity)), 4)
