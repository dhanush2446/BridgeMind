"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./studio.module.css";

interface DiagramNode {
  id: string;
  type: "entity" | "bottleneck" | "flow" | "loop" | "goal";
  label: string;
  x: number;
  y: number;
}

interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
}

const PRESETS = [
  {
    name: "Emergency Room Congestion",
    nodes: [
      { id: "1", type: "entity" as const, label: "Patients Arrival", x: 120, y: 150 },
      { id: "2", type: "bottleneck" as const, label: "Triage Capacity", x: 300, y: 150 },
      { id: "3", type: "flow" as const, label: "Bed Allocation", x: 480, y: 150 },
      { id: "4", type: "loop" as const, label: "Re-admission Loop", x: 480, y: 280 },
      { id: "5", type: "goal" as const, label: "Patient Discharge", x: 660, y: 150 },
    ],
    edges: [
      { from: "1", to: "2", label: "Unpredictable Rate" },
      { from: "2", to: "3", label: "Delay Spike" },
      { from: "3", to: "5", label: "Recovery" },
      { from: "5", to: "4", label: "Complications" },
      { from: "4", to: "2", label: "Feedback Surge" },
    ],
  },
  {
    name: "Urban Highway Bottleneck",
    nodes: [
      { id: "1", type: "entity" as const, label: "Commuter Vehicles", x: 120, y: 180 },
      { id: "2", type: "bottleneck" as const, label: "Lane Merger", x: 320, y: 180 },
      { id: "3", type: "loop" as const, label: "Phantom Traffic Wave", x: 320, y: 300 },
      { id: "4", type: "goal" as const, label: "City Center Throughput", x: 550, y: 180 },
    ],
    edges: [
      { from: "1", to: "2", label: "Peak Inflow" },
      { from: "2", to: "4", label: "Restricted Capacity" },
      { from: "2", to: "3", label: "Braking Cascade" },
      { from: "3", to: "2", label: "Amplified Shockwave" },
    ],
  },
];

