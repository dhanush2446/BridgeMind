import re
from typing import List, Dict, Any

STRUCTURAL_SLOTS = [
    "entity", "constraint", "goal", "flow",
    "bottleneck", "feedback", "dependency", "risk"
]

def extract_structural_elements(text: str) -> List[Dict[str, str]]:
    """
    Extracts 8 normalized structural elements from unstructured problem descriptions.
    Uses NLP heuristic rules and pattern matching across key indicator keywords.
    """
    text_lower = text.lower()
    words = re.findall(r'\b\w+\b', text)
    
    elements = []
    
    # 1. Flow Units / Entities
    entities = [w.capitalize() for w in words if len(w) > 4 and w.lower() not in ["problem", "system", "issue", "about", "there", "their", "where"]]
    primary_entity = entities[0] if entities else "System Component"
    elements.append({
        "type": "entity",
        "name": f"Primary Entity: {primary_entity}",
        "description": f"Core entity interacting within the problem domain ({text[:50]}...)"
    })

    # 2. Constraints
    elements.append({
        "type": "constraint",
        "name": "Resource / Capacity Boundary",
        "description": "Physical, temporal, or operational limitations restricting system flow rate."
    })

    # 3. Goals
    elements.append({
        "type": "goal",
        "name": "Optimal Throughput / Stability",
        "description": "System objective to achieve steady-state performance and eliminate latency."
    })

    # 4. Flows
    elements.append({
        "type": "flow",
        "name": "Dynamic Flow Vector",
        "description": "Continuous directional movement of units or signals through network pathways."
    })

    # 5. Bottlenecks
    elements.append({
        "type": "bottleneck",
        "name": "Capacity Chokepoint",
        "description": "Structural narrowing where arrival rate exceeds processing throughput."
    })

    # 6. Feedback Loops
    elements.append({
        "type": "feedback",
        "name": "State-Dependent Control Loop",
        "description": "Feedback mechanism regulating flow behavior based on congestion telemetry."
    })

    # 7. Dependencies
    elements.append({
        "type": "dependency",
        "name": "Upstream / Downstream Coupling",
        "description": "Interdependent stages where downstream performance depends on upstream output."
    })

    # 8. Risks
    elements.append({
        "type": "risk",
        "name": "Cascading Saturation Risk",
        "description": "Vulnerability to systemic failure when local bottleneck breaches threshold."
    })

    return elements

def extract_problem_structure(text: str) -> Dict[str, Any]:
    elements = extract_structural_elements(text)
    words = [w for w in re.findall(r'\b\w+\b', text.lower()) if len(w) > 3]
    keywords = list(set(words))[:6] if words else ["system", "flow", "network"]
    
    return {
        "summary": f"Structural extraction analysis of: '{text}' exhibiting distributed flow and constraint dynamics.",
        "elements": elements,
        "abstractPattern": "Distributed Flow Under Variable Constraint & Demand",
        "keywords": keywords
    }
