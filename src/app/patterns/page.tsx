"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { StructuralPattern } from "@/lib/seed-data";
import styles from "./patterns.module.css";

export default function PatternsPage() {
  const [patterns, setPatterns] = useState<StructuralPattern[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPattern, setSelectedPattern] = useState<StructuralPattern | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/patterns")
      .then((res) => res.json())
      .then((data) => {
        setPatterns(data);
        setIsLoading(false);
      });
  }, []);

  // Extract unique domains for filter chips
  const allDomains = [...new Set(patterns.flatMap(p => p.examples.map(e => e.domain)))].sort();

  const filteredPatterns = patterns.filter((p) => {
    // Text search filter
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.abstractDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.examples.some(
        (e) =>
          e.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.problem.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Domain filter
    const matchesDomain = !selectedDomain ||
      p.examples.some(e => e.domain === selectedDomain);

    return matchesSearch && matchesDomain;
  });

  const domainColors: Record<string, string> = {
    Biology: "green",
    Healthcare: "red",
    "Computer Science": "cyan",
    Ecology: "green",
    "Urban Planning": "blue",
    Engineering: "amber",
    Finance: "amber",
    Logistics: "purple",
    Infrastructure: "blue",
    Humanitarian: "red",
    Social: "purple",
    Aviation: "cyan",
    Government: "blue",
    Technology: "cyan",
    Environmental: "green",
    Legal: "amber",
    Education: "blue",
    Manufacturing: "amber",
    Robotics: "cyan",
    Economics: "amber",
    Climate: "green",
    "Audio Engineering": "purple",
    "Data Science": "cyan",
    Science: "blue",
    Business: "amber",
    Medicine: "red",
    Radar: "cyan",
    "Materials Science": "amber",
    "Software Engineering": "cyan",
    "Organization Design": "purple",
    Electronics: "blue",
    Chemistry: "green",
    "Software": "cyan",
    "Transportation": "blue",
    "Information Science": "purple",
    "Cybersecurity": "red",
    "Agriculture": "green",
    "Epidemiology": "red",
    "Neuroscience": "purple",
    "Disaster Response": "red",
    "Computing": "cyan",
    "Urban": "blue",
  };

  const getDomainColor = (domain: string) => {
    return domainColors[domain] || "cyan";
  };

  return (
    <main className={styles.main}>
      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <span className={styles.pageTitleIcon}>📐</span>
          Universal Pattern Library
        </h1>
        <p className={styles.pageSubtitle}>
          {patterns.length} recurring structural patterns found across all domains of human knowledge
        </p>
      </div>

      <div className={styles.container}>
        {/* ── Sidebar: Pattern List ── */}
        <div className={styles.sidebar}>
          <div className={styles.searchBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search patterns, domains, problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Domain Filter Chips */}
          <div className={styles.filterChips}>
            <button
              className={`${styles.filterChip} ${!selectedDomain ? styles.filterChipActive : ""}`}
              onClick={() => setSelectedDomain(null)}
            >
              All
            </button>
            {allDomains.slice(0, 12).map((domain) => (
              <button
                key={domain}
                className={`${styles.filterChip} ${selectedDomain === domain ? styles.filterChipActive : ""}`}
                onClick={() => setSelectedDomain(selectedDomain === domain ? null : domain)}
              >
                {domain}
              </button>
            ))}
          </div>

          <div className={styles.patternCount}>
            {filteredPatterns.length} pattern{filteredPatterns.length !== 1 ? "s" : ""} found
            {selectedDomain && (
              <button
                className={styles.clearFilter}
                onClick={() => setSelectedDomain(null)}
              >
                Clear filter ×
              </button>
            )}
          </div>

          <div className={styles.patternList}>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`${styles.patternListItem} skeleton`} style={{ height: "60px" }} />
              ))
            ) : (
              filteredPatterns.map((pattern) => (
                <button
                  key={pattern.id}
                  className={`${styles.patternListItem} ${selectedPattern?.id === pattern.id ? styles.patternListItemActive : ""}`}
                  onClick={() => setSelectedPattern(pattern)}
                >
                  <div className={styles.patternListNum}>#{pattern.number}</div>
                  <div className={styles.patternListContent}>
                    <span className={styles.patternListName}>{pattern.name}</span>
                    <span className={styles.patternListMeta}>
                      {pattern.domainCount} domains · {pattern.examples.length} examples
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Main: Pattern Detail ── */}
        <div className={styles.detail}>
          {selectedPattern ? (
            <div className={styles.detailContent}>
              <div className={styles.detailHeader}>
                <span className={styles.detailNumber}>Pattern #{selectedPattern.number}</span>
                <h2 className={styles.detailName}>{selectedPattern.name}</h2>
                <p className={styles.detailAbstract}>{selectedPattern.abstractDescription}</p>
              </div>

              {/* Structural Elements */}
              <div className={styles.detailSection}>
                <h3 className={styles.detailSectionTitle}>Structural Elements</h3>
                <div className={styles.elementTags}>
                  {selectedPattern.structuralElements.map((el, i) => (
                    <span key={i} className="tag tag-cyan">{el}</span>
                  ))}
                </div>
              </div>

              {/* Domain Examples */}
              <div className={styles.detailSection}>
                <h3 className={styles.detailSectionTitle}>
                  Cross-Domain Examples ({selectedPattern.examples.length})
                </h3>
                <div className={styles.exampleList}>
                  {selectedPattern.examples.map((ex, i) => (
                    <div key={i} className={styles.exampleItem}>
                      <div className={styles.exampleHeader}>
                        <span className={`tag tag-${getDomainColor(ex.domain)}`}>{ex.domain}</span>
                      </div>
                      <h4 className={styles.exampleProblem}>{ex.problem}</h4>
                      <div className={styles.exampleSolution}>
                        <span className={styles.exampleLabel}>Solution:</span>
                        {ex.solution}
                      </div>
                      <div className={styles.exampleOutcome}>
                        <span className={styles.exampleLabel}>Outcome:</span>
                        {ex.outcome}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Solutions */}
              <div className={styles.detailSection}>
                <h3 className={styles.detailSectionTitle}>
                  <span style={{ color: "var(--accent-green)" }}>✓</span> Common Solutions
                </h3>
                <ul className={styles.solutionList}>
                  {selectedPattern.commonSolutions.map((sol, i) => (
                    <li key={i}>{sol}</li>
                  ))}
                </ul>
              </div>

              {/* Common Failures */}
              <div className={styles.detailSection}>
                <h3 className={styles.detailSectionTitle}>
                  <span style={{ color: "var(--accent-red)" }}>✗</span> Common Failures
                </h3>
                <ul className={styles.failureList}>
                  {selectedPattern.commonFailures.map((fail, i) => (
                    <li key={i}>{fail}</li>
                  ))}
                </ul>
              </div>

              {/* Related Patterns */}
              <div className={styles.detailSection}>
                <h3 className={styles.detailSectionTitle}>Related Patterns</h3>
                <div className={styles.relatedPatterns}>
                  {selectedPattern.relatedPatterns.map((relId, i) => {
                    const relPattern = patterns.find((p) => p.id === relId);
                    return (
                      <button
                        key={i}
                        className={styles.relatedItem}
                        onClick={() => {
                          if (relPattern) setSelectedPattern(relPattern);
                        }}
                        disabled={!relPattern}
                      >
                        {relPattern ? `#${relPattern.number} ${relPattern.name}` : relId}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📐</div>
              <h3>Select a pattern to explore</h3>
              <p>
                The Universal Pattern Library contains {patterns.length} recurring structural
                patterns found across all domains of human knowledge.
              </p>
              <p className={styles.emptyHint}>
                Each pattern represents a fundamental problem structure that appears
                again and again — in biology, engineering, social systems, and beyond.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
