/* ── Seed Data: Universal Pattern Library ──
   Pre-populated structural patterns for the analogy engine.
   Each pattern represents a recurring abstract structure found across many domains. */

export interface DomainExample {
  domain: string;
  problem: string;
  solution: string;
  outcome: string;
}

export interface StructuralPattern {
  id: string;
  number: number;
  name: string;
  abstractDescription: string;
  structuralElements: string[];
  domainCount: number;
  examples: DomainExample[];
  commonSolutions: string[];
  commonFailures: string[];
  relatedPatterns: string[];
}

export const SEED_PATTERNS: StructuralPattern[] = [
  {
    id: "distributed-flow-constrained-network",
    number: 1,
    name: "Distributed Flow Under Variable Demand",
    abstractDescription:
      "Resources flow through a network of constrained pathways toward distributed destinations. Demand fluctuates, capacity is limited, and congestion emerges when flow exceeds local capacity.",
    structuralElements: [
      "Flow units",
      "Constrained channels",
      "Variable demand",
      "Distributed destinations",
      "Capacity limits",
      "Congestion points",
      "Routing decisions",
    ],
    domainCount: 12,
    examples: [
      {
        domain: "Urban Planning",
        problem: "City traffic congestion during peak hours",
        solution: "Adaptive traffic signals, congestion pricing, alternate route distribution",
        outcome: "30% reduction in peak congestion in Singapore",
      },
      {
        domain: "Biology",
        problem: "Blood circulation through restricted vessels",
        solution: "Vasodilation, collateral vessel formation, heart rate adaptation",
        outcome: "Continuous oxygen delivery despite variable demand",
      },
      {
        domain: "Computer Science",
        problem: "Internet packet routing under heavy load",
        solution: "TCP congestion control, load balancing, adaptive routing protocols",
        outcome: "Stable throughput with minimal packet loss",
      },
      {
        domain: "Ecology",
        problem: "Ant colony food distribution across foraging trails",
        solution: "Pheromone-based decentralized routing, trail reinforcement",
        outcome: "Near-optimal path discovery without central control",
      },
      {
        domain: "Healthcare",
        problem: "Emergency room patient flow during surges",
        solution: "Triage protocols, overflow routing, dynamic staffing",
        outcome: "Reduced wait times during peak demand",
      },
      {
        domain: "Logistics",
        problem: "Supply chain delivery under variable orders",
        solution: "Distribution centers, buffer inventory, dynamic routing",
        outcome: "Maintained delivery timelines despite demand spikes",
      },
      {
        domain: "Infrastructure",
        problem: "Water distribution network pressure management",
        solution: "Pressure zones, storage tanks, demand-responsive pumping",
        outcome: "Consistent water delivery across elevation changes",
      },
      {
        domain: "Humanitarian",
        problem: "Refugee resettlement through limited processing centers",
        solution: "Distributed processing, priority queuing, capacity expansion",
        outcome: "Faster processing with maintained quality of assessment",
      },
    ],
    commonSolutions: [
      "Adaptive routing to bypass congestion",
      "Buffer/storage at intermediate points",
      "Dynamic capacity allocation",
      "Decentralized decision-making at nodes",
      "Demand smoothing or spreading",
      "Congestion pricing or signaling",
    ],
    commonFailures: [
      "Over-centralization of routing decisions",
      "Insufficient buffer capacity",
      "Ignoring feedback loops in demand",
      "Static capacity allocation in dynamic environment",
    ],
    relatedPatterns: [
      "bottleneck-cascade",
      "queue-priority-limited-capacity",
      "load-balancing-heterogeneous",
    ],
  },
  {
    id: "rapid-spread-connected-population",
    number: 2,
    name: "Rapid Spread Through Connected Population",
    abstractDescription:
      "An entity (information, disease, behavior, fire) propagates through a connected network. Spread rate depends on connectivity, susceptibility, and containment barriers.",
    structuralElements: [
      "Spreading agent",
      "Connected population/network",
      "Susceptibility",
      "Transmission rate",
      "Containment barriers",
      "Tipping points",
      "Recovery/resistance",
    ],
    domainCount: 10,
    examples: [
      {
        domain: "Epidemiology",
        problem: "Infectious disease pandemic spread",
        solution: "Vaccination, quarantine, contact tracing, social distancing",
        outcome: "Flattened infection curve, herd immunity",
      },
      {
        domain: "Information Science",
        problem: "Fake news propagation on social media",
        solution: "Fact-checking nodes, algorithmic dampening, media literacy",
        outcome: "Reduced viral spread of misinformation",
      },
      {
        domain: "Cybersecurity",
        problem: "Malware and worm propagation through networks",
        solution: "Network segmentation, patch management, intrusion detection",
        outcome: "Contained spread to isolated network segments",
      },
      {
        domain: "Finance",
        problem: "Financial panic and bank run contagion",
        solution: "Circuit breakers, deposit insurance, central bank intervention",
        outcome: "Prevented systemic collapse during crises",
      },
      {
        domain: "Ecology",
        problem: "Forest fire spreading through connected vegetation",
        solution: "Firebreaks, controlled burns, early detection",
        outcome: "Limited fire damage through structural barriers",
      },
      {
        domain: "Agriculture",
        problem: "Crop disease spreading through monoculture fields",
        solution: "Crop rotation, genetic diversity, buffer zones",
        outcome: "Reduced crop loss through diversity barriers",
      },
    ],
    commonSolutions: [
      "Create structural barriers/firebreaks in the network",
      "Increase resistance at vulnerable nodes",
      "Early detection and rapid containment",
      "Reduce connectivity at key hubs",
      "Introduce competing/counteracting agents",
    ],
    commonFailures: [
      "Delayed detection allows exponential growth",
      "Over-connected hubs amplify spread",
      "Uniform containment ignoring network topology",
      "Suppressing symptoms without addressing transmission",
    ],
    relatedPatterns: [
      "network-hub-vulnerability",
      "tipping-point-cascade",
      "immune-response-adaptive",
    ],
  },
  {
    id: "queue-priority-limited-capacity",
    number: 3,
    name: "Uncertain Arrivals with Priority Queuing Under Limited Capacity",
    abstractDescription:
      "Agents arrive unpredictably at a processing system with finite capacity. A priority mechanism determines service order. Delays cascade when arrival rate exceeds processing capacity.",
    structuralElements: [
      "Uncertain arrivals",
      "Limited service capacity",
      "Priority-based queues",
      "Cascading delays",
      "Service time variability",
      "Overflow mechanisms",
    ],
    domainCount: 9,
    examples: [
      {
        domain: "Healthcare",
        problem: "Emergency room overcrowding and long wait times",
        solution: "Triage protocols, fast-track lanes, predictive staffing",
        outcome: "Reduced average wait from 4h to 90min",
      },
      {
        domain: "Legal",
        problem: "Court case backlogs overwhelming the justice system",
        solution: "Case prioritization, alternative dispute resolution, parallel courts",
        outcome: "30% reduction in case resolution time",
      },
      {
        domain: "Government",
        problem: "Immigration processing delays",
        solution: "Digital pre-screening, parallel processing centers, priority categories",
        outcome: "Faster processing while maintaining security standards",
      },
      {
        domain: "Aviation",
        problem: "Airport security queue congestion during peak travel",
        solution: "PreCheck lanes, dynamic staffing, automated screening",
        outcome: "Average wait time under 15 minutes",
      },
      {
        domain: "Technology",
        problem: "Customer support ticket overflow",
        solution: "AI triage, escalation tiers, self-service resolution",
        outcome: "70% of tickets resolved without human intervention",
      },
    ],
    commonSolutions: [
      "Multi-tier priority system",
      "Parallel processing channels",
      "Predictive capacity planning",
      "Self-service for simple cases",
      "Dynamic resource allocation based on queue depth",
    ],
    commonFailures: [
      "Single queue bottleneck",
      "Priority inversion (low-priority items blocking high-priority)",
      "Ignoring arrival rate patterns",
      "Staff burnout from constant overload",
    ],
    relatedPatterns: [
      "distributed-flow-constrained-network",
      "bottleneck-cascade",
      "resource-allocation-fairness",
    ],
  },
  {
    id: "decentralized-task-allocation",
    number: 4,
    name: "Decentralized Task Allocation Under Local Information",
    abstractDescription:
      "A system of autonomous agents allocates tasks among themselves using only local information and simple communication rules, without a central coordinator.",
    structuralElements: [
      "Autonomous agents",
      "Local information only",
      "Simple communication rules",
      "Emergent coordination",
      "Dynamic task arrival",
      "Distributed decision-making",
    ],
    domainCount: 8,
    examples: [
      {
        domain: "Biology",
        problem: "Bee hive task allocation (foraging, nursing, building)",
        solution: "Age-based role switching, waggle dance communication, threshold response",
        outcome: "Efficient division of labor without central control",
      },
      {
        domain: "Logistics",
        problem: "Warehouse worker task assignment across dynamic orders",
        solution: "Zone-based picking, local queue management, peer signaling",
        outcome: "Reduced walking distance and improved throughput",
      },
      {
        domain: "Computing",
        problem: "Cloud computing load balancing across servers",
        solution: "Distributed schedulers, health checks, auto-scaling",
        outcome: "Even resource utilization across clusters",
      },
      {
        domain: "Robotics",
        problem: "Multi-robot coordination in unknown environments",
        solution: "Stigmergic communication, auction-based task allocation",
        outcome: "Efficient coverage without communication overhead",
      },
    ],
    commonSolutions: [
      "Simple local rules producing global coordination",
      "Threshold-based role switching",
      "Indirect communication through environment (stigmergy)",
      "Redundancy to tolerate individual failures",
    ],
    commonFailures: [
      "Deadlock when all agents wait for others",
      "Oscillation between states without convergence",
      "Inefficiency from lack of global information",
      "Silent failures going undetected",
    ],
    relatedPatterns: [
      "swarm-intelligence",
      "distributed-flow-constrained-network",
      "self-organization-emergence",
    ],
  },
  {
    id: "feedback-loop-instability",
    number: 5,
    name: "Positive Feedback Loop Leading to Instability",
    abstractDescription:
      "A reinforcing feedback mechanism causes a system variable to grow exponentially until it hits a constraint, causing collapse, oscillation, or structural change.",
    structuralElements: [
      "Reinforcing feedback",
      "Exponential growth phase",
      "Constraint/limit",
      "Collapse or oscillation",
      "Delayed signals",
      "Threshold effects",
    ],
    domainCount: 11,
    examples: [
      {
        domain: "Finance",
        problem: "Asset bubble formation and crash",
        solution: "Circuit breakers, margin requirements, regulatory oversight",
        outcome: "Dampened volatility but not full prevention",
      },
      {
        domain: "Ecology",
        problem: "Predator-prey population oscillation",
        solution: "Ecosystem diversity, predator rotation, habitat management",
        outcome: "Stabilized populations through diversity",
      },
      {
        domain: "Audio Engineering",
        problem: "Microphone feedback creating amplifying screech",
        solution: "Notch filters, directional microphones, gain staging",
        outcome: "Clean audio without feedback loops",
      },
      {
        domain: "Climate",
        problem: "Ice-albedo feedback accelerating warming",
        solution: "Emissions reduction, albedo modification research",
        outcome: "Ongoing research into breaking the feedback cycle",
      },
      {
        domain: "Social",
        problem: "Panic buying causing supply shortages causing more panic",
        solution: "Purchase limits, transparent communication, reserve release",
        outcome: "Stabilized supply perception reducing panic",
      },
    ],
    commonSolutions: [
      "Introduce negative feedback/dampening mechanisms",
      "Add delays or buffers to slow the reinforcing loop",
      "Set circuit breakers that activate at thresholds",
      "Increase system diversity to prevent uniform response",
      "Improve information transparency to reduce reactive behavior",
    ],
    commonFailures: [
      "Delayed recognition of positive feedback in action",
      "Interventions that create new unintended feedback loops",
      "Constraint reached before corrective action can take effect",
    ],
    relatedPatterns: [
      "tipping-point-cascade",
      "rapid-spread-connected-population",
      "oscillation-control",
    ],
  },
  {
    id: "immune-response-adaptive",
    number: 6,
    name: "Adaptive Defense with Memory and Specificity",
    abstractDescription:
      "A system detects threats through pattern recognition, mounts a targeted response, and retains memory of past threats to respond faster to future encounters.",
    structuralElements: [
      "Threat detection",
      "Pattern recognition",
      "Targeted response",
      "Memory/learning",
      "Self/non-self distinction",
      "Escalation levels",
      "False positive risk",
    ],
    domainCount: 7,
    examples: [
      {
        domain: "Biology",
        problem: "Immune system defending against diverse pathogens",
        solution: "Innate + adaptive immunity, antibodies, memory cells",
        outcome: "Rapid response to previously seen threats",
      },
      {
        domain: "Cybersecurity",
        problem: "Network defense against evolving attacks",
        solution: "Signature-based + behavioral detection, threat intelligence sharing",
        outcome: "Faster detection of known attack patterns",
      },
      {
        domain: "Finance",
        problem: "Fraud detection in transaction systems",
        solution: "Pattern matching, anomaly detection, user behavior profiles",
        outcome: "Real-time fraud prevention with low false positives",
      },
      {
        domain: "Manufacturing",
        problem: "Quality control detecting defective products",
        solution: "Statistical process control, machine learning inspection",
        outcome: "Sub-1% defect rate in production lines",
      },
    ],
    commonSolutions: [
      "Layered defense (fast generic + slow specific)",
      "Continuous learning from new threat patterns",
      "Balance sensitivity vs specificity",
      "Share threat intelligence across nodes",
    ],
    commonFailures: [
      "Autoimmune response (attacking self)",
      "Overreaction causing more damage than the threat",
      "Novel threats evading pattern-based detection",
      "Memory decay leading to re-vulnerability",
    ],
    relatedPatterns: [
      "rapid-spread-connected-population",
      "pattern-recognition-classification",
      "learning-adaptation-evolution",
    ],
  },
  {
    id: "bottleneck-cascade",
    number: 7,
    name: "Single-Point Bottleneck Causing System-Wide Cascade",
    abstractDescription:
      "A single constrained resource or process becomes a bottleneck, causing delays that cascade through the entire system, reducing overall throughput far below potential.",
    structuralElements: [
      "Sequential dependencies",
      "Single constrained resource",
      "Cascading delays",
      "Throughput collapse",
      "Queue buildup",
      "Underutilized downstream capacity",
    ],
    domainCount: 10,
    examples: [
      {
        domain: "Manufacturing",
        problem: "One slow machine limiting entire production line",
        solution: "Theory of Constraints: subordinate everything to the bottleneck",
        outcome: "30-50% throughput improvement",
      },
      {
        domain: "Software",
        problem: "Database becoming bottleneck for web application",
        solution: "Caching, read replicas, query optimization, sharding",
        outcome: "10x improvement in request handling",
      },
      {
        domain: "Transportation",
        problem: "Single lane bridge causing traffic backup for miles",
        solution: "Signal coordination, bypass routes, capacity expansion",
        outcome: "Eliminated cascade effect on surrounding roads",
      },
      {
        domain: "Healthcare",
        problem: "Lab test turnaround delaying all diagnoses",
        solution: "Point-of-care testing, parallel processing, result prediction",
        outcome: "Reduced diagnostic cycle from days to hours",
      },
    ],
    commonSolutions: [
      "Identify and elevate the constraint (Theory of Constraints)",
      "Add parallel capacity at the bottleneck",
      "Buffer before the bottleneck to absorb variation",
      "Reduce dependency on the bottleneck through redesign",
      "Shift load away from bottleneck during peak",
    ],
    commonFailures: [
      "Optimizing non-bottleneck processes (no system improvement)",
      "Moving the bottleneck to a new location without awareness",
      "Adding capacity everywhere instead of at the constraint",
    ],
    relatedPatterns: [
      "distributed-flow-constrained-network",
      "queue-priority-limited-capacity",
      "single-point-failure",
    ],
  },
  {
    id: "self-organization-emergence",
    number: 8,
    name: "Self-Organization Producing Emergent Global Order",
    abstractDescription:
      "Simple local rules followed by individual agents produce complex global patterns, structures, or behaviors that no individual agent controls or intends.",
    structuralElements: [
      "Simple local rules",
      "Many interacting agents",
      "No central controller",
      "Emergent global patterns",
      "Phase transitions",
      "Sensitivity to initial conditions",
    ],
    domainCount: 9,
    examples: [
      {
        domain: "Biology",
        problem: "How do flocking birds form coordinated shapes?",
        solution: "Three rules: separation, alignment, cohesion",
        outcome: "Complex flock formations from simple individual behavior",
      },
      {
        domain: "Urban Planning",
        problem: "How do cities develop organic neighborhood patterns?",
        solution: "Zoning incentives, market forces, cultural clustering",
        outcome: "Distinct neighborhoods emerge without master planning",
      },
      {
        domain: "Economics",
        problem: "How do market prices self-organize?",
        solution: "Supply-demand interaction, price signals, competition",
        outcome: "Efficient resource allocation without central pricing",
      },
      {
        domain: "Chemistry",
        problem: "How do crystal structures form from solutions?",
        solution: "Molecular bonding rules, nucleation, energy minimization",
        outcome: "Highly ordered structures from random molecular motion",
      },
    ],
    commonSolutions: [
      "Design simple local rules that produce desired global behavior",
      "Allow emergence rather than prescribing top-down structure",
      "Use environmental signals to guide self-organization",
      "Intervene minimally at leverage points",
    ],
    commonFailures: [
      "Emergent behavior diverging from desired outcome",
      "Difficulty predicting or controlling emergent properties",
      "Pathological self-organization (e.g., mob behavior)",
    ],
    relatedPatterns: [
      "decentralized-task-allocation",
      "swarm-intelligence",
      "feedback-loop-instability",
    ],
  },
  {
    id: "resilience-through-redundancy",
    number: 9,
    name: "Resilience Through Redundancy and Diversity",
    abstractDescription:
      "A system maintains function despite component failures by incorporating redundant pathways, diverse mechanisms, and graceful degradation strategies.",
    structuralElements: [
      "Redundant components",
      "Diverse mechanisms",
      "Failure detection",
      "Graceful degradation",
      "Recovery pathways",
      "Cost of redundancy",
    ],
    domainCount: 8,
    examples: [
      {
        domain: "Aviation",
        problem: "Aircraft systems must never fail catastrophically",
        solution: "Triple redundancy for critical systems, diverse suppliers",
        outcome: "Aviation is safest transportation mode per mile",
      },
      {
        domain: "Biology",
        problem: "Organisms surviving environmental stress",
        solution: "Multiple metabolic pathways, DNA repair mechanisms, organ redundancy",
        outcome: "Life persists through mass extinction events",
      },
      {
        domain: "Finance",
        problem: "Portfolio surviving market crashes",
        solution: "Diversification across asset classes, geographies, strategies",
        outcome: "Reduced maximum drawdown during crises",
      },
      {
        domain: "Engineering",
        problem: "Internet surviving node and cable failures",
        solution: "Mesh topology, packet rerouting, multiple ISPs",
        outcome: "99.99% uptime despite constant component failures",
      },
    ],
    commonSolutions: [
      "Add parallel pathways for critical functions",
      "Diversify mechanisms (not just copies of the same thing)",
      "Build failure detection and automatic failover",
      "Design for graceful degradation not binary failure",
      "Test failure modes regularly (chaos engineering)",
    ],
    commonFailures: [
      "Common-cause failures defeating redundancy (same vulnerability)",
      "Cost of redundancy leading to its removal",
      "Untested failover mechanisms failing when needed",
      "Over-redundancy creating complexity that causes new failures",
    ],
    relatedPatterns: [
      "single-point-failure",
      "immune-response-adaptive",
      "antifragility-stress-improvement",
    ],
  },
  {
    id: "tipping-point-cascade",
    number: 10,
    name: "Tipping Point and Regime Shift",
    abstractDescription:
      "A system accumulates gradual stress until a critical threshold is crossed, triggering a rapid, often irreversible shift to a fundamentally different state.",
    structuralElements: [
      "Gradual stress accumulation",
      "Critical threshold",
      "Rapid state transition",
      "Hysteresis (hard to reverse)",
      "Early warning signals",
      "New equilibrium state",
    ],
    domainCount: 9,
    examples: [
      {
        domain: "Ecology",
        problem: "Lake ecosystem collapsing from eutrophication",
        solution: "Nutrient load reduction, early warning monitoring",
        outcome: "Prevention of irreversible algal dominance",
      },
      {
        domain: "Social",
        problem: "Social movements reaching critical mass",
        solution: "Understanding threshold dynamics, identifying catalysts",
        outcome: "Predictive models for social change adoption",
      },
      {
        domain: "Materials Science",
        problem: "Metal fatigue leading to sudden structural failure",
        solution: "Non-destructive testing, safety margins, material rotation",
        outcome: "Prevention of catastrophic bridge/aircraft failures",
      },
      {
        domain: "Climate",
        problem: "Climate tipping points (ice sheet collapse, permafrost thaw)",
        solution: "Emissions reduction, monitoring critical indicators",
        outcome: "Ongoing research into preventing irreversible shifts",
      },
    ],
    commonSolutions: [
      "Monitor early warning indicators (critical slowing down)",
      "Maintain safe distance from known thresholds",
      "Build reversibility into system design",
      "Increase system resilience to delay threshold crossing",
    ],
    commonFailures: [
      "Ignoring gradual changes because each step seems small",
      "Discovering the threshold only after crossing it",
      "Assuming all transitions are gradual and reversible",
    ],
    relatedPatterns: [
      "feedback-loop-instability",
      "rapid-spread-connected-population",
      "resilience-through-redundancy",
    ],
  },
  {
    id: "resource-allocation-fairness",
    number: 11,
    name: "Resource Allocation Under Competing Demands and Fairness Constraints",
    abstractDescription:
      "Limited resources must be distributed among competing claimants with different needs, priorities, and notions of fairness, while maximizing overall utility.",
    structuralElements: [
      "Scarce resources",
      "Competing claimants",
      "Fairness criteria",
      "Efficiency vs equity tradeoff",
      "Information asymmetry",
      "Gaming/manipulation risk",
    ],
    domainCount: 8,
    examples: [
      {
        domain: "Healthcare",
        problem: "Organ transplant prioritization",
        solution: "UNOS scoring (medical urgency + waiting time + compatibility)",
        outcome: "Transparent, medically-driven allocation",
      },
      {
        domain: "Economics",
        problem: "Spectrum allocation among telecom companies",
        solution: "Auction mechanisms (Vickrey, combinatorial)",
        outcome: "Efficient allocation with revenue generation",
      },
      {
        domain: "Education",
        problem: "University admissions with limited seats",
        solution: "Holistic review, quotas, lottery for tied candidates",
        outcome: "Diverse student body within capacity constraints",
      },
      {
        domain: "Computing",
        problem: "CPU time allocation among processes",
        solution: "Priority scheduling, fair queuing, resource quotas",
        outcome: "Responsive system despite competing workloads",
      },
    ],
    commonSolutions: [
      "Multi-criteria scoring with transparent weights",
      "Market mechanisms (auctions, pricing)",
      "Priority classes with guaranteed minimums",
      "Randomization for tie-breaking to ensure fairness",
    ],
    commonFailures: [
      "Gaming the allocation criteria",
      "Efficiency gains eroding fairness",
      "Information asymmetry enabling manipulation",
      "Rigid rules failing to adapt to changing needs",
    ],
    relatedPatterns: [
      "queue-priority-limited-capacity",
      "distributed-flow-constrained-network",
      "tragedy-of-commons",
    ],
  },
  {
    id: "learning-adaptation-evolution",
    number: 12,
    name: "Learning and Adaptation Through Iterative Selection",
    abstractDescription:
      "A system improves its performance over time by generating variations, testing them against an environment, selecting successful variants, and accumulating improvements.",
    structuralElements: [
      "Variation generation",
      "Selection pressure",
      "Fitness evaluation",
      "Inheritance/retention",
      "Exploration vs exploitation",
      "Environmental change",
    ],
    domainCount: 10,
    examples: [
      {
        domain: "Biology",
        problem: "Species adapting to changing environments",
        solution: "Genetic variation + natural selection + inheritance",
        outcome: "Biodiversity adapted to every niche on Earth",
      },
      {
        domain: "Machine Learning",
        problem: "Model improving predictions from data",
        solution: "Gradient descent, hyperparameter search, cross-validation",
        outcome: "Human-level performance on many tasks",
      },
      {
        domain: "Business",
        problem: "Startup finding product-market fit",
        solution: "Lean methodology: build-measure-learn cycles",
        outcome: "Rapid iteration toward viable business model",
      },
      {
        domain: "Science",
        problem: "Scientific knowledge advancing through research",
        solution: "Hypothesis generation, experimentation, peer review, replication",
        outcome: "Cumulative knowledge growth over centuries",
      },
    ],
    commonSolutions: [
      "Rapid iteration cycles with clear feedback",
      "Balance exploration (new ideas) with exploitation (known good)",
      "Retain and build upon successful variants",
      "Diverse variation to avoid local optima",
    ],
    commonFailures: [
      "Premature convergence on local optimum",
      "Insufficient variation leading to stagnation",
      "Changed environment invalidating previous adaptations",
      "Selection criteria misaligned with actual goals",
    ],
    relatedPatterns: [
      "self-organization-emergence",
      "feedback-loop-instability",
      "immune-response-adaptive",
    ],
  },
  {
    id: "tragedy-of-commons",
    number: 13,
    name: "Tragedy of the Commons — Shared Resource Depletion",
    abstractDescription:
      "Multiple agents share a common resource. Each agent's individually rational behavior is to over-consume, but collective over-consumption depletes the resource for everyone.",
    structuralElements: [
      "Shared resource",
      "Individual incentives to over-consume",
      "Collective harm from individual actions",
      "Missing or weak governance",
      "Free-rider problem",
      "Depletion threshold",
    ],
    domainCount: 7,
    examples: [
      {
        domain: "Environmental",
        problem: "Overfishing depleting ocean fish stocks",
        solution: "Fishing quotas, marine reserves, tradeable permits",
        outcome: "Recovery of fish stocks where enforced",
      },
      {
        domain: "Technology",
        problem: "API rate limiting to prevent service overload",
        solution: "Rate limits, quotas, tiered access, cost-based throttling",
        outcome: "Stable service availability for all users",
      },
      {
        domain: "Urban",
        problem: "Shared road space congested by individual drivers",
        solution: "Congestion pricing, public transit investment, HOV lanes",
        outcome: "Reduced congestion in cities with pricing",
      },
    ],
    commonSolutions: [
      "Establish clear ownership or governance",
      "Align individual incentives with collective good",
      "Monitoring and enforcement",
      "Privatization or quota systems",
      "Community-based management (Ostrom principles)",
    ],
    commonFailures: [
      "Free riders undermining cooperative solutions",
      "Enforcement costs exceeding benefits",
      "Governance capture by powerful actors",
    ],
    relatedPatterns: [
      "resource-allocation-fairness",
      "feedback-loop-instability",
      "tipping-point-cascade",
    ],
  },
  {
    id: "signal-noise-detection",
    number: 14,
    name: "Signal Detection in Noisy Environments",
    abstractDescription:
      "A system must identify meaningful signals embedded in noise, balancing the cost of false positives against the cost of missed detections.",
    structuralElements: [
      "True signals",
      "Background noise",
      "Detection threshold",
      "False positive cost",
      "False negative cost",
      "Signal-to-noise ratio",
    ],
    domainCount: 8,
    examples: [
      {
        domain: "Medicine",
        problem: "Cancer screening with imperfect tests",
        solution: "Multiple test stages, Bayesian updating, risk-based screening",
        outcome: "Balanced detection rate vs unnecessary procedures",
      },
      {
        domain: "Radar",
        problem: "Detecting aircraft in weather clutter",
        solution: "Doppler filtering, adaptive thresholds, sensor fusion",
        outcome: "Reliable detection in adverse conditions",
      },
      {
        domain: "Data Science",
        problem: "Anomaly detection in large datasets",
        solution: "Statistical models, ensemble methods, human review for edge cases",
        outcome: "Automated flagging with manageable false positive rate",
      },
    ],
    commonSolutions: [
      "Multi-stage detection with increasing specificity",
      "Adaptive thresholds based on context",
      "Sensor/source fusion for corroboration",
      "Cost-aware threshold setting",
    ],
    commonFailures: [
      "Fixed thresholds in changing noise environments",
      "Ignoring base rates (base rate fallacy)",
      "Over-tuning to reduce one error type while increasing the other",
    ],
    relatedPatterns: [
      "immune-response-adaptive",
      "pattern-recognition-classification",
      "information-filtering-overload",
    ],
  },
  {
    id: "hierarchical-modularity",
    number: 15,
    name: "Hierarchical Modularity for Managing Complexity",
    abstractDescription:
      "A complex system is organized into nested modules with well-defined interfaces. Each module can evolve independently, and the hierarchy manages complexity through abstraction.",
    structuralElements: [
      "Nested modules",
      "Well-defined interfaces",
      "Abstraction layers",
      "Independent evolution",
      "Complexity management",
      "Inter-module communication",
    ],
    domainCount: 9,
    examples: [
      {
        domain: "Biology",
        problem: "How do complex organisms develop reliably?",
        solution: "Cells → tissues → organs → systems, each with defined interfaces",
        outcome: "Robust development despite enormous complexity",
      },
      {
        domain: "Software Engineering",
        problem: "Managing million-line codebases",
        solution: "Microservices, APIs, packages, layered architecture",
        outcome: "Teams can work independently on different modules",
      },
      {
        domain: "Organization Design",
        problem: "Scaling a company from 10 to 10,000 people",
        solution: "Departments, teams, reporting structures, defined responsibilities",
        outcome: "Coordinated action at scale",
      },
      {
        domain: "Electronics",
        problem: "Designing complex integrated circuits",
        solution: "Standard cells, IP blocks, hierarchical layout",
        outcome: "Billions of transistors designed by manageable teams",
      },
    ],
    commonSolutions: [
      "Define clear interfaces between modules",
      "Allow modules to evolve independently",
      "Use abstraction to hide internal complexity",
      "Standardize inter-module communication",
    ],
    commonFailures: [
      "Tight coupling defeating modularity",
      "Interface mismatches causing integration failures",
      "Over-abstraction hiding necessary details",
      "Module boundaries misaligned with actual dependencies",
    ],
    relatedPatterns: [
      "self-organization-emergence",
      "resilience-through-redundancy",
      "decentralized-task-allocation",
    ],
  },
  {
    id: "stochastically-gated-cascade",
    number: 16,
    name: "Stochastic Gating in Multi-Stage Cascades",
    abstractDescription:
      "Signals or work units pass through multiple sequential checkpoints where probability gates filter noise and amplify intentional signals to prevent false positives.",
    structuralElements: [
      "Probability gates",
      "Sequential checkpoints",
      "Signal-to-noise ratio",
      "Threshold triggers",
      "Amplification stages",
    ],
    domainCount: 9,
    examples: [
      {
        domain: "Neuroscience",
        problem: "Synaptic vesicle release probability in neuronal circuits",
        solution: "Probabilistic calcium-gated neurotransmitter release",
        outcome: "Filters background thermal noise while preserving high-frequency firing patterns",
      },
      {
        domain: "Cybersecurity",
        problem: "Zero-trust access control with multi-factor authentication",
        solution: "Conditional access gating based on risk score thresholds",
        outcome: "99.9% reduction in unauthorized access attempts",
      },
    ],
    commonSolutions: [
      "Set multi-stage probabilistic thresholds",
      "Use coincidence detection across multiple sensors",
      "Implement dampening for isolated low-confidence triggers",
    ],
    commonFailures: [
      "Over-gating causing severe signal drop-off",
      "Under-gating allowing noise to cascade through all stages",
    ],
    relatedPatterns: ["feedback-loop-instability", "bottleneck-cascade"],
  },
  {
    id: "hysteresis-bistable-switch",
    number: 17,
    name: "Hysteresis & Bistable Switching",
    abstractDescription:
      "A system maintains one of two stable states and resists switching until input exceeds a high threshold, preventing rapid oscillation near boundary conditions.",
    structuralElements: [
      "ON/OFF stable states",
      "Activation threshold",
      "Deactivation threshold",
      "Hysteresis gap",
      "State memory",
    ],
    domainCount: 11,
    examples: [
      {
        domain: "Electronics",
        problem: "Schmitt trigger circuit for noisy analog input signals",
        solution: "Dual-threshold comparator with positive feedback loop",
        outcome: "Clean digital pulse outputs with zero chatter near switching points",
      },
      {
        domain: "Genetics",
        problem: "Cellular fate determination during embryonic development",
        solution: "Bistable gene regulatory networks with positive feedback",
        outcome: "Irreversible cell differentiation despite fluctuating morphogen gradients",
      },
    ],
    commonSolutions: [
      "Separate activation and deactivation thresholds",
      "Introduce positive feedback after state change to lock state",
      "Add deliberate lag or memory into state transitions",
    ],
    commonFailures: [
      "Setting thresholds too close together causing rapid chatter",
      "Permanent state lockup when deactivation threshold is unreachable",
    ],
    relatedPatterns: ["homeostatic-setpoint-regulation", "feedback-loop-instability"],
  },
  {
    id: "swarm-stigmergic-coordination",
    number: 18,
    name: "Stigmergic Coordination in Swarms",
    abstractDescription:
      "Individual agents communicate indirectly by modifying their shared environment, allowing complex global structures to emerge without central planning or direct messaging.",
    structuralElements: [
      "Environmental markers",
      "Local perception",
      "Indirect communication",
      "Positive reinforcement",
      "Environmental decay",
    ],
    domainCount: 14,
    examples: [
      {
        domain: "Robotics",
        problem: "Autonomous multi-robot search and rescue in GPS-denied environments",
        solution: "Digital pheromone drops left on virtual shared spatial grids",
        outcome: "100% area coverage with zero central control overhead",
      },
      {
        domain: "Open Source",
        problem: "Wikipedia article curation and quality maintenance",
        solution: "Edit histories and cleanup tags left directly on pages",
        outcome: "Self-correcting global encyclopedia created by millions of strangers",
      },
    ],
    commonSolutions: [
      "Embed state information directly into the environment",
      "Implement automatic decay on environmental markers",
      "Keep individual agent rules simple and local",
    ],
    commonFailures: [
      "Pheromone saturation blinding agents to new opportunities",
      "Lack of marker decay leading to stale environmental signals",
    ],
    relatedPatterns: ["self-organization-emergence", "distributed-flow-constrained-network"],
  },
  {
    id: "homeostatic-setpoint-regulation",
    number: 19,
    name: "Homeostatic Set-Point Regulation",
    abstractDescription:
      "A negative feedback control loop continuously measures system state against a target set-point and applies corrective force proportional to the error.",
    structuralElements: [
      "Sensor",
      "Target set-point",
      "Error calculator",
      "Actuator",
      "Negative feedback loop",
    ],
    domainCount: 15,
    examples: [
      {
        domain: "Endocrinology",
        problem: "Blood glucose regulation in the human body",
        solution: "Insulin and glucagon secretion from pancreatic islet cells",
        outcome: "Glucose maintained within 70-100 mg/dL range despite variable meals",
      },
      {
        domain: "Economics",
        problem: "Central bank inflation targeting",
        solution: "Interest rate adjustments based on distance from 2% inflation target",
        outcome: "Price stability and economic growth moderation",
      },
    ],
    commonSolutions: [
      "Use Proportional-Integral-Derivative (PID) control algorithms",
      "Incorporate derivative control to anticipate overshoot",
      "Calibrate sensor frequency to match system response latency",
    ],
    commonFailures: [
      "Over-correction leading to destructive harmonic oscillations",
      "Sensor lag causing delayed response and constant overshoot",
    ],
    relatedPatterns: ["feedback-loop-instability", "hysteresis-bistable-switch"],
  },
  {
    id: "percolation-phase-transition",
    number: 20,
    name: "Percolation & Critical Phase Transitions",
    abstractDescription:
      "Small incremental changes in density or connection probability accumulate silently until a critical threshold is crossed, triggering sudden global connectivity or state shift.",
    structuralElements: [
      "Occupation probability",
      "Critical threshold (Pc)",
      "Giant connected component",
      "Non-linear tipping point",
    ],
    domainCount: 10,
    examples: [
      {
        domain: "Materials Science",
        problem: "Electrical conductivity in composite polymer materials",
        solution: "Carbon nanotube doping above 0.5% volume fraction",
        outcome: "Insulator abruptly transforms into conductor at critical percolation threshold",
      },
      {
        domain: "Epidemiology",
        problem: "Community-wide disease outbreak prevention",
        solution: "Vaccination coverage brought above 85-95% herd immunity threshold",
        outcome: "Disease propagation chains break completely",
      },
    ],
    commonSolutions: [
      "Identify the exact mathematical critical density (Pc) before investing",
      "Push system just beyond percolation threshold for maximum efficiency",
      "Monitor cluster size distribution as an early warning signal",
    ],
    commonFailures: [
      "Operating just below threshold expecting linear improvements",
      "Failing to recognize non-linear tipping points",
    ],
    relatedPatterns: ["rapid-spread-connected-population", "scale-free-preferential-attachment"],
  },
  {
    id: "scale-free-preferential-attachment",
    number: 21,
    name: "Scale-Free Preferential Attachment",
    abstractDescription:
      "New nodes entering a network disproportionately connect to existing highly-connected nodes ('rich-get-richer'), producing a power-law degree distribution.",
    structuralElements: [
      "Hub nodes",
      "Preferential attachment rule",
      "Power-law distribution",
      "Robust-yet-fragile architecture",
    ],
    domainCount: 13,
    examples: [
      {
        domain: "Internet Topology",
        problem: "Autonomous system (AS) peering in global internet routing",
        solution: "BGP routing hub concentration at major internet exchange points (IXPs)",
        outcome: "Low latency routing globally, but vulnerable to major IXP outages",
      },
      {
        domain: "Citation Networks",
        problem: "Scientific paper visibility and impact distribution",
        solution: "Highly cited papers receive disproportionate future citations",
        outcome: "Top 1% of papers accumulate 90%+ of total field citations",
      },
    ],
    commonSolutions: [
      "Protect key hub nodes with redundant backup infrastructure",
      "Introduce artificial connection limits on hubs to prevent single points of failure",
      "Promote secondary hubs to decentralize traffic",
    ],
    commonFailures: [
      "Ignoring hub vulnerability leading to catastrophic targeted attacks",
      "Monopolization by hyper-hubs stifling peripheral growth",
    ],
    relatedPatterns: ["distributed-flow-constrained-network", "percolation-phase-transition"],
  },
  {
    id: "antagonistic-pleiotropy-tradeoff",
    number: 22,
    name: "Antagonistic Trade-Off Optimization",
    abstractDescription:
      "A trait or parameter provides strong benefit in one phase or dimension while causing unavoidable detriment in another phase or dimension, requiring multi-objective Pareto optimization.",
    structuralElements: [
      "Primary benefit feature",
      "Secondary penalty feature",
      "Pareto frontier",
      "Phase/context shift",
      "Trade-off curve",
    ],
    domainCount: 11,
    examples: [
      {
        domain: "Evolutionary Biology",
        problem: "High early-life fertility vs late-life tissue degeneration",
        solution: "Gene variants selected for reproductive success despite late-life cellular senescence",
        outcome: "Optimized evolutionary fitness over the lifespan",
      },
      {
        domain: "Software Engineering",
        problem: "In-memory caching vs memory footprint and stale data risks",
        solution: "LRU cache eviction policies with strict memory caps and TTL expirations",
        outcome: "Maximum read speed with bounded memory consumption",
      },
    ],
    commonSolutions: [
      "Map explicit Pareto frontiers before choosing design points",
      "Use phase-dependent switching to alter parameters based on operational lifecycle",
      "Decouple conflicting objectives into separate modular components",
    ],
    commonFailures: [
      "Optimizing for one dimension while ignoring catastrophic costs in the other",
      "Assuming a 'free lunch' exists without trade-offs",
    ],
    relatedPatterns: ["bottleneck-cascade", "homeostatic-setpoint-regulation"],
  },
  {
    id: "quorum-sensing-threshold",
    number: 23,
    name: "Quorum Sensing Threshold Activation",
    abstractDescription:
      "Individual entities continuously emit signaling molecules; collective action triggers only when local signal concentration exceeds a threshold, confirming sufficient group density.",
    structuralElements: [
      "Autoinducer signals",
      "Local concentration sensor",
      "Density threshold",
      "Synchronized population response",
    ],
    domainCount: 8,
    examples: [
      {
        domain: "Microbiology",
        problem: "Bacterial bioluminescence and virulence factor secretion",
        solution: "AHL (acyl-homoserine lactone) autoinducer accumulation",
        outcome: "Synchronized group attack that overwhelms host defenses",
      },
      {
        domain: "Distributed Systems",
        problem: "Raft/Paxos consensus in distributed database clusters",
        solution: "Quorum voting requirement (N/2 + 1 nodes)",
        outcome: "Guaranteed state consistency even during network partitions",
      },
    ],
    commonSolutions: [
      "Require majority quorum (N/2 + 1) for irreversible actions",
      "Calibrate signal decay rate so quorum reflects current, active density",
      "Use multi-stage quorum triggers for progressive escalation",
    ],
    commonFailures: [
      "Quorum threshold set too low causing premature triggers",
      "Split-brain scenarios when network partitions create isolated sub-quorums",
    ],
    relatedPatterns: ["self-organization-emergence", "percolation-phase-transition"],
  },
  {
    id: "fractal-surface-amplification",
    number: 24,
    name: "Fractal Surface Area Maximization",
    abstractDescription:
      "A 3D system uses self-similar recursive branching to maximize contact surface area within a finite volume, exponentially increasing exchange capacity.",
    structuralElements: [
      "Recursive branching",
      "Surface-area-to-volume ratio",
      "Boundary layer exchange",
      "Volume-filling geometry",
    ],
    domainCount: 10,
    examples: [
      {
        domain: "Pulmonology",
        problem: "Oxygen exchange in human lungs within a 5-liter chest cavity",
        solution: "23 generations of bronchial branching yielding 480 million alveoli",
        outcome: "70 square meters of surface area (half a tennis court) fitted into the chest",
      },
      {
        domain: "Chemical Engineering",
        problem: "Catalytic converter efficiency in automotive exhausts",
        solution: "Washcoat of porous micro-structures on ceramic honeycomb matrices",
        outcome: "Enormous catalytic surface area fitting inside a small under-car canister",
      },
    ],
    commonSolutions: [
      "Use fractal geometry for heat exchangers and filtration units",
      "Apply additive 3D printing to fabricate biomimetic porous lattices",
      "Optimize channel diameters at each branching tier to equalize flow resistance",
    ],
    commonFailures: [
      "Micro-channel clogging due to inadequate pre-filtration",
      "High pressure drops across overly dense fractal networks",
    ],
    relatedPatterns: ["distributed-flow-constrained-network", "modular-abstraction-hierarchy"],
  },
  {
    id: "feed-forward-predictive-compensation",
    number: 25,
    name: "Feed-Forward Anticipatory Regulation",
    abstractDescription:
      "A control system detects incoming external disturbances at the entry point and applies proactive countermeasures before the disturbance affects internal system state.",
    structuralElements: [
      "Disturbance sensor",
      "Predictive model",
      "Pre-emptive actuator",
      "Disturbance channel",
      "Internal state protector",
    ],
    domainCount: 12,
    examples: [
      {
        domain: "Industrial Automation",
        problem: "Temperature control in continuous chemical reactors with raw material temperature fluctuations",
        solution: "Inlet temperature sensor triggering pre-heating/cooling before fluid reaches main tank",
        outcome: "Near-zero temperature deviation inside the reaction chamber",
      },
      {
        domain: "Neuroscience",
        problem: "Vestibulo-ocular reflex (VOR) for eye stabilization during head movement",
        solution: "Semicircular canals send direct feed-forward signals to eye muscles",
        outcome: "Clear vision maintained during walking/running without waiting for visual blur feedback",
      },
    ],
    commonSolutions: [
      "Combine feed-forward prediction for known disturbances with feedback control for residual errors",
      "Accurately measure disturbance arrival latency",
      "Continuously calibrate the predictive forward model",
    ],
    commonFailures: [
      "Inaccurate forward models causing over-compensation that creates new disturbances",
      "Unmeasured disturbance channels bypassing the feed-forward sensor",
    ],
    relatedPatterns: ["homeostatic-setpoint-regulation", "stochastically-gated-cascade"],
  },
];


