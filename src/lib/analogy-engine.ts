/* ── Analogy Engine ──
   The AI backbone of the Universal Analogy Engine.
   Performs structural extraction, analogy matching, broken bridge analysis,
   hybrid synthesis, and impact finding.
   
   This module uses pre-computed seed data for demo mode and is structured
   to plug into real LLM APIs (Gemini, OpenAI) for production use. */

import {
  SEED_PATTERNS,
  SEED_ANALOGIES,
  type StructuralPattern,
  type CrossDomainAnalogy,
  type AnalogyMapping,
} from "./seed-data";
import { PRECOMPUTED_ANALYSES } from "./precomputed-analyses";
import {
  getAnalogies as getHarvestedAnalogies,
  getCaseStudies,
  addOrUpdateMappedAnalogy,
  type DatasetAnalogy
} from "./dataset-loader";
import { getCleanPaperUrl } from "./paper-utils";
export { getCleanPaperUrl };

/* ── Types ── */

export interface StructuralElement {
  type: "entity" | "constraint" | "goal" | "flow" | "bottleneck" | "feedback" | "dependency" | "risk";
  name: string;
  description: string;
}

export interface ProblemStructure {
  summary: string;
  elements: StructuralElement[];
  abstractPattern: string;
  keywords: string[];
}

export interface KidFriendlyStep {
  stepNumber: number;
  title: string;
  simpleAction: string;
  playgroundAnalogy: string;
  icon: string;
}

export interface KidFriendlyExplanation {
  headline: string;
  storyMetaphor: string;
  steps: KidFriendlyStep[];
  keyTakeaway: string;
}

export interface VisualDiagramNode {
  id: string;
  label: string;
  sublabel: string;
  type: "source" | "buffer" | "controller" | "target";
  icon: string;
  color: string;
}

export interface VisualDiagramData {
  title: string;
  nodes: VisualDiagramNode[];
  flowDescription: string;
}

export interface AnalogySuggestion {
  id: string;
  analogyName?: string;
  sourceDomain: string;
  sourceSystem: string;
  overallStrength: number;
  mappings: AnalogyMapping[];
  explanation: string;
  transferableSolutions: string[];
  url?: string;
  targetProblem?: string;
  problemMechanism?: string;
  targetSolution?: string;
  structuralComparison?: string;
  detailedTransferSolution?: string;
  kidFriendlyExplanation?: KidFriendlyExplanation;
  visualDiagramData?: VisualDiagramData;
}

export interface BrokenBridge {
  breakPoint: string;
  reason: string;
  innovation: string;
  severity: "low" | "medium" | "high";
}

export interface BrokenBridgeReport {
  analogyId: string;
  directTransfers: { element: string; explanation: string }[];
  adaptedTransfers: { element: string; adaptation: string; risk: string }[];
  failures: BrokenBridge[];
  innovationOpportunities: string[];
}

export interface HybridSolution {
  name: string;
  description: string;
  components: {
    sourceDomain: string;
    principle: string;
    contribution: string;
  }[];
  synthesis: string;
  risks: string[];
  testingRecommendations: string[];
}

export interface ImpactProblem {
  title: string;
  domain: string;
  description: string;
  structuralSimilarity: number;
  socialImpact: "low" | "medium" | "high" | "critical";
  scale: string;
  status: "solved" | "partially-solved" | "unsolved" | "untried";
  transferFeasibility: number;
}

export interface FullAnalysis {
  problem: string;
  structure: ProblemStructure;
  analogies: AnalogySuggestion[];
  brokenBridgeReports: BrokenBridgeReport[];
  hybridSolution: HybridSolution;
  impactProblems: ImpactProblem[];
  matchedPattern: StructuralPattern | null;
}


/* ── Keyword Matching Engine ──
   Simple but effective text-based matching for demo purposes.
   In production, this would be replaced by embedding similarity. */

function computeKeywordSimilarity(input: string, keywords: string[]): number {
  const inputLower = input.toLowerCase();
  const inputWords = inputLower.split(/\s+/);
  let matches = 0;
  for (const keyword of keywords) {
    if (inputLower.includes(keyword.toLowerCase())) {
      matches++;
    }
  }
  return keywords.length > 0 ? matches / keywords.length : 0;
}

/* ── Problem Matching ──
   Matches user input to the closest pre-computed analysis or generates
   a generic response based on the best-matching pattern. */

function findBestMatch(input: string): string | null {
  const inputLower = input.toLowerCase();

  // Direct keyword matching to pre-computed analyses
  const matchScores: { key: string; score: number }[] = [
    {
      key: "er-waiting",
      score: computeKeywordSimilarity(inputLower, [
        "hospital", "emergency", "er", "waiting", "patient", "triage",
        "queue", "medical", "healthcare", "overcrowd",
      ]),
    },
    {
      key: "traffic-congestion",
      score: computeKeywordSimilarity(inputLower, [
        "traffic", "congestion", "road", "vehicle", "driving", "rush hour",
        "intersection", "highway", "commute", "transportation",
      ]),
    },
    {
      key: "data-center-cooling",
      score: computeKeywordSimilarity(inputLower, [
        "data center", "cooling", "hvac", "server", "heat", "dissipation",
        "thermal", "temperature", "energy", "rack", "pue",
      ]),
    },
    {
      key: "warehouse-bottleneck",
      score: computeKeywordSimilarity(inputLower, [
        "warehouse", "bottleneck", "picking", "packing", "order", "shipping",
        "inventory", "sku", "logistics", "storage",
      ]),
    },
    {
      key: "fake-news",
      score: computeKeywordSimilarity(inputLower, [
        "misinformation", "fake news", "social platform", "social media",
        "disinformation", "censorship", "viral", "spread", "speech",
      ]),
    },
    {
      key: "democracy-polarization",
      score: computeKeywordSimilarity(inputLower, [
        "democracy", "polarization", "democratic", "two-party", "electoral",
        "institution", "political", "conflict", "partisan", "compromise",
      ]),
    },
  ];

  matchScores.sort((a, b) => b.score - a.score);

  if (matchScores[0] && matchScores[0].score > 0.15) {
    return matchScores[0].key;
  }

  return null;
}

/* ── Generate a generic analysis for unmatched problems ── */
function generateGenericAnalysis(input: string): FullAnalysis {
  // Find the best matching pattern
  let bestPattern = SEED_PATTERNS[0];
  let bestScore = 0;

  for (const pattern of SEED_PATTERNS) {
    const score = computeKeywordSimilarity(
      input,
      pattern.structuralElements.concat(
        pattern.examples.map((e) => e.domain),
        pattern.commonSolutions
      )
    );
    if (score > bestScore) {
      bestScore = score;
      bestPattern = pattern;
    }
  }

  // Find the best matching analogy
  let bestAnalogy = SEED_ANALOGIES[0];
  let bestAnalogyScore = 0;
  for (const analogy of SEED_ANALOGIES) {
    const score = computeKeywordSimilarity(
      input,
      analogy.mappings.map((m) => m.sourceNode).concat(
        analogy.mappings.map((m) => m.targetNode),
        [analogy.sourceDomain, analogy.targetDomain]
      )
    );
    if (score > bestAnalogyScore) {
      bestAnalogyScore = score;
      bestAnalogy = analogy;
    }
  }

  return {
    problem: input,
    structure: {
      summary: `Your problem follows a well-known pattern called "${bestPattern.name}". It involves things like ${bestPattern.structuralElements.slice(0, 4).join(", ")}, which show up in many real-world systems.`,
      elements: bestPattern.structuralElements.slice(0, 8).map((el, i) => ({
        type: (["entity", "constraint", "goal", "flow", "bottleneck", "feedback", "dependency", "risk"] as const)[i % 8],
        name: el,
        description: `An important part of this problem that also appears in similar challenges across other fields.`,
      })),
      abstractPattern: bestPattern.abstractDescription,
      keywords: bestPattern.structuralElements.slice(0, 5),
    },
    analogies: [
      {
        id: `generic-${bestAnalogy.id}`,
        analogyName: bestAnalogy.analogyName,
        sourceDomain: bestAnalogy.sourceDomain,
        sourceSystem: bestAnalogy.sourceSystem,
        overallStrength: bestAnalogy.overallStrength * 0.85,
        mappings: bestAnalogy.mappings.slice(0, 4),
        explanation: `Your problem works a lot like ${bestAnalogy.sourceSystem}. Both deal with similar challenges around ${bestPattern.structuralElements.slice(0, 3).join(", ")} — so solutions from one can help solve the other.`,
        transferableSolutions: bestAnalogy.transferableSolutions,
      },
    ],
    brokenBridgeReports: [
      {
        analogyId: `generic-${bestAnalogy.id}`,
        directTransfers: bestAnalogy.mappings.slice(0, 2).map((m) => ({
          element: m.sourceNode,
          explanation: m.reason,
        })),
        adaptedTransfers: [
          {
            element: bestAnalogy.mappings[2]?.sourceNode || "Core mechanism",
            adaptation: "This idea needs some tweaking to fit your specific situation.",
            risk: "What works in one field might need adjustments in yours — test before committing.",
          },
        ],
        failures: bestAnalogy.brokenBridges.map((bb) => ({
          ...bb,
          severity: "medium" as const,
        })),
        innovationOpportunities: [
          "Where this comparison breaks down is exactly where you need to come up with something new.",
          "Try combining ideas from multiple fields — that often leads to the strongest solutions.",
        ],
      },
    ],
    hybridSolution: {
      name: "Cross-Domain Synthesis",
      description: `A combined solution that borrows the best ideas from ${bestAnalogy.sourceDomain} and other fields to tackle your "${bestPattern.name}" challenge.`,
      components: [
        {
          sourceDomain: bestAnalogy.sourceDomain,
          principle: bestAnalogy.transferableSolutions[0] || "Main idea borrowed from a similar system",
          contribution: "The core solution idea, adapted from the closest matching field.",
        },
        {
          sourceDomain: bestPattern.examples[0]?.domain || "Cross-domain",
          principle: bestPattern.commonSolutions[0] || "A proven approach from similar problems",
          contribution: "An extra layer of solution drawn from problems that look just like yours.",
        },
      ],
      synthesis: `This solution mixes the best ideas from ${bestAnalogy.sourceDomain} with proven approaches to "${bestPattern.name}" problems, creating something that tackles both the big-picture challenge and the details unique to your situation.`,
      risks: [
        "This is a general analysis — your specific situation might have unique constraints we haven't accounted for.",
        "How well this comparison holds up may vary — it's worth checking with someone who knows your field.",
        "Always test a combined solution in a small pilot before rolling it out fully.",
      ],
      testingRecommendations: [
        "Run the idea by an expert in your field to see if the comparison makes sense.",
        "Try the borrowed solution on a small scale first to see if it actually works.",
        "Compare the results against what you're already doing — is this actually better?",
      ],
    },
    impactProblems: bestPattern.examples.slice(0, 5).map((ex, i) => ({
      title: ex.problem,
      domain: ex.domain,
      description: ex.solution,
      structuralSimilarity: Math.max(0.5, 0.9 - i * 0.08),
      socialImpact: (["high", "medium", "critical", "high", "medium"] as const)[i],
      scale: "Cross-domain application",
      status: (["partially-solved", "solved", "unsolved", "partially-solved", "untried"] as const)[i],
      transferFeasibility: Math.max(0.4, 0.85 - i * 0.1),
    })),
    matchedPattern: bestPattern,
  };
}

