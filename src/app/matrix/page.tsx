"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./matrix.module.css";

export default function MatrixPage() {
  const router = useRouter();
  const [domains, setDomains] = useState<string[]>([]);
  const [matrix, setMatrix] = useState<number[][]>([]);
  const [pairDetails, setPairDetails] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>({ row: 0, col: 1 });

  useEffect(() => {
    async function loadMatrixData() {
      try {
        const res = await fetch("/api/matrix");
        if (res.ok) {
          const data = await res.json();
          setDomains(data.domains || []);
          setMatrix(data.matrix || []);
          setPairDetails(data.pairDetails || {});
        }
      } catch (err) {
        console.error("Failed to load real matrix:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMatrixData();
  }, []);

  const getHeatmapColor = (score: number, isSelf: boolean) => {
    if (isSelf) return "rgba(255, 255, 255, 0.05)";
    if (score >= 0.9) return "rgba(0, 229, 255, 0.65)";
    if (score >= 0.82) return "rgba(77, 124, 255, 0.55)";
    if (score >= 0.75) return "rgba(168, 85, 247, 0.45)";
    return "rgba(245, 158, 11, 0.35)";
  };

  const domainA = selectedCell && domains[selectedCell.row] ? domains[selectedCell.row] : "";
  const domainB = selectedCell && domains[selectedCell.col] ? domains[selectedCell.col] : "";
  const selectedScore = selectedCell && matrix[selectedCell.row] ? matrix[selectedCell.row][selectedCell.col] : 0;
  const currentPairDetail = selectedCell ? pairDetails[`${selectedCell.row}-${selectedCell.col}`] : null;

  const handleLaunchPairAnalysis = () => {
    if (!selectedCell) return;
    const promptText = `A structural challenge in ${domainA} requiring isomorphic solution transfer from mechanisms in ${domainB}. Analyze shared flow conservation, feedback loops, and boundary failure points.`;
    sessionStorage.setItem("analysisProblem", promptText);
    router.push("/analyze");
  };

  return (
    <main className={styles.main}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <span className={styles.pageTitleIcon}>📊</span>
            Real Cross-Domain Isomorphism Matrix & Heatmap
          </h1>
          <p className={styles.pageSubtitle}>
            Calculated live from 1,485 real research papers across top scientific disciplines.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#38bdf8" }}>
          ⚡ Calculating real cross-domain isomorphism matrix from 1,485 research papers...
        </div>
      ) : (
        <div className={styles.container}>
          {/* Heatmap Grid */}
          <div className={styles.matrixWrapper}>
            <div className={styles.matrixGrid}>
              {/* Top Header Row */}
              <div className={styles.cellHeaderCorner} />
              {domains.map((domain, colIdx) => (
                <div key={colIdx} className={styles.cellHeaderCol}>
                  <span>{domain}</span>
                </div>
              ))}

              {/* Matrix Body Rows */}
              {domains.map((rowDomain, rowIdx) => (
                <React.Fragment key={rowIdx}>
                  <div className={styles.cellHeaderRow}>
                    <span>{rowDomain}</span>
                  </div>
                  {domains.map((colDomain, colIdx) => {
                    const score = matrix[rowIdx]?.[colIdx] || 0;
                    const isSelf = rowIdx === colIdx;
                    const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx;

                    return (
                      <button
                        key={colIdx}
                        className={`${styles.matrixCell} ${isSelected ? styles.cellSelected : ""}`}
                        style={{ background: getHeatmapColor(score, isSelf) }}
                        onClick={() => setSelectedCell({ row: rowIdx, col: colIdx })}
                        title={`${rowDomain} ↔ ${colDomain}: ${Math.round(score * 100)}%`}
                      >
                        <span className={styles.cellScore}>{Math.round(score * 100)}%</span>
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Selected Pair Detail Card */}
          {selectedCell && (
            <div className={styles.detailCard}>
              <div className={styles.detailHeader}>
                <span className="tag tag-cyan">{domainA}</span>
                <span className={styles.pairArrow}>⟷</span>
                <span className="tag tag-blue">{domainB}</span>
              </div>

              <div className={styles.scoreRow}>
                <span className={styles.scoreValue}>{Math.round(selectedScore * 100)}%</span>
                <span className={styles.scoreLabel}>Real Paper Transfer Strength</span>
              </div>

              {currentPairDetail?.paperA && (
                <div style={{ margin: "0.75rem 0", background: "rgba(0, 229, 255, 0.05)", padding: "0.6rem", borderRadius: "6px", border: "1px solid rgba(0,229,255,0.15)" }}>
                  <div style={{ fontSize: "0.75rem", color: "#38bdf8", fontWeight: 700, marginBottom: "0.2rem" }}>📄 Sample Source Research Paper:</div>
                  <div style={{ fontSize: "0.85rem", color: "#f8fafc", fontWeight: 600 }}>{currentPairDetail.paperA.title}</div>
                  {currentPairDetail.paperA.url && (
                    <a href={currentPairDetail.paperA.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "#00e5ff", textDecoration: "underline", marginTop: "0.3rem", display: "inline-block" }}>
                      View Published Paper ↗
                    </a>
                  )}
                </div>
              )}

              <div className={styles.detailSection}>
                <h4>Discovered Transfer Patterns</h4>
                <ul>
                  {(currentPairDetail?.patterns || []).map((pat: string, idx: number) => (
                    <li key={idx}>{pat}</li>
                  ))}
                </ul>
              </div>

              <button className="btn-primary" onClick={handleLaunchPairAnalysis} style={{ width: "100%", marginTop: "auto" }}>
                Explore Cross-Domain Analogies →
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
