"use client";

import React, { useState, useRef, useEffect } from "react";
import { EXAMPLE_PROBLEMS } from "@/lib/seed-data";
import { useRouter } from "next/navigation";
import ScrollReveal from "@/components/scroll-reveal";
import styles from "./page.module.css";

/* ── Animated Node Background ── */
function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let nodes: { x: number; y: number; vx: number; vy: number; r: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create nodes
    const nodeCount = 60;
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    const maxDist = 180;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${node.opacity})`;
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0, 229, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.networkCanvas} />;
}

/* ── Animated Stats ── */
function AnimatedStat({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };

    const timeout = setTimeout(tick, 500);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>
        {current}
        {suffix}
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

/* ── Main Page ── */
export default function HomePage() {
  const [problem, setProblem] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [charCount, setCharCount] = useState(0);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setProblem(value);
    setCharCount(value.length);

    // Auto-resize
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.max(120, Math.min(textarea.scrollHeight, 300)) + "px";
    }
  };

  const handleAnalyze = async () => {
    if (!problem.trim() && !selectedFile) return;
    setIsLoading(true);
    sessionStorage.setItem("analysisProblem", problem.trim());
    router.push("/analyze");
  };

  const handleExampleClick = (description: string) => {
    setProblem(description);
    setCharCount(description.length);
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Trigger auto-resize for example text
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = Math.max(120, Math.min(textareaRef.current.scrollHeight, 300)) + "px";
        }
      }, 0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  return (
    <main className={styles.main}>
      <NetworkBackground />

      {/* NavBar spacer — global nav is in layout */}
      <div style={{ height: "64px" }} />

      {/* ── Hero Section ── */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          Cross-Domain Analogical Reasoning
        </div>

        <h1 className={styles.heroTitle}>
          Every problem has already been{" "}
          <span className="gradient-text">solved somewhere else</span>
        </h1>

        <p className={styles.heroSubtitle}>
          Discover hidden structural similarities across science, nature, engineering,
          medicine, and history. Transfer solutions. Visualize mappings. See where
          analogies break — and innovate at the crack.
        </p>

        {/* ── Problem Input ── */}
        <div className={styles.inputContainer}>
          <div className={styles.inputWrapper}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              placeholder="Describe your problem, challenge, or system...

Example: 'A hospital has long emergency-room waiting times during peak hours. Patients arrive unpredictably, triage is overwhelmed, and delays cascade through the system.'"
              value={problem}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              rows={4}
              aria-label="Describe your problem for cross-domain analysis"
            />

            <div className={styles.inputActions}>
              <div className={styles.inputLeft}>
                <label className={styles.uploadBtn}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {selectedFile ? selectedFile.name : "Upload diagram"}
                  <input
                    type="file"
                    accept="image/*,.pdf,.svg"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </label>

                <span className={styles.hint}>Enter to analyze, Shift+Enter for new line</span>
                {charCount > 0 && (
                  <span className={styles.charCount}>{charCount} chars</span>
                )}
              </div>

              <button
                className="btn-primary"
                onClick={handleAnalyze}
                disabled={isLoading || (!problem.trim() && !selectedFile)}
              >
                {isLoading ? (
                  <>
                    <span className={styles.spinner} />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                    Find Analogies
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Example Problems ── */}
        <div className={styles.examples}>
          <span className={styles.examplesLabel}>Try an example:</span>
          <div className={styles.exampleGrid}>
            {EXAMPLE_PROBLEMS.map((example) => (
              <button
                key={example.id}
                className={styles.exampleCard}
                onClick={() => handleExampleClick(example.description)}
              >
                <span className={styles.exampleIcon}>{example.icon}</span>
                <div className={styles.exampleContent}>
                  <span className={styles.exampleTitle}>{example.title}</span>
                  <span className={styles.exampleCategory}>{example.category}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <ScrollReveal>
      <section className={styles.statsBar}>
        <AnimatedStat value={127} label="Universal Patterns" suffix="+" />
        <AnimatedStat value={15} label="Knowledge Domains" />
        <AnimatedStat value={1000} label="Cross-Domain Mappings" suffix="+" />
        <AnimatedStat value={47} label="Solution Mechanisms" />
      </section>
      </ScrollReveal>

      {/* ── Features Section ── */}
      <section className={styles.features}>
        <div className="section-container">
          <ScrollReveal>
          <div className={styles.featuresHeader}>
            <h2 className={styles.featuresTitle}>
              Not a chatbot. A{" "}
              <span className="gradient-text">structural reasoning engine</span>
            </h2>
            <p className={styles.featuresSubtitle}>
              Integrated systems working together to find, validate, and
              synthesize cross-domain solutions.
            </p>
          </div>
          </ScrollReveal>

          <div className={styles.featureGrid}>
            {[
              {
                icon: "🔮",
                title: "Interactive Isomorphism Engine",
                description:
                  "Live visualization mapping your problem to its structural twins across domains with deep reasoning.",
                color: "cyan",
                path: "/analyze",
              },
              {
                icon: "🔬",
                title: "Broken Bridge Analysis",
                description:
                  "Identifies exactly where each analogy collapses — and innovates at the crack to create robust solutions.",
                color: "red",
                path: "/analyze",
              },
              {
                icon: "⚡",
                title: "Hybrid Mechanism Generator",
                description:
                  "Combines principles from multiple distinct fields into novel solutions no single domain could yield.",
                color: "amber",
                path: "/analyze",
              },
              {
                icon: "💾",
                title: "Scientific Corpus & SQLite Hub",
                description:
                  "Browse, search, and inspect indexed peer-reviewed research papers across 20 scientific disciplines with sub-3ms FTS5 search.",
                color: "purple",
                path: "/datasets",
              },
              {
                icon: "🌍",
                title: "Impact Problem Finder",
                description:
                  "After solving your problem, discover other global challenges with the exact same abstract structure.",
                color: "green",
                path: "/analyze",
              },
            ].map((feature, i) => (
              <ScrollReveal key={i} delay={i * 0.06}>
              <div
                className={`${styles.featureCard} glass-card`}
                onClick={() => feature.path && router.push(feature.path)}
                style={{ cursor: feature.path ? "pointer" : "default" }}
              >
                <div className={`${styles.featureIcon} ${styles[`featureIcon_${feature.color}`]}`}>
                  {feature.icon}
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className={styles.howItWorks}>
        <div className="section-container">
          <ScrollReveal>
          <h2 className={styles.howTitle}>
            How the <span className="gradient-text">engine</span> works
          </h2>
          </ScrollReveal>

          <div className={styles.steps}>
            {[
              {
                num: "01",
                title: "Structural Extraction",
                desc: "The system identifies entities, constraints, goals, flows, bottlenecks, feedback loops, and dependencies inside your problem.",
              },
              {
                num: "02",
                title: "Cross-Domain Search",
                desc: "It searches across biology, ecology, engineering, medicine, economics, history, and technology for systems with the same deeper structure.",
              },
              {
                num: "03",
                title: "Analogy Mapping",
                desc: "It generates a live interactive graph showing exactly how elements in one domain map to elements in another, with confidence scores.",
              },
              {
                num: "04",
                title: "Broken Bridge Analysis",
                desc: "It identifies where each analogy fails, what the failure reveals about your problem, and how to innovate at the breaking point.",
              },
              {
                num: "05",
                title: "Hybrid Synthesis",
                desc: "It combines transferable principles from multiple domains into a new hybrid solution that no single field could have produced.",
              },
              {
                num: "06",
                title: "Impact Discovery",
                desc: "It shows you other large-scale problems with the same structure — revealing that your local solution may have global value.",
              },
            ].map((step, i) => (
              <ScrollReveal key={i} delay={i * 0.1} direction={i % 2 === 0 ? 'left' : 'right'}>
              <div className={styles.step}>
                <div className={styles.stepNum}>{step.num}</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerQuote}>
            &ldquo;There may be a limited number of recurring problem structures in the world.
            Everything else is domain-specific decoration.&rdquo;
          </p>
          <p className={styles.footerSub}>Universal Analogy Engine — A Living Map of Problem Structures</p>
        </div>
      </footer>
    </main>
  );
}