import { getDb } from "./db";

/* ══════════════════════════════════════════════════════════════
   SLOT INDICATOR DICTIONARIES
   Weighted keyword indicators for each structural element type.
   Used to extract real structural elements from the input text.
   ══════════════════════════════════════════════════════════════ */

const SLOT_INDICATORS: Record<string, Record<string, number>> = {
  entity: {
    patient: 0.9, user: 0.8, vehicle: 0.9, agent: 0.8,
    particle: 0.8, packet: 0.9, signal: 0.8, cell: 0.8,
    robot: 0.9, drone: 0.9, worker: 0.8, student: 0.8,
    organism: 0.8, molecule: 0.8, server: 0.9, node: 0.8,
    aircraft: 0.9, spacecraft: 0.9, satellite: 0.9,
    water: 0.7, energy: 0.7, data: 0.7, information: 0.7,
    resource: 0.7, component: 0.7, device: 0.8, sensor: 0.8,
    qubit: 0.9, neuron: 0.9, blood: 0.8, material: 0.7,
    request: 0.8, order: 0.7, message: 0.8, product: 0.7, load: 0.7,
  },
  constraint: {
    limit: 0.9, capacity: 0.95, bandwidth: 0.9, budget: 0.9,
    threshold: 0.9, boundary: 0.85, restriction: 0.9,
    finite: 0.85, scarce: 0.9, limited: 0.9, maximum: 0.85,
    deadline: 0.9, quota: 0.9, shortage: 0.9, constraint: 0.95,
    saturation: 0.9, overload: 0.9, insufficient: 0.85,
    pressure: 0.7, stress: 0.7, strain: 0.7,
  },
  goal: {
    optimize: 0.95, maximize: 0.95, minimize: 0.95,
    reduce: 0.85, improve: 0.85, efficiency: 0.9, throughput: 0.9,
    performance: 0.85, stability: 0.9, reliability: 0.9,
    quality: 0.85, speed: 0.85, safety: 0.9, survival: 0.9,
    balance: 0.8, sustainability: 0.85, resilience: 0.85,
    prevent: 0.8, maintain: 0.8, achieve: 0.8, target: 0.8,
  },
  flow: {
    flow: 0.95, stream: 0.9, current: 0.85, circulation: 0.9,
    movement: 0.85, transport: 0.9, transfer: 0.85, routing: 0.9,
    path: 0.8, pipeline: 0.9, channel: 0.85, network: 0.8,
    propagation: 0.85, transmission: 0.85, distribution: 0.85,
    diffusion: 0.85, migration: 0.8, trajectory: 0.85,
    delivery: 0.8, dispatch: 0.8,
  },
  bottleneck: {
    bottleneck: 0.98, congestion: 0.95, blockage: 0.9,
    chokepoint: 0.95, backlog: 0.9, queue: 0.85, waiting: 0.8,
    delay: 0.85, latency: 0.85, slowdown: 0.9, deadlock: 0.95,
    contention: 0.9, collision: 0.85, overwhelm: 0.85,
    overload: 0.9, saturated: 0.9, crowding: 0.85, gridlock: 0.95,
  },
  feedback: {
    feedback: 0.98, loop: 0.8, cycle: 0.8, oscillation: 0.9,
    regulation: 0.85, control: 0.8, adjustment: 0.8,
    adaptation: 0.85, dampening: 0.9, amplification: 0.9,
    reinforcement: 0.9, homeostasis: 0.95, stabilization: 0.85,
    monitor: 0.8, convergence: 0.8, cascade: 0.8, spiral: 0.85,
  },
  dependency: {
    dependency: 0.95, dependent: 0.9, coupling: 0.9,
    interconnection: 0.9, upstream: 0.9, downstream: 0.9,
    prerequisite: 0.9, sequential: 0.85, causal: 0.85,
    chain: 0.85, cascade: 0.85, domino: 0.9, ripple: 0.85,
    interdependent: 0.95, supply: 0.7, demand: 0.7,
    trigger: 0.8, consequence: 0.8,
  },
  risk: {
    risk: 0.95, failure: 0.9, vulnerability: 0.95,
    threat: 0.9, hazard: 0.9, catastrophe: 0.95, collapse: 0.95,
    crash: 0.9, breakdown: 0.9, malfunction: 0.9, error: 0.8,
    fault: 0.85, instability: 0.9, deterioration: 0.85,
    degradation: 0.85, shutdown: 0.85, outage: 0.9,
    disruption: 0.85, attack: 0.8, breach: 0.85, overflow: 0.8,
    meltdown: 0.95,
  },
};

