/**
 * Reclassify the 526 papers stuck in the catch-all "Complex System Dynamics & Optimization"
 * pattern using an expanded 20-pattern library. Also reclassifies any papers in the
 * existing 11 patterns that now better match a more specific new pattern.
 *
 * Run:  node scripts/reclassify-patterns.js
 */

const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "src", "data", "analogy_engine.db");
const db = new Database(DB_PATH);

/* ══════════════════════════════════════════════════════════════
   EXPANDED PATTERN LIBRARY (20 patterns)
   Order matters: more specific patterns first, catch-all last.
   ══════════════════════════════════════════════════════════════ */

const PATTERNS = [
  // Original 10 (kept + tightened)
  ["Distributed Flow Under Variable Demand",
    /flow|routing|queue|traffic|congestion|throughput|bottleneck|packet|bandwidth|latency/],
  ["Rapid Spread Through Connected Population",
    /spread|propagat|epidem|cascade|diffus|viral|contagion|infection|transmiss|outbreak|pandemic/],
  ["Uncertain Arrivals with Priority Queuing",
    /schedul|priorit|triage|queue|arrival|waiting|urgent|emergency|appointment|dispatch/],
  ["Decentralized Task Allocation Under Local Information",
    /swarm|decentraliz|multi-agent|consensus|cooperat|autonomous.*agent|foraging|colony|self-organiz/],
  ["Delayed Feedback Oscillations & System Instability",
    /feedback.*loop|oscillat|instabil|control.*loop|overshoot|undershoot|pid\b|servo|regulator/],
  ["Impedance Matching & Peak Load Buffering",
    /buffer|peak.*load|capacity.*manag|impedance|reservoir|cache|surge|spike|absorb|smooth.*demand/],
  ["Resonant Frequency Phase Disruption & Damping",
    /damp|suppress|vibrat|frequency|phase.*disrupt|resonan|harmonic|amplitude|attenuati/],
  ["Redundancy Fallback & Fail-Safe Topology",
    /fault.*toler|redundanc|failover|backup|fail-safe|replicat|graceful.*degradat|checkpoint/],
  ["Stigmergic Signaling & Environmental Memory",
    /pheromone|stigmerg|trail|indirect.*communicat|environmental.*cue|scent|marker.*follow/],
  ["Modular Abstraction & Layered Protocol Coupling",
    /modular|layer.*protocol|encapsulat|interface.*abstract|separation.*concern|micro.*service|plug.*play/],

  // 5 patterns that existed in the TS/Python engines but were missing from ingestion
  ["Cascading Failure Containment",
    /cascad.*fail|circuit.*breaker|bulkhead|quarantine|fuse|isolation.*failure|containment|domino.*effect/],
  ["Resource Competition & Niche Partitioning",
    /competiti.*resource|niche|exclusion.*principle|coexist|territory|predator.*prey|food.*web|species.*compet/],
  ["Hierarchical Control & Multi-Scale Coordination",
    /hierarch|multi.*scale|top-down|bottom-up|nested.*control|governance|supervisor|multi.*level.*control/],
  ["Self-Organization & Emergent Collective Behavior",
    /self-organiz|emergent|emergenc.*behav|collective.*behav|flock|murmuration|spontaneous.*order|pattern.*formation/],
  ["Signal Noise Separation & Information Extraction",
    /signal.*noise|noise.*filter|snr\b|anomaly.*detect|pattern.*recognit|feature.*extract|classification.*signal/],

  // 5 patterns to classify the former catch-all bulk
  ["Adaptive Learning & Evolutionary Optimization",
    /evolut.*optim|genetic.*algorithm|reinforcement.*learn|adaptive.*learn|neural.*network|deep.*learn|gradient|train.*model|machine.*learn|backpropagat/],
  ["Graph Structure & Topological Analysis",
    /graph.*neural|graph.*network|topolog|isomorphism|spectral|adjacency|node.*embed|link.*predict|communit.*detect|centrality/],
  ["Cryptographic Security & Trust Protocols",
    /encrypt|cryptograph|blockchain|byzantine|trust.*protocol|zero.*knowledge|secure.*comput|digital.*signatur|authenticat|hash.*function/],
  ["Quantum State Control & Error Correction",
    /qubit|quantum.*error|decoherence|entangl|superposit|quantum.*circuit|quantum.*gate|fidelity|quantum.*channel|quantum.*algorithm/],
  ["Biological Network Regulation & Homeostasis",
    /gene.*regulat|protein.*interact|metabol|homeostasis|circadian|neuroplastic|synaptic|cortical.*process|receptor|membrane.*transport/],

  // 5 MORE patterns from sampling remaining catch-all papers
  ["Motion Planning & Path Optimization",
    /motion.*plan|path.*plan|trajectory.*optim|navigation|obstacle.*avoid|manipulat.*plan|rrt\b|a\*.*search|waypoint|locomot/],
  ["Constraint Satisfaction & Safety Verification",
    /barrier.*function|lyapunov|safety.*verif|formal.*verif|invariant|constraint.*satisf|reachab|model.*check|control.*barrier|stability.*proof/],
  ["Analogical Reasoning & Knowledge Transfer",
    /analog.*reason|transfer.*learn|knowledge.*transfer|cross-domain|structural.*map|metaphor|relational.*reason|concept.*blend|domain.*adapt/],
  ["Market Dynamics & Financial Contagion",
    /volatil|stock.*market|financial.*crash|market.*dynamics|portfolio.*optim|risk.*manag|contagion.*financial|garch|asset.*pric/],
  ["Multi-Modal Sensing & Sensor Fusion",
    /sensor.*fusion|multi.*modal|lidar|radar.*fusion|visual.*inertial|data.*fusion|percept.*fusion|camera.*fusion|point.*cloud/],
];

// Final catch-all stays
const CATCH_ALL = "Complex System Dynamics & Optimization";

function classifyPattern(title, problem, solution) {
  const text = `${title || ""} ${problem || ""} ${solution || ""}`.toLowerCase();
  for (const [name, regex] of PATTERNS) {
    if (regex.test(text)) return name;
  }
  return CATCH_ALL;
}

/* ── Reclassify ALL papers ── */
console.log("=== Reclassifying all 1,509 papers ===\n");

const allPapers = db.prepare("SELECT id, title, problem, solution, abstract_pattern FROM case_studies").all();

const updateStmt = db.prepare("UPDATE case_studies SET abstract_pattern = ? WHERE id = ?");

let changed = 0;
const patternCounts = {};

const transaction = db.transaction(() => {
  for (const paper of allPapers) {
    const newPattern = classifyPattern(paper.title, paper.problem, paper.solution);
    patternCounts[newPattern] = (patternCounts[newPattern] || 0) + 1;

    if (newPattern !== paper.abstract_pattern) {
      updateStmt.run(newPattern, paper.id);
      changed++;
    }
  }
});

transaction();

console.log(`Reclassified ${changed} papers out of ${allPapers.length} total.\n`);
console.log("=== NEW PATTERN DISTRIBUTION ===");

const sorted = Object.entries(patternCounts).sort((a, b) => b[1] - a[1]);
for (const [pattern, count] of sorted) {
  console.log(`  ${String(count).padStart(4)}  ${pattern}`);
}
console.log(`\nTotal patterns: ${sorted.length}`);

db.close();
