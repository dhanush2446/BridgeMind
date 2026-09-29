import re
import math
from typing import List, Dict, Any, Tuple
from collections import Counter

# ═══════════════════════════════════════════════════════════════
#  STRUCTURAL ELEMENT EXTRACTION ENGINE
#
#  Extracts 8 normalized structural slots from unstructured text
#  using weighted keyword indicator dictionaries and contextual
#  sentence analysis. No hardcoded outputs — every result is
#  derived from the actual input text.
# ═══════════════════════════════════════════════════════════════

STRUCTURAL_SLOTS = [
    "entity", "constraint", "goal", "flow",
    "bottleneck", "feedback", "dependency", "risk"
]

# Weighted keyword indicators for each structural slot type.
# Each dict maps indicator words → relevance weight (0.0–1.0).
SLOT_INDICATORS: Dict[str, Dict[str, float]] = {
    "entity": {
        "patient": 0.9, "user": 0.8, "vehicle": 0.9, "agent": 0.8,
        "particle": 0.8, "packet": 0.9, "signal": 0.8, "cell": 0.8,
        "robot": 0.9, "drone": 0.9, "worker": 0.8, "student": 0.8,
        "organism": 0.8, "molecule": 0.8, "electron": 0.8, "photon": 0.8,
        "server": 0.9, "node": 0.8, "person": 0.7, "animal": 0.8,
        "aircraft": 0.9, "spacecraft": 0.9, "satellite": 0.9,
        "water": 0.7, "energy": 0.7, "data": 0.7, "information": 0.7,
        "resource": 0.7, "component": 0.7, "system": 0.6, "device": 0.8,
        "sensor": 0.8, "actuator": 0.8, "qubit": 0.9, "neuron": 0.9,
        "blood": 0.8, "oxygen": 0.7, "food": 0.7, "material": 0.7,
        "request": 0.8, "order": 0.7, "message": 0.8, "item": 0.7,
        "product": 0.7, "supply": 0.7, "load": 0.7, "task": 0.7,
    },
    "constraint": {
        "limit": 0.9, "capacity": 0.95, "bandwidth": 0.9, "budget": 0.9,
        "threshold": 0.9, "boundary": 0.85, "restriction": 0.9,
        "finite": 0.85, "scarce": 0.9, "limited": 0.9, "maximum": 0.85,
        "minimum": 0.85, "deadline": 0.9, "quota": 0.9, "ceiling": 0.85,
        "shortage": 0.9, "constraint": 0.95, "bottleneck": 0.8,
        "saturation": 0.9, "exhaustion": 0.85, "depletion": 0.85,
        "overload": 0.9, "overflow": 0.85, "insufficient": 0.85,
        "unavailable": 0.8, "shortage": 0.9, "deficit": 0.85,
        "pressure": 0.7, "stress": 0.7, "strain": 0.7, "friction": 0.7,
    },
    "goal": {
        "optimize": 0.95, "maximize": 0.95, "minimize": 0.95,
        "reduce": 0.85, "improve": 0.85, "increase": 0.8, "decrease": 0.8,
        "efficiency": 0.9, "throughput": 0.9, "performance": 0.85,
        "stability": 0.9, "reliability": 0.9, "accuracy": 0.85,
        "quality": 0.85, "speed": 0.85, "safety": 0.9, "survival": 0.9,
        "balance": 0.8, "equilibrium": 0.85, "sustainability": 0.85,
        "resilience": 0.85, "robustness": 0.85, "scalability": 0.85,
        "prevent": 0.8, "avoid": 0.8, "maintain": 0.8, "achieve": 0.8,
        "target": 0.8, "objective": 0.85, "goal": 0.9,
    },
    "flow": {
        "flow": 0.95, "stream": 0.9, "current": 0.85, "circulation": 0.9,
        "movement": 0.85, "transport": 0.9, "transfer": 0.85,
        "routing": 0.9, "path": 0.8, "pipeline": 0.9, "channel": 0.85,
        "network": 0.8, "propagation": 0.85, "transmission": 0.85,
        "distribution": 0.85, "diffusion": 0.85, "convection": 0.85,
        "migration": 0.8, "trajectory": 0.85, "direction": 0.7,
        "route": 0.85, "conduit": 0.85, "pathway": 0.85, "artery": 0.85,
        "dispatch": 0.8, "delivery": 0.8, "supply chain": 0.9,
    },
    "bottleneck": {
        "bottleneck": 0.98, "congestion": 0.95, "jam": 0.85,
        "blockage": 0.9, "chokepoint": 0.95, "backlog": 0.9,
        "queue": 0.85, "waiting": 0.8, "delay": 0.85, "latency": 0.85,
        "slowdown": 0.9, "stall": 0.85, "deadlock": 0.95,
        "contention": 0.9, "collision": 0.85, "conflict": 0.8,
        "overwhelm": 0.85, "overload": 0.9, "saturated": 0.9,
        "crowding": 0.85, "gridlock": 0.95, "pileup": 0.85,
        "accumulation": 0.8, "buildup": 0.8, "clogging": 0.9,
        "narrow": 0.7, "squeeze": 0.8, "choke": 0.9,
    },
    "feedback": {
        "feedback": 0.98, "loop": 0.8, "cycle": 0.8, "oscillation": 0.9,
        "regulation": 0.85, "control": 0.8, "adjustment": 0.8,
        "adaptation": 0.85, "response": 0.7, "reaction": 0.7,
        "dampening": 0.9, "amplification": 0.9, "reinforcement": 0.9,
        "stabilization": 0.85, "homeostasis": 0.95, "thermostat": 0.9,
        "governor": 0.85, "sensor": 0.8, "monitor": 0.8,
        "self-regulation": 0.95, "negative feedback": 0.95,
        "positive feedback": 0.95, "cascade": 0.8, "spiral": 0.85,
        "recursion": 0.8, "iteration": 0.75, "convergence": 0.8,
    },
    "dependency": {
        "dependency": 0.95, "dependent": 0.9, "coupling": 0.9,
        "interconnection": 0.9, "interaction": 0.8, "relation": 0.8,
        "upstream": 0.9, "downstream": 0.9, "prerequisite": 0.9,
        "sequential": 0.85, "causal": 0.85, "linked": 0.8,
        "connected": 0.8, "chain": 0.85, "cascade": 0.85,
        "domino": 0.9, "ripple": 0.85, "propagate": 0.85,
        "interdependent": 0.95, "symbiotic": 0.85, "parasitic": 0.8,
        "supply": 0.7, "demand": 0.7, "input": 0.7, "output": 0.7,
        "trigger": 0.8, "consequence": 0.8, "effect": 0.75,
    },
    "risk": {
        "risk": 0.95, "failure": 0.9, "vulnerability": 0.95,
        "threat": 0.9, "hazard": 0.9, "danger": 0.85,
        "catastrophe": 0.95, "collapse": 0.95, "crash": 0.9,
        "breakdown": 0.9, "malfunction": 0.9, "error": 0.8,
        "fault": 0.85, "defect": 0.85, "cascade failure": 0.95,
        "instability": 0.9, "deterioration": 0.85, "degradation": 0.85,
        "extinction": 0.9, "shutdown": 0.85, "outage": 0.9,
        "disruption": 0.85, "corruption": 0.85, "contamination": 0.85,
        "attack": 0.8, "exploit": 0.8, "breach": 0.85, "leak": 0.8,
        "overflow": 0.8, "runaway": 0.9, "meltdown": 0.95,
    },
}