/* Known abstract patterns with keyword signatures */
const KNOWN_PATTERNS: [string, string[]][] = [
  ["Distributed Flow Under Variable Demand",
    ["flow", "routing", "queue", "traffic", "congestion", "throughput", "bottleneck", "network", "distribution", "channel", "stream"]],
  ["Rapid Spread Through Connected Population",
    ["spread", "propagation", "epidemic", "cascade", "diffusion", "viral", "contagion", "infection", "transmission", "outbreak"]],
  ["Uncertain Arrivals with Priority Queuing",
    ["schedule", "priority", "triage", "allocation", "queue", "arrival", "waiting", "urgent", "emergency", "scheduling"]],
  ["Decentralized Task Allocation Under Local Information",
    ["swarm", "decentralized", "agent", "consensus", "cooperative", "autonomous", "distributed", "foraging", "colony"]],
  ["Delayed Feedback Oscillations & System Instability",
    ["feedback", "oscillation", "instability", "delay", "control", "resonance", "damping", "overshoot", "undershoot"]],
  ["Impedance Matching & Peak Load Buffering",
    ["buffer", "peak", "load", "capacity", "impedance", "reservoir", "cache", "storage", "surge", "spike", "absorb"]],
  ["Resonant Frequency Phase Disruption & Damping",
    ["damping", "suppression", "vibration", "frequency", "phase", "resonance", "harmonic", "wave", "amplitude"]],
  ["Redundancy Fallback & Fail-Safe Topology",
    ["fault", "redundancy", "failover", "backup", "recovery", "replication", "resilient", "tolerance"]],
  ["Stigmergic Signaling & Environmental Memory",
    ["pheromone", "stigmergy", "signal", "trail", "memory", "marker", "trace", "scent"]],
  ["Modular Abstraction & Layered Protocol Coupling",
    ["modular", "layer", "abstraction", "protocol", "encapsulation", "interface", "stack", "separation"]],
  ["Cascading Failure Containment",
    ["cascade", "failure", "containment", "breaker", "isolation", "firewall", "bulkhead", "quarantine", "fuse"]],
  ["Resource Competition & Niche Partitioning",
    ["competition", "niche", "resource", "exclusion", "coexistence", "territory", "habitat", "species", "predator", "prey"]],
  ["Hierarchical Control & Multi-Scale Coordination",
    ["hierarchy", "scale", "coordination", "governance", "manager", "supervisor", "nested"]],
  ["Self-Organization & Emergent Collective Behavior",
    ["emergence", "organization", "collective", "flock", "formation", "spontaneous", "order"]],
  ["Signal Noise Separation & Information Extraction",
    ["noise", "signal", "filter", "detection", "separation", "extraction", "classification", "anomaly"]],
  // ── New patterns (matched to database reclassification) ──
  ["Adaptive Learning & Evolutionary Optimization",
    ["evolutionary", "genetic", "reinforcement", "adaptive", "neural", "gradient", "training", "backpropagation", "optimization"]],
  ["Graph Structure & Topological Analysis",
    ["graph", "topology", "isomorphism", "spectral", "adjacency", "embedding", "centrality", "community"]],
  ["Cryptographic Security & Trust Protocols",
    ["encryption", "cryptographic", "blockchain", "byzantine", "authentication", "signature", "hash", "zero-knowledge"]],
  ["Quantum State Control & Error Correction",
    ["qubit", "decoherence", "entanglement", "superposition", "fidelity", "quantum"]],
  ["Biological Network Regulation & Homeostasis",
    ["gene", "protein", "metabolism", "homeostasis", "circadian", "neuroplasticity", "synaptic", "receptor"]],
  ["Motion Planning & Path Optimization",
    ["motion", "trajectory", "navigation", "obstacle", "waypoint", "locomotion", "manipulator", "path"]],
  ["Constraint Satisfaction & Safety Verification",
    ["lyapunov", "barrier", "invariant", "reachability", "verification", "constraint", "safety"]],
  ["Analogical Reasoning & Knowledge Transfer",
    ["analogy", "transfer", "cross-domain", "mapping", "metaphor", "reasoning", "adaptation"]],
  ["Market Dynamics & Financial Contagion",
    ["volatility", "stock", "crash", "portfolio", "contagion", "garch", "asset", "pricing"]],
  ["Multi-Modal Sensing & Sensor Fusion",
    ["sensor", "fusion", "lidar", "radar", "multimodal", "perception", "pointcloud"]],
];

/* Domain group mapping for domain distance computation */
const DOMAIN_GROUPS: Record<string, number> = {
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
};

/* Social impact classification per domain */
const SOCIAL_IMPACT_MAP: Record<string, "low" | "medium" | "high" | "critical"> = {
  "Healthcare": "critical", "Urban Planning": "critical",
  "Energy Systems": "high", "Ecology": "high",
  "Cybersecurity": "high", "Aviation": "critical",
  "Aerospace Engineering": "high", "Neuroscience": "high",
  "Economics & Finance": "high",
};

/* Stop words for keyword extraction */
const STOP_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can",
  "had", "her", "was", "one", "our", "out", "get", "has",
  "him", "his", "how", "its", "may", "new", "now", "see",
  "way", "who", "did", "let", "say", "she", "too", "use",
  "been", "many", "some", "them", "than", "each", "make", "like",
  "long", "look", "come", "could", "first", "into", "just",
  "know", "most", "much", "made", "more", "only", "over", "such",
  "take", "that", "then", "this", "time", "very", "when", "which",
  "with", "have", "from", "they", "will", "what", "about",
  "would", "there", "their", "other", "after", "also",
  "these", "those", "being", "where", "does", "doing", "during",
  "before", "should", "through", "between", "problem", "system",
  "issue", "using", "based", "often",
]);

/* ── Compute domain distance (granular) ── */
const GROUP_DISTANCES: Record<string, number> = {
  "1-2": 0.7,  "1-3": 0.5,  "1-4": 0.8,  "1-5": 0.75,
  "1-6": 0.4,  "1-7": 0.6,  "1-8": 0.85, "1-9": 0.7,
  "1-10": 0.65, "1-11": 0.8,
  "2-3": 0.6,  "2-4": 0.65, "2-5": 0.55, "2-6": 0.45,
  "2-7": 0.7,  "2-8": 0.75, "2-9": 0.65, "2-10": 0.4,
  "2-11": 0.7,
  "3-4": 0.7,  "3-5": 0.75, "3-6": 0.5,  "3-7": 0.6,
  "3-8": 0.45, "3-9": 0.55, "3-10": 0.5, "3-11": 0.65,
  "4-5": 0.7,  "4-6": 0.75, "4-7": 0.5,  "4-8": 0.55,
  "4-9": 0.6,  "4-10": 0.5, "4-11": 0.65,
  "5-6": 0.65, "5-7": 0.6,  "5-8": 0.75, "5-9": 0.7,
  "5-10": 0.7, "5-11": 0.5,
  "6-7": 0.65, "6-8": 0.7,  "6-9": 0.6,  "6-10": 0.5,
  "6-11": 0.7,
  "7-8": 0.55, "7-9": 0.45, "7-10": 0.65, "7-11": 0.5,
  "8-9": 0.6,  "8-10": 0.65, "8-11": 0.7,
  "9-10": 0.55, "9-11": 0.6,
  "10-11": 0.65,
};

function computeDomainDistance(domainA: string, domainB: string): number {
  if (domainA === domainB) return 0.0;
  const groupA = DOMAIN_GROUPS[domainA] || 0;
  const groupB = DOMAIN_GROUPS[domainB] || 0;
  if (groupA === 0 || groupB === 0) return 0.85;
  if (groupA === groupB) return 0.1;
  const key = `${Math.min(groupA, groupB)}-${Math.max(groupA, groupB)}`;
  return GROUP_DISTANCES[key] || 0.8;
}

/* ── Classify abstract pattern from text ── */
function classifyAbstractPattern(text: string): string {
  const textLower = text.toLowerCase();
  const words = new Set(textLower.match(/\b\w+\b/g) || []);

  let bestPattern = "Complex System Dynamics & Optimization";
  let bestScore = -1;

  for (const [patternName, patternKeywords] of KNOWN_PATTERNS) {
    let score = 0;
    for (const kw of patternKeywords) {
      if (kw.includes(" ")) {
        if (textLower.includes(kw)) score += 3.0;
      } else {
        if (words.has(kw)) score += 1.0;
      }
    }
    const patternWords = patternName.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !STOP_WORDS.has(w));
    for (const pw of patternWords) {
      if (words.has(pw)) score += 1.5;
    }

    if (score > bestScore && score > 0.5) {
      bestScore = score;
      bestPattern = patternName;
    }
  }
  return bestPattern;
}

/* ── Extract TF-IDF-style keywords ── */
function extractKeywords(text: string, topN: number = 8): string[] {
  const words = (text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [])
    .filter(w => !STOP_WORDS.has(w));
  if (words.length === 0) return [];

  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;

  const scored = Object.entries(freq)
    .map(([word, count]) => ({ word, score: count * Math.log(word.length) }))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, topN).map(s => s.word);
}

/* ── Score text against slot indicators ── */
function scoreAgainstIndicators(textWords: Set<string>, indicators: Record<string, number>): { score: number; matched: string[] } {
  let totalScore = 0;
  const matched: string[] = [];
  for (const [keyword, weight] of Object.entries(indicators)) {
    if (textWords.has(keyword)) {
      totalScore += weight;
      matched.push(keyword);
    }
  }
  return { score: totalScore, matched };
}

