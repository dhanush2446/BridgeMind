/* ══════════════════════════════════════════════════════════════
   PRE-COMPUTED ANALYSES — Rich, expert-level results for
   all example problems. Each includes full structural extraction,
   3 cross-domain analogies, broken bridge reports, hybrid
   synthesis, impact problems, and pattern matching.
   ══════════════════════════════════════════════════════════════ */

import type { FullAnalysis } from "./analogy-engine";
import { SEED_PATTERNS } from "./seed-data";

function findPattern(id: string) {
  return SEED_PATTERNS.find((p) => p.id === id) || null;
}

export const PRECOMPUTED_ANALYSES: Record<string, FullAnalysis> = {
  /* ════════════════════════════════════════
     1. HOSPITAL ER OVERCROWDING
     ════════════════════════════════════════ */
  "er-waiting": {
    problem: "A hospital has long emergency-room waiting times during peak hours.",
    structure: {
      summary:
        "An emergency room system where patients arrive unpredictably at a processing facility with finite capacity. A triage mechanism determines service priority. Delays cascade when arrival rate exceeds processing capacity, creating system-wide degradation.",
      elements: [
        { type: "entity", name: "Patients", description: "Agents arriving with varying urgency and needs" },
        { type: "entity", name: "Medical Staff", description: "Limited service providers with specialized skills" },
        { type: "entity", name: "Treatment Rooms", description: "Physical capacity constraint for patient care" },
        { type: "constraint", name: "Finite Capacity", description: "Fixed number of beds, staff, and equipment" },
        { type: "constraint", name: "Priority Ordering", description: "Triage system must order patients by urgency" },
        { type: "goal", name: "Minimize Wait Time", description: "Reduce time from arrival to treatment" },
        { type: "goal", name: "Maximize Survival", description: "Ensure critical patients receive timely care" },
        { type: "flow", name: "Patient Journey", description: "Arrival → Triage → Waiting → Treatment → Discharge" },
        { type: "bottleneck", name: "Triage Process", description: "Single assessment point creating queue buildup" },
        { type: "bottleneck", name: "Treatment Rooms", description: "Limited rooms causing waiting after triage" },
        { type: "feedback", name: "Cascade Effect", description: "Delayed patients worsen, requiring more resources" },
        { type: "dependency", name: "Lab Results", description: "Treatment depends on diagnostic results" },
        { type: "risk", name: "Patient Deterioration", description: "Condition worsening while waiting" },
        { type: "risk", name: "Staff Burnout", description: "Overworked staff reducing quality of care" },
      ],
      abstractPattern: "Uncertain Arrivals + Limited Service Capacity + Priority Queues + Cascading Delays",
      keywords: ["queue", "triage", "capacity", "priority", "cascade", "arrival rate", "service rate"],
    },
    analogies: [
      {
        id: "er-to-airport",
        sourceDomain: "Aviation",
        sourceSystem: "Airport Runway Scheduling System",
        analogyName: "Runway Scheduling → ER Triage",
        overallStrength: 0.89,
        mappings: [
          { sourceNode: "Aircraft", targetNode: "Patients", reason: "Both arrive unpredictably and require prioritized processing with varying urgency levels.", strength: 0.91 },
          { sourceNode: "Runway", targetNode: "Treatment Room", reason: "Both are scarce physical resources that can serve only one unit at a time.", strength: 0.93 },
          { sourceNode: "Air Traffic Control", targetNode: "Triage Nurse", reason: "Both assess incoming units, assign priority, and manage sequencing.", strength: 0.87 },
          { sourceNode: "Holding Pattern", targetNode: "Waiting Room", reason: "Both are buffer zones where units circle/wait until capacity opens.", strength: 0.92 },
          { sourceNode: "Fuel Emergency Priority", targetNode: "Critical Patient Priority", reason: "Both override normal queue order for life-threatening situations.", strength: 0.88 },
          { sourceNode: "Gate Assignment", targetNode: "Bed Assignment", reason: "Both match arriving units to available resources based on type and need.", strength: 0.85 },
        ],
        explanation: "Airport runway scheduling and ER management share the same fundamental structure: unpredictable arrivals competing for scarce capacity, with life-safety priority overrides and cascading delays when demand exceeds throughput.",
        transferableSolutions: [
          "Implement predictive arrival modeling (like airport ground delay programs) to pre-position staff before surges",
          "Create fast-track lanes for simple cases (like separate taxiways for small aircraft) to keep them out of the main queue",
          "Use dynamic capacity allocation: flex treatment rooms like airports flex between arrivals and departures",
          "Deploy real-time queue visualization so all staff see system state (like air traffic control screens)",
        ],
      },
      {
        id: "er-to-packet-routing",
        sourceDomain: "Computer Science",
        sourceSystem: "Network Quality of Service (QoS)",
        analogyName: "Network QoS → Patient Prioritization",
        overallStrength: 0.83,
        mappings: [
          { sourceNode: "Data Packets", targetNode: "Patients", reason: "Both are units requiring processing that arrive in bursts with varying priority.", strength: 0.82 },
          { sourceNode: "Router Buffer", targetNode: "Waiting Room", reason: "Both temporarily hold units when processing capacity is exceeded.", strength: 0.88 },
          { sourceNode: "QoS Classes", targetNode: "Triage Categories", reason: "Both classify incoming units into priority tiers for differential treatment.", strength: 0.90 },
          { sourceNode: "Packet Drop", targetNode: "Patient Diversion", reason: "Both are last-resort mechanisms when the system is completely overwhelmed.", strength: 0.75 },
          { sourceNode: "Load Balancer", targetNode: "Transfer Coordinator", reason: "Both distribute load across multiple processing nodes when one is overwhelmed.", strength: 0.86 },
        ],
        explanation: "Network QoS and ER triage solve the exact same structural problem: classifying incoming units by priority and managing a finite buffer to prevent the most important units from being delayed by less critical ones.",
        transferableSolutions: [
          "Implement weighted fair queuing: guarantee minimum service rate for each priority class",
          "Deploy early congestion detection (like TCP ECN) to trigger staffing increases before overflow",
          "Use packet scheduling algorithms (Weighted Round Robin) to balance between priority classes",
          "Implement 'load shedding' protocols: pre-planned diversion to other facilities when utilization exceeds threshold",
        ],
      },
      {
        id: "er-to-ant-foraging",
        sourceDomain: "Ecology",
        sourceSystem: "Ant Colony Resource Processing",
        analogyName: "Ant Nest → ER Staffing",
        overallStrength: 0.71,
        mappings: [
          { sourceNode: "Returning Foragers", targetNode: "Arriving Patients", reason: "Both arrive at a central processing point carrying needs that require different handling.", strength: 0.70 },
          { sourceNode: "Nest Entrance Workers", targetNode: "Triage Nurses", reason: "Both perform initial assessment and routing at the system entry point.", strength: 0.75 },
          { sourceNode: "Storage Chambers", targetNode: "Treatment Rooms", reason: "Both are specialized processing areas with limited capacity.", strength: 0.68 },
          { sourceNode: "Dynamic Worker Reassignment", targetNode: "Staff Reallocation", reason: "Both reallocate workers from low-demand to high-demand areas.", strength: 0.78 },
        ],
        explanation: "Ant colonies process returning foragers through a decentralized assessment system that dynamically reassigns workers based on demand — a principle directly applicable to ER staff management.",
        transferableSolutions: [
          "Implement threshold-based staff switching: nurses move to busiest area when queue exceeds trigger level",
          "Use stigmergic communication: visual/digital signals in the environment indicate which areas need help",
          "Deploy decentralized decision-making: empower each care team to recruit help without central authorization",
        ],
      },
    ],
    brokenBridgeReports: [
      {
        analogyId: "er-to-airport",
        directTransfers: [
          { element: "Priority override system", explanation: "Both systems can bump lower-priority items for emergencies. Direct transfer: implement emergency fast-track that bypasses normal queue." },
          { element: "Predictive scheduling", explanation: "Airports use historical data to predict traffic. ERs can use admission history to predict surge timing." },
          { element: "Holding pattern / waiting area", explanation: "Both use buffer zones to manage overflow. Direct transfer: structured waiting with regular updates." },
        ],
        adaptedTransfers: [
          { element: "Ground delay programs", adaptation: "Airports delay departures at origin to manage destination congestion. ERs can implement 'ambulance diversion' to redirect patients to less busy hospitals.", risk: "Patient condition may worsen during diversion travel time." },
          { element: "Parallel runway operations", adaptation: "ERs can create parallel treatment tracks (fast-track for minor issues, main track for complex cases, resuscitation for critical).", risk: "Requires sufficient staff to man multiple tracks." },
        ],
        failures: [
          {
            breakPoint: "Predictability of arrivals",
            reason: "Aircraft file flight plans hours in advance, giving airports predictive visibility. ER arrivals are fundamentally unpredictable — there are no 'flight plans' for emergencies.",
            innovation: "Use population-level predictive models: historical patterns, local events, weather, and real-time ambulance dispatch data to create probabilistic arrival forecasts.",
            severity: "high",
          },
          {
            breakPoint: "Diversion consequences",
            reason: "Diverting an aircraft to another airport is inconvenient but safe. Diverting a critical patient to a distant hospital can be life-threatening.",
            innovation: "Implement 'soft diversion' for non-critical patients only, combined with real-time capacity sharing between hospitals so diversions go to verified available capacity.",
            severity: "high",
          },
          {
            breakPoint: "Unit homogeneity",
            reason: "Aircraft types are relatively standardized. Patients present infinite variety of conditions, each requiring different resources and expertise.",
            innovation: "Develop rapid classification protocols that map patient presentations to resource requirement profiles, creating 'patient type categories' analogous to aircraft categories.",
            severity: "medium",
          },
        ],
        innovationOpportunities: [
          "Real-time hospital network capacity sharing (like air traffic flow management across airports)",
          "Patient 'flight plan' system: urgent care and telehealth create voluntary pre-arrival notification",
          "Probabilistic arrival forecasting using multi-source data fusion",
          "Cross-hospital load balancing for non-emergency patients",
        ],
      },
    ],
    hybridSolution: {
      name: "Adaptive Flow Hospital — A Self-Healing ER System",
      description:
        "A hybrid solution combining airport scheduling precision, network QoS priority management, and ant colony adaptive resource allocation to create an ER that predicts surges, dynamically reallocates resources, and balances load across the hospital network.",
      components: [
        { sourceDomain: "Aviation", principle: "Predictive flow management", contribution: "Forecast patient surges using historical patterns and real-time data. Pre-position staff and open capacity before the wave arrives." },
        { sourceDomain: "Computer Science", principle: "Quality of Service (QoS) priority queuing", contribution: "Implement multi-tier priority system with guaranteed minimum service rates for each tier. Use weighted fair queuing to prevent priority inversion." },
        { sourceDomain: "Ecology", principle: "Decentralized adaptive task allocation", contribution: "Empower staff to self-organize using threshold-based switching. When a queue exceeds a threshold, nearby staff automatically shift to assist without waiting for central authorization." },
      ],
      synthesis:
        "The Adaptive Flow Hospital combines three intelligence patterns: it PREDICTS like an airport (using data fusion for surge forecasting), PRIORITIZES like a network router (using QoS algorithms for multi-tier patient management), and ADAPTS like an ant colony (using decentralized threshold-based staff reallocation). The result is a system that sees surges coming, manages them with mathematical precision, and self-heals when individual components are overwhelmed.",
      risks: [
        "Predictive models may fail for unprecedented events (pandemics, mass casualty incidents)",
        "Decentralized staff movement may leave some areas understaffed",
        "Technology infrastructure costs may be significant",
        "Staff resistance to algorithm-driven task assignment",
      ],
      testingRecommendations: [
        "Simulate the system with 12 months of historical ER data before deployment",
        "Pilot in one ER wing before hospital-wide rollout",
        "Compare patient outcomes and wait times against historical baseline",
        "Survey staff satisfaction with the decentralized allocation model",
        "Test failure modes: what happens when the prediction system goes down?",
      ],
    },
    impactProblems: [
      { title: "Court Case Backlog Crisis", domain: "Legal System", description: "Criminal and civil courts overwhelmed with cases, leading to years-long delays in justice.", structuralSimilarity: 0.91, socialImpact: "critical", scale: "Millions of pending cases globally", status: "partially-solved", transferFeasibility: 0.78 },
      { title: "Immigration Processing Delays", domain: "Government", description: "Asylum and visa applications backing up due to limited processing capacity and unpredictable volumes.", structuralSimilarity: 0.88, socialImpact: "critical", scale: "Tens of millions of applicants worldwide", status: "partially-solved", transferFeasibility: 0.72 },
      { title: "Disaster Relief Allocation", domain: "Humanitarian", description: "After natural disasters, limited relief resources must be prioritized among competing urgent needs.", structuralSimilarity: 0.85, socialImpact: "critical", scale: "Hundreds of millions affected annually", status: "partially-solved", transferFeasibility: 0.68 },
      { title: "Organ Transplant Waitlist", domain: "Healthcare", description: "Limited organs must be allocated to prioritized patients with uncertain arrival of new organs.", structuralSimilarity: 0.83, socialImpact: "critical", scale: "Over 100,000 waiting in the US alone", status: "partially-solved", transferFeasibility: 0.65 },
      { title: "Airport Security Queue Optimization", domain: "Transportation", description: "Unpredictable passenger volumes at security checkpoints with limited lanes and equipment.", structuralSimilarity: 0.92, socialImpact: "medium", scale: "Billions of passengers annually", status: "partially-solved", transferFeasibility: 0.85 },
      { title: "Customer Support Ticket Overflow", domain: "Technology", description: "Support tickets arrive faster than agents can handle, with varying urgency and complexity.", structuralSimilarity: 0.87, socialImpact: "medium", scale: "Industry-wide challenge", status: "partially-solved", transferFeasibility: 0.90 },
      { title: "Emergency Evacuation Management", domain: "Disaster Response", description: "Mass evacuation requires prioritized routing of people through limited exit pathways.", structuralSimilarity: 0.80, socialImpact: "critical", scale: "Entire city populations at risk", status: "unsolved", transferFeasibility: 0.55 },
    ],
    matchedPattern: findPattern("queue-priority-limited-capacity"),
  },

  /* ════════════════════════════════════════
     2. TRAFFIC CONGESTION
     ════════════════════════════════════════ */
  "traffic-congestion": {
    problem: "A major city experiences severe traffic congestion during rush hours.",
    structure: {
      summary:
        "Vehicles flow through a road network with limited lane capacity toward distributed destinations. During peak hours, demand exceeds capacity at key intersection points, creating cascading congestion that degrades the entire network.",
      elements: [
        { type: "entity", name: "Vehicles", description: "Autonomous agents navigating the network" },
        { type: "entity", name: "Road Network", description: "Constrained pathways with fixed capacity" },
        { type: "entity", name: "Traffic Signals", description: "Flow controllers at intersection nodes" },
        { type: "constraint", name: "Lane Capacity", description: "Each road has a maximum vehicle throughput" },
        { type: "constraint", name: "Signal Timing", description: "Traffic lights create periodic flow interruptions" },
        { type: "goal", name: "Minimize Travel Time", description: "All vehicles want fastest route to destination" },
        { type: "goal", name: "Maximize Throughput", description: "System should move maximum vehicles per hour" },
        { type: "flow", name: "Vehicle Movement", description: "Origin → Route Selection → Intersections → Destination" },
        { type: "bottleneck", name: "Key Intersections", description: "High-traffic intersections where routes converge" },
        { type: "bottleneck", name: "Highway On-ramps", description: "Merge points with limited entry capacity" },
        { type: "feedback", name: "Congestion Spiral", description: "Congestion causes rerouting which creates new congestion" },
        { type: "feedback", name: "Braess Paradox", description: "Adding roads can worsen congestion by changing route choices" },
        { type: "dependency", name: "Signal Coordination", description: "Green waves require coordination across intersections" },
        { type: "risk", name: "Gridlock", description: "Complete system failure when no vehicle can move" },
      ],
      abstractPattern: "Distributed Flow Through Constrained Network Under Variable Demand",
      keywords: ["flow", "congestion", "routing", "network", "capacity", "demand", "intersection"],
    },
    analogies: [
      {
        id: "traffic-to-ant-colony",
        sourceDomain: "Ecology",
        sourceSystem: "Ant Colony Foraging Network",
        analogyName: "Ant Trails → Traffic Routes",
        overallStrength: 0.86,
        mappings: [
          { sourceNode: "Ants", targetNode: "Vehicles", reason: "Both are autonomous agents navigating a shared network to reach destinations.", strength: 0.88 },
          { sourceNode: "Pheromone Trails", targetNode: "Traffic Data / GPS", reason: "Both provide indirect route quality information to guide future decisions.", strength: 0.90 },
          { sourceNode: "Trail Evaporation", targetNode: "Data Decay / Updates", reason: "Both ensure routing information stays current by fading old signals.", strength: 0.85 },
          { sourceNode: "Multiple Food Sources", targetNode: "Multiple Destinations", reason: "Both involve distributed goals reached through shared pathways.", strength: 0.82 },
          { sourceNode: "Trail Reinforcement", targetNode: "Route Popularity", reason: "Both strengthen frequently-used paths through positive feedback.", strength: 0.87 },
        ],
        explanation: "Ant colonies solve the same decentralized routing problem: many autonomous agents navigating a shared network using indirect communication, with no central controller.",
        transferableSolutions: [
          "Implement digital pheromone-based routing: real-time crowd-sourced traffic data guides vehicles away from congestion",
          "Use trail evaporation: traffic recommendations expire quickly to prevent herding toward suddenly-congested routes",
          "Deploy decentralized path discovery: vehicles independently explore alternatives rather than all following the same 'best' route",
        ],
      },
      {
        id: "traffic-to-blood-flow",
        sourceDomain: "Biology",
        sourceSystem: "Blood Circulatory System",
        analogyName: "Blood Flow → Traffic Flow",
        overallStrength: 0.81,
        mappings: [
          { sourceNode: "Blood Cells", targetNode: "Vehicles", reason: "Both are flow units carrying payload through constrained channels.", strength: 0.84 },
          { sourceNode: "Arteries", targetNode: "Highways", reason: "Both are high-capacity channels carrying flow away from a central point.", strength: 0.88 },
          { sourceNode: "Capillaries", targetNode: "Local Streets", reason: "Both are small-capacity channels delivering flow to final destinations.", strength: 0.82 },
          { sourceNode: "Vasodilation", targetNode: "Adaptive Lane Mgmt", reason: "Both dynamically increase local capacity in response to demand.", strength: 0.79 },
          { sourceNode: "Collateral Vessels", targetNode: "Alternative Routes", reason: "Both provide bypass pathways when primary channels are blocked.", strength: 0.83 },
        ],
        explanation: "Blood circulation and traffic share the structure of flow through a hierarchical network with adaptive capacity and bypass mechanisms.",
        transferableSolutions: [
          "Implement vasodilation: dynamically widen high-demand routes (reversible lanes, signal priority)",
          "Develop collateral pathways: pre-planned bypass routes that activate during congestion",
          "Deploy distributed pressure sensing: monitor traffic pressure throughout the network, not just at intersections",
        ],
      },
      {
        id: "traffic-to-immune",
        sourceDomain: "Biology",
        sourceSystem: "Immune System Response",
        analogyName: "Immune Response → Congestion Clearing",
        overallStrength: 0.68,
        mappings: [
          { sourceNode: "Threat Detection", targetNode: "Congestion Detection", reason: "Both identify localized problems that could spread if unchecked.", strength: 0.74 },
          { sourceNode: "Local Containment", targetNode: "Local Signal Adjustment", reason: "Both respond first with local containment before escalating.", strength: 0.71 },
          { sourceNode: "Memory Cells", targetNode: "Historical Traffic Patterns", reason: "Both remember past incidents to respond faster to recurring problems.", strength: 0.76 },
          { sourceNode: "Rapid Mobilization", targetNode: "Dynamic Rerouting", reason: "Both recruit resources/alternatives quickly to the problem area.", strength: 0.65 },
        ],
        explanation: "The immune system detects threats, contains them locally, and remembers patterns — principles applicable to detecting and managing recurring congestion.",
        transferableSolutions: [
          "Implement pattern memory: recognize recurring congestion events and pre-deploy solutions",
          "Use local-first containment: address congestion at the source before it spreads",
          "Deploy 'immune memory' for incidents: when a similar incident occurs, activate the previously successful response immediately",
        ],
      },
    ],
    brokenBridgeReports: [
      {
        analogyId: "traffic-to-ant-colony",
        directTransfers: [
          { element: "Decentralized routing", explanation: "Both systems work without central control. Vehicles can independently choose routes like ants choose trails." },
          { element: "Information decay", explanation: "Trail evaporation directly maps to traffic data expiry. Old route recommendations should fade." },
        ],
        adaptedTransfers: [
          { element: "Pheromone communication", adaptation: "Digital pheromones via connected vehicles and road sensors. Unlike chemical pheromones, digital signals can be broadcast instantly.", risk: "Technology dependency — system fails if connectivity drops." },
        ],
        failures: [
          { breakPoint: "Agent expendability", reason: "Ants exploring risky paths may die, which is acceptable. Vehicles cannot be routed into dangerous situations for 'network exploration.'", innovation: "Use simulated exploration: AI agents virtually explore alternative routes using real-time data before recommending them to actual vehicles.", severity: "high" },
          { breakPoint: "Scale of individual intelligence", reason: "Ants follow simple rules. Human drivers have complex, sometimes irrational, preferences.", innovation: "Design the system to work WITH human decision-making via recommendations and incentives rather than commands.", severity: "medium" },
        ],
        innovationOpportunities: [
          "Virtual pheromone system: AI explores routes computationally, drivers get safe recommendations",
          "Incentive-based routing: reward drivers for choosing less-congested routes",
          "Self-healing network: automatically detect and respond to congestion before it cascades",
        ],
      },
    ],
    hybridSolution: {
      name: "Self-Healing Traffic Network",
      description: "A traffic system that detects congestion like an immune system, remembers recurring patterns, and reroutes vehicles through decentralized adaptive paths like an ant colony, while dynamically adjusting capacity like blood vessel vasodilation.",
      components: [
        { sourceDomain: "Ecology (Ant Colonies)", principle: "Decentralized path discovery with pheromone-like signals", contribution: "Vehicles share real-time route quality data, creating digital 'pheromone trails' that guide others away from congestion." },
        { sourceDomain: "Biology (Immune System)", principle: "Local detection, memory, and rapid containment", contribution: "The system detects congestion at its source, remembers recurring patterns, and pre-deploys containment measures." },
        { sourceDomain: "Biology (Circulatory System)", principle: "Adaptive capacity and collateral pathways", contribution: "Roads dynamically adjust capacity (reversible lanes, adaptive signals) and pre-mapped bypass routes activate automatically." },
      ],
      synthesis: "The Self-Healing Traffic Network operates on three layers: SENSE (immune-inspired detection), REMEMBER (pattern memory from history), and ADAPT (ant-colony rerouting + circulatory capacity adjustment).",
      risks: ["Technology infrastructure investment is substantial", "Privacy concerns from continuous vehicle tracking", "System must degrade gracefully if sensors fail", "Human driver compliance cannot be guaranteed"],
      testingRecommendations: ["Simulate with 6 months of real traffic data in a digital twin", "Pilot in a single corridor before city-wide deployment", "A/B test corridors with and without the system", "Measure: average travel time, congestion duration, fuel consumption, emissions"],
    },
    impactProblems: [
      { title: "Internet Packet Routing Under DDoS", domain: "Cybersecurity", description: "Network infrastructure overwhelmed by malicious traffic, requiring adaptive routing and filtering.", structuralSimilarity: 0.88, socialImpact: "high", scale: "Global internet infrastructure", status: "partially-solved", transferFeasibility: 0.82 },
      { title: "Supply Chain Disruption Recovery", domain: "Logistics", description: "Global supply chains need to reroute around disruptions (factory closures, port blockages).", structuralSimilarity: 0.85, socialImpact: "critical", scale: "Global trade", status: "partially-solved", transferFeasibility: 0.70 },
      { title: "Emergency Evacuation Routing", domain: "Disaster Response", description: "Routing thousands of vehicles out of a disaster zone through limited exit routes.", structuralSimilarity: 0.90, socialImpact: "critical", scale: "Metropolitan populations", status: "unsolved", transferFeasibility: 0.60 },
      { title: "Neural Signal Propagation Disorders", domain: "Neuroscience", description: "Neural signals experiencing 'congestion' in damaged pathways, needing rerouting.", structuralSimilarity: 0.72, socialImpact: "high", scale: "Millions of neurological patients", status: "unsolved", transferFeasibility: 0.40 },
      { title: "Airport Taxiway Congestion", domain: "Aviation", description: "Aircraft competing for limited taxiway space, causing departure delays.", structuralSimilarity: 0.93, socialImpact: "medium", scale: "Major airports worldwide", status: "partially-solved", transferFeasibility: 0.88 },
    ],
    matchedPattern: findPattern("distributed-flow-constrained-network"),
  },

  /* ════════════════════════════════════════
     3. DATA CENTER COOLING
     ════════════════════════════════════════ */
  "data-center-cooling": {
    problem: "How can we cool a large data center more efficiently? Current HVAC systems consume 40% of total energy.",
    structure: {
      summary:
        "A facility generates concentrated heat from computing equipment that must be dissipated to maintain operating temperatures. Current active cooling consumes enormous energy. The challenge is to remove heat passively or with minimal energy input across a complex spatial layout.",
      elements: [
        { type: "entity", name: "Server Racks", description: "Heat-generating computing units arranged in rows" },
        { type: "entity", name: "HVAC System", description: "Active cooling infrastructure consuming 40% of energy" },
        { type: "entity", name: "Airflow Pathways", description: "Hot aisle / cold aisle air circulation channels" },
        { type: "constraint", name: "Temperature Limits", description: "Servers must stay below 35°C to avoid failure" },
        { type: "constraint", name: "Energy Budget", description: "Cooling must consume less energy to reduce PUE" },
        { type: "constraint", name: "Spatial Layout", description: "Fixed building geometry constraining airflow design" },
        { type: "goal", name: "Reduce Cooling Energy", description: "Cut HVAC energy consumption by 50%+" },
        { type: "goal", name: "Maintain Temperature", description: "Keep all equipment within operating range" },
        { type: "flow", name: "Heat Transfer", description: "Server → Hot Air → Cooling System → Outside Environment" },
        { type: "flow", name: "Airflow Path", description: "Cold intake → Through servers → Hot exhaust → Return" },
        { type: "bottleneck", name: "Hot Spots", description: "Localized areas where heat exceeds capacity of airflow" },
        { type: "feedback", name: "Thermal Runaway", description: "Hot equipment works harder, generating more heat" },
        { type: "risk", name: "Equipment Failure", description: "Overheating causing server shutdown or damage" },
        { type: "risk", name: "Uneven Cooling", description: "Some areas over-cooled while hot spots persist" },
      ],
      abstractPattern: "Heat Dissipation Through Passive Structures in a Constrained Spatial Volume",
      keywords: ["cooling", "heat", "thermal", "airflow", "passive", "ventilation", "temperature", "energy"],
    },
    analogies: [
      {
        id: "datacenter-to-termite",
        sourceDomain: "Biology",
        sourceSystem: "Termite Mound Ventilation System",
        analogyName: "Termite Cooling → Data Center Cooling",
        overallStrength: 0.91,
        mappings: [
          { sourceNode: "Mound Interior", targetNode: "Server Room", reason: "Both are enclosed spaces generating heat that must be regulated within narrow temperature bands.", strength: 0.93 },
          { sourceNode: "Ventilation Chimneys", targetNode: "Hot Aisle Exhaust", reason: "Both use vertical channels to draw hot air upward and out of the system via convection.", strength: 0.92 },
          { sourceNode: "Porous Mound Walls", targetNode: "Building Envelope", reason: "Both serve as the boundary between internal heat and external environment, and can be engineered for selective permeability.", strength: 0.85 },
          { sourceNode: "Underground Tunnels", targetNode: "Sub-floor Plenums", reason: "Both use below-grade channels to bring cool air into the system from thermally stable sources.", strength: 0.88 },
          { sourceNode: "Evaporative Chambers", targetNode: "Cooling Towers", reason: "Both use evaporation to remove heat, converting thermal energy to latent heat of water.", strength: 0.90 },
          { sourceNode: "Dynamic Vent Opening", targetNode: "Variable Airflow Controls", reason: "Both adjust openings based on environmental conditions to regulate internal temperature.", strength: 0.86 },
        ],
        explanation: "Termite mounds maintain internal temperatures within 1°C despite 40°C external swings — using zero-energy passive ventilation, thermal mass, and adaptive airflow. This is exactly what data centers need.",
        transferableSolutions: [
          "Design chimney-effect exhaust systems that use natural convection to pull hot air upward without fans",
          "Use underground thermal mass: route intake air through sub-grade tunnels to pre-cool it (earth tubes)",
          "Implement porous building envelope zones that allow selective air exchange based on temperature differential",
          "Create evaporative cooling zones inspired by termite humidity chambers — using water misting at key exhaust points",
        ],
      },
      {
        id: "datacenter-to-human-body",
        sourceDomain: "Biology",
        sourceSystem: "Human Thermoregulation System",
        analogyName: "Body Temperature → Server Temperature",
        overallStrength: 0.84,
        mappings: [
          { sourceNode: "Blood Circulation", targetNode: "Coolant Distribution", reason: "Both transport heat from generation points to dissipation surfaces via fluid circulation.", strength: 0.89 },
          { sourceNode: "Sweat Glands", targetNode: "Evaporative Coolers", reason: "Both use evaporation at the surface to remove heat energy.", strength: 0.87 },
          { sourceNode: "Vasodilation", targetNode: "Dynamic Airflow Increase", reason: "Both increase flow to the cooling surface when heat load rises.", strength: 0.82 },
          { sourceNode: "Hypothalamus", targetNode: "Building Management System", reason: "Both serve as the central thermostat sensing temperature and coordinating responses.", strength: 0.80 },
          { sourceNode: "Skin Surface Area", targetNode: "Heat Exchanger Surface", reason: "Both maximize surface area for heat dissipation to the environment.", strength: 0.85 },
        ],
        explanation: "The human body maintains 37°C across a wide range of activities and environments using a multi-layered thermoregulation system — circulation, evaporation, radiation, and behavioral adaptation.",
        transferableSolutions: [
          "Implement liquid cooling loops that circulate coolant directly to hot spots (like blood carrying heat to skin)",
          "Deploy zone-based temperature control: each rack row has independent cooling (like different body parts regulate independently)",
          "Use counter-current heat exchange: outgoing hot air pre-heats incoming fresh air in winter for energy recovery",
        ],
      },
      {
        id: "datacenter-to-coral-reef",
        sourceDomain: "Marine Biology",
        sourceSystem: "Coral Reef Water Flow Architecture",
        analogyName: "Reef Water Flow → Server Airflow",
        overallStrength: 0.72,
        mappings: [
          { sourceNode: "Coral Structure", targetNode: "Server Rack Layout", reason: "Both are porous structures that must allow fluid flow through and around them.", strength: 0.75 },
          { sourceNode: "Water Currents", targetNode: "Airflow Patterns", reason: "Both rely on fluid movement to deliver nutrients/cooling and remove waste/heat.", strength: 0.80 },
          { sourceNode: "Reef Channels", targetNode: "Cold Aisles", reason: "Both are structured pathways that accelerate fluid flow through the system.", strength: 0.73 },
          { sourceNode: "Fractal Branching", targetNode: "Airflow Distribution", reason: "Both benefit from fractal-like branching to maximize surface contact with the fluid.", strength: 0.68 },
        ],
        explanation: "Coral reefs create complex 3D structures that maximize water flow for cooling and nutrient delivery — a design principle applicable to server rack arrangement and airflow optimization.",
        transferableSolutions: [
          "Redesign rack layouts using fractal branching principles to maximize air contact surface area",
          "Create channeled airflow pathways that accelerate cooling air through high-heat zones (venturi effect)",
          "Use biomimetic 3D structures between racks to increase turbulent mixing and heat transfer",
        ],
      },
    ],
    brokenBridgeReports: [
      {
        analogyId: "datacenter-to-termite",
        directTransfers: [
          { element: "Chimney ventilation", explanation: "Natural convection through vertical exhaust channels works identically in both systems. Can directly reduce fan energy by 30-60%." },
          { element: "Earth tube pre-cooling", explanation: "Underground air channels exploit the same geothermal stability in both systems. Ground temperature at 3m depth is ~15°C year-round." },
          { element: "Evaporative cooling", explanation: "Water evaporation removes heat identically. Termite mounds use damp soil; data centers can use misting systems." },
        ],
        adaptedTransfers: [
          { element: "Adaptive vent control", adaptation: "Termites physically open/close vents with their bodies. Data centers can use automated dampers controlled by sensor networks.", risk: "Sensor failure could leave vents in wrong position." },
          { element: "Thermal mass integration", adaptation: "Termite mounds use thick soil walls as thermal batteries. Data centers can use phase-change materials (PCMs) in walls and ceilings to absorb peak heat.", risk: "PCM capacity is finite — may not handle sustained peak loads without active backup." },
        ],
        failures: [
          { breakPoint: "Heat density scale", reason: "Termite mounds generate ~10 watts of metabolic heat. A single server rack generates 5,000-25,000 watts. The heat density is 500-2,500x greater per unit volume.", innovation: "Combine passive ventilation for baseline cooling (handling 40-60% of load) with targeted liquid cooling for high-density racks. Passive handles the easy watts; active handles the hard ones.", severity: "high" },
          { breakPoint: "Environmental control requirements", reason: "Termites tolerate 2-3°C temperature swings. Servers need consistent temperature with no hot spots above 35°C.", innovation: "Deploy granular sensor networks with per-rack monitoring and localized active cooling that only engages when passive cooling is insufficient at specific locations.", severity: "medium" },
          { breakPoint: "Humidity control", reason: "Termite mounds embrace humidity for evaporative cooling. Server rooms need controlled humidity (40-60% RH) to prevent condensation and static discharge.", innovation: "Separate the cooling pathway: use evaporative cooling in a separated air-to-air heat exchanger so humid air never contacts servers directly (indirect evaporative cooling).", severity: "medium" },
        ],
        innovationOpportunities: [
          "Hybrid passive-active cooling: passive for 60% of load, active only for peak demand",
          "Phase-change material thermal batteries that absorb heat spikes and release overnight",
          "Indirect evaporative cooling that keeps humidity away from servers",
          "Bio-inspired adaptive architecture that responds to heat load in real-time",
        ],
      },
    ],
    hybridSolution: {
      name: "BioVent — Biomimetic Data Center Cooling",
      description: "A hybrid cooling system combining termite mound passive ventilation, human thermoregulation principles, and coral reef flow optimization to reduce data center cooling energy by 60% while maintaining precise temperature control.",
      components: [
        { sourceDomain: "Entomology (Termite Mounds)", principle: "Passive convective ventilation with earth tube pre-cooling", contribution: "Chimney-effect exhaust systems and underground intake tunnels provide zero-energy baseline cooling for 40-60% of the heat load. No fans required for this portion." },
        { sourceDomain: "Human Physiology", principle: "Multi-zone adaptive thermoregulation with liquid loops", contribution: "Direct liquid cooling for high-density racks (like blood cooling), with zone-based control where each row independently adjusts cooling intensity based on local demand." },
        { sourceDomain: "Marine Biology (Coral Reefs)", principle: "Flow-optimized spatial architecture", contribution: "Server racks arranged in biomimetic patterns that maximize air contact and create venturi acceleration through hot zones, increasing heat transfer coefficient without additional energy." },
      ],
      synthesis: "BioVent creates three cooling layers: PASSIVE (termite-inspired natural ventilation handling 40-60% of load at zero energy cost), TARGETED (human-inspired liquid cooling for high-heat racks), and OPTIMIZED (coral-inspired spatial layout maximizing airflow efficiency). The system operates in cascading mode — passive first, active only where needed — achieving a projected PUE of 1.08-1.15 versus the industry average of 1.58.",
      risks: ["Passive ventilation effectiveness depends on local climate", "Liquid cooling adds complexity and leak risk", "Retrofit costs for existing facilities may be high", "Novel architecture requires validation at scale"],
      testingRecommendations: ["Build a 100-rack pilot facility with instrumented thermal monitoring", "Compare PUE against identical conventional facility over 12 months", "Test extreme conditions: summer peak heat, winter cold, humidity variations", "Validate computational fluid dynamics (CFD) models against actual performance"],
    },
    impactProblems: [
      { title: "Urban Heat Island Effect", domain: "Urban Planning", description: "Cities trapping heat due to concrete/asphalt, needing passive cooling at district scale.", structuralSimilarity: 0.85, socialImpact: "critical", scale: "Billions of urban residents", status: "partially-solved", transferFeasibility: 0.72 },
      { title: "Spacecraft Thermal Management", domain: "Aerospace", description: "Satellites must dissipate heat in vacuum using only radiation — no convection possible.", structuralSimilarity: 0.70, socialImpact: "high", scale: "Growing satellite industry", status: "partially-solved", transferFeasibility: 0.55 },
      { title: "Electric Vehicle Battery Cooling", domain: "Automotive", description: "Battery packs generate intense heat during fast charging, requiring efficient thermal management.", structuralSimilarity: 0.82, socialImpact: "high", scale: "Global EV market", status: "partially-solved", transferFeasibility: 0.80 },
      { title: "Tropical Building Design", domain: "Architecture", description: "Buildings in hot climates needing passive cooling to reduce air conditioning dependency.", structuralSimilarity: 0.88, socialImpact: "critical", scale: "Billions of buildings globally", status: "partially-solved", transferFeasibility: 0.85 },
      { title: "Server Chip Thermal Design", domain: "Electronics", description: "Microprocessors hitting thermal walls — chip-level heat dissipation becoming the bottleneck.", structuralSimilarity: 0.78, socialImpact: "high", scale: "Entire semiconductor industry", status: "partially-solved", transferFeasibility: 0.65 },
    ],
    matchedPattern: findPattern("distributed-flow-constrained-network"),
  },

  /* ════════════════════════════════════════
     4. WAREHOUSE PICKING BOTTLENECK
     ════════════════════════════════════════ */
  "warehouse-bottleneck": {
    problem: "Our warehouse has a bottleneck at the order-picking stage. The flow is: receiving → storage → picking → packing → shipping. Picking takes 3x longer than any other stage.",
    structure: {
      summary:
        "A sequential processing pipeline where one stage (picking) operates at significantly lower throughput than all other stages, causing queue buildup before it and underutilization after it, reducing total system throughput to the speed of the slowest stage.",
      elements: [
        { type: "entity", name: "Orders", description: "Work units flowing through the pipeline" },
        { type: "entity", name: "Pick Workers/Robots", description: "Agents performing the bottleneck task" },
        { type: "entity", name: "Warehouse Layout", description: "Physical space constraining movement paths" },
        { type: "constraint", name: "Sequential Dependency", description: "Each stage depends on the previous stage's output" },
        { type: "constraint", name: "Walking Distance", description: "Pickers must travel between storage locations" },
        { type: "constraint", name: "Pick Accuracy", description: "Speed must not compromise accuracy" },
        { type: "goal", name: "Triple Pick Throughput", description: "Match picking speed to other stages" },
        { type: "goal", name: "Reduce Walking Time", description: "Minimize non-productive movement" },
        { type: "flow", name: "Order Pipeline", description: "Receiving → Storage → Picking → Packing → Shipping" },
        { type: "bottleneck", name: "Picking Stage", description: "3x slower than every other stage — the constraint" },
        { type: "feedback", name: "Queue Pressure", description: "Backed-up orders create pressure and errors at picking" },
        { type: "dependency", name: "Storage Layout", description: "Pick efficiency depends on how items are stored" },
        { type: "risk", name: "Order Delays", description: "Bottleneck delays all downstream shipping deadlines" },
        { type: "risk", name: "Worker Fatigue", description: "Pickers walking 10-15 miles/day leads to errors and injuries" },
      ],
      abstractPattern: "Single-Point Bottleneck in Sequential Pipeline Causing System-Wide Throughput Collapse",
      keywords: ["bottleneck", "pipeline", "throughput", "picking", "warehouse", "constraint", "sequential"],
    },
    analogies: [
      {
        id: "warehouse-to-bee-hive",
        sourceDomain: "Biology",
        sourceSystem: "Bee Hive Task Allocation & Resource Distribution",
        analogyName: "Bee Hive → Warehouse Workers",
        overallStrength: 0.82,
        mappings: [
          { sourceNode: "Worker Bees", targetNode: "Pick Workers", reason: "Both are autonomous agents retrieving items from distributed storage locations.", strength: 0.88 },
          { sourceNode: "Waggle Dance", targetNode: "Pick Assignment System", reason: "Both communicate the location and priority of resources to workers.", strength: 0.75 },
          { sourceNode: "Honeycomb Layout", targetNode: "Storage Layout", reason: "Both are structured spatial arrangements optimized for access efficiency.", strength: 0.80 },
          { sourceNode: "Radial Distribution", targetNode: "Zone-Based Picking", reason: "Bees store frequently-used resources near the center; warehouses can place fast-moving items near packing.", strength: 0.85 },
          { sourceNode: "Task Switching", targetNode: "Dynamic Role Assignment", reason: "Both systems benefit when workers switch roles based on current demand.", strength: 0.78 },
        ],
        explanation: "A bee hive manages distributed resource retrieval with remarkable efficiency — workers dynamically self-assign, high-demand items are stored centrally, and communication is decentralized.",
        transferableSolutions: [
          "Implement radial storage: place highest-velocity items closest to packing area (like bees storing honey near the brood)",
          "Use decentralized task claiming: pickers self-assign orders based on their current zone location",
          "Deploy dynamic role switching: when packing is idle, packers assist with picking (like bees switching roles by age/need)",
        ],
      },
      {
        id: "warehouse-to-hospital-pharmacy",
        sourceDomain: "Healthcare",
        sourceSystem: "Hospital Pharmacy Dispensing System",
        analogyName: "Pharmacy Queue → Warehouse Queue",
        overallStrength: 0.87,
        mappings: [
          { sourceNode: "Medication Orders", targetNode: "Pick Orders", reason: "Both are requests for specific items from a large inventory that must be fulfilled quickly and accurately.", strength: 0.92 },
          { sourceNode: "Automated Dispensing", targetNode: "Goods-to-Person Systems", reason: "Both use automation to bring items to the worker rather than worker to items.", strength: 0.90 },
          { sourceNode: "Unit-Dose Packaging", targetNode: "Pre-Kitting", reason: "Both pre-prepare items in standard units to speed downstream assembly.", strength: 0.83 },
          { sourceNode: "STAT Priority", targetNode: "Rush Order Priority", reason: "Both have urgent orders that must bypass normal queue.", strength: 0.85 },
        ],
        explanation: "Hospital pharmacies solved the identical picking bottleneck by inverting the model: instead of humans walking to items, automated systems bring items to humans. This 'goods-to-person' revolution is directly transferable.",
        transferableSolutions: [
          "Implement goods-to-person automation: robotic shelves travel to stationary pickers (like automated pharmacy dispensers)",
          "Use batch picking with sorting: collect items for multiple orders in one trip, then sort at a central station",
          "Deploy pre-kitting for predictable orders: pre-assemble common item combinations during off-peak hours",
        ],
      },
      {
        id: "warehouse-to-cpu-pipeline",
        sourceDomain: "Computer Architecture",
        sourceSystem: "CPU Instruction Pipeline",
        analogyName: "CPU Pipeline → Order Pipeline",
        overallStrength: 0.79,
        mappings: [
          { sourceNode: "Instructions", targetNode: "Orders", reason: "Both are work units flowing through a multi-stage sequential pipeline.", strength: 0.85 },
          { sourceNode: "Pipeline Stall", targetNode: "Picking Bottleneck", reason: "Both cause the entire pipeline to wait for the slowest stage.", strength: 0.90 },
          { sourceNode: "Out-of-Order Execution", targetNode: "Parallel Picking", reason: "Both bypass sequential constraints by processing independent items in parallel.", strength: 0.82 },
          { sourceNode: "Branch Prediction", targetNode: "Order Forecasting", reason: "Both predict upcoming work to pre-position resources before they're needed.", strength: 0.70 },
          { sourceNode: "Cache Hierarchy", targetNode: "Proximity Storage", reason: "Both keep frequently-accessed items in fast-access locations.", strength: 0.78 },
        ],
        explanation: "A CPU pipeline and warehouse pipeline are structurally identical: sequential stages where one slow stage stalls everything. CPU designers solved this decades ago with parallelism, out-of-order execution, and caching.",
        transferableSolutions: [
          "Implement out-of-order processing: pick items for multiple orders simultaneously, assembling them at the end",
          "Use prediction: forecast tomorrow's orders tonight and pre-stage high-probability items near packing",
          "Deploy multi-level caching: fast-access forward pick positions for top 20% SKUs (like L1 cache for hot data)",
        ],
      },
    ],
    brokenBridgeReports: [
      {
        analogyId: "warehouse-to-bee-hive",
        directTransfers: [
          { element: "Radial storage layout", explanation: "Placing fast-moving items near output exactly mirrors how bees store honey near the brood. Directly reduces walking distance by 30-40%." },
          { element: "Dynamic task switching", explanation: "Workers shifting between roles based on demand directly applies. When pick queues grow, packers can pick; when packing backs up, pickers help pack." },
        ],
        adaptedTransfers: [
          { element: "Decentralized communication", adaptation: "Bees use physical dance. Warehouse can use real-time digital dashboards showing zone heat maps and queue depths visible to all workers.", risk: "Information overload if too many signals. Keep displays simple." },
        ],
        failures: [
          { breakPoint: "Silent failure tolerance", reason: "Bee colonies tolerate individual worker death silently — others adapt. In a warehouse, a worker injury, equipment breakdown, or mispick creates cascading problems that require active management.", innovation: "Build redundant 'worker nodes' with real-time status heartbeats. If a picker stops responding to tasks, immediately reassign their queue and alert supervisors. Add buddy systems for safety.", severity: "high" },
          { breakPoint: "Cost of individual agents", reason: "A single bee is nearly costless. A warehouse worker represents training investment, and a picking robot costs $50K-200K.", innovation: "Unlike bee colonies, warehouse systems need predictive maintenance, injury prevention, and careful ROI analysis for automation — not just disposable redundancy.", severity: "medium" },
          { breakPoint: "Uniform agent capability", reason: "All worker bees of the same age have roughly equal capability. Warehouse workers have vastly different speeds, accuracy, and physical capabilities.", innovation: "Create skill-aware task assignment: match complex picks to experienced workers and simple picks to newer workers, maximizing overall throughput while maintaining accuracy.", severity: "medium" },
        ],
        innovationOpportunities: [
          "Hybrid human-robot picking: robots handle simple, high-volume picks while humans handle complex, fragile, or irregular items",
          "Skill-aware dynamic task assignment optimizing for both speed and accuracy",
          "Real-time worker status heartbeats with automatic task redistribution on failure",
          "Predictive pre-staging: use order forecasting to move items to forward pick positions before shifts begin",
        ],
      },
    ],
    hybridSolution: {
      name: "FlowPick — Biomimetic Warehouse Optimization",
      description: "A hybrid solution combining bee hive spatial optimization, hospital pharmacy goods-to-person automation, and CPU pipeline parallelism to eliminate the picking bottleneck and triple warehouse throughput.",
      components: [
        { sourceDomain: "Biology (Bee Hive)", principle: "Radial storage and decentralized task allocation", contribution: "Reorganize storage so the top 20% of SKUs (80% of picks) are within 30 feet of packing. Workers self-assign tasks based on zone proximity." },
        { sourceDomain: "Healthcare (Hospital Pharmacy)", principle: "Goods-to-person automation for high-velocity items", contribution: "Automated mobile shelving units bring top-velocity items to stationary pick stations, eliminating walking for 50% of all picks." },
        { sourceDomain: "Computer Architecture (CPU Pipeline)", principle: "Out-of-order parallel execution with prediction", contribution: "Pick items for multiple orders simultaneously (batch picking), use overnight order forecasting to pre-stage items, and create multi-level 'cache' pick positions." },
      ],
      synthesis: "FlowPick attacks the bottleneck from three angles: PROXIMITY (bee-inspired radial layout cutting walking 40%), AUTOMATION (pharmacy-inspired goods-to-person for top SKUs), and PARALLELISM (CPU-inspired batch picking and predictive pre-staging). The combined effect transforms picking from a 3x bottleneck into a balanced pipeline stage.",
      risks: ["Automation capital cost ($500K-2M for robotic shelving)", "Storage reorganization requires temporary throughput reduction", "Worker retraining for new picking paradigm", "Technology integration complexity with existing WMS"],
      testingRecommendations: ["Pilot radial layout in one zone first (lowest cost, fastest impact)", "Measure walking distance before/after with pedometer data", "A/B test batch picking vs single-order picking for error rates", "Calculate ROI for goods-to-person automation using 6 months of order data"],
    },
    impactProblems: [
      { title: "Manufacturing Production Line Bottleneck", domain: "Manufacturing", description: "One slow machine limiting entire production line throughput (Theory of Constraints).", structuralSimilarity: 0.95, socialImpact: "high", scale: "Every factory globally", status: "partially-solved", transferFeasibility: 0.90 },
      { title: "Software Deployment Pipeline", domain: "DevOps", description: "Testing stage creating bottleneck in CI/CD pipeline, delaying all releases.", structuralSimilarity: 0.88, socialImpact: "medium", scale: "Every software company", status: "partially-solved", transferFeasibility: 0.85 },
      { title: "Hospital Lab Turnaround", domain: "Healthcare", description: "Lab test processing creating bottleneck delaying all diagnoses and treatments.", structuralSimilarity: 0.87, socialImpact: "high", scale: "Every hospital", status: "partially-solved", transferFeasibility: 0.75 },
      { title: "Port Container Processing", domain: "Logistics", description: "Container unloading bottleneck causing ship queuing and supply chain delays.", structuralSimilarity: 0.91, socialImpact: "critical", scale: "Global shipping", status: "partially-solved", transferFeasibility: 0.70 },
      { title: "Immigration Visa Processing", domain: "Government", description: "Background check stage creating bottleneck in visa approval pipeline.", structuralSimilarity: 0.84, socialImpact: "high", scale: "Millions of applicants", status: "partially-solved", transferFeasibility: 0.65 },
    ],
    matchedPattern: findPattern("bottleneck-cascade"),
  },

  /* ════════════════════════════════════════
     5. MISINFORMATION SPREAD
     ════════════════════════════════════════ */
  "fake-news": {
    problem: "How can we slow the spread of misinformation on social platforms without censoring legitimate speech?",
    structure: {
      summary:
        "False information propagates through a connected social network at viral speed. Spread rate depends on emotional engagement, network connectivity, and platform amplification. Containment must balance suppression of falsehood against protection of free expression.",
      elements: [
        { type: "entity", name: "Misinformation Content", description: "False or misleading claims packaged as shareable content" },
        { type: "entity", name: "Social Network Users", description: "Connected agents who consume, believe, and reshare content" },
        { type: "entity", name: "Platform Algorithm", description: "Amplification system that promotes engaging content" },
        { type: "constraint", name: "Free Expression", description: "Containment cannot suppress legitimate speech" },
        { type: "constraint", name: "Scale", description: "Billions of pieces of content shared daily" },
        { type: "constraint", name: "Detection Difficulty", description: "Distinguishing misinformation from opinion or satire is hard" },
        { type: "goal", name: "Reduce Viral Spread", description: "Slow propagation of verified misinformation" },
        { type: "goal", name: "Preserve Free Speech", description: "Avoid false positive censorship" },
        { type: "flow", name: "Viral Cascade", description: "Creation → Initial Share → Algorithmic Boost → Viral Spread → Belief Formation" },
        { type: "bottleneck", name: "Fact-Checking Speed", description: "Human fact-checkers cannot keep up with content volume" },
        { type: "feedback", name: "Engagement Loop", description: "Emotional content gets more engagement, which gets more algorithmic promotion" },
        { type: "feedback", name: "Belief Reinforcement", description: "Repeated exposure increases belief, increasing further sharing" },
        { type: "risk", name: "Censorship Overreach", description: "Aggressive suppression silences legitimate debate" },
        { type: "risk", name: "Streisand Effect", description: "Suppression draws more attention to the content" },
      ],
      abstractPattern: "Rapid Spread Through Connected Population with Containment-Freedom Tradeoff",
      keywords: ["spread", "viral", "misinformation", "network", "containment", "censorship", "amplification"],
    },
    analogies: [
      {
        id: "misinfo-to-epidemic",
        sourceDomain: "Epidemiology",
        sourceSystem: "Infectious Disease Epidemic Control",
        analogyName: "Virus Spread → Fake News Spread",
        overallStrength: 0.88,
        mappings: [
          { sourceNode: "Pathogen", targetNode: "Misinformation Content", reason: "Both are agents that spread through a population, 'infecting' susceptible individuals.", strength: 0.90 },
          { sourceNode: "Infected Individuals", targetNode: "Believers/Sharers", reason: "Both are agents who have been 'infected' and can transmit to others.", strength: 0.87 },
          { sourceNode: "R₀ (Reproduction Number)", targetNode: "Viral Coefficient", reason: "Both measure how many new cases each infected case generates.", strength: 0.92 },
          { sourceNode: "Vaccination", targetNode: "Media Literacy Education", reason: "Both create resistance in the population before exposure.", strength: 0.85 },
          { sourceNode: "Quarantine", targetNode: "Content Quarantine / Labels", reason: "Both isolate infectious agents to slow transmission.", strength: 0.80 },
          { sourceNode: "Contact Tracing", targetNode: "Share Chain Analysis", reason: "Both trace the path of spread to identify super-spreaders and intervention points.", strength: 0.83 },
        ],
        explanation: "Misinformation spreads through social networks with the same mathematical dynamics as an infectious disease: exponential growth, super-spreaders, herd immunity thresholds, and containment strategies.",
        transferableSolutions: [
          "Pre-emptive 'vaccination': inoculate populations with media literacy before they encounter misinformation (prebunking)",
          "Identify and reduce super-spreader nodes: accounts with massive reach sharing misinformation get friction (like isolating super-spreaders)",
          "Implement 'contact tracing': map share chains to find the origin point and intervene there rather than at every endpoint",
          "Reduce R₀ below 1: add enough friction (sharing delays, context labels) to make each share generate less than one reshare",
        ],
      },
      {
        id: "misinfo-to-immune-system",
        sourceDomain: "Biology",
        sourceSystem: "Adaptive Immune Response",
        analogyName: "Immune Memory → Fact-Checking Memory",
        overallStrength: 0.81,
        mappings: [
          { sourceNode: "Antigens", targetNode: "Misinformation Markers", reason: "Both are identifying features that the defense system learns to recognize.", strength: 0.82 },
          { sourceNode: "Antibodies", targetNode: "Fact-Check Labels", reason: "Both are targeted responses that neutralize specific threats.", strength: 0.79 },
          { sourceNode: "Memory B-Cells", targetNode: "Prebunking Knowledge", reason: "Both retain information about past threats for faster future response.", strength: 0.85 },
          { sourceNode: "Innate Immunity", targetNode: "Platform Content Policies", reason: "Both are first-line, non-specific defenses that catch obvious threats.", strength: 0.78 },
          { sourceNode: "Autoimmune Response", targetNode: "Over-Censorship", reason: "Both are pathological overreactions where the defense system attacks the host/legitimate content.", strength: 0.88 },
        ],
        explanation: "The immune system must distinguish self from non-self (legitimate from harmful) — the exact challenge of content moderation. It uses layered, adaptive defense without destroying the body.",
        transferableSolutions: [
          "Implement layered defense: fast generic filters (innate immunity) + slower specific fact-checking (adaptive immunity)",
          "Build threat memory: once misinformation is identified, automatically tag all copies and variants (like antibodies)",
          "Guard against autoimmune overreaction: calibrate systems to avoid false positive censorship of legitimate speech",
        ],
      },
      {
        id: "misinfo-to-forest-fire",
        sourceDomain: "Ecology",
        sourceSystem: "Forest Fire Management",
        analogyName: "Firebreak → Content Firewall",
        overallStrength: 0.76,
        mappings: [
          { sourceNode: "Fire", targetNode: "Viral Content", reason: "Both spread rapidly through connected fuel/network when conditions are right.", strength: 0.82 },
          { sourceNode: "Firebreaks", targetNode: "Sharing Friction", reason: "Both create structural gaps that slow or stop spread.", strength: 0.80 },
          { sourceNode: "Controlled Burns", targetNode: "Prebunking Campaigns", reason: "Both proactively reduce fuel load before the real fire/misinformation arrives.", strength: 0.77 },
          { sourceNode: "Dry Conditions", targetNode: "Emotional Climate", reason: "Both describe environmental conditions that make spread more likely.", strength: 0.72 },
        ],
        explanation: "Forest fire management uses structural barriers and proactive fuel reduction to contain fires — directly analogous to using friction and prebunking to contain viral misinformation.",
        transferableSolutions: [
          "Create digital firebreaks: add sharing delays and confirmation prompts that slow viral spread without blocking it",
          "Deploy controlled burns: proactively expose populations to weakened forms of misinformation with corrections (inoculation theory)",
          "Monitor 'dry conditions': increase vigilance during high-emotion periods (elections, crises) when misinformation spreads faster",
        ],
      },
    ],
    brokenBridgeReports: [
      {
        analogyId: "misinfo-to-epidemic",
        directTransfers: [
          { element: "R₀ reduction strategies", explanation: "Adding friction to reduce viral coefficient below 1 directly applies. Sharing delays, 'are you sure?' prompts, and context labels reduce resharing rate." },
          { element: "Prebunking as vaccination", explanation: "Teaching people to recognize manipulation techniques before exposure is a proven strategy (inoculation theory)." },
        ],
        adaptedTransfers: [
          { element: "Quarantine", adaptation: "Content quarantine (reduced algorithmic promotion, warning labels) is the adapted version. Unlike physical quarantine, it reduces reach without complete isolation.", risk: "Determined users can still find and share quarantined content. May create 'forbidden fruit' effect." },
        ],
        failures: [
          { breakPoint: "Pathogen clarity", reason: "Diseases have objective diagnostic criteria. Misinformation exists on a spectrum from clearly false to debatable to opinion. There's no 'test' that definitively identifies misinformation.", innovation: "Instead of binary true/false classification, implement a spectrum of responses: certainty scores, multiple-perspective labels, and source credibility ratings that inform rather than censor.", severity: "high" },
          { breakPoint: "Mutation speed", reason: "Biological pathogens mutate over generations. Misinformation mutates in minutes — claims are rephrased, screenshots are edited, context is changed.", innovation: "Use semantic matching, not string matching. Identify the core claim structure rather than exact text to catch mutations. Deploy AI that recognizes the 'meaning' of misinformation regardless of phrasing.", severity: "high" },
          { breakPoint: "Willing re-infection", reason: "People don't choose to catch diseases. Many people choose to believe and spread misinformation because it aligns with their identity.", innovation: "Address the demand side, not just supply: understand why people want to believe the misinformation. Address underlying fears, grievances, and identity needs that make people susceptible.", severity: "high" },
        ],
        innovationOpportunities: [
          "Spectrum-based content labels instead of binary true/false",
          "Semantic misinformation detection that catches claim mutations",
          "Demand-side intervention: addressing why people want to believe misinformation",
          "Community-based immune systems: empowered fact-checking communities within platforms",
        ],
      },
    ],
    hybridSolution: {
      name: "Calibrated Information Immunity",
      description: "A platform-level information defense system combining epidemic containment math, immune system layered defense, and forest fire structural barriers to slow misinformation without censoring legitimate speech.",
      components: [
        { sourceDomain: "Epidemiology", principle: "R₀ reduction and prebunking vaccination", contribution: "Add calibrated friction (sharing delays, confirmation prompts) to reduce viral coefficient below 1. Deploy prebunking campaigns during high-risk periods." },
        { sourceDomain: "Immunology", principle: "Layered adaptive defense with autoimmune safeguards", contribution: "Fast generic filters catch obvious violations; slower fact-checking provides specific responses. Continuous calibration prevents over-censorship (autoimmune response)." },
        { sourceDomain: "Ecology (Fire Management)", principle: "Structural firebreaks and fuel reduction", contribution: "Reduce algorithmic amplification of unverified claims during 'dry conditions' (elections, crises). Create structural sharing barriers that slow but don't block spread." },
      ],
      synthesis: "Calibrated Information Immunity treats misinformation as an endemic challenge, not a problem to 'solve.' It reduces spread to manageable levels through friction (epidemiology), builds population resilience through education (vaccination), uses layered detection that avoids over-censorship (immunology), and monitors environmental conditions to scale defenses appropriately (fire management).",
      risks: ["Definition of 'misinformation' is inherently political", "System could be weaponized for political censorship", "Friction measures may reduce overall platform engagement", "Sophisticated state actors may overwhelm defensive systems"],
      testingRecommendations: ["A/B test sharing friction features measuring both spread reduction and user satisfaction", "Measure false positive rate: how often does the system flag legitimate content?", "Evaluate prebunking campaigns with randomized controlled trials", "Monitor for weaponization: are the tools being used to suppress legitimate speech?"],
    },
    impactProblems: [
      { title: "Financial Market Manipulation", domain: "Finance", description: "False information spreading through trading networks causing stock price manipulation.", structuralSimilarity: 0.85, socialImpact: "high", scale: "Global financial markets", status: "partially-solved", transferFeasibility: 0.75 },
      { title: "Public Health Misinformation", domain: "Healthcare", description: "Anti-vaccine and alternative medicine misinformation undermining public health efforts.", structuralSimilarity: 0.92, socialImpact: "critical", scale: "Global population", status: "partially-solved", transferFeasibility: 0.70 },
      { title: "Election Interference", domain: "Governance", description: "Coordinated disinformation campaigns targeting democratic elections.", structuralSimilarity: 0.90, socialImpact: "critical", scale: "Democratic nations globally", status: "unsolved", transferFeasibility: 0.55 },
      { title: "Scientific Disinformation", domain: "Science", description: "Climate denial, evolution denial, and other anti-science movements spreading through social networks.", structuralSimilarity: 0.88, socialImpact: "critical", scale: "Global public understanding", status: "unsolved", transferFeasibility: 0.50 },
      { title: "Malware Distribution Channels", domain: "Cybersecurity", description: "Malware spreading through phishing and social engineering using the same viral mechanisms.", structuralSimilarity: 0.82, socialImpact: "high", scale: "All internet users", status: "partially-solved", transferFeasibility: 0.80 },
    ],
    matchedPattern: findPattern("rapid-spread-connected-population"),
  },

  /* ════════════════════════════════════════
     6. DEMOCRATIC POLARIZATION
     ════════════════════════════════════════ */
  "democracy-polarization": {
    problem: "How do we redesign democratic institutions to reduce polarization? Current two-party systems create binary divisions that amplify conflict.",
    structure: {
      summary:
        "A governance system where diverse population preferences are compressed into binary choices, creating reinforcing feedback loops of identity-based division, algorithmic amplification, and institutional incentives that reward extremism over compromise.",
      elements: [
        { type: "entity", name: "Citizens", description: "Population with diverse, multi-dimensional preferences" },
        { type: "entity", name: "Political Parties", description: "Binary coalitions that compress diverse views into two camps" },
        { type: "entity", name: "Media Ecosystem", description: "Information channels that amplify conflict for engagement" },
        { type: "entity", name: "Electoral System", description: "Winner-take-all mechanics that discourage moderation" },
        { type: "constraint", name: "Binary Choice", description: "Two-party systems force complex preferences into yes/no" },
        { type: "constraint", name: "Winner-Take-All", description: "First-past-the-post rewards extremism, not consensus" },
        { type: "goal", name: "Reduce Polarization", description: "Create governance that rewards compromise and cooperation" },
        { type: "goal", name: "Preserve Representation", description: "Maintain democratic accountability and voice" },
        { type: "flow", name: "Polarization Spiral", description: "Division → Media Amplification → Identity Hardening → More Division" },
        { type: "bottleneck", name: "Binary Electoral Choice", description: "All nuance collapses into two options at the ballot box" },
        { type: "feedback", name: "Outrage Engine", description: "Media profits from division, incentivizing more extreme content" },
        { type: "feedback", name: "Primary Incentive", description: "Party primaries reward extremism, not moderation" },
        { type: "risk", name: "Democratic Collapse", description: "Extreme polarization undermines the legitimacy of democratic outcomes" },
        { type: "risk", name: "Governance Paralysis", description: "Polarization prevents any policy compromise or action" },
      ],
      abstractPattern: "Binary Compression of Multidimensional Signal Causing Amplifying Division via Positive Feedback",
      keywords: ["polarization", "democracy", "binary", "division", "feedback", "governance", "compromise"],
    },
    analogies: [
      {
        id: "democracy-to-immune",
        sourceDomain: "Immunology",
        sourceSystem: "Immune System Self/Non-Self Calibration",
        analogyName: "Immune Tolerance → Political Tolerance",
        overallStrength: 0.78,
        mappings: [
          { sourceNode: "Self/Non-Self Distinction", targetNode: "Us/Them Political Division", reason: "Both systems must distinguish between 'own' and 'other' without overreacting to harmless differences.", strength: 0.82 },
          { sourceNode: "Regulatory T-Cells", targetNode: "Moderating Institutions", reason: "Both actively suppress overreaction and maintain tolerance of diversity.", strength: 0.80 },
          { sourceNode: "Autoimmune Disease", targetNode: "Political Polarization", reason: "Both represent pathological overreaction where the system attacks parts of itself.", strength: 0.85 },
          { sourceNode: "Diversity Thresholds", targetNode: "Pluralism Requirements", reason: "Both require a minimum level of diversity to function properly.", strength: 0.75 },
          { sourceNode: "Calibrated Response", targetNode: "Proportional Governance", reason: "Both require responses proportional to actual threat level, not maximum escalation.", strength: 0.73 },
        ],
        explanation: "Political polarization is structurally identical to autoimmune disease: the system overreacts to internal diversity, treating fellow citizens as threats. Immune tolerance mechanisms directly inform democratic design.",
        transferableSolutions: [
          "Strengthen 'regulatory T-cell' institutions: independent commissions, cross-party committees, and deliberative bodies that enforce cooperation",
          "Implement 'diversity thresholds': electoral systems that require multi-party coalitions (like immune diversity preventing single-clone dominance)",
          "Calibrate the response: require supermajorities for divisive policies, simple majorities for consensus policies (proportional response)",
        ],
      },
      {
        id: "democracy-to-ecosystem",
        sourceDomain: "Ecology",
        sourceSystem: "Diverse Ecosystem Stability",
        analogyName: "Ecosystem Balance → Political Balance",
        overallStrength: 0.82,
        mappings: [
          { sourceNode: "Species Diversity", targetNode: "Political Party Diversity", reason: "Both systems become more stable and resilient with greater diversity of actors.", strength: 0.86 },
          { sourceNode: "Competitive Niches", targetNode: "Policy Specialization", reason: "Both involve multiple actors specializing in different roles rather than competing head-to-head.", strength: 0.80 },
          { sourceNode: "Monoculture Collapse", targetNode: "Two-Party Failure", reason: "Both represent the fragility of systems dominated by too few actors.", strength: 0.88 },
          { sourceNode: "Keystone Species", targetNode: "Swing Voters / Moderates", reason: "Both are actors whose behavior disproportionately determines system stability.", strength: 0.75 },
          { sourceNode: "Ecological Succession", targetNode: "Political Evolution", reason: "Both undergo gradual shifts in composition and structure over time.", strength: 0.70 },
        ],
        explanation: "Ecologists have long known that monocultures collapse and diverse ecosystems thrive. Two-party political systems are monocultures — fragile, oscillating, and unable to represent the diversity of the population.",
        transferableSolutions: [
          "Implement proportional representation: allow multiple parties to hold seats proportional to their vote share (ecological diversity)",
          "Create political 'niches': issue-specific parties that collaborate on overlapping interests rather than total-package platforms",
          "Protect 'keystone' moderates: electoral systems that reward center-building rather than base-mobilization",
        ],
      },
      {
        id: "democracy-to-neural",
        sourceDomain: "Neuroscience",
        sourceSystem: "Neural Conflict Resolution in the Brain",
        analogyName: "Brain Conflict → Political Conflict",
        overallStrength: 0.75,
        mappings: [
          { sourceNode: "Conflicting Neural Signals", targetNode: "Conflicting Political Views", reason: "Both represent competing inputs that must be resolved into coherent action.", strength: 0.78 },
          { sourceNode: "Higher-Order Abstraction", targetNode: "Constitutional Principles", reason: "Both resolve conflicts by appealing to a higher-level framework that incorporates both sides.", strength: 0.80 },
          { sourceNode: "Lateral Inhibition", targetNode: "Debate and Deliberation", reason: "Both are processes where competing inputs mutually refine each other.", strength: 0.72 },
          { sourceNode: "Integration Centers", targetNode: "Deliberative Assemblies", reason: "Both are specialized structures that synthesize diverse inputs into unified decisions.", strength: 0.76 },
        ],
        explanation: "The brain resolves conflicting signals not by suppressing one side but by creating higher-order abstractions that incorporate both. Political systems can do the same through deliberative processes.",
        transferableSolutions: [
          "Create deliberative assemblies: randomly selected citizens' assemblies that discuss issues without party affiliation (like neural integration centers)",
          "Implement ranked-choice voting: allows voters to express nuanced preferences rather than binary choices (like graded neural signals)",
          "Design 'higher-order abstraction' mechanisms: constitutional conventions that find shared principles above partisan positions",
        ],
      },
    ],
    brokenBridgeReports: [
      {
        analogyId: "democracy-to-immune",
        directTransfers: [
          { element: "Autoimmune diagnosis", explanation: "Recognizing that polarization IS an autoimmune condition — the body politic attacking itself — reframes the problem from 'the other side is wrong' to 'our system is malfunctioning.'" },
          { element: "Regulatory mechanisms", explanation: "Independent institutions that actively enforce cooperation (like regulatory T-cells suppressing overreaction) directly transfer to cross-party requirement mechanisms." },
        ],
        adaptedTransfers: [
          { element: "Diversity thresholds", adaptation: "Immune systems need diversity of T-cell receptors. Electoral systems can require multi-party coalitions through proportional representation. The exact threshold needs calibration to each country's context.", risk: "Too many parties can lead to ungovernable fragmentation (Italy, Israel). The threshold must be carefully set." },
        ],
        failures: [
          { breakPoint: "Conscious identity", reason: "Immune cells don't identify with their targets. Political actors form deep identity attachments to their 'side.' Polarization is not just a system error — it's an identity commitment.", innovation: "Address identity directly: create cross-cutting identities through mandatory national service, mixed deliberative assemblies, and institutions that create shared experience across political lines.", severity: "high" },
          { breakPoint: "External manipulation", reason: "Immune systems evolved against natural threats. Political systems face deliberate manipulation by foreign actors, domestic demagogues, and profit-driven media.", innovation: "Build 'immune system awareness': teach populations about manipulation techniques (prebunking) and create institutional antibodies against known disinformation tactics.", severity: "high" },
          { breakPoint: "Speed of adaptation", reason: "Immune systems adapt over days to weeks. Political institutions change over decades. The threat evolves faster than the defense.", innovation: "Create adaptive governance mechanisms: sunset clauses, automatic review triggers, and rapid-response democratic innovations that allow faster institutional evolution.", severity: "medium" },
        ],
        innovationOpportunities: [
          "Cross-cutting identity creation through shared national experiences",
          "Adaptive governance with built-in institutional evolution mechanisms",
          "Calibrated Pluralist Architecture: a new governance framework synthesized from all three analogies",
          "Anti-manipulation immune education as a core civic responsibility",
        ],
      },
    ],
    hybridSolution: {
      name: "Calibrated Pluralist Architecture",
      description: "A fundamental redesign of democratic institutions synthesizing immune system tolerance, ecosystem diversity, and neural integration to create governance that rewards cooperation, embraces pluralism, and resolves conflict through synthesis rather than suppression.",
      components: [
        { sourceDomain: "Immunology", principle: "Calibrated self/non-self distinction with active tolerance enforcement", contribution: "Strengthen moderating institutions (regulatory T-cells). Require supermajorities for divisive policies. Implement autoimmune safeguards: institutional checks that trigger when polarization metrics exceed thresholds." },
        { sourceDomain: "Ecology", principle: "Diversity-driven stability through competitive niches", contribution: "Proportional representation creating 4-7 party ecosystems. Issue-specific coalitions replacing total-package partisanship. Protection of political 'keystone species' (moderates and bridge-builders)." },
        { sourceDomain: "Neuroscience", principle: "Higher-order abstraction resolving conflicting signals", contribution: "Citizens' assemblies that create higher-order consensus. Ranked-choice voting that captures nuanced preferences. Deliberative processes that synthesize opposing views into new solutions rather than choosing between them." },
      ],
      synthesis: "The Calibrated Pluralist Architecture operates on three principles: DIVERSIFY (ecological multi-party systems replacing monoculture binary), MODERATE (immune-inspired institutions that actively enforce tolerance), and INTEGRATE (neural-inspired deliberative processes that create synthesis from conflict). This concept does not exist in any textbook — the system invented it from three biological principles.",
      risks: ["Radical institutional change faces enormous political resistance", "Multi-party systems require coalition governance, which can be slow", "Deliberative assemblies are expensive and time-consuming", "Bad-faith actors may exploit moderation requirements to obstruct"],
      testingRecommendations: ["Pilot citizens' assemblies at municipal level first", "Study existing multi-party democracies (Nordic countries) for calibration data", "Test ranked-choice voting in local elections before national adoption", "Monitor polarization metrics in pilot jurisdictions vs controls"],
    },
    impactProblems: [
      { title: "Corporate Board Groupthink", domain: "Business", description: "Homogeneous boards making poor decisions due to lack of cognitive diversity.", structuralSimilarity: 0.78, socialImpact: "high", scale: "Every major corporation", status: "partially-solved", transferFeasibility: 0.82 },
      { title: "Scientific Paradigm Lock-in", domain: "Science", description: "Academic fields becoming polarized around competing paradigms, resisting synthesis.", structuralSimilarity: 0.75, socialImpact: "medium", scale: "Academic institutions globally", status: "unsolved", transferFeasibility: 0.60 },
      { title: "Religious Sectarian Conflict", domain: "Society", description: "Binary religious divisions creating cycles of conflict within and between faiths.", structuralSimilarity: 0.80, socialImpact: "critical", scale: "Billions affected globally", status: "unsolved", transferFeasibility: 0.35 },
      { title: "Social Media Echo Chambers", domain: "Technology", description: "Algorithmic curation creating information bubbles that reinforce existing beliefs.", structuralSimilarity: 0.88, socialImpact: "high", scale: "Billions of social media users", status: "partially-solved", transferFeasibility: 0.70 },
      { title: "International Diplomatic Deadlock", domain: "Geopolitics", description: "Bilateral opposition preventing multilateral cooperation on global challenges.", structuralSimilarity: 0.82, socialImpact: "critical", scale: "Global governance", status: "unsolved", transferFeasibility: 0.40 },
    ],
    matchedPattern: findPattern("feedback-loop-instability"),
  },
};