# Known abstract patterns with their keyword signatures for classification
KNOWN_PATTERNS: List[Tuple[str, List[str]]] = [
    ("Distributed Flow Under Variable Demand",
     ["flow", "routing", "queue", "traffic", "congestion", "throughput",
      "bottleneck", "network", "distribution", "channel", "pipe", "stream"]),
    ("Rapid Spread Through Connected Population",
     ["spread", "propagation", "epidemic", "cascade", "diffusion", "viral",
      "contagion", "infection", "transmission", "outbreak", "pandemic"]),
    ("Uncertain Arrivals with Priority Queuing",
     ["schedule", "priority", "triage", "allocation", "queue", "arrival",
      "waiting", "urgent", "emergency", "appointment", "scheduling"]),
    ("Decentralized Task Allocation Under Local Information",
     ["swarm", "decentralized", "multi-agent", "consensus", "cooperative",
      "autonomous", "distributed", "foraging", "colony", "self-organized"]),
    ("Delayed Feedback Oscillations & System Instability",
     ["feedback", "oscillation", "instability", "delay", "control loop",
      "resonance", "damping", "overshoot", "undershoot", "PID"]),
    ("Impedance Matching & Peak Load Buffering",
     ["buffer", "peak", "load", "capacity", "impedance", "reservoir",
      "cache", "storage", "surge", "spike", "absorb", "smooth"]),
    ("Resonant Frequency Phase Disruption & Damping",
     ["damping", "suppression", "vibration", "frequency", "phase",
      "resonance", "harmonic", "wave", "amplitude", "attenuation"]),
    ("Redundancy Fallback & Fail-Safe Topology",
     ["fault", "redundancy", "failover", "backup", "fail-safe", "recovery",
      "replication", "resilient", "tolerance", "graceful degradation"]),
    ("Stigmergic Signaling & Environmental Memory",
     ["pheromone", "stigmergy", "signal", "trail", "memory", "marker",
      "trace", "scent", "environmental cue", "indirect communication"]),
    ("Modular Abstraction & Layered Protocol Coupling",
     ["modular", "layer", "abstraction", "protocol", "encapsulation",
      "interface", "API", "stack", "separation of concerns", "plug"]),
    ("Cascading Failure Containment",
     ["cascade", "failure", "containment", "circuit breaker", "isolation",
      "firewall", "bulkhead", "quarantine", "fuse", "threshold"]),
    ("Resource Competition & Niche Partitioning",
     ["competition", "niche", "resource", "exclusion", "coexistence",
      "territory", "habitat", "species", "predator", "prey", "food web"]),
    ("Hierarchical Control & Multi-Scale Coordination",
     ["hierarchy", "scale", "coordination", "governance", "top-down",
      "bottom-up", "manager", "supervisor", "nested", "multi-level"]),
    ("Self-Organization & Emergent Collective Behavior",
     ["emergence", "self-organization", "collective", "flock", "murmuration",
      "pattern formation", "spontaneous", "order from chaos", "swarm"]),
    ("Signal Noise Separation & Information Extraction",
     ["noise", "signal", "filter", "detection", "separation", "SNR",
      "extraction", "classification", "anomaly", "pattern recognition"]),
    # ── New patterns (matched to database reclassification) ──
    ("Adaptive Learning & Evolutionary Optimization",
     ["evolutionary", "genetic algorithm", "reinforcement learning", "adaptive",
      "neural network", "deep learning", "gradient", "machine learning", "backpropagation"]),
    ("Graph Structure & Topological Analysis",
     ["graph neural", "graph network", "topology", "isomorphism", "spectral",
      "adjacency", "node embedding", "link prediction", "community detection", "centrality"]),
    ("Cryptographic Security & Trust Protocols",
     ["encryption", "cryptographic", "blockchain", "byzantine", "trust protocol",
      "zero knowledge", "secure computation", "digital signature", "authentication"]),
    ("Quantum State Control & Error Correction",
     ["qubit", "quantum error", "decoherence", "entanglement", "superposition",
      "quantum circuit", "quantum gate", "fidelity", "quantum channel"]),
    ("Biological Network Regulation & Homeostasis",
     ["gene regulation", "protein interaction", "metabolism", "homeostasis",
      "circadian", "neuroplasticity", "synaptic", "cortical", "receptor", "membrane transport"]),
    ("Motion Planning & Path Optimization",
     ["motion planning", "path planning", "trajectory optimization", "navigation",
      "obstacle avoidance", "manipulation planning", "waypoint", "locomotion"]),
    ("Constraint Satisfaction & Safety Verification",
     ["barrier function", "lyapunov", "safety verification", "formal verification",
      "invariant", "constraint satisfaction", "reachability", "model checking", "control barrier"]),
    ("Analogical Reasoning & Knowledge Transfer",
     ["analogical reasoning", "transfer learning", "knowledge transfer", "cross-domain",
      "structural mapping", "metaphor", "relational reasoning", "domain adaptation"]),
    ("Market Dynamics & Financial Contagion",
     ["volatility", "stock market", "financial crash", "market dynamics",
      "portfolio optimization", "risk management", "financial contagion", "garch", "asset pricing"]),
    ("Multi-Modal Sensing & Sensor Fusion",
     ["sensor fusion", "multi-modal", "lidar", "radar fusion", "visual inertial",
      "data fusion", "perception fusion", "camera fusion", "point cloud"]),
]