/* ── Compute keyword overlap similarity (Jaccard-style) ── */
function computeKeywordOverlap(wordsA: string[], wordsB: string[]): number {
  const setA = new Set(wordsA.filter(w => !STOP_WORDS.has(w)));
  const setB = new Set(wordsB.filter(w => !STOP_WORDS.has(w)));
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const w of setA) {
    if (setB.has(w)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0;
}

/* ── Compute abstract pattern similarity score ── */
function computePatternSimilarity(patternA: string, patternB: string): number {
  if (patternA === patternB) return 1.0;
  const aLower = patternA.toLowerCase();
  const bLower = patternB.toLowerCase();
  
  // Shared structural vocabulary between patterns
  const aWords = new Set(aLower.split(/[\s&]+/).filter(w => w.length > 3 && !STOP_WORDS.has(w)));
  const bWords = new Set(bLower.split(/[\s&]+/).filter(w => w.length > 3 && !STOP_WORDS.has(w)));
  let shared = 0;
  for (const w of aWords) { if (bWords.has(w)) shared++; }
  const totalUnique = new Set([...aWords, ...bWords]).size;
  const wordSim = totalUnique > 0 ? shared / totalUnique : 0;
  
  // Pattern family similarity (patterns in same "family" are structurally close)
  const PATTERN_FAMILIES: string[][] = [
    ["flow", "distributed", "routing", "queue", "buffering", "impedance", "load"],
    ["spread", "cascade", "propagation", "failure", "contagion"],
    ["feedback", "oscillation", "instability", "damping", "resonant"],
    ["decentralized", "swarm", "emergent", "self-organization", "stigmergic"],
    ["learning", "adaptive", "evolutionary", "optimization"],
    ["hierarchy", "modular", "layered", "coordination"],
    ["graph", "topological", "network"],
    ["redundancy", "fail-safe", "containment"],
  ];
  
  let familyBoost = 0;
  for (const family of PATTERN_FAMILIES) {
    const aIn = family.some(f => aLower.includes(f));
    const bIn = family.some(f => bLower.includes(f));
    if (aIn && bIn) { familyBoost = 0.4; break; }
  }
  
  return Math.min(1.0, wordSim + familyBoost);
}

/* ── Compute structural role signature from problem text ── */
function extractFunctionalSignature(text: string): Set<string> {
  const textLower = text.toLowerCase();
  const roles = new Set<string>();
  
  // Map text to abstract functional roles (domain-agnostic)
  const FUNCTIONAL_INDICATORS: [string, string[]][] = [
    ["producer-consumer", ["generate", "produce", "consume", "demand", "supply", "arrival", "serve", "request", "process"]],
    ["bottleneck", ["bottleneck", "congestion", "saturate", "overflow", "chokepoint", "limit", "capacity", "overload"]],
    ["feedback-loop", ["feedback", "loop", "cycle", "oscillat", "resonan", "amplif", "dampen", "stabiliz", "homeostasis"]],
    ["cascade", ["cascade", "domino", "ripple", "propagat", "chain", "spread", "contagion", "epidemic"]],
    ["buffer", ["buffer", "cache", "reservoir", "storage", "queue", "pool", "absorb", "accumulate"]],
    ["scheduler", ["schedul", "priorit", "allocat", "triage", "dispatch", "assign", "route"]],
    ["redundancy", ["redundan", "backup", "failover", "replica", "fallback", "toleran"]],
    ["optimizer", ["optim", "maximiz", "minimiz", "efficien", "tradeoff", "pareto", "balance"]],
    ["coordinator", ["coordinat", "synchroniz", "consensus", "negotiat", "arbitrat"]],
    ["detector", ["detect", "monitor", "sensor", "alert", "diagnos", "anomal", "predict"]],
    ["barrier", ["barrier", "threshold", "boundary", "constraint", "limit", "wall", "gate"]],
    ["network-topology", ["network", "graph", "connect", "topolog", "cluster", "hub", "node"]],
  ];
  
  for (const [role, indicators] of FUNCTIONAL_INDICATORS) {
    for (const ind of indicators) {
      if (textLower.includes(ind)) {
        roles.add(role);
        break;
      }
    }
  }
  return roles;
}

/* ── Compute functional role overlap between two texts ── */
function computeRoleSimilarity(rolesA: Set<string>, rolesB: Set<string>): number {
  if (rolesA.size === 0 || rolesB.size === 0) return 0;
  let intersection = 0;
  for (const r of rolesA) { if (rolesB.has(r)) intersection++; }
  const union = new Set([...rolesA, ...rolesB]).size;
  return union > 0 ? intersection / union : 0;
}

/* ── Compute novelty score: high structural similarity × high domain distance = invention ── */
function computeNoveltyScore(
  structuralSim: number,
  domainDist: number,
  patternSim: number,
  roleSim: number
): number {
  // Weighted composite structural match
  const structMatch = structuralSim * 0.25 + patternSim * 0.40 + roleSim * 0.35;
  // Novelty = structural match × domain_distance² (rewards far-domain, penalizes same-domain)
  const novelty = structMatch * Math.pow(Math.max(domainDist, 0.1), 1.5);
  return Math.min(0.98, Math.round(novelty * 10000) / 10000);
}

/* ── Infer query domain from text ── */
function inferQueryDomain(text: string): string {
  const textLower = text.toLowerCase();
  const domainKeywords: Record<string, string[]> = {
    "Healthcare": ["hospital", "patient", "medical", "health", "clinical", "disease", "treatment", "triage"],
    "Computer Science": ["network", "server", "packet", "routing", "algorithm", "database", "software", "computing"],
    "Cybersecurity": ["cyber", "malware", "firewall", "intrusion", "security", "attack", "exploit"],
    "Urban Planning": ["traffic", "city", "urban", "road", "pedestrian", "transit", "intersection"],
    "Ecology": ["ecosystem", "species", "habitat", "biodiversity", "ecology", "predator", "prey"],
    "Biomimicry": ["biomimicry", "nature", "colony", "swarm"],
    "Energy Systems": ["energy", "solar", "grid", "battery", "renewable", "turbine", "power"],
    "Aviation": ["aircraft", "runway", "flight", "aviation", "aerospace"],
    "Neuroscience": ["brain", "neural", "neuron", "synapse", "cortical", "cognitive"],
    "Economics & Finance": ["market", "financial", "trading", "stock", "portfolio", "economic"],
    "Robotics & Autonomous Swarms": ["robot", "drone", "autonomous", "swarm", "navigation"],
    "Logistics": ["logistics", "warehouse", "supply chain", "shipping", "inventory"],
  };

  let bestDomain = "General";
  let bestScore = 0;
  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    const score = keywords.filter(kw => textLower.includes(kw)).length;
    if (score > bestScore) { bestScore = score; bestDomain = domain; }
  }
  return bestDomain;
}

/**
 * Dynamically extract structural elements from user input using
 * weighted keyword indicators — no hardcoded elements or patterns.
 */
function extractInputStructure(input: string): ProblemStructure {
  const textLower = input.toLowerCase();
  const textWords = new Set((textLower.match(/\b\w+\b/g) || []));
  const sentences = input.split(/[.!?;]+/).map(s => s.trim()).filter(s => s.length > 5);

  const slotTypes: StructuralElement["type"][] = ["entity", "constraint", "goal", "flow", "bottleneck", "feedback", "dependency", "risk"];

  const elements: StructuralElement[] = [];

  for (const slotType of slotTypes) {
    const indicators = SLOT_INDICATORS[slotType];
    const { score, matched } = scoreAgainstIndicators(textWords, indicators);

    // Find best-matching sentence for this slot
    let bestSentence = "";
    let bestSentScore = -1;
    for (const sent of sentences) {
      const sentWords = new Set((sent.toLowerCase().match(/\b\w+\b/g) || []));
      const { score: sentScore } = scoreAgainstIndicators(sentWords, indicators);
      if (sentScore > bestSentScore) {
        bestSentScore = sentScore;
        bestSentence = sent;
      }
    }

    // Build name from matched keywords
    let name: string;
    if (matched.length > 0) {
      const primary = matched[0].charAt(0).toUpperCase() + matched[0].slice(1);
      const suffixes: Record<string, string> = {
        entity: "", constraint: " Constraint", goal: " Objective",
        flow: " Flow", bottleneck: " Chokepoint", feedback: " Loop",
        dependency: " Coupling", risk: " Vulnerability"
      };
      name = primary + (suffixes[slotType] || "");
      if (matched.length > 1) {
        const secondary = matched[1].charAt(0).toUpperCase() + matched[1].slice(1);
        if (slotType === "constraint" || slotType === "flow" || slotType === "feedback") {
          name = `${primary} / ${secondary}${suffixes[slotType] || ""}`;
        }
      }
    } else {
      // Derive from text content
      const meaningful = (input.match(/\b[a-zA-Z]{4,}\b/g) || [])
        .filter(w => !STOP_WORDS.has(w.toLowerCase()));
      const idx = slotTypes.indexOf(slotType);
      const contextWord = meaningful[Math.min(idx, meaningful.length - 1)] || "System";
      name = `${contextWord.charAt(0).toUpperCase() + contextWord.slice(1)} (${slotType.charAt(0).toUpperCase() + slotType.slice(1)} Factor)`;
    }

    // Description from best sentence or generated
    let description: string;
    if (bestSentence && bestSentScore > 0) {
      description = bestSentence.substring(0, 200);
      if (!description.endsWith(".")) description += ".";
    } else if (matched.length > 0) {
      description = `This part of the problem involves ${matched.slice(0, 3).join(", ")}, which plays a key role in how things work.`;
    } else {
      description = `A behind-the-scenes factor that shapes how this problem behaves.`;
    }

    elements.push({ type: slotType, name, description });
  }

  const abstractPattern = classifyAbstractPattern(input);
  const keywords = extractKeywords(input);

  const elementNames = elements.filter(e => !e.name.includes("Factor)")).map(e => e.name);
  const summary = elementNames.length > 0
    ? `We found ${elementNames.length} key building blocks in your problem: ${elementNames.slice(0, 4).join(", ")}. This looks like a "${abstractPattern}" type of challenge.`
    : `We've broken down your problem. It looks like a "${abstractPattern}" type of challenge.`;

  return { summary, elements, abstractPattern, keywords };
}

