"use client";

import React, { useState, useRef } from "react";
import type { AnalogySuggestion } from "@/lib/analogy-engine";
import styles from "./solution-visualizer.module.css";

interface SolutionVisualizerProps {
  analogy: AnalogySuggestion;
}

export default function SolutionVisualizer({ analogy }: SolutionVisualizerProps) {
  const [viewMode, setViewMode] = useState<"technical" | "kidFriendly">("kidFriendly");
  const [activeNodeId, setActiveNodeId] = useState<string | null>("node-2");
  const [isExporting, setIsExporting] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  const domain = analogy.sourceDomain || "Cross-Domain Science";
  const kid = analogy.kidFriendlyExplanation;
  const diagram = analogy.visualDiagramData;

  const handleExportCard = () => {
    setIsExporting(true);
    setTimeout(() => {
      alert("🎨 Visual Solution Infographic Generated! You can view the visual representation below.");
      setIsExporting(false);
    }, 600);
  };

  return (
    <div className={styles.visualizerContainer}>
      {/* ── Top Header & Mode Toggle ── */}
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <span className={styles.titleBadge}>
            {viewMode === "kidFriendly" ? "🎈 ELI5 Mode" : "🔬 Technical View"}
          </span>
          <h3 className={styles.mainTitle}>
            {viewMode === "kidFriendly"
              ? kid?.headline || `Explaining ${domain} Solution to a Child`
              : `Operational Solution Transfer from ${domain}`}
          </h3>
        </div>

        <div className={styles.modeToggleGroup}>
          <button
            className={`${styles.toggleBtn} ${viewMode === "kidFriendly" ? styles.toggleActiveKid : ""}`}
            onClick={() => setViewMode("kidFriendly")}
          >
            🎈 Kid-Friendly (ELI5)
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === "technical" ? styles.toggleActiveTech : ""}`}
            onClick={() => setViewMode("technical")}
          >
            🔬 Technical Mode
          </button>
        </div>
      </div>

      {/* ── Content View ── */}
      {viewMode === "kidFriendly" && kid ? (
        <div className={styles.kidContainer}>
          {/* Playground Story Box */}
          <div className={styles.storyCard}>
            <div className={styles.storyHeader}>
              <span className={styles.storyIcon}>🎡</span>
              <span className={styles.storyTitle}>Playground Metaphor & Story</span>
            </div>
            <p className={styles.storyText}>{kid.storyMetaphor}</p>
          </div>

          {/* 3 Kid-Friendly Steps */}
          <div className={styles.stepsGrid}>
            {kid.steps.map((step) => (
              <div key={step.stepNumber} className={styles.stepCard}>
                <div className={styles.stepBadgeRow}>
                  <span className={styles.stepIcon}>{step.icon}</span>
                  <span className={styles.stepNumberTag}>Step {step.stepNumber}</span>
                </div>
                <h4 className={styles.stepTitle}>{step.title}</h4>
                <div className={styles.simpleActionBox}>
                  <span className={styles.actionLabel}>What to do:</span>
                  <p>{step.simpleAction}</p>
                </div>
                <div className={styles.playgroundBox}>
                  <span className={styles.playgroundLabel}>Child Explanation:</span>
                  <p>{step.playgroundAnalogy}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Key Takeaway Banner */}
          <div className={styles.takeawayBanner}>
            <span className={styles.takeawayIcon}>🌟</span>
            <div>
              <strong>Super Simple Takeaway:</strong>
              <p>{kid.keyTakeaway}</p>
            </div>
          </div>
        </div>
      ) : (
        /* Technical View */
        <div className={styles.techContainer}>
          <div className={styles.techBox}>
            <h4 className={styles.techBoxTitle}>⚡ Technical Execution Steps</h4>
            <div className={styles.techText}>
              {analogy.detailedTransferSolution || analogy.explanation}
            </div>
          </div>
        </div>
      )}

      {/* ── Visual Solution Flowchart / SVG Diagram ── */}
      <div className={styles.diagramSection} ref={diagramRef}>
        <div className={styles.diagramHeaderRow}>
          <div>
            <h4 className={styles.diagramTitle}>
              <span className={styles.diagramDot} />
              Interactive Solution Flow Diagram
            </h4>
            <p className={styles.diagramSubtitle}>
              {diagram?.flowDescription || "Visual representation of signal flow, buffer management, and controller feedback."}
            </p>
          </div>
          <button className={styles.exportCardBtn} onClick={handleExportCard} disabled={isExporting}>
            {isExporting ? "🎨 Rendering Image..." : "🖼️ Export Visual Solution Card"}
          </button>
        </div>

        {/* SVG Flowchart Diagram */}
        <div className={styles.flowchartCanvas}>
          <svg className={styles.flowSvg} viewBox="0 0 800 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="flowGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="flowGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="flowGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Connection Paths */}
            <path d="M 170 70 L 250 70" stroke="url(#flowGrad1)" strokeWidth="3" strokeDasharray="6 3" />
            <path d="M 370 70 L 450 70" stroke="url(#flowGrad2)" strokeWidth="3" strokeDasharray="6 3" />
            <path d="M 570 70 L 650 70" stroke="url(#flowGrad3)" strokeWidth="3" strokeDasharray="6 3" />

            {/* Animated Flow Particles */}
            <circle cx="210" cy="70" r="4" fill="#00e5ff" filter="url(#glow)">
              <animate attributeName="cx" values="170;250;170" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="410" cy="70" r="4" fill="#a855f7" filter="url(#glow)">
              <animate attributeName="cx" values="370;450;370" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="610" cy="70" r="4" fill="#10b981" filter="url(#glow)">
              <animate attributeName="cx" values="570;650;570" dur="2.5s" repeatCount="indefinite" />
            </circle>
          </svg>

          {/* Render Interactive Diagram Nodes */}
          <div className={styles.nodesGrid}>
            {(diagram?.nodes || []).map((node, index) => {
              const isActive = activeNodeId === node.id;
              return (
                <div
                  key={node.id}
                  className={`${styles.nodeCard} ${isActive ? styles.nodeCardActive : ""}`}
                  style={{ borderColor: node.color }}
                  onClick={() => setActiveNodeId(node.id)}
                >
                  <div className={styles.nodeHeader}>
                    <span className={styles.nodeIcon}>{node.icon}</span>
                    <span className={styles.nodeStepTag}>Step 0{index + 1}</span>
                  </div>
                  <h5 className={styles.nodeLabel}>{node.label}</h5>
                  <p className={styles.nodeSublabel}>{node.sublabel}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Node Details Box */}
        {activeNodeId && (
          <div className={styles.nodeDetailBox}>
            <span className={styles.nodeDetailBadge}>Interactive Node Highlight</span>
            {activeNodeId === "node-1" && (
              <p>🌊 <strong>Input Demand Stream:</strong> Variable incoming signal or load spikes entering the system under dynamic conditions.</p>
            )}
            {activeNodeId === "node-2" && (
              <p>🛡️ <strong>Reserve Buffer Zone:</strong> Capital / resource buffer mandate directly adapted from {domain} controls to absorb sudden volume peaks.</p>
            )}
            {activeNodeId === "node-3" && (
              <p>🎛️ <strong>Feedback Damping Controller:</strong> Rate-limiting governor that adjusts flow parameters dynamically to prevent system overload.</p>
            )}
            {activeNodeId === "node-4" && (
              <p>🎯 <strong>Robust Experience Goal:</strong> Smooth, uninterrupted performance and end-user goal fulfillment even under maximum stress load.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