def _score_text_against_indicators(text_lower: str, words: List[str], indicators: Dict[str, float]) -> Tuple[float, List[str]]:
    """Score how well text matches a set of keyword indicators. Returns (score, matched_keywords)."""
    total_score = 0.0
    matched = []
    for keyword, weight in indicators.items():
        if " " in keyword:
            # Multi-word indicator: check in full text
            if keyword in text_lower:
                total_score += weight
                matched.append(keyword)
        else:
            if keyword in words:
                total_score += weight
                matched.append(keyword)
    return total_score, matched


def _extract_noun_phrases(text: str) -> List[str]:
    """Extract candidate noun phrases from text using simple pattern matching."""
    # Remove common stop words and extract meaningful word sequences
    stop_words = {
        "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "shall", "can", "need", "dare", "ought",
        "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
        "as", "into", "through", "during", "before", "after", "above",
        "below", "between", "out", "off", "over", "under", "again", "further",
        "then", "once", "here", "there", "when", "where", "why", "how",
        "all", "each", "every", "both", "few", "more", "most", "other",
        "some", "such", "no", "nor", "not", "only", "own", "same", "so",
        "than", "too", "very", "just", "about", "also", "and", "but", "or",
        "if", "while", "because", "until", "although", "this", "that",
        "these", "those", "it", "its", "they", "them", "their", "we", "our",
        "you", "your", "he", "his", "she", "her", "my", "me", "i", "what",
        "which", "who", "whom", "whose",
    }
    words = re.findall(r'\b[a-zA-Z]+\b', text)
    meaningful = [w for w in words if w.lower() not in stop_words and len(w) > 2]
    return meaningful