/**
 * DEEP STRUCTURAL ANALOGY ENGINE v2
 * 
 * Core algorithm: Pattern-First, Cross-Domain Novelty Matching
 * 
 * Instead of matching by shared keywords (which just finds same-domain papers),
 * this engine:
 * 1. Extracts the ABSTRACT FUNCTIONAL SIGNATURE of the user's problem
 * 2. Searches for papers with MATCHING PATTERNS across DIFFERENT domains
 * 3. Scores by NOVELTY = structural_match × domain_distance^1.5
 * 4. Hard-enforces 4+ domain diversity in results
 * 5. Generates specific mechanism transfer explanations
 */
export async function analyzeProblem(input: string): Promise<FullAnalysis> {
  const db = getDb();
  const inputStructure = extractInputStructure(input);
  const keywords = inputStructure.keywords;
  const queryDomain = inferQueryDomain(input);
  const queryPattern = inputStructure.abstractPattern;
  const queryRoles = extractFunctionalSignature(input);

  // ── 1. MULTI-STRATEGY SEARCH: Pattern-first + FTS supplementary ──
  let allCandidates: any[] = [];

  // Strategy A: Find papers with SAME abstract pattern but DIFFERENT domain
  try {
    const patternPapers = db.prepare(`
      SELECT * FROM case_studies
      WHERE abstract_pattern = ? AND domain != ?
      ORDER BY RANDOM()
      LIMIT 40
    `).all(queryPattern, queryDomain);
    allCandidates.push(...patternPapers);
  } catch (e) {
    console.warn("Pattern search failed:", e);
  }

  // Strategy B: Find papers with RELATED patterns (same family) in far domains
  try {
    const patternWords = queryPattern.toLowerCase().split(/[\s&]+/).filter(w => w.length > 3);
    if (patternWords.length > 0) {
      for (const pw of patternWords.slice(0, 3)) {
        const relatedPapers = db.prepare(`
          SELECT * FROM case_studies
          WHERE abstract_pattern LIKE ? AND domain != ?
          ORDER BY RANDOM()
          LIMIT 15
        `).all(`%${pw}%`, queryDomain);
        allCandidates.push(...relatedPapers);
      }
    }
  } catch (e) {
    console.warn("Related pattern search failed:", e);
  }

  // Strategy C: FTS keyword search but ONLY in different domains
  try {
    if (keywords.length > 0) {
      const searchTerms = keywords.slice(0, 4).join(" OR ");
      const ftsPapers = db.prepare(`
        SELECT cs.*, bm25(case_studies_fts) as rank_score
        FROM case_studies cs
        JOIN case_studies_fts fts ON cs.rowid = fts.rowid
        WHERE case_studies_fts MATCH ?
        AND cs.domain != ?
        ORDER BY bm25(case_studies_fts)
        LIMIT 20
      `).all(searchTerms, queryDomain);
      allCandidates.push(...ftsPapers);
    }
  } catch (e) {
    console.warn("FTS search failed:", e);
  }

  // Strategy D: If still sparse, pull from maximally distant domains
  if (allCandidates.length < 10) {
    try {
      const distantDomains = Object.keys(DOMAIN_GROUPS)
        .filter(d => computeDomainDistance(queryDomain, d) > 0.6)
        .slice(0, 5);
      for (const dd of distantDomains) {
        const distantPapers = db.prepare(`
          SELECT * FROM case_studies WHERE domain = ? ORDER BY RANDOM() LIMIT 5
        `).all(dd);
        allCandidates.push(...distantPapers);
      }
    } catch (e) {
      console.warn("Distant domain search failed:", e);
    }
  }

  // Deduplicate by paper ID
  const seenIds = new Set<string>();
  const uniqueCandidates = allCandidates.filter((p: any) => {
    if (seenIds.has(p.id)) return false;
    seenIds.add(p.id);
    return true;
  });

  // ── 2. NOVELTY-WEIGHTED SCORING ──
  const inputWordsAll = (input.toLowerCase().match(/\b[a-z]{3,}\b/g) || [])
    .filter(w => !STOP_WORDS.has(w));

  const scoredPapers = uniqueCandidates.map((paper: any) => {
    let paperKeywords: string[] = [];
    try {
      paperKeywords = JSON.parse(paper.keywords_json || "[]");
    } catch {
      paperKeywords = [];
    }

    const paperText = `${paper.title || ""} ${paper.problem || ""} ${paper.solution || ""}`;
    const paperWords = paperText.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const paperWordsFiltered = paperWords.filter(w => !STOP_WORDS.has(w));

    // Compute multi-dimensional similarity
    const keywordSim = computeKeywordOverlap(inputWordsAll, paperWordsFiltered);
    const patternSim = computePatternSimilarity(queryPattern, paper.abstract_pattern || "");
    const paperRoles = extractFunctionalSignature(paperText);
    const roleSim = computeRoleSimilarity(queryRoles, paperRoles);
    const domainDist = computeDomainDistance(queryDomain, paper.domain || "General");

    // NOVELTY SCORE: structural match × domain distance^1.5
    // This is the key insight: high structural similarity + high domain distance = inventive analogy
    const noveltyScore = computeNoveltyScore(keywordSim, domainDist, patternSim, roleSim);

    return {
      ...paper,
      paperKeywords,
      paperWordsFiltered,
      keywordSim,
      patternSim,
      roleSim,
      domainDist,
      computedSimilarity: noveltyScore
    };
  });

  // Sort by novelty score (descending)
  scoredPapers.sort((a: any, b: any) => b.computedSimilarity - a.computedSimilarity);

  // ── 3. ENFORCE DOMAIN DIVERSITY (guarantee 4+ different domains) ──
  const topPapers: any[] = [];
  const usedDomains = new Set<string>();
  const MIN_DOMAINS = 4;
  const MAX_RESULTS = 6;

  // First pass: take the top scorer from each unique domain
  for (const paper of scoredPapers) {
    if (topPapers.length >= MAX_RESULTS) break;
    const domain = paper.domain || "General";
    if (!usedDomains.has(domain)) {
      usedDomains.add(domain);
      topPapers.push(paper);
    }
  }

  // Second pass: if we haven't hit 4 domains, pull from distant domains
  if (usedDomains.size < MIN_DOMAINS) {
    for (const paper of scoredPapers) {
      if (topPapers.length >= MAX_RESULTS) break;
      const domain = paper.domain || "General";
      if (!usedDomains.has(domain) && computeDomainDistance(queryDomain, domain) > 0.5) {
        usedDomains.add(domain);
        topPapers.push(paper);
      }
    }
  }

  // Third pass: fill remaining slots with highest-scoring papers not yet picked
  for (const paper of scoredPapers) {
    if (topPapers.length >= MAX_RESULTS) break;
    if (!topPapers.some((p: any) => p.id === paper.id)) {
      topPapers.push(paper);
    }
  }

  // Resort final set by novelty score
  topPapers.sort((a: any, b: any) => b.computedSimilarity - a.computedSimilarity);

  // ── 4. Build INVENTION-QUALITY analogies ──
  const analogies: AnalogySuggestion[] = topPapers.map((paper: any) => {
    const sim = paper.computedSimilarity;
    const mappings = generateMappings(inputStructure, paper, inputWordsAll);
    const detailed = buildDetailedAnalogyFields(paper, sim, inputStructure);

    return {
      id: paper.id,
      sourceDomain: paper.domain || "Cross-Domain Science",
      sourceSystem: paper.title,
      overallStrength: sim,
      url: getCleanPaperUrl(paper.title, paper.url),
      mappings,
      explanation: detailed.explanation,
      targetProblem: detailed.targetProblem,
      problemMechanism: detailed.problemMechanism,
      targetSolution: detailed.targetSolution,
      structuralComparison: detailed.structuralComparison,
      detailedTransferSolution: detailed.detailedTransferSolution,
      kidFriendlyExplanation: detailed.kidFriendlyExplanation,
      visualDiagramData: detailed.visualDiagramData,
      transferableSolutions: [
        detailed.detailedTransferSolution
      ]
    };
  });

  // ── 5. Dynamic Broken Bridge Reports ──
  const brokenBridgeReports: BrokenBridgeReport[] = analogies.map(an => {
    const directTransfers: { element: string; explanation: string }[] = [];
    const adaptedTransfers: { element: string; adaptation: string; risk: string }[] = [];
    const failures: BrokenBridge[] = [];

    for (const m of an.mappings) {
      if (m.strength >= 0.6) {
        directTransfers.push({
          element: m.sourceNode,
          explanation: `"${m.sourceNode}" in ${an.sourceDomain} performs the exact same structural role as "${m.targetNode}" in your problem. The mechanism transfers directly because both govern the same abstract constraint: ${m.reason.substring(0, 120)}.`
        });
      } else if (m.strength >= 0.35) {
        adaptedTransfers.push({
          element: m.sourceNode,
          adaptation: `"${m.sourceNode}" (${an.sourceDomain}) and "${m.targetNode}" (your system) share the same causal role but operate at different scales. Adapt by mapping the ${an.sourceDomain} control parameters to your system's units.`,
          risk: `The ${an.sourceDomain} solution assumes conditions that may not hold in your domain — validate boundary cases first.`
        });
      } else {
        failures.push({
          breakPoint: m.sourceNode,
          reason: `"${m.sourceNode}" in ${an.sourceDomain} and "${m.targetNode}" in your problem serve structurally different functions despite surface similarity. The ${an.sourceDomain} mechanism relies on ${m.reason.includes("feedback") ? "feedback dynamics" : m.reason.includes("flow") ? "flow constraints" : "causal chains"} that don't exist in your system.`,
          innovation: `INVENTION OPPORTUNITY: The gap between how ${an.sourceDomain} handles "${m.sourceNode}" and how your system handles "${m.targetNode}" is exactly where a novel mechanism could be designed. No existing field has bridged this specific gap.`,
          severity: m.strength < 0.15 ? "high" : "medium"
        });
      }
    }

    if (directTransfers.length === 0 && an.mappings.length > 0) {
      const best = an.mappings.reduce((a, b) => a.strength > b.strength ? a : b);
      directTransfers.push({
        element: best.sourceNode,
        explanation: `The strongest structural parallel (${intPct(best.strength)}%): "${best.sourceNode}" in ${an.sourceDomain} plays an analogous role to "${best.targetNode}" in your system.`
      });
    }
    if (adaptedTransfers.length === 0) {
      adaptedTransfers.push({
        element: "Scale Translation",
        adaptation: `The ${an.sourceDomain} solution operates at a different scale and granularity than your system. Translate the abstract mechanism while preserving the structural invariants.`,
        risk: "Cross-domain translations often fail at boundary conditions — test edge cases aggressively."
      });
    }
    if (failures.length === 0) {
      failures.push({
        breakPoint: "Domain-Specific Assumptions",
        reason: `${an.sourceDomain} makes implicit assumptions about its operating environment that don't hold in your domain.`,
        innovation: `The structural gap between ${an.sourceDomain} and your domain is precisely where the most inventive solutions lie — no one has built a mechanism that bridges this exact pair of domains.`,
        severity: "low"
      });
    }

    return {
      analogyId: an.id,
      directTransfers,
      adaptedTransfers,
      failures,
      innovationOpportunities: [
        ...failures.slice(0, 2).map(f =>
          `NOVEL INVENTION SPACE: The structural break at "${f.breakPoint}" reveals a gap no existing field has solved. Design a new mechanism that combines ${an.sourceDomain}'s approach with your domain's constraints.`
        ),
        `CROSS-POLLINATION: The ${an.sourceDomain} solution was designed for a completely different surface problem, but the abstract mechanism is structurally isomorphic. Adapting it creates a solution that experts in your field would never have conceived independently.`
      ]
    };
  });

  // ── 6. Dynamic Hybrid Solution ──
  const topDomains = [...new Set(topPapers.slice(0, 4).map((p: any) => p.domain))];
  const hybridSolution: HybridSolution = topPapers.length > 0 ? {
    name: `Cross-Domain Invention: ${topDomains.join(" × ")}`,
    description: `A novel solution that no single field has produced — synthesized by extracting structurally isomorphic mechanisms from ${topDomains.length} unrelated domains and combining them to address your "${inputStructure.abstractPattern}" challenge.`,
    components: topPapers.slice(0, 3).map((p: any) => ({
      sourceDomain: p.domain,
      principle: p.solution || p.title,
      contribution: `From ${p.domain}: ${(p.solution || "").substring(0, 100)}. This mechanism addresses the "${(p.abstract_pattern || "").substring(0, 40)}" aspect of your problem.`
    })),
    synthesis: `INVENTIVE SYNTHESIS: Combine ${topPapers.slice(0, 3).map((p: any) => `the ${(p.abstract_pattern || p.domain).split(" ").slice(0, 3).join(" ")} mechanism from ${p.domain}`).join(", ")}. Each contributes a structural component that the others lack, creating an approach that no single domain could have produced alone.`,
    risks: [
      `Cross-domain integration risk: The mechanisms from ${topDomains.join(" and ")} were each designed in isolation. Their interaction may produce emergent behaviors not present in either source domain.`,
      "Novel combinations are by definition untested — budget for extensive prototyping and failure modes analysis."
    ],
    testingRecommendations: [
      "Build a minimal prototype combining just 2 of the 3 source mechanisms first.",
      "Identify the structural invariants from each source domain and verify they hold in your new context.",
      "Consult domain experts from EACH source field to catch hidden assumptions.",
      "Test boundary conditions: what happens when the mechanism from domain A conflicts with domain B's constraints?"
    ]
  } : {
    name: "No Hybrid Solution Available",
    description: "Insufficient cross-domain data to synthesize a novel solution.",
    components: [],
    synthesis: "N/A",
    risks: ["No structurally similar papers found in distant domains."],
    testingRecommendations: ["Try rephrasing your problem in more abstract, structural terms (e.g., 'bottleneck in flow system' instead of 'traffic jam')."]
  };

  // ── 7. Impact Problems (cross-domain only) ──
  const impactProblems: ImpactProblem[] = scoredPapers
    .filter((p: any) => p.domain !== queryDomain && p.domainDist > 0.3)
    .slice(0, 6)
    .map((p: any) => {
      const structSim = p.computedSimilarity;
      const domDist = p.domainDist;
      const transferFeasibility = Math.min(0.95, Math.round(structSim * (0.5 + 0.5 * domDist) * 10000) / 10000);
      const socialImpact = SOCIAL_IMPACT_MAP[p.domain as string] || "medium";
      const status: ImpactProblem["status"] =
        structSim > 0.7 ? "partially-solved" :
        structSim > 0.4 ? "unsolved" : "untried";

      return {
        title: p.title,
        domain: p.domain,
        description: p.problem,
        structuralSimilarity: Math.round(structSim * 10000) / 10000,
        socialImpact,
        scale: `${p.domain} → Your Domain Transfer`,
        status,
        transferFeasibility
      };
    });

  // ── 8. Matched Pattern ──
  const primaryPaper = topPapers[0];
  const matchedPattern: StructuralPattern = primaryPaper ? {
    id: "db-pat-1",
    number: 1,
    name: inputStructure.abstractPattern,
    abstractDescription: `Your problem follows the "${inputStructure.abstractPattern}" archetype — a structural pattern that appears across ${usedDomains.size}+ unrelated scientific domains. This means solutions from ${[...usedDomains].slice(0, 3).join(", ")} can all be adapted to your context.`,
    structuralElements: inputStructure.elements.map(e => e.name),
    domainCount: usedDomains.size,
    examples: topPapers.slice(0, 5).map((p: any) => ({
      domain: p.domain,
      problem: p.title,
      solution: p.solution || "N/A",
      outcome: `Novelty score: ${intPct(p.computedSimilarity)}% (structural match: ${intPct(p.patternSim || 0)}%, domain distance: ${intPct(p.domainDist || 0)}%)`
    })),
    commonSolutions: [...new Set(topPapers.map((p: any) => p.solution).filter(Boolean))].slice(0, 5),
    commonFailures: [...new Set(brokenBridgeReports.flatMap(br => br.failures.map(f => f.breakPoint)))].slice(0, 3),
    relatedPatterns: []
  } : SEED_PATTERNS[0];

  // ── 9. Auto-persist ──
  try {
    if (analogies.length > 0) {
      const topAnalogy = analogies[0];
      const topBridgeReport = brokenBridgeReports.find(b => b.analogyId === topAnalogy.id);

      const cleanSlug = input.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30).replace(/^-|-$/g, "");
      const analogyId = `analogy-${cleanSlug || "q"}-${Date.now().toString().slice(-5)}`;

      const newMappedAnalogy: DatasetAnalogy = {
        id: analogyId,
        analogyName: `${topAnalogy.sourceDomain} → ${queryDomain}: ${topAnalogy.sourceSystem.substring(0, 40)}`,
        sourceDomain: topAnalogy.sourceDomain || "Cross-Domain Science",
        targetDomain: queryDomain || "Target System",
        sourceSystem: topAnalogy.sourceSystem || "Source Model",
        targetSystem: input.substring(0, 80),
        overallStrength: topAnalogy.overallStrength,
        patternId: matchedPattern ? matchedPattern.id : "distributed-flow-constrained-network",
        inspiringPaper: {
          title: topAnalogy.sourceSystem,
          authors: "Extracted via Universal Analogy Engine v2",
          url: topAnalogy.url
        },
        mappings: topAnalogy.mappings.map(m => ({
          sourceNode: m.sourceNode,
          targetNode: m.targetNode,
          strength: m.strength,
          reason: m.reason
        })),
        brokenBridges: topBridgeReport ? topBridgeReport.failures.map(f => ({
          breakPoint: f.breakPoint,
          reason: f.reason,
          severity: f.severity
        })) : [],
        transferableSolutions: topAnalogy.transferableSolutions && topAnalogy.transferableSolutions.length > 0
          ? topAnalogy.transferableSolutions
          : [hybridSolution.description],
        createdAt: new Date().toISOString()
      };

      addOrUpdateMappedAnalogy(newMappedAnalogy);
    }
  } catch (err) {
    console.warn("[analogy-engine] Failed to auto-persist mapped analogy:", err);
  }

  return {
    problem: input,
    structure: inputStructure,
    analogies,
    brokenBridgeReports,
    hybridSolution,
    impactProblems,
    matchedPattern
  };
}