/* ── Cross-Domain Analogy Examples ── */
export interface AnalogyMapping {
  sourceNode: string;
  targetNode: string;
  reason: string;
  strength: number; // 0-1
}

export interface CrossDomainAnalogy {
  id: string;
  sourceDomain: string;
  targetDomain: string;
  sourceSystem: string;
  targetSystem: string;
  overallStrength: number;
  mappings: AnalogyMapping[];
  transferableSolutions: string[];
  brokenBridges: {
    breakPoint: string;
    reason: string;
    innovation: string;
  }[];
  patternId: string;
}

export const SEED_ANALOGIES: CrossDomainAnalogy[] = [
  {
    id: "blood-circulation-to-networking",
    sourceDomain: "Biology",
    targetDomain: "Computer Science",
    sourceSystem: "Blood Circulatory System",
    targetSystem: "Computer Network Infrastructure",
    overallStrength: 0.87,
    mappings: [
      {
        sourceNode: "Blood Cells",
        targetNode: "Data Packets",
        reason:
          "Both are discrete units that carry essential resources through a network of constrained pathways toward distributed destinations.",
        strength: 0.92,
      },
      {
        sourceNode: "Arteries & Veins",
        targetNode: "Network Cables & Channels",
        reason:
          "Both are directional pathways with varying capacity that form the physical infrastructure for transport.",
        strength: 0.95,
      },
      {
        sourceNode: "Heart",
        targetNode: "Central Router / Server",
        reason:
          "Both serve as the central pumping/routing mechanism that drives flow through the network.",
        strength: 0.78,
      },
      {
        sourceNode: "Arterial Blockage",
        targetNode: "Network Congestion",
        reason:
          "Both represent flow restriction in a pathway that forces rerouting or causes system degradation.",
        strength: 0.88,
      },
      {
        sourceNode: "Immune Response",
        targetNode: "Cybersecurity Defense",
        reason:
          "Both detect and neutralize foreign/malicious entities that could damage the system.",
        strength: 0.73,
      },
      {
        sourceNode: "Oxygen Delivery",
        targetNode: "Information Delivery",
        reason:
          "Both represent the payload that the transport system exists to deliver to end consumers.",
        strength: 0.90,
      },
    ],
    transferableSolutions: [
      "Implement collateral routing (like collateral blood vessels) for automatic failover",
      "Use adaptive flow control that responds to downstream demand (like vasodilation)",
      "Deploy distributed monitoring nodes (like baroreceptors) to detect pressure anomalies",
    ],
    brokenBridges: [
      {
        breakPoint: "Self-healing capacity",
        reason:
          "Blood vessels can grow new collateral pathways over time (angiogenesis). Network cables cannot physically reroute themselves.",
        innovation:
          "Software-defined networking (SDN) can simulate this by creating virtual pathways dynamically, achieving 'digital angiogenesis.'",
      },
      {
        breakPoint: "Packet immortality vs cell death",
        reason:
          "Data packets can be copied infinitely without degradation. Blood cells have a finite lifespan and must be continuously produced.",
        innovation:
          "This asymmetry suggests networks should implement packet 'aging' (TTL) to prevent zombie data from clogging the system — which TCP/IP already does.",
      },
    ],
    patternId: "distributed-flow-constrained-network",
  },
  {
    id: "ant-colony-to-traffic",
    sourceDomain: "Ecology",
    targetDomain: "Urban Planning",
    sourceSystem: "Ant Colony Foraging Network",
    targetSystem: "Urban Traffic System",
    overallStrength: 0.82,
    mappings: [
      {
        sourceNode: "Ants",
        targetNode: "Vehicles",
        reason: "Both are autonomous agents navigating a shared network to reach destinations.",
        strength: 0.85,
      },
      {
        sourceNode: "Pheromone Trails",
        targetNode: "Traffic Data / GPS Signals",
        reason:
          "Both provide indirect communication about path quality, guiding future routing decisions.",
        strength: 0.88,
      },
      {
        sourceNode: "Nest",
        targetNode: "City Center / Destination Hub",
        reason: "Both are high-traffic convergence points where many agents must arrive.",
        strength: 0.75,
      },
      {
        sourceNode: "Food Sources",
        targetNode: "Workplaces / Destinations",
        reason: "Both are distributed goals that agents must reach through the network.",
        strength: 0.80,
      },
      {
        sourceNode: "Trail Evaporation",
        targetNode: "Real-time Traffic Update Decay",
        reason:
          "Both mechanisms cause outdated routing information to fade, preventing agents from following stale paths.",
        strength: 0.90,
      },
    ],
    transferableSolutions: [
      "Decentralized path discovery using real-time data trails (like Waze crowd-sourced routing)",
      "Trail reinforcement: successful routes get stronger signals, drawing more traffic to proven paths",
      "Evaporation mechanism: traffic recommendations decay over time to reflect changing conditions",
    ],
    brokenBridges: [
      {
        breakPoint: "Agent expendability",
        reason:
          "Ants are expendable — the colony tolerates high individual mortality. Humans in cars are not expendable, making risky routing unacceptable.",
        innovation:
          "Traffic systems must add safety constraints that ant algorithms don't need: route risk scoring, speed limits on alternative paths, and liability-aware routing.",
      },
      {
        breakPoint: "Scale of communication",
        reason:
          "Ants communicate locally through pheromones with no global view. Vehicles have access to global traffic maps via GPS.",
        innovation:
          "Hybrid approach: use global data for strategic routing but local sensor data for tactical adjustments, combining the strengths of both.",
      },
    ],
    patternId: "distributed-flow-constrained-network",
  },
  {
    id: "bee-hive-to-warehouse",
    sourceDomain: "Biology",
    targetDomain: "Logistics",
    sourceSystem: "Bee Hive Task Allocation",
    targetSystem: "Warehouse Operations",
    overallStrength: 0.79,
    mappings: [
      {
        sourceNode: "Worker Bees",
        targetNode: "Warehouse Workers / Robots",
        reason: "Both are autonomous agents performing tasks from a shared pool.",
        strength: 0.88,
      },
      {
        sourceNode: "Waggle Dance",
        targetNode: "Task Assignment System",
        reason: "Both communicate task location, priority, and value to available workers.",
        strength: 0.72,
      },
      {
        sourceNode: "Age-Based Role Switching",
        targetNode: "Skill-Based Task Rotation",
        reason: "Both match agent capabilities to tasks, with transitions between roles.",
        strength: 0.68,
      },
      {
        sourceNode: "Hive Temperature Regulation",
        targetNode: "Warehouse Climate Control",
        reason: "Both maintain environmental conditions critical for stored resources.",
        strength: 0.65,
      },
    ],
    transferableSolutions: [
      "Implement decentralized task claiming where workers self-assign based on proximity and skill",
      "Use threshold-based role switching: workers change roles when queue depth exceeds threshold",
      "Deploy local communication for task handoffs instead of centralized dispatching",
    ],
    brokenBridges: [
      {
        breakPoint: "Silent failure tolerance",
        reason:
          "Bee colonies tolerate individual worker death silently — other bees adapt automatically. In warehouses, a worker failure (injury, equipment breakdown) cascades into inventory chaos.",
        innovation:
          "Build redundant 'worker nodes' that absorb silent failures. Add real-time status heartbeats — if a worker/robot stops responding, immediately reassign their tasks and alert supervisors.",
      },
      {
        breakPoint: "Cost of individual agents",
        reason:
          "A single bee is nearly costless to the colony. A warehouse robot or trained worker represents significant investment.",
        innovation:
          "Unlike bee colonies, warehouse systems need predictive maintenance, injury prevention, and careful resource protection — not just redundancy.",
      },
    ],
    patternId: "decentralized-task-allocation",
  },
  {
    id: "immune-system-to-cybersecurity",
    sourceDomain: "Biology",
    targetDomain: "Cybersecurity",
    sourceSystem: "Human Immune System",
    targetSystem: "Network Security Architecture",
    overallStrength: 0.84,
    mappings: [
      {
        sourceNode: "Innate Immunity (Skin, Mucus)",
        targetNode: "Firewalls & Perimeter Security",
        reason: "Both provide first-line, non-specific defense against any external threat.",
        strength: 0.91,
      },
      {
        sourceNode: "Adaptive Immunity (T-cells, B-cells)",
        targetNode: "Intrusion Detection & Response Systems",
        reason: "Both learn specific threat signatures and mount targeted responses.",
        strength: 0.86,
      },
      {
        sourceNode: "Antibodies",
        targetNode: "Security Rules & Signatures",
        reason: "Both are specific markers used to identify and neutralize known threats.",
        strength: 0.88,
      },
      {
        sourceNode: "Memory Cells",
        targetNode: "Threat Intelligence Database",
        reason: "Both retain information about past threats to enable faster future response.",
        strength: 0.93,
      },
      {
        sourceNode: "Inflammation",
        targetNode: "Incident Response & Alerting",
        reason: "Both are escalation mechanisms that recruit additional resources to the threat site.",
        strength: 0.77,
      },
    ],
    transferableSolutions: [
      "Implement layered defense: fast generic screening + slower specific analysis",
      "Build threat memory: store attack patterns for rapid future detection",
      "Use distributed detection: deploy sensors throughout the network, not just at the perimeter",
      "Implement 'inflammatory' response: automatically isolate affected segments and recruit resources",
    ],
    brokenBridges: [
      {
        breakPoint: "False positive consequences",
        reason:
          "The immune system has autoimmune diseases where it attacks self. Cybersecurity false positives block legitimate users, but the consequences are typically less severe than biological autoimmune attacks.",
        innovation:
          "Implement graduated response: quarantine suspicious activity first, confirm before blocking, and maintain 'self' profiles that are regularly updated.",
      },
      {
        breakPoint: "Speed of mutation",
        reason:
          "Biological pathogens mutate over generations. Digital malware can mutate in milliseconds through polymorphism.",
        innovation:
          "Behavioral analysis over signature matching: detect what malware does rather than what it looks like, since behavior changes slower than code appearance.",
      },
    ],
    patternId: "immune-response-adaptive",
  },
];