def _classify_abstract_pattern(text: str) -> str:
    """Classify the problem text against known abstract structural patterns using keyword scoring."""
    text_lower = text.lower()
    words = set(re.findall(r'\b\w+\b', text_lower))

    best_pattern = "Complex System Dynamics & Optimization"
    best_score = 0.0

    for pattern_name, pattern_keywords in KNOWN_PATTERNS:
        score = 0.0
        for kw in pattern_keywords:
            if " " in kw:
                if kw in text_lower:
                    score += 1.5  # Multi-word matches are stronger signals
            else:
                if kw in words:
                    score += 1.0
        # Normalize by number of keywords to allow fair comparison
        normalized = score / len(pattern_keywords) if pattern_keywords else 0.0
        if normalized > best_score:
            best_score = normalized
            best_pattern = pattern_name

    return best_pattern


def _extract_keywords_tfidf(text: str, top_n: int = 8) -> List[str]:
    """Extract the most relevant keywords from text using term frequency scoring."""
    text_lower = text.lower()
    words = re.findall(r'\b[a-z]{3,}\b', text_lower)

    # Common English stop words that carry no structural meaning
    stop_words = {
        "the", "and", "for", "are", "but", "not", "you", "all", "can",
        "had", "her", "was", "one", "our", "out", "day", "get", "has",
        "him", "his", "how", "its", "may", "new", "now", "old", "see",
        "way", "who", "did", "let", "say", "she", "too", "use", "been",
        "many", "some", "them", "than", "each", "make", "like", "long",
        "look", "been", "call", "come", "could", "first", "into", "just",
        "know", "most", "much", "made", "more", "only", "over", "such",
        "take", "that", "then", "this", "time", "very", "when", "which",
        "with", "have", "from", "they", "will", "what", "been", "about",
        "would", "there", "their", "other", "could", "after", "also",
        "these", "those", "being", "where", "does", "doing", "during",
        "before", "should", "through", "between", "problem", "system",
        "issue", "using", "based", "often",
    }

    filtered = [w for w in words if w not in stop_words]
    if not filtered:
        return words[:top_n]

    freq = Counter(filtered)
    # Score: frequency * inverse document commonality (longer words are less common)
    scored = [(word, count * math.log(len(word))) for word, count in freq.items()]
    scored.sort(key=lambda x: x[1], reverse=True)
    return [word for word, _ in scored[:top_n]]