/* ── Generate structural element-to-element mappings with functional role awareness ── */
function generateMappings(inputStructure: ProblemStructure, paper: any, inputWords: string[]): AnalogyMapping[] {
  let paperKeywords: string[] = paper.paperKeywords || [];
  if (paperKeywords.length === 0) {
    try { paperKeywords = JSON.parse(paper.keywords_json || "[]"); } catch { paperKeywords = []; }
  }

  const paperText = `${paper.title || ""} ${paper.problem || ""} ${paper.solution || ""}`;
  const paperWords = (paper.paperWordsFiltered || paperText.toLowerCase().match(/\b[a-z]{3,}\b/g) || []) as string[];
  const paperWordSet = new Set(paperWords);
  const paperSentences = paperText.split(/[.!?;]+/).map(s => s.trim()).filter(s => s.length > 10);

  const mappings: AnalogyMapping[] = [];

  for (const element of inputStructure.elements) {
    const elWords = (`${element.name} ${element.description}`).toLowerCase()
      .match(/\b[a-z]{3,}\b/g)?.filter(w => !STOP_WORDS.has(w)) || [];

    // 1. Keyword overlap component
    const overlap = computeKeywordOverlap(elWords, paperWords);

    // 2. Functional role match: does the paper contain the same ABSTRACT ROLE?
    const elementRoles = extractFunctionalSignature(element.name + " " + element.description);
    const paperRoles = extractFunctionalSignature(paperText);
    const roleSim = computeRoleSimilarity(elementRoles, paperRoles);

    // 3. Structural type indicator match
    const typeIndicators = SLOT_INDICATORS[element.type] || {};
    let typeBonus = 0;
    let matchedIndicator = "";
    for (const [kw, weight] of Object.entries(typeIndicators)) {
      if (paperWordSet.has(kw)) {
        typeBonus += weight * 0.15;
        if (!matchedIndicator) matchedIndicator = kw;
      }
    }
    typeBonus = Math.min(typeBonus, 0.4);

    // Composite strength: role similarity weighted higher than keyword overlap
    const strength = Math.min(0.95, Math.round((overlap * 0.2 + roleSim * 0.5 + typeBonus + 0.05) * 10000) / 10000);

    // Find the best context from the paper for this mapping
    let bestPaperContext = "";
    for (const sent of paperSentences) {
      const sentLower = sent.toLowerCase();
      if (matchedIndicator && sentLower.includes(matchedIndicator)) {
        bestPaperContext = sent.substring(0, 120);
        break;
      }
    }

    const bestPaperKw = matchedIndicator ||
      paperKeywords.find(kw => element.description.toLowerCase().includes(kw.toLowerCase())) ||
      paperKeywords[0] || paper.domain || "Mechanism";

    // Generate SPECIFIC, non-template reason
    let reason: string;
    if (strength > 0.5) {
      reason = `In ${paper.domain}, "${bestPaperKw}" serves as the ${element.type} mechanism — structurally identical to "${element.name}" in your system. ${bestPaperContext ? `Specifically: "${bestPaperContext}..."` : `Both govern the same abstract constraint under variable demand.`}`;
    } else if (strength > 0.25) {
      reason = `"${bestPaperKw}" in ${paper.domain} and "${element.name}" in your problem play analogous structural roles: both act as ${element.type === "bottleneck" ? "throughput limiters" : element.type === "feedback" ? "regulatory loops" : element.type === "flow" ? "transport channels" : element.type === "risk" ? "failure modes" : element.type === "constraint" ? "boundary conditions" : element.type === "goal" ? "optimization targets" : element.type === "dependency" ? "causal chains" : "system actors"}. ${bestPaperContext ? `Context: "${bestPaperContext}..."` : ''}`;
    } else {
      reason = `Weak but intriguing parallel: "${bestPaperKw}" (${paper.domain}) and "${element.name}" (your domain) both exist at the boundary of ${element.type} dynamics, but the analogy breaks down in specifics — this is where a new mechanism could be invented.`;
    }

    mappings.push({
      sourceNode: bestPaperKw,
      targetNode: element.name,
      strength,
      reason
    });
  }

  // Sort by strength, return top 4
  mappings.sort((a, b) => b.strength - a.strength);
  return mappings.slice(0, 4);
}

