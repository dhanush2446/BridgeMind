"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./knowledge.module.css";

/* ── Types ── */

interface GraphNode {
  id: string;
  label: string;
  type: "pattern" | "domain";
  details: string;
  paperCount: number;
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
  weight: number;
  strength: number; // normalised 0-1
}

interface ApiNode {
  id: string;
  label: string;
  type: "domain" | "pattern";
  paperCount: number;
  details: string;
}

interface ApiEdge {
  source: string;
  target: string;
  weight: number;
}

interface ApiStats {
  totalPapers: number;
  totalDomains: number;
  totalPatterns: number;
  totalEdges: number;
}

export default function KnowledgePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const dragRef = useRef<{ node: GraphNode | null; isDragging: boolean }>({
    node: null,
    isDragging: false,
  });

  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "pattern" | "domain">("all");
  const [zoomScale, setZoomScale] = useState(1);
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);

  /* ── Fetch graph data from database API ── */
  useEffect(() => {
    async function loadGraphData() {
      try {
        const res = await fetch("/api/knowledge");
        if (!res.ok) throw new Error("API error");
        const data = await res.json();

        const apiNodes: ApiNode[] = data.nodes ?? [];
        const apiEdges: ApiEdge[] = data.edges ?? [];
        const apiStats: ApiStats = data.stats ?? { totalPapers: 0, totalDomains: 0, totalPatterns: 0, totalEdges: 0 };
        setStats(apiStats);

        const cx = 500;
        const cy = 400;

        /* ── Compute max counts for radius scaling ── */
        const maxDomainCount = Math.max(1, ...apiNodes.filter((n) => n.type === "domain").map((n) => n.paperCount));
        const maxPatternCount = Math.max(1, ...apiNodes.filter((n) => n.type === "pattern").map((n) => n.paperCount));

        const domainNodes = apiNodes.filter((n) => n.type === "domain");
        const patternNodes = apiNodes.filter((n) => n.type === "pattern");

        const nodes: GraphNode[] = [];

        /* Domain nodes – outer ring */
        domainNodes.forEach((n, i) => {
          const angle = (i / domainNodes.length) * Math.PI * 2;
          const r = 320;
          const sizeScale = 5 + 9 * (n.paperCount / maxDomainCount);
          nodes.push({
            id: n.id,
            label: n.label,
            type: "domain",
            details: n.details,
            paperCount: n.paperCount,
            x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 15,
            y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 15,
            vx: 0,
            vy: 0,
            color: "#a855f7",
            radius: sizeScale,
          });
        });

        /* Pattern nodes – inner ring */
        patternNodes.forEach((n, i) => {
          const angle = (i / patternNodes.length) * Math.PI * 2;
          const r = 150;
          const sizeScale = 6 + 8 * (n.paperCount / maxPatternCount);
          nodes.push({
            id: n.id,
            label: n.label,
            type: "pattern",
            details: n.details,
            paperCount: n.paperCount,
            x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 10,
            y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 10,
            vx: 0,
            vy: 0,
            color: "#00e5ff",
            radius: sizeScale,
          });
        });

        /* Edges – normalise weights */
        const maxWeight = Math.max(1, ...apiEdges.map((e) => e.weight));
        const edges: GraphEdge[] = apiEdges.map((e) => ({
          source: e.source,
          target: e.target,
          weight: e.weight,
          strength: e.weight / maxWeight,
        }));

        nodesRef.current = nodes;
        edgesRef.current = edges;
      } catch (err) {
        console.error("Failed to load knowledge graph data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadGraphData();
  }, []);

  /* ── Force simulation loop ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loading) return;

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

      const repulsion = 5000;
      const k = 0.001;
      const damping = 0.90;

      /* Repulsion */
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

      /* Edge attraction */
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

      /* Center gravity */
      for (const node of nodes) {
        const dx = w / 2 - node.x;
        const dy = h / 2 - node.y;
        node.vx += dx * 0.0004;
        node.vy += dy * 0.0004;
      }

      /* Position updates */
      for (const node of nodes) {
        if (dragRef.current.node === node) continue;
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;
        node.x = Math.max(40, Math.min(w - 40, node.x));
        node.y = Math.max(40, Math.min(h - 40, node.y));
      }

      /* ── Draw edges ── */
      for (const edge of edges) {
        const source = nodes.find((n) => n.id === edge.source);
        const target = nodes.find((n) => n.id === edge.target);
        if (!source || !target) continue;

        const isSourceMatched = filterType === "all" || source.type === filterType;
        const isTargetMatched = filterType === "all" || target.type === filterType;
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
          ? `rgba(0, 229, 255, ${0.4 + edge.strength * 0.5})`
          : `rgba(255, 255, 255, ${0.02 + edge.strength * 0.06})`;
        ctx.lineWidth = isConnectedToActive ? 1.2 + edge.strength * 1.5 : 0.4 + edge.strength * 0.6;
        ctx.stroke();
      }

      /* ── Draw nodes ── */
      for (const node of nodes) {
        const matchesFilter = filterType === "all" || node.type === filterType;
        const matchesSearch =
          !searchQuery || node.label.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesFilter) continue;

        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;
        const isHighlighted = isHovered || isSelected || (searchQuery && matchesSearch);

        const radius = isHighlighted ? node.radius + 3 : node.radius;

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = isHighlighted ? 1 : searchQuery && !matchesSearch ? 0.15 : 0.7;
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

        /* Label */
        const shouldLabel =
          node.type === "pattern" ||
          isHighlighted ||
          (searchQuery && matchesSearch) ||
          node.radius >= 10;
        if (shouldLabel) {
          ctx.font = `${isHighlighted ? "600" : "400"} ${isHighlighted ? "11" : "9"}px Inter`;
          ctx.fillStyle = isHighlighted ? "#ffffff" : "rgba(154, 160, 184, 0.6)";
          ctx.textAlign = "center";
          const displayLabel =
            node.label.length > 28 ? node.label.slice(0, 26) + "…" : node.label;
          ctx.fillText(displayLabel, node.x, node.y + radius + 13);
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
  }, [hoveredNode, selectedNode, filterType, searchQuery, zoomScale, loading]);

  /* ── Mouse handlers ── */
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

  /* ── Connected neighbors ── */
  const getConnectedNeighbors = useCallback(() => {
    if (!selectedNode) return [];
    const connectedIds = new Set<string>();
    edgesRef.current.forEach((edge) => {
      if (edge.source === selectedNode.id) connectedIds.add(edge.target);
      if (edge.target === selectedNode.id) connectedIds.add(edge.source);
    });
    return nodesRef.current
      .filter((n) => connectedIds.has(n.id))
      .sort((a, b) => b.paperCount - a.paperCount);
  }, [selectedNode]);

  /* ── Render ── */
  return (
    <main className={styles.main}>
      {/* Page Header with Controls */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>
            <span className={styles.pageTitleIcon}>🧠</span>
            Knowledge Graph Explorer
          </h1>
          {stats && (
            <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginTop: 2 }}>
              {stats.totalDomains} domains · {stats.totalPatterns} patterns · {stats.totalEdges} connections · {stats.totalPapers.toLocaleString()} papers
            </p>
          )}
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
            {(["all", "pattern", "domain"] as const).map((type) => (
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

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#38bdf8" }}>
          ⚡ Loading knowledge graph from 1,509 research papers...
        </div>
      ) : (
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

          {/* Legend */}
          <div style={{
            position: "absolute", bottom: 16, left: 16,
            display: "flex", gap: 16, fontSize: "0.75rem", color: "var(--text-tertiary)",
            background: "rgba(6,7,14,0.7)", padding: "6px 14px", borderRadius: 8,
            backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.06)"
          }}>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#a855f7", marginRight: 4 }} />Domains</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#00e5ff", marginRight: 4 }} />Patterns</span>
            <span style={{ opacity: 0.6 }}>Node size = paper count</span>
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
              <p style={{ fontSize: "0.8rem", color: "var(--accent-cyan)", fontWeight: 700, margin: "4px 0 8px" }}>
                {selectedNode.paperCount} papers
              </p>
              {selectedNode.details && (
                <p className={styles.nodeDesc}>{selectedNode.details}</p>
              )}

              <div className={styles.connectedSection}>
                <h4 className={styles.connectedTitle}>
                  Connected Nodes ({getConnectedNeighbors().length})
                </h4>
                <div className={styles.neighborList}>
                  {getConnectedNeighbors().map((neighbor) => (
                    <button
                      key={neighbor.id}
                      className={styles.neighborItem}
                      onClick={() => setSelectedNode(neighbor)}
                    >
                      <span className={styles.neighborDot} style={{ background: neighbor.color }} />
                      <span className={styles.neighborLabel}>
                        {neighbor.label}
                        <span style={{ opacity: 0.5, marginLeft: 6, fontSize: "0.7rem" }}>
                          ({neighbor.paperCount})
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