def extract_structural_elements(text: str) -> List[Dict[str, str]]:
    """
    Extracts 8 normalized structural elements from unstructured problem descriptions.
    Uses weighted keyword indicators and contextual sentence analysis.
    Every element is derived from the actual input text — nothing is predetermined.
    """
    text_lower = text.lower()
    words = set(re.findall(r'\b\w+\b', text_lower))
    sentences = re.split(r'[.!?;]+', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 5]
    noun_phrases = _extract_noun_phrases(text)

    elements = []

    for slot_type in STRUCTURAL_SLOTS:
        indicators = SLOT_INDICATORS[slot_type]
        best_score, matched_keywords = _score_text_against_indicators(text_lower, words, indicators)

        # Find the most relevant sentence for this slot
        best_sentence = ""
        best_sent_score = -1
        for sent in sentences:
            sent_lower = sent.lower()
            sent_words = set(re.findall(r'\b\w+\b', sent_lower))
            sent_score, _ = _score_text_against_indicators(sent_lower, sent_words, indicators)
            if sent_score > best_sent_score:
                best_sent_score = sent_score
                best_sentence = sent

        # Construct element name from matched keywords + noun phrases
        if matched_keywords:
            # Build a descriptive name from what was actually found
            primary_match = matched_keywords[0].capitalize()
            if slot_type == "entity":
                name = f"{primary_match}"
                if len(noun_phrases) > 0:
                    # Use actual nouns from the text
                    relevant_nouns = [n for n in noun_phrases[:5] if n.lower() in text_lower and n.lower() != primary_match.lower()]
                    if relevant_nouns:
                        name = f"{relevant_nouns[0].capitalize()} ({primary_match})"
                    else:
                        name = f"{primary_match}"
            elif slot_type == "constraint":
                name = f"{primary_match} Constraint"
                if len(matched_keywords) > 1:
                    name = f"{primary_match} / {matched_keywords[1].capitalize()} Constraint"
            elif slot_type == "goal":
                name = f"{primary_match.capitalize()} Objective"
            elif slot_type == "flow":
                name = f"{primary_match.capitalize()} Flow"
                if len(matched_keywords) > 1:
                    name = f"{primary_match.capitalize()} {matched_keywords[1].capitalize()} Flow"
            elif slot_type == "bottleneck":
                name = f"{primary_match.capitalize()} Chokepoint"
            elif slot_type == "feedback":
                name = f"{primary_match.capitalize()} Loop"
                if len(matched_keywords) > 1:
                    name = f"{primary_match.capitalize()}-{matched_keywords[1].capitalize()} Loop"
            elif slot_type == "dependency":
                name = f"{primary_match.capitalize()} Coupling"
            elif slot_type == "risk":
                name = f"{primary_match.capitalize()} Vulnerability"
        else:
            # No keyword matches: derive from noun phrases and context
            if noun_phrases:
                context_noun = noun_phrases[min(STRUCTURAL_SLOTS.index(slot_type), len(noun_phrases) - 1)]
                name = f"{context_noun.capitalize()} ({slot_type.capitalize()} Factor)"
            else:
                name = f"Unspecified {slot_type.capitalize()} Factor"

        # Description from the best matching sentence, or a derived one
        if best_sentence and best_sent_score > 0:
            desc = best_sentence[:200].strip()
            if not desc.endswith("."):
                desc += "."
        elif matched_keywords:
            desc = f"Structural {slot_type} factor involving {', '.join(matched_keywords[:3])} identified in the problem context."
        else:
            desc = f"Implicit {slot_type} factor inferred from the overall problem structure."

        elements.append({
            "type": slot_type,
            "name": name,
            "description": desc
        })

    return elements


def extract_problem_structure(text: str) -> Dict[str, Any]:
    """
    Full structural analysis pipeline:
    1. Extract 8 structural elements from input text
    2. Classify abstract pattern against known pattern library
    3. Extract relevant keywords using TF-IDF scoring
    """
    elements = extract_structural_elements(text)
    abstract_pattern = _classify_abstract_pattern(text)
    keywords = _extract_keywords_tfidf(text)

    # Build summary from actual extracted elements
    element_names = [e["name"] for e in elements if "Unspecified" not in e["name"]]
    if element_names:
        summary = f"Structural analysis identified {len(element_names)} active elements: {', '.join(element_names[:4])}. Pattern class: {abstract_pattern}."
    else:
        summary = f"Structural analysis of problem text. Pattern class: {abstract_pattern}."

    return {
        "summary": summary,
        "elements": elements,
        "abstractPattern": abstract_pattern,
        "keywords": keywords
    }
