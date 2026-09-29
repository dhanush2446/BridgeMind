import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();

    // 1. Fetch ALL domains with ≥ 2 papers
    const domainRows: any[] = db.prepare(`
      SELECT domain, COUNT(*) as count 
      FROM case_studies 
      WHERE domain IS NOT NULL
      GROUP BY domain 
      HAVING count >= 2
      ORDER BY count DESC
    `).all();

    if (!domainRows || domainRows.length === 0) {
      return NextResponse.json({ error: "No domain data found" }, { status: 404 });
    }

    const domains = domainRows.map(r => r.domain);
    const domainCounts: Record<string, number> = {};
    domainRows.forEach(r => { domainCounts[r.domain] = r.count; });

    // 2. Fetch distinct patterns
    const patternRows: any[] = db.prepare(`
      SELECT DISTINCT abstract_pattern 
      FROM case_studies 
      WHERE abstract_pattern IS NOT NULL
    `).all();
    const patterns = patternRows.map(r => r.abstract_pattern);

    // 3. Build Pattern Distribution Vector for each Domain
    // Vector V_d[p] = count of papers in domain d having pattern p
    const domVectors: Record<string, Record<string, number>> = {};
    const domNorms: Record<string, number> = {};

    domains.forEach(d => {
      domVectors[d] = {};
      patterns.forEach(p => { domVectors[d][p] = 0; });

      const counts: any[] = db.prepare(`
        SELECT abstract_pattern, COUNT(*) as c 
        FROM case_studies 
        WHERE domain = ? AND abstract_pattern IS NOT NULL
        GROUP BY abstract_pattern
      `).all(d);

      let sumSq = 0;
      counts.forEach(r => {
        domVectors[d][r.abstract_pattern] = r.c;
        sumSq += r.c * r.c;
      });
      domNorms[d] = Math.sqrt(sumSq);
    });

    // 4. Compute Genuine Cosine Similarity Matrix based on Pattern Vectors
    const n = domains.length;
    const matrix: number[][] = [];

    for (let i = 0; i < n; i++) {
      const row: number[] = [];
      for (let j = 0; j < n; j++) {
        if (i === j) {
          row.push(1.0);
          continue;
        }

        const d1 = domains[i];
        const d2 = domains[j];
        const norm1 = domNorms[d1] || 1;
        const norm2 = domNorms[d2] || 1;

        let dot = 0;
        patterns.forEach(p => {
          dot += (domVectors[d1][p] || 0) * (domVectors[d2][p] || 0);
        });

        const cosineSim = dot / (norm1 * norm2);
        // Round to 2 decimal places (range 0.10 to 0.95)
        const score = Math.round(cosineSim * 100) / 100;
        row.push(score);
      }
      matrix.push(row);
    }

    // 5. Fetch sample papers and shared top patterns for pair details
    const domainPapers: Record<string, any[]> = {};
    for (const d of domains) {
      domainPapers[d] = db.prepare(`
        SELECT id, title, problem, solution, abstract_pattern, keywords_json, url 
        FROM case_studies 
        WHERE domain = ? 
        LIMIT 10
      `).all(d);
    }

    const pairDetails: Record<string, any> = {};
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const d1 = domains[i];
        const d2 = domains[j];
        const key = `${i}-${j}`;

        // Find shared patterns between d1 and d2 sorted by combined paper frequency
        const sharedPatterns = patterns
          .filter(p => (domVectors[d1][p] || 0) > 0 && (domVectors[d2][p] || 0) > 0)
          .sort((a, b) => ((domVectors[d1][b] || 0) + (domVectors[d2][b] || 0)) - ((domVectors[d1][a] || 0) + (domVectors[d2][a] || 0)));

        const paperA = domainPapers[d1]?.[0] || null;
        const paperB = domainPapers[d2]?.[0] || null;

        const patternList = sharedPatterns.length > 0
          ? sharedPatterns.slice(0, 3).map(p => `Shared Isomorphism: ${p}`)
          : [
              paperA?.abstract_pattern ? `Source Mechanism: ${paperA.abstract_pattern}` : "Complex System Dynamics",
              paperB?.abstract_pattern ? `Target Mechanism: ${paperB.abstract_pattern}` : "Distributed Optimization"
            ];

        pairDetails[key] = {
          domainA: d1,
          domainB: d2,
          paperA: paperA ? { title: paperA.title, url: paperA.url, problem: paperA.problem } : null,
          paperB: paperB ? { title: paperB.title, url: paperB.url, problem: paperB.problem } : null,
          patterns: patternList
        };
      }
    }

    const totalRow: any = db.prepare("SELECT COUNT(*) as count FROM case_studies").get();
    const totalPapersIndexed = totalRow?.count ?? 0;

    return NextResponse.json({
      domains,
      domainCounts,
      matrix,
      pairDetails,
      totalPapersIndexed,
    });
  } catch (error: any) {
    console.error("Matrix API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
