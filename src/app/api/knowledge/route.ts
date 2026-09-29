import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

/**
 * GET /api/knowledge
 *
 * Returns graph data (nodes + edges) built entirely from the database:
 *   - Domain nodes   (one per domain, sized by paper count)
 *   - Pattern nodes  (one per abstract_pattern, sized by paper count)
 *   - Edges          (domain ↔ pattern, weighted by co-occurrence count)
 *   - Summary stats
 */
export async function GET() {
  try {
    const db = getDb();

    /* ── 1. Domain nodes ── */
    const domainRows: any[] = db
      .prepare(
        `SELECT domain, COUNT(*) as count
         FROM case_studies
         WHERE domain IS NOT NULL
         GROUP BY domain
         ORDER BY count DESC`
      )
      .all();

    /* ── 2. Pattern nodes ── */
    const patternRows: any[] = db
      .prepare(
        `SELECT abstract_pattern, COUNT(*) as count
         FROM case_studies
         WHERE abstract_pattern IS NOT NULL
         GROUP BY abstract_pattern
         ORDER BY count DESC`
      )
      .all();

    /* ── 3. Domain × Pattern edges (real co-occurrence counts) ── */
    const crossRows: any[] = db
      .prepare(
        `SELECT domain, abstract_pattern, COUNT(*) as count
         FROM case_studies
         WHERE domain IS NOT NULL AND abstract_pattern IS NOT NULL
         GROUP BY domain, abstract_pattern
         ORDER BY count DESC`
      )
      .all();

    /* ── Build nodes ── */
    const maxDomainCount = domainRows[0]?.count ?? 1;
    const maxPatternCount = patternRows[0]?.count ?? 1;

    interface KGNode {
      id: string;
      label: string;
      type: "domain" | "pattern";
      paperCount: number;
      details: string;
    }

    const nodes: KGNode[] = [];

    domainRows.forEach((r) => {
      nodes.push({
        id: `domain-${r.domain}`,
        label: r.domain,
        type: "domain",
        paperCount: r.count,
        details: `${r.count} indexed research papers in ${r.domain}.`,
      });
    });

    patternRows.forEach((r) => {
      nodes.push({
        id: `pattern-${slugify(r.abstract_pattern)}`,
        label: r.abstract_pattern,
        type: "pattern",
        paperCount: r.count,
        details: `${r.count} papers exhibit the "${r.abstract_pattern}" structural pattern.`,
      });
    });

    /* ── Build edges ── */
    interface KGEdge {
      source: string;
      target: string;
      weight: number;
    }

    const edges: KGEdge[] = [];

    crossRows.forEach((r) => {
      edges.push({
        source: `domain-${r.domain}`,
        target: `pattern-${slugify(r.abstract_pattern)}`,
        weight: r.count,
      });
    });

    /* ── Stats ── */
    const totalPapers: number =
      (db.prepare("SELECT COUNT(*) as c FROM case_studies").get() as any)?.c ?? 0;

    return NextResponse.json({
      nodes,
      edges,
      stats: {
        totalPapers,
        totalDomains: domainRows.length,
        totalPatterns: patternRows.length,
        totalEdges: edges.length,
      },
    });
  } catch (error: any) {
    console.error("Knowledge API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* ── helpers ── */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
