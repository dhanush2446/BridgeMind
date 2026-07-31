"use client";

import React, { useState } from "react";
import styles from "./simulate.module.css";

const SIMULATION_SCENARIOS = [
  {
    id: "er-ant-colony",
    title: "ER Patients ↔ Ant Colony Foraging",
    sourceDomain: "Biology / Myrmecology",
    targetDomain: "Healthcare / Hospital Operations",
    stages: [
      {
        step: 1,
        title: "Structural Extraction",
        description: "Extracting flow conservation, arrival rate variance, and bottleneck capacity limits.",
        metrics: { nodesMapped: "8/8", topologyMatch: "94%" },
      },
      {
        step: 2,
        title: "Isomorphism Alignment",
        description: "Aligning ant pheromone trail reinforcement with dynamic triage priority queues.",
        metrics: { variableAlignment: "91%", structuralLoss: "4%" },
      },
      {
        step: 3,
        title: "Solution Mechanism Transfer",
        description: "Transferring negative feedback damping to limit patient queue accumulation during surge hours.",
        metrics: { transferEfficiency: "88%", expectedDelayReduction: "34%" },
      },
      {
        step: 4,
        title: "Boundary Stress Testing",
        description: "Simulating sudden 150% arrival spike and extreme staff shortage.",
        metrics: { breakdownPoint: "185% load", resilienceScore: "82%" },
      },
    ],
  },
  {
    id: "traffic-packet-routing",
    title: "Urban Traffic ↔ Packet Routing Protocol",
    sourceDomain: "Computer Science / Networking",
    targetDomain: "Civil Engineering / Transportation",
    stages: [
      {
        step: 1,
        title: "Structural Extraction",
        description: "Extracting graph capacity bounds, queuing delay functions, and backpressure propagation.",
        metrics: { nodesMapped: "12/12", topologyMatch: "96%" },
      },
      {
        step: 2,
        title: "Isomorphism Alignment",
        description: "Mapping TCP window backpressure to adaptive traffic signal green-light duration.",
        metrics: { variableAlignment: "95%", structuralLoss: "2%" },
      },
      {
        step: 3,
        title: "Solution Mechanism Transfer",
        description: "Applying fair-queuing queue management to prevent gridlock at key city intersections.",
        metrics: { transferEfficiency: "92%", expectedDelayReduction: "41%" },
      },
      {
        step: 4,
        title: "Boundary Stress Testing",
        description: "Simulating rainy weather slowdown and simultaneous multi-lane closure.",
        metrics: { breakdownPoint: "160% capacity", resilienceScore: "78%" },
      },
    ],
  },
];

export default function SimulatePage() {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);

  // Parameter sliders for real-time stress test simulation
  const [loadDemand, setLoadDemand] = useState(100); // 50% to 200%
  const [friction, setFriction] = useState(30);     // 0 to 100
  const [damping, setDamping] = useState(0.8);      // 0.1 to 1.0

  const scenario = SIMULATION_SCENARIOS[selectedScenarioIndex];
  const stage = scenario.stages[currentStep - 1];

  // Real-time calculated stability metric
  const calculatedResilience = Math.max(
    10,
    Math.round(100 - (loadDemand - 100) * 0.4 - friction * 0.3 + damping * 25)
  );

  const getResilienceColor = () => {
    if (calculatedResilience >= 75) return "var(--accent-green)";
    if (calculatedResilience >= 50) return "var(--accent-cyan)";
    if (calculatedResilience >= 35) return "var(--accent-amber)";
    return "var(--accent-red)";
  };

  return (
    <main className={styles.main}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <span className={styles.pageTitleIcon}>⚙️</span>
            Step-by-Step Mechanism Transfer Simulator
          </h1>
          <p className={styles.pageSubtitle}>
            Simulate how mechanisms transfer from source domains to target domains under real-world stress conditions.
          </p>
        </div>

        <div className={styles.scenarioSelect}>
          {SIMULATION_SCENARIOS.map((sc, i) => (
            <button
              key={sc.id}
              className={`${styles.scenarioTab} ${selectedScenarioIndex === i ? styles.scenarioTabActive : ""}`}
              onClick={() => {
                setSelectedScenarioIndex(i);
                setCurrentStep(1);
              }}
            >
              {sc.title}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.container}>
        {/* Stepper Bar */}
        <div className={styles.stepperBar}>
          {scenario.stages.map((st) => (
            <button
              key={st.step}
              className={`${styles.stepTile} ${currentStep === st.step ? styles.stepTileActive : ""}`}
              onClick={() => {
                setCurrentStep(st.step);
              }}
            >
              <span className={styles.stepNum}>0{st.step}</span>
              <span className={styles.stepTitleLabel}>{st.title}</span>
            </button>
          ))}
        </div>

        <div className={styles.contentGrid}>
          {/* Main Stage Card */}
          <div className={styles.stageCard}>
            <div className={styles.stageCardHeader}>
              <span className={styles.stageStepBadge}>Stage {stage.step} of 4</span>
              <div className={styles.domainPair}>
                <span className="tag tag-cyan">{scenario.sourceDomain}</span>
                <span>→</span>
                <span className="tag tag-blue">{scenario.targetDomain}</span>
              </div>
            </div>

            <h2 className={styles.stageTitle}>{stage.title}</h2>
            <p className={styles.stageDesc}>{stage.description}</p>

            <div className={styles.metricsGrid}>
              {Object.entries(stage.metrics).map(([key, val]) => (
                <div key={key} className={styles.metricItem}>
                  <span className={styles.metricValue}>{val}</span>
                  <span className={styles.metricKey}>{key.replace(/([A-Z])/g, " $1").toLowerCase()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Stress Parameters */}
          <div className={styles.stressPanel}>
            <h3 className={styles.stressTitle}>Boundary Stress Test Parameters</h3>
            <p className={styles.stressSubtitle}>
              Adjust real-world stress factors to observe boundary failure thresholds in real-time.
            </p>

            <div className={styles.sliderControl}>
              <div className={styles.sliderHeader}>
                <label>Demand Load / Arrival Surge</label>
                <span>{loadDemand}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="200"
                value={loadDemand}
                onChange={(e) => setLoadDemand(Number(e.target.value))}
                className={styles.slider}
              />
            </div>

            <div className={styles.sliderControl}>
              <div className={styles.sliderHeader}>
                <label>Domain Friction / Delay Noise</label>
                <span>{friction}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={friction}
                onChange={(e) => setFriction(Number(e.target.value))}
                className={styles.slider}
              />
            </div>

            <div className={styles.sliderControl}>
              <div className={styles.sliderHeader}>
                <label>Feedback Damping Ratio</label>
                <span>{damping.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={damping}
                onChange={(e) => setDamping(Number(e.target.value))}
                className={styles.slider}
              />
            </div>

            <div className={styles.resilienceGauge}>
              <span className={styles.gaugeLabel}>Simulated Mechanism Resilience</span>
              <span className={styles.gaugeVal} style={{ color: getResilienceColor() }}>
                {calculatedResilience}%
              </span>
              <div className={styles.gaugeBar}>
                <div
                  className={styles.gaugeFill}
                  style={{ width: `${calculatedResilience}%`, background: getResilienceColor() }}
                />
              </div>
              <span className={styles.gaugeStatus}>
                {calculatedResilience >= 75
                  ? "✓ Transfer highly stable under load"
                  : calculatedResilience >= 45
                  ? "⚠ Partial adaptation required at boundary"
                  : "✗ Analogy collapse: Broken Bridge detected"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