export default function StudioPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [nodes, setNodes] = useState<DiagramNode[]>(PRESETS[0].nodes);
  const [edges, setEdges] = useState<DiagramEdge[]>(PRESETS[0].edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectFromId, setConnectFromId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<DiagramNode["type"]>("entity");
  const [nodeLabel, setNodeLabel] = useState("");
  const dragRef = useRef<{ id: string | null; offsetX: number; offsetY: number }>({ id: null, offsetX: 0, offsetY: 0 });

  const nodeTypeColors: Record<DiagramNode["type"], string> = {
    entity: "#00e5ff",
    bottleneck: "#f87171",
    flow: "#4d7cff",
    loop: "#f59e0b",
    goal: "#10b981",
  };

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth * 2;
      canvas.height = parent.clientHeight * 2;
      canvas.style.width = parent.clientWidth + "px";
      canvas.style.height = parent.clientHeight + "px";
    }

    ctx.save();
    ctx.scale(2, 2);
    const w = canvas.width / 2;
    const h = canvas.height / 2;
    ctx.clearRect(0, 0, w, h);

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw edges
    edges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from);
      const toNode = nodes.find((n) => n.id === edge.to);
      if (!fromNode || !toNode) return;

      const isConnectTarget = connectFromId === edge.from;

      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2;
      ctx.lineTo(toNode.x, toNode.y);
      ctx.strokeStyle = isConnectTarget ? "rgba(0, 229, 255, 0.8)" : "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = isConnectTarget ? 2.5 : 1.5;
      ctx.stroke();

      // Arrow head
      const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
      const headLen = 10;
      const arrowX = toNode.x - 22 * Math.cos(angle);
      const arrowY = toNode.y - 22 * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX - headLen * Math.cos(angle - Math.PI / 6), arrowY - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(arrowX - headLen * Math.cos(angle + Math.PI / 6), arrowY - headLen * Math.sin(angle + Math.PI / 6));
      ctx.fillStyle = isConnectTarget ? "rgba(0, 229, 255, 0.9)" : "rgba(255, 255, 255, 0.5)";
      ctx.fill();

      // Edge label
      if (edge.label) {
        ctx.font = "500 10px Inter";
        ctx.fillStyle = "rgba(154, 160, 184, 0.8)";
        ctx.textAlign = "center";
        ctx.fillText(edge.label, midX, midY - 6);
      }
    });

    // Draw nodes
    nodes.forEach((node) => {
      const isSelected = selectedNodeId === node.id;
      const isConnecting = connectFromId === node.id;
      const color = nodeTypeColors[node.type];

      // Node shadow / glow
      if (isSelected || isConnecting) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 28, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.2;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Outer ring
      ctx.beginPath();
      ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = "#0c0f1e";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Node label
      ctx.font = isSelected ? "600 12px Outfit" : "500 11px Inter";
      ctx.fillStyle = isSelected ? "#ffffff" : "rgba(232, 234, 246, 0.85)";
      ctx.textAlign = "center";
      ctx.fillText(node.label, node.x, node.y + 36);
    });

    ctx.restore();
  }, [nodes, edges, selectedNodeId, connectFromId]);

  // Handle canvas mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = nodes.find((n) => Math.sqrt((x - n.x) ** 2 + (y - n.y) ** 2) < 22);

    if (clickedNode) {
      if (connectFromId && connectFromId !== clickedNode.id) {
        // Create edge
        setEdges((prev) => [...prev, { from: connectFromId, to: clickedNode.id }]);
        setConnectFromId(null);
      } else {
        setSelectedNodeId(clickedNode.id);
        setNodeLabel(clickedNode.label);
        dragRef.current = { id: clickedNode.id, offsetX: x - clickedNode.x, offsetY: y - clickedNode.y };
      }
    } else {
      setSelectedNodeId(null);
      setConnectFromId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.id) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNodes((prev) =>
      prev.map((n) =>
        n.id === dragRef.current.id
          ? { ...n, x: x - dragRef.current.offsetX, y: y - dragRef.current.offsetY }
          : n
      )
    );
  };

  const handleMouseUp = () => {
    dragRef.current = { id: null, offsetX: 0, offsetY: 0 };
  };

  // Add node
  const handleAddNode = () => {
    const newNode: DiagramNode = {
      id: String(Date.now()),
      type: selectedType,
      label: nodeLabel.trim() || `New ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`,
      x: 300 + (Math.random() - 0.5) * 100,
      y: 200 + (Math.random() - 0.5) * 100,
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    setNodeLabel("");
  };

  // Delete node
  const handleDeleteNode = () => {
    if (!selectedNodeId) return;
    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
    setEdges((prev) => prev.filter((e) => e.from !== selectedNodeId && e.to !== selectedNodeId));
    setSelectedNodeId(null);
  };

  // Load preset
  const handleLoadPreset = (preset: typeof PRESETS[0]) => {
    setNodes(preset.nodes);
    setEdges(preset.edges);
    setSelectedNodeId(null);
  };

  // Analyze compiled diagram
  const handleAnalyzeDiagram = () => {
    const textDescription = nodes
      .map((n) => {
        const outgoing = edges.filter((e) => e.from === n.id).map((e) => {
          const target = nodes.find((tn) => tn.id === e.to);
          return `leads to ${target?.label || "next node"} (${e.label || "flow"})`;
        });
        return `${n.label} [${n.type.toUpperCase()}] ${outgoing.length ? "which " + outgoing.join(" and ") : ""}`;
      })
      .join(". ");

    sessionStorage.setItem("analysisProblem", textDescription);
    router.push("/analyze");
  };

  return (
    <main className={styles.main}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <span className={styles.pageTitleIcon}>✏️</span>
            Multimodal Problem Diagram Studio
          </h1>
          <p className={styles.pageSubtitle}>
            Visually construct problem structures with entities, bottlenecks, flows, and feedback loops.
          </p>
        </div>

        <button className="btn-primary" onClick={handleAnalyzeDiagram}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          Extract Structure & Analyze
        </button>
      </div>

      <div className={styles.workspace}>
        {/* Sidebar Toolkit */}
        <div className={styles.toolkit}>
          <div className={styles.toolSection}>
            <h3 className={styles.toolTitle}>Presets</h3>
            <div className={styles.presetButtons}>
              {PRESETS.map((preset, i) => (
                <button key={i} className={styles.presetBtn} onClick={() => handleLoadPreset(preset)}>
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.toolSection}>
            <h3 className={styles.toolTitle}>Add Structural Element</h3>
            <div className={styles.nodeTypes}>
              {(["entity", "bottleneck", "flow", "loop", "goal"] as const).map((type) => (
                <button
                  key={type}
                  className={`${styles.typeBtn} ${selectedType === type ? styles.typeBtnActive : ""}`}
                  onClick={() => setSelectedType(type)}
                  style={{ borderColor: nodeTypeColors[type] }}
                >
                  <span className={styles.typeDot} style={{ background: nodeTypeColors[type] }} />
                  {type.toUpperCase()}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Element name..."
              value={nodeLabel}
              onChange={(e) => setNodeLabel(e.target.value)}
              className={styles.nodeInput}
            />

            <button className="btn-secondary" onClick={handleAddNode} style={{ width: "100%", marginTop: "8px" }}>
              + Add Node to Canvas
            </button>
          </div>

          {selectedNodeId && (
            <div className={styles.toolSection}>
              <h3 className={styles.toolTitle}>Selected Node Actions</h3>
              <div className={styles.selectedActions}>
                <button
                  className={`${styles.actionBtn} ${connectFromId === selectedNodeId ? styles.actionBtnActive : ""}`}
                  onClick={() => setConnectFromId(connectFromId === selectedNodeId ? null : selectedNodeId)}
                >
                  {connectFromId === selectedNodeId ? "Connecting... Click Target Node" : "🔗 Connect to Node"}
                </button>
                <button className={styles.deleteBtn} onClick={handleDeleteNode}>
                  🗑 Delete Selected
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div className={styles.canvasWrapper}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
          <div className={styles.canvasHint}>
            Click and drag nodes to position. Select a node and click &quot;Connect to Node&quot; to draw arrows.
          </div>
        </div>
      </div>
    </main>
  );
}