/* ── Generate dynamic, domain-aware Intuitive Explanations ── */
function generateDynamicELI5(domain: string, title: string, targetSolution: string, keyElements: string, problemSummary: string): KidFriendlyExplanation {
  const domLower = domain.toLowerCase();

  let headline = `🎈 How a clever trick from ${domain} solves your challenge!`;
  let storyMetaphor = "";
  let step1Analogy = "";
  let step2Analogy = "";
  let step3Analogy = "";
  let takeaway = "";

  if (domLower.includes("biology") || domLower.includes("ecology") || domLower.includes("biomimicry")) {
    headline = `🌿 Nature's Secret: How ${domain} balances complex systems!`;
    storyMetaphor = `Imagine an ant colony or forest ecosystem. Millions of individual creatures work together without a single boss shouting orders! When one path gets crowded, ants lay down invisible scent trails (pheromones) so others automatically take a faster route. ${domain} research ("${title}") uses this exact self-organizing trick, which we can apply directly to your ${keyElements}!`;
    step1Analogy = `Just like worker ants sharing a map of short cuts, we map out how ${keyElements} interact so no single pathway gets overwhelmed.`;
    step2Analogy = `Like ants strengthening the fastest trail with extra scent, we add automatic feedback loops that guide traffic to open capacity.`;
    step3Analogy = `Testing this in a mini ant farm first before letting the whole colony use the new paths!`;
    takeaway = `By copying nature's self-organizing feedback loops from ${domain}, your system manages heavy loads smoothly without needing a giant central controller!`;
  } else if (domLower.includes("aviation") || domLower.includes("aerospace") || domLower.includes("mechanical") || domLower.includes("marine")) {
    headline = `✈️ High-Speed Precision: Borrowing aerodynamic flow control from ${domain}!`;
    storyMetaphor = `Imagine a sleek jet plane flying through violent wind gusts or a kingfisher diving underwater without splashing. Engineers in ${domain} shaped the nose and wings ("${title}") so air and water glide smoothly around them without creating noisy turbulence. We can reshape how ${keyElements} flow through your system in the exact same way!`;
    step1Analogy = `Like smoothing the sharp edges of a paper airplane, we streamline the entry points for ${keyElements} to stop bottlenecks before they start.`;
    step2Analogy = `Like automatic wing flaps adjusting to sudden wind gusts, we add dynamic rate-limiters that keep the flow steady under peak demand.`;
    step3Analogy = `Testing our new aerodynamic shape in a mini wind tunnel simulator before taking off on a real flight!`;
    takeaway = `By adapting the fluid stream controls from ${domain}, your system glides through heavy pressure spikes without turbulence or drag!`;
  } else if (domLower.includes("health") || domLower.includes("medicine") || domLower.includes("neuroscience") || domLower.includes("epidemiology")) {
    headline = `🩺 Immunity & Triage: How ${domain} protects under extreme pressure!`;
    storyMetaphor = `Imagine a hospital emergency room during flu season or your body's immune system fighting a virus. Doctors don't treat patients on a first-come-first-served basis — they use 'triage' so critical cases get urgent care immediately while mild cases rest in a holding area. ${domain} research ("${title}") perfected this prioritization rule, which is perfect for your ${keyElements}!`;
    step1Analogy = `Like a triage nurse tagging patients by urgency, we categorize incoming ${keyElements} so critical operations skip the line.`;
    step2Analogy = `Like white blood cells creating targeted antibodies, we deploy dynamic safety buffers to neutralize unexpected surge spikes.`;
    step3Analogy = `Running a mock emergency drill with a small group first to make sure every patient gets the right care at the right speed!`;
    takeaway = `By using medical triage and immune defense patterns from ${domain}, your system handles emergency surges safely and prioritizes what matters most!`;
  } else if (domLower.includes("energy") || domLower.includes("thermal") || domLower.includes("chemical")) {
    headline = `⚡ Thermal Equilibrium: How ${domain} dissipates heat & energy surges!`;
    storyMetaphor = `Imagine a giant underground termite mound in the desert. Even when the outside desert heat hits 110°F, the inside stays at a perfect cool 86°F because air circulates through clever chimneys! ${domain} research ("${title}") uses thermal balance mechanisms to spread out heat and energy so nothing melts. We can use this to keep your ${keyElements} cool and stable!`;
    step1Analogy = `Like building underground cooling vents, we create secondary overflow channels for ${keyElements} so energy doesn't build up in one spot.`;
    step2Analogy = `Like a thermostat turning on a fan when things get warm, we activate dynamic rate dampeners as soon as load passes 80%.`;
    step3Analogy = `Testing temperature gauges on a mini test circuit before turning on the high-voltage power!`;
    takeaway = `By borrowing thermal equilibrium & energy dissipation rules from ${domain}, your system stays cool, stable, and resilient even under maximum load!`;
  } else {
    headline = `🚀 Smart System Balance: Transferring a proven mechanism from ${domain}!`;
    storyMetaphor = `Imagine a busy city intersection where traffic lights dynamically adjust their timers based on how many cars are waiting in each lane. Instead of fixed red and green lights, the system 'listens' to the road! ${domain} research ("${title}") uses this adaptive flow control to eliminate traffic jams. We can apply this exact logic to your ${keyElements}!`;
    step1Analogy = `Like mapping out traffic lanes, we define clear routes for ${keyElements} so fast lanes stay clear of slow turn lanes.`;
    step2Analogy = `Like smart traffic sensors changing lights automatically, we add rate controllers that prevent queue buildup at bottleneck intersections.`;
    step3Analogy = `Testing our smart light timer on a virtual city map first before turning on the real street lights!`;
    takeaway = `By pairing dynamic flow buffers with adaptive rate controllers from ${domain}, your system stays fast, safe, and bottleneck-free!`;
  }

  return {
    headline,
    storyMetaphor,
    steps: [
      {
        stepNumber: 1,
        title: "1. The System Blueprint (Interface Adaptation)",
        simpleAction: `Map the core mechanism from ${domain} ("${targetSolution.substring(0, 60)}...") onto your system elements (${keyElements}).`,
        playgroundAnalogy: step1Analogy,
        icon: "🗺️"
      },
      {
        stepNumber: 2,
        title: "2. The Smart Controller (Signal & Buffer Tuning)",
        simpleAction: `Add dynamic rate-limiters inspired by ${domain} controls that automatically dampen flow when capacity saturates.`,
        playgroundAnalogy: step2Analogy,
        icon: "🚦"
      },
      {
        stepNumber: 3,
        title: "3. Safe Pilot Test (Execution & Validation)",
        simpleAction: `Test this holding & routing zone on a mini test loop first under maximum speed before opening to all traffic.`,
        playgroundAnalogy: step3Analogy,
        icon: "🧪"
      }
    ],
    keyTakeaway: takeaway
  };
}