/* ── Example Problems for Quick Start ── */
export interface ExampleProblem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
}

export const EXAMPLE_PROBLEMS: ExampleProblem[] = [
  {
    id: "er-waiting",
    title: "Hospital ER Overcrowding",
    description:
      "A hospital has long emergency-room waiting times during peak hours. Patients arrive unpredictably, triage is overwhelmed, and delays cascade through the system.",
    icon: "🏥",
    category: "Healthcare",
  },
  {
    id: "data-center-cooling",
    title: "Data Center Cooling",
    description:
      "How can we cool a large data center more efficiently? Current HVAC systems consume 40% of total energy. We need passive or biomimetic cooling approaches.",
    icon: "🌡️",
    category: "Engineering",
  },
  {
    id: "traffic-congestion",
    title: "Urban Traffic Congestion",
    description:
      "A major city experiences severe traffic congestion during rush hours. Current signal timing is static. How can we create a self-adapting traffic system?",
    icon: "🚗",
    category: "Urban Planning",
  },
  {
    id: "warehouse-bottleneck",
    title: "Warehouse Picking Bottleneck",
    description:
      "Our warehouse has a bottleneck at the order-picking stage. The flow is: receiving → storage → picking → packing → shipping. Picking takes 3x longer than any other stage.",
    icon: "📦",
    category: "Logistics",
  },
  {
    id: "fake-news",
    title: "Misinformation Spread",
    description:
      "How can we slow the spread of misinformation on social platforms without censoring legitimate speech? The spread follows epidemic-like patterns.",
    icon: "📰",
    category: "Information",
  },
  {
    id: "democracy-polarization",
    title: "Democratic Polarization",
    description:
      "How do we redesign democratic institutions to reduce polarization? Current two-party systems create binary divisions that amplify conflict.",
    icon: "🏛️",
    category: "Governance",
  },
];
