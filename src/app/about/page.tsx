"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ScrollReveal from "@/components/scroll-reveal";
import styles from "./about.module.css";

export default function AboutPage() {
  const router = useRouter();

  return (
    <main className={styles.main}>
      {/* Spacer for global nav */}
      <div style={{ height: "64px" }} />

      <div className={styles.content}>
        <div className={styles.hero}>
          <h1 className={styles.title}>
            About the{" "}
            <span className="gradient-text">Universal Analogy Engine</span>
          </h1>
          <p className={styles.subtitle}>
            A Living Map of Problem Structures
          </p>
        </div>

        <div className={styles.sections}>
          <ScrollReveal>
          <section className={styles.section}>
            <h2>The Core Insight</h2>
            <p>
              Every problem in the world has already been solved somewhere else.
              A hospital struggling with patient flow solved the same structural
              challenge as a city struggling with traffic, which solved the same
              structural challenge as an ant colony managing food distribution,
              which solved the same structural challenge as an internet router
              managing packets.
            </p>
            <p>
              <strong>The structure is identical. The vocabulary is different.</strong>{" "}
              Every domain is speaking the same language underneath. This system
              finds these hidden structural matches systematically, transfers
              solutions across them, identifies where they break, and shows you
              every other problem they solve.
            </p>
          </section>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
          <section className={styles.section}>
            <h2>What This Is Not</h2>
            <p>
              This is not a chatbot that produces metaphors. This is not a search
              engine. This is a <strong>structural reasoning engine</strong> that
              identifies the underlying mathematical structure of a problem, finds
              genuine isomorphisms across domains, and transfers validated solution
              mechanisms.
            </p>
          </section>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
          <section className={styles.section}>
            <h2>The Seven Systems</h2>
            <div className={styles.featureList}>
              {[
                {
                  name: "Structural Extractor",
                  desc: "Identifies entities, constraints, goals, flows, bottlenecks, feedback loops, and dependencies inside any problem.",
                },
                {
                  name: "Isomorphism Graph",
                  desc: "Visualizes the structural mapping between your problem and its cross-domain twins. Click any connection to see the reasoning.",
                },
                {
                  name: "Broken Bridge Engine",
                  desc: "Finds exactly where each analogy collapses and innovates specifically at that crack. Turns failures into design requirements.",
                },
                {
                  name: "Hybrid Synthesizer",
                  desc: "Combines transferable principles from multiple domains into new solutions that no single field could have produced.",
                },
                {
                  name: "Scientific Research Corpus",
                  desc: "Indexed database of peer-reviewed papers across 20 scientific disciplines with fast full-text search.",
                },
                {
                  name: "Impact Finder",
                  desc: "After solving your problem, discovers other global challenges with the same structure — revealing that your local solution may have global value.",
                },
              ].map((f, i) => (
                <div key={i} className={styles.featureItem}>
                  <span className={styles.featureNum}>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{f.name}</h3>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          </ScrollReveal>

          <section className={styles.section}>
            <h2>The Hypothesis</h2>
            <blockquote className={styles.quote}>
              &ldquo;There may be a limited number of recurring problem structures
              in the world. Everything else is domain-specific decoration.&rdquo;
            </blockquote>
            <p>
              The Universal Pattern Library is built around this bold research
              hypothesis. By studying thousands of systems across biology,
              engineering, economics, medicine, ecology, social science, and
              technology, the system groups them into a finite set of recurring
              structural patterns — currently approximately 127 and growing.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Use Cases</h2>
            <div className={styles.useGrid}>
              {[
                "Biomimicry & Nature-Inspired Engineering",
                "Scientific Hypothesis Generation",
                "Innovation & Product Design",
                "Urban Planning & Smart Cities",
                "Healthcare System Improvement",
                "Climate Resilience Strategy",
                "Cybersecurity Architecture",
                "Supply Chain Optimization",
                "Education & Teaching",
                "Organizational Decision-Making",
                "Public Policy Design",
                "Research Collaboration",
              ].map((use, i) => (
                <div key={i} className={styles.useItem}>
                  {use}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.cta}>
          <p className={styles.pitch}>
            &ldquo;Every problem has already been solved somewhere else in the world.
            This system finds where. And then it invents what nobody has solved yet.&rdquo;
          </p>
          <button className="btn-primary" onClick={() => router.push("/")}>
            Start Exploring
          </button>
        </div>
      </div>
    </main>
  );
}
