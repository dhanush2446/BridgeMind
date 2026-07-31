"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SEED_ANALOGIES, SEED_PATTERNS } from "@/lib/seed-data";
import styles from "./knowledge.module.css";

interface GraphNode {
  id: string;
  label: string;
  type: "pattern" | "domain" | "analogy";
  details?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
}

interface GraphEdge {
  source: string;
  target: string;
  strength: number;
}

export default function KnowledgePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const dragRef = useRef<{ node: GraphNode | null; isDragging: boolean }>({ node: null, isDragging: false });
  
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "pattern" | "domain" | "analogy">("all");
  const [zoomScale, setZoomScale] = useState(1);

  // Initialize graph data
  useEffect(() => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const cx = 450;
    const cy = 350;

    // Pattern nodes
    SEED_PATTERNS.slice(0, 15).forEach((pattern, i) => {
      const angle = (i / 15) * Math.PI * 2;
      const r = 160;
      nodes.push({
        id: `pattern-${pattern.id}`,
        label: pattern.name,
        type: "pattern",
        details: pattern.abstractDescription,
        x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 20,
        y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 20,
        vx: 0,
        vy: 0,
        color: "#00e5ff",
        radius: 9,
      });
    });

    // Domain nodes
    const domains = [...new Set(SEED_PATTERNS.flatMap((p) => p.examples.map((e) => e.domain)))].slice(0, 12);
    domains.forEach((domain, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const r = 300;
      nodes.push({
        id: `domain-${domain}`,
        label: domain,
        type: "domain",
        details: `Knowledge domain spanning biological, engineering, and artificial systems.`,
        x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 20,
        y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 20,
        vx: 0,
        vy: 0,
        color: "#a855f7",
        radius: 7,
      });
    });

    // Analogy nodes
    SEED_ANALOGIES.forEach((analogy) => {
      const angle = Math.random() * Math.PI * 2;
      const r = 220 + Math.random() * 50;
      nodes.push({
        id: `analogy-${analogy.id}`,
        label: `${analogy.sourceDomain} → ${analogy.targetDomain}`,
        type: "analogy",
        details: `${analogy.sourceSystem} (${analogy.sourceDomain}) mapped to ${analogy.targetSystem} (${analogy.targetDomain}). Match strength: ${Math.round(analogy.overallStrength * 100)}%.`,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: 0,
        vy: 0,
        color: "#4d7cff",
        radius: 6,
      });
    });

    // Edges: patterns → domains
    SEED_PATTERNS.slice(0, 15).forEach((pattern) => {
      pattern.examples.forEach((ex) => {
        if (domains.includes(ex.domain)) {
          edges.push({
            source: `pattern-${pattern.id}`,
            target: `domain-${ex.domain}`,
            strength: 0.35,
          });
        }
      });
    });

    // Edges: analogies → patterns
    SEED_ANALOGIES.forEach((analogy) => {
      const patternNode = nodes.find((n) => n.id === `pattern-${analogy.patternId}`);
      if (patternNode) {
        edges.push({
          source: `analogy-${analogy.id}`,
          target: patternNode.id,
          strength: analogy.overallStrength,
        });
      }
    });

    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, []);

  // Force simulation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth * 2;
        canvas.height = parent.clientHeight * 2;
        canvas.style.width = parent.clientWidth + "px";
        canvas.style.height = parent.clientHeight + "px";
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let animId: number;

    const simulate = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.scale(2 * zoomScale, 2 * zoomScale);
      const w = canvas.width / (2 * zoomScale);
      const h = canvas.height / (2 * zoomScale);
      ctx.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      const repulsion = 4500;
      const k = 0.0012;
      const damping = 0.91;

      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsion / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          nodes[i].vx -= fx;
          nodes[i].vy -= fy;
          nodes[j].vx += fx;
          nodes[j].vy += fy;
        }
      }

      // Edge attraction
      for (const edge of edges) {
        const source = nodes.find((n) => n.id === edge.source);
        const target = nodes.find((n) => n.id === edge.target);
        if (!source || !target) continue;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = k * dist * edge.strength;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        source.vx += fx;
        source.vy += fy;
        target.vx -= fx;
        target.vy -= fy;
      }

      // Center gravity
      for (const node of nodes) {
        const dx = w / 2 - node.x;
        const dy = h / 2 - node.y;
        node.vx += dx * 0.0004;
        node.vy += dy * 0.0004;
      }

      // Position updates
      for (const node of nodes) {
        if (dragRef.current.node === node) continue;
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;
        node.x = Math.max(30, Math.min(w - 30, node.x));
        node.y = Math.max(30, Math.min(h - 30, node.y));
      }

      // Draw edges
      for (const edge of edges) {
        const source = nodes.find((n) => n.id === edge.source);
        const target = nodes.find((n) => n.id === edge.target);
        if (!source || !target) continue;

        const isSourceMatched = !filterType || filterType === "all" || source.type === filterType;
        const isTargetMatched = !filterType || filterType === "all" || target.type === filterType;
        if (!isSourceMatched && !isTargetMatched) continue;

        const isConnectedToActive =
          hoveredNode?.id === source.id ||
          hoveredNode?.id === target.id ||
          selectedNode?.id === source.id ||
          selectedNode?.id === target.id;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = isConnectedToActive
          ? "rgba(0, 229, 255, 0.7)"
          : `rgba(255, 255, 255, ${0.03 + edge.strength * 0.05})`;
        ctx.lineWidth = isConnectedToActive ? 1.8 : 0.6;
        ctx.stroke();
      }

      // Draw nodes
      for (const node of nodes) {
        const matchesFilter = filterType === "all" || node.type === filterType;
        const matchesSearch = !searchQuery || node.label.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesFilter) continue;

        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;
        const isHighlighted = isHovered || isSelected || (searchQuery && matchesSearch);

        const radius = isHighlighted ? node.radius + 3 : node.radius;

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = isHighlighted ? 1 : searchQuery && !matchesSearch ? 0.15 : 0.65;
        ctx.fill();
        ctx.globalAlpha = 1;

        if (isHighlighted) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 7, 0, Math.PI * 2);
          ctx.strokeStyle = node.color;
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Label
        if (node.type === "pattern" || isHighlighted || (searchQuery && matchesSearch)) {
          ctx.font = `${isHighlighted ? "600" : "400"} ${isHighlighted ? "11" : "9"}px Inter`;
          ctx.fillStyle = isHighlighted ? "#ffffff" : "rgba(154, 160, 184, 0.6)";
          ctx.textAlign = "center";
          ctx.fillText(node.label, node.x, node.y + radius + 13);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(simulate);
    };

    simulate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animId);
    };
  }, [hoveredNode, selectedNode, filterType, searchQuery, zoomScale]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomScale;
    const y = (e.clientY - rect.top) / zoomScale;

    if (dragRef.current.node) {
      dragRef.current.node.x = x;
      dragRef.current.node.y = y;
      dragRef.current.node.vx = 0;
      dragRef.current.node.vy = 0;
      dragRef.current.isDragging = true;
      return;
    }

    let found: GraphNode | null = null;
    for (const node of nodesRef.current) {
      const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      if (dist < node.radius + 8) {
        found = node;
        break;
      }
    }
    setHoveredNode(found);
  };

  const handleMouseDown = () => {
    if (hoveredNode) {
      dragRef.current = { node: hoveredNode, isDragging: false };
    }
  };

  const handleMouseUp = () => {
    if (dragRef.current.node && !dragRef.current.isDragging) {
      setSelectedNode(dragRef.current.node);
    }
    dragRef.current = { node: null, isDragging: false };
  };

  // Find connected neighbors of selected node
  const getConnectedNeighbors = useCallback(() => {
    if (!selectedNode) return [];
    const connectedIds = new Set<string>();
    edgesRef.current.forEach((edge) => {
      if (edge.source === selectedNode.id) connectedIds.add(edge.target);
      if (edge.target === selectedNode.id) connectedIds.add(edge.source);
    });
    return nodesRef.current.filter((n) => connectedIds.has(n.id));
  }, [selectedNode]);

  return (
    <main className={styles.main}>
      {/* Page Header with Controls */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>
            <span className={styles.pageTitleIcon}>🧠</span>
            Knowledge Graph Explorer
          </h1>
        </div>

        {/* Search & Filter bar */}
        <div className={styles.controlsBar}>
          <div className={styles.searchBox}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search graph..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button className={styles.clearSearch} onClick={() => setSearchQuery("")}>
                ×
              </button>
            )}
          </div>

          <div className={styles.filterGroup}>
            {(["all", "pattern", "domain", "analogy"] as const).map((type) => (
              <button
                key={type}
                className={`${styles.filterBtn} ${filterType === type ? styles.filterBtnActive : ""}`}
                onClick={() => setFilterType(type)}
              >
                {type === "all" ? "All Nodes" : type.charAt(0).toUpperCase() + type.slice(1) + "s"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.graphContainer}>
        <canvas
          ref={canvasRef}
          className={styles.graphCanvas}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: hoveredNode ? "grab" : "default" }}
        />

        {/* Floating Zoom Controls */}
        <div className={styles.zoomControls}>
          <button onClick={() => setZoomScale((z) => Math.min(z + 0.2, 2.5))} title="Zoom In">+</button>
          <button onClick={() => setZoomScale(1)} title="Reset Zoom">100%</button>
          <button onClick={() => setZoomScale((z) => Math.max(z - 0.2, 0.5))} title="Zoom Out">−</button>
        </div>

        {/* Graph Overlay Info */}
        <div className={styles.graphOverlay}>
          <p>Drag nodes to explore. Click any node to view structural details.</p>
          <p className={styles.graphOverlaySub}>
            {nodesRef.current.length} nodes &bull; {edgesRef.current.length} connections across knowledge domains
          </p>
        </div>

        {/* Node Detail Sidebar */}
        {selectedNode && (
          <div className={styles.nodeSidebar}>
            <div className={styles.nodeSidebarHeader}>
              <span className={styles.nodeTypeBadge} style={{ background: selectedNode.color }}>
                {selectedNode.type}
              </span>
              <button className={styles.closeSidebar} onClick={() => setSelectedNode(null)}>
                ×
              </button>
            </div>
            <h3 className={styles.nodeTitle}>{selectedNode.label}</h3>
            {selectedNode.details && (
              <p className={styles.nodeDesc}>{selectedNode.details}</p>
            )}

            <div className={styles.connectedSection}>
              <h4 className={styles.connectedTitle}>Connected Nodes ({getConnectedNeighbors().length})</h4>
              <div className={styles.neighborList}>
                {getConnectedNeighbors().map((neighbor) => (
                  <button
                    key={neighbor.id}
                    className={styles.neighborItem}
                    onClick={() => setSelectedNode(neighbor)}
                  >
                    <span className={styles.neighborDot} style={{ background: neighbor.color }} />
                    <span className={styles.neighborLabel}>{neighbor.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