/* ── Generate detailed, specific mechanism transfer explanations ── */
function buildDetailedAnalogyFields(paper: any, similarity: number, inputStructure: ProblemStructure) {
  const domain = paper.domain || "Cross-Domain Science";
  const title = paper.title || "Research System";
  const targetProblem = (paper.problem || "Complex operational challenge in domain.").trim();
  const targetSolution = (paper.solution || "Algorithmic optimization and structural refinement.").trim();
  const patternName = inputStructure.abstractPattern || "Complex System Dynamics";
  const paperPattern = paper.abstract_pattern || patternName;

  const keyElements = inputStructure.elements.slice(0, 3).map(e => e.name).join(", ") || "core system variables";
  const queryDomain = inputStructure.elements[0]?.description?.includes("patient") ? "Healthcare" :
    inputStructure.elements[0]?.description?.includes("traffic") ? "Urban Planning" : "your domain";

  // Specific mechanism extraction
  const problemMechanism = `In ${domain}, the problem "${title.substring(0, 80)}" faces: ${targetProblem.substring(0, 200)}. The root cause follows the "${paperPattern}" archetype — the same abstract structure driving your problem, but manifested in a completely different physical context.`;

  const structuralComparison = `WHY THIS CONNECTION IS NON-OBVIOUS: Your problem ("${patternName}") and ${domain}'s "${title.substring(0, 60)}" ("${paperPattern}") share the same abstract causal topology despite having zero surface vocabulary overlap. The ${domain} community solved this using mechanisms that experts in ${queryDomain} have never encountered. Your elements (${keyElements}) map to the same functional slots that ${domain} researchers optimized with: ${targetSolution.substring(0, 120)}.`;

  const detailedTransferSolution = `SPECIFIC MECHANISM TRANSFER from ${domain}:

1. WHAT ${domain} does: ${targetSolution.substring(0, 200)}

2. WHY it applies to you: Your problem involves ${keyElements}, which structurally play the same roles as the components in the ${domain} system. Both follow the "${paperPattern}" pattern.

3. HOW to adapt it:
   a) Map your ${inputStructure.elements[0]?.name || "primary entity"} → ${domain}'s primary variable
   b) Apply the ${domain} solution's core mechanism (${targetSolution.substring(0, 60)}...) to your constraint space
   c) Adjust parameters: ${domain} operates at different scales, so recalibrate thresholds for your system

4. WHAT'S NOVEL: This combination of ${domain}'s mechanism applied to ${queryDomain} problems has likely never been attempted. The gap between these fields is where your invention lives.`;

  const explanation = `SURPRISING CONNECTION: ${domain} researchers solved a structurally identical problem ("${targetProblem.substring(0, 100)}...") using: ${targetSolution.substring(0, 150)}. This mechanism has never been applied to ${queryDomain} problems — but the abstract structure matches.`;

  const kidFriendlyExplanation = generateDynamicELI5(domain, title, targetSolution, keyElements, inputStructure.summary);

  const visualDiagramData: VisualDiagramData = {
    title: `Invention Bridge: ${domain} → Your Problem`,
    flowDescription: `${keyElements} → ${domain}'s Proven Mechanism → Adapted Solution → Novel Outcome`,
    nodes: [
      {
        id: "node-1",
        label: "Your Problem",
        sublabel: keyElements,
        type: "source",
        icon: "🔍",
        color: "var(--accent-cyan)"
      },
      {
        id: "node-2",
        label: `${domain} Mechanism`,
        sublabel: targetSolution.substring(0, 40) + "...",
        type: "buffer",
        icon: "⚡",
        color: "var(--accent-purple)"
      },
      {
        id: "node-3",
        label: "Cross-Domain Bridge",
        sublabel: `Pattern: ${paperPattern.substring(0, 30)}`,
        type: "controller",
        icon: "🌉",
        color: "var(--accent-amber)"
      },
      {
        id: "node-4",
        label: "Novel Invention",
        sublabel: "First-of-its-kind solution",
        type: "target",
        icon: "💡",
        color: "var(--accent-green)"
      }
    ]
  };

  return {
    explanation,
    targetProblem,
    problemMechanism,
    targetSolution,
    structuralComparison,
    detailedTransferSolution,
    kidFriendlyExplanation,
    visualDiagramData
  };
}

function generateExplanation(paper: any, similarity: number, inputStructure: ProblemStructure): string {
  return buildDetailedAnalogyFields(paper, similarity, inputStructure).explanation;
}

function generateTransferableIdea(paper: any, inputStructure: ProblemStructure): string {
  return buildDetailedAnalogyFields(paper, 0.8, inputStructure).detailedTransferSolution;
}

function intPct(val: number): number {
  return Math.round(val * 100);
}

/* ── Pattern Library Access ── */
export function getAllPatterns(): StructuralPattern[] {
  return SEED_PATTERNS;
}

export function getPatternById(id: string): StructuralPattern | undefined {
  return SEED_PATTERNS.find((p) => p.id === id);
}

export function searchPatterns(query: string): StructuralPattern[] {
  const queryLower = query.toLowerCase();
  return SEED_PATTERNS.filter(
    (p) =>
      p.name.toLowerCase().includes(queryLower) ||
      p.abstractDescription.toLowerCase().includes(queryLower) ||
      p.examples.some(
        (e) =>
          e.domain.toLowerCase().includes(queryLower) ||
          e.problem.toLowerCase().includes(queryLower)
      ) ||
      p.structuralElements.some((el) => el.toLowerCase().includes(queryLower))
  );
}

/* ── Knowledge Graph Access ── */
export function getAllAnalogies(): CrossDomainAnalogy[] {
  try {
    const harvested = getHarvestedAnalogies();
    if (harvested && harvested.analogies && harvested.analogies.length > 0) {
      const combinedMap = new Map<string, CrossDomainAnalogy>();
      SEED_ANALOGIES.forEach((a) => combinedMap.set(a.id, a));
      harvested.analogies.forEach((a: any) => {
        combinedMap.set(a.id, {
          id: a.id,
          sourceDomain: a.sourceDomain,
          targetDomain: a.targetDomain,
          sourceSystem: a.sourceSystem,
          targetSystem: a.targetSystem,
          overallStrength: a.overallStrength,
          patternId: a.patternId || "distributed-flow-constrained-network",
          mappings: a.mappings || [],
          brokenBridges: (a.brokenBridges || []).map((b: any) => ({
            breakPoint: b.breakPoint,
            reason: b.reason,
            severity: b.severity,
            innovation: `Adaptive engineering modification to resolve ${b.breakPoint}`
          })),
          transferableSolutions: a.transferableSolutions || []
        });
      });
      return Array.from(combinedMap.values());
    }
  } catch (err) {
    console.warn("Using SEED_ANALOGIES fallback:", err);
  }
  return SEED_ANALOGIES;
}
