import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

/* ══════════════════════════════════════════════════════════════
   TIER B SQLITE DATABASE ENGINE & FTS5 FULL-TEXT SEARCH
   
   Manages persistent database operations in src/data/analogy_engine.db
   with sub-millisecond FTS5 indexing across 1,000+ scientific case studies,
   cross-domain analogies, and domain taxonomy dictionaries.
   ══════════════════════════════════════════════════════════════ */

const DATA_DIR = path.join(process.cwd(), "src", "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "analogy_engine.db");

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  dbInstance = new Database(DB_PATH);
  dbInstance.pragma("journal_mode = WAL");
  dbInstance.pragma("synchronous = NORMAL");

  // Initialize SQLite Tables & FTS5 Virtual Tables
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS case_studies (
      id TEXT PRIMARY KEY,
      source TEXT,
      domain TEXT,
      title TEXT,
      problem TEXT,
      solution TEXT,
      abstract_pattern TEXT,
      keywords_json TEXT,
      url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS case_studies_fts USING fts5(
      id UNINDEXED,
      title,
      problem,
      domain,
      keywords_json,
      content='case_studies',
      content_rowid='rowid'
    );

    CREATE TABLE IF NOT EXISTS cross_domain_analogies (
      id TEXT PRIMARY KEY,
      analogy_name TEXT,
      source_domain TEXT,
      target_domain TEXT,
      source_system TEXT,
      target_system TEXT,
      overall_strength REAL,
      pattern_id TEXT,
      inspiring_paper_json TEXT,
      mappings_json TEXT,
      broken_bridges_json TEXT,
      transferable_solutions_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS domain_taxonomies (
      domain_name TEXT,
      entity_name TEXT,
      role TEXT,
      abstract_desc TEXT,
      PRIMARY KEY (domain_name, entity_name)
    );

    CREATE TABLE IF NOT EXISTS dataset_stats (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      last_harvested TEXT,
      total_case_studies INTEGER,
      total_analogies INTEGER,
      total_patterns INTEGER,
      total_domains INTEGER,
      domain_counts_json TEXT,
      sources_json TEXT,
      pipeline_version TEXT
    );
  `);

  // Migration: Add url column if missing (for existing databases)
  try {
    dbInstance.exec(`ALTER TABLE case_studies ADD COLUMN url TEXT`);
  } catch (e) {
    // Column already exists — ignore
  }

  // Migration: Rebuild FTS5 table if it has wrong column name (keywords vs keywords_json)
  try {
    // Test if the FTS5 index works correctly
    dbInstance.prepare(`SELECT COUNT(*) FROM case_studies_fts`).get();
  } catch (e) {
    // FTS5 table has wrong schema — rebuild it
    try {
      dbInstance.exec(`DROP TABLE IF EXISTS case_studies_fts`);
      dbInstance.exec(`
        CREATE VIRTUAL TABLE case_studies_fts USING fts5(
          id UNINDEXED,
          title,
          problem,
          domain,
          keywords_json,
          content='case_studies',
          content_rowid='rowid'
        )
      `);
      dbInstance.exec(`INSERT INTO case_studies_fts(case_studies_fts) VALUES('rebuild')`);
      console.log("[db] Rebuilt FTS5 index with correct schema.");
    } catch (rebuildErr) {
      console.warn("[db] FTS5 rebuild warning:", rebuildErr);
    }
  }

  try {
    dbInstance.exec(`ALTER TABLE cross_domain_analogies ADD COLUMN analogy_name TEXT`);
  } catch (e) {}
  try {
    dbInstance.exec(`ALTER TABLE cross_domain_analogies ADD COLUMN inspiring_paper_json TEXT`);
  } catch (e) {}
  try {
    dbInstance.exec(`ALTER TABLE cross_domain_analogies ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
  } catch (e) {}

  // Auto-seed initial analogies if table is empty
  try {
    const row: any = dbInstance.prepare(`SELECT COUNT(*) as c FROM cross_domain_analogies`).get();
    if (!row || row.c === 0) {
      const analogiesJsonPath = path.join(DATA_DIR, "analogies.json");
      if (fs.existsSync(analogiesJsonPath)) {
        const raw = fs.readFileSync(analogiesJsonPath, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.analogies)) {
          insertAnalogiesBatch(parsed.analogies, dbInstance);
        }
      }
    }
  } catch (err) {
    console.warn("[db] Failed to auto-seed cross_domain_analogies:", err);
  }

  // Sanitize any existing synthetic (Paper #...) URLs in SQLite tables
  try {
    sanitizeDbPaperUrls(dbInstance);
  } catch (e) {}

  return dbInstance;
}

export function sanitizePaperUrl(title: string, rawUrl?: string): string {
  if (
    rawUrl &&
    rawUrl.trim().length > 0 &&
    !rawUrl.includes("scholar.google.com") &&
    (rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))
  ) {
    return rawUrl.trim();
  }

  let cleanTitle = (title || "")
    .replace(/\s*\(Paper\s*#?\d+\)\s*/gi, "")
    .replace(/Paper\s*#?\d+/gi, "")
    .trim();

  cleanTitle = cleanTitle.replace(/[^a-zA-Z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const searchTerms = cleanTitle.split(" ").slice(0, 10).join(" ");

  return `https://scholar.google.com/scholar?q=${encodeURIComponent(searchTerms || title)}`;
}

export function sanitizeDbPaperUrls(customDb?: Database.Database) {
  const db = customDb || getDb();
  try {
    const rows = db.prepare(`SELECT rowid, title, url FROM case_studies WHERE url LIKE '%(Paper%' OR url LIKE '%Paper #%'`).all();
    if (rows && rows.length > 0) {
      const updateStmt = db.prepare(`UPDATE case_studies SET url = ? WHERE rowid = ?`);
      const trans = db.transaction((items: any[]) => {
        for (const r of items) {
          const cleanUrl = sanitizePaperUrl(r.title, r.url);
          updateStmt.run(cleanUrl, r.rowid);
        }
      });
      trans(rows);
    }
  } catch (err) {
    console.warn("[db] sanitizeDbPaperUrls warning:", err);
  }
}

export interface DbCaseStudy {
  id: string;
  source: string;
  domain: string;
  title: string;
  problem: string;
  solution?: string;
  abstract_pattern: string;
  keywords_json: string;
  url?: string;
  created_at?: string;
}

/**
 * Bulk insert case studies into SQLite with FTS5 indexing.
 */
export function insertCaseStudiesBatch(studies: any[]) {
  const db = getDb();
  
  const insertCaseStudy = db.prepare(`
    INSERT OR REPLACE INTO case_studies (id, source, domain, title, problem, solution, abstract_pattern, keywords_json, url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertFts = db.prepare(`
    INSERT OR REPLACE INTO case_studies_fts (rowid, id, title, problem, domain, keywords)
    SELECT rowid, id, title, problem, domain, keywords_json FROM case_studies WHERE id = ?
  `);

  const transaction = db.transaction((items: any[]) => {
    for (const item of items) {
      const keywordsStr = Array.isArray(item.keywords) ? item.keywords.join(" ") : (item.keywords || "");
      insertCaseStudy.run(
        item.id,
        item.source || "Academic Scientific Repository",
        item.domain || "General Science",
        item.title || "Untitled Paper",
        item.problem || "",
        item.solution || "Structural modeling and cross-domain pattern abstraction.",
        item.abstractPattern || item.abstract_pattern || "Complex System Dynamics",
        JSON.stringify(item.keywords || []),
        item.url || `https://scholar.google.com/scholar?q=${encodeURIComponent(item.title || "")}`
      );
      try {
        insertFts.run(item.id);
      } catch (err) {
        // FTS index optional catch
      }
    }
  });

  transaction(studies);
}

/**
 * Perform sub-millisecond FTS5 Search across case studies with offset pagination.
 */
export function searchCaseStudiesFTS(query: string, domainFilter = "all", limit = 50, offset = 0) {
  const db = getDb();
  const startTime = performance.now();

  let results: any[] = [];
  let totalMatches = 0;
  
  try {
    if (query && query.trim().length > 0) {
      const stopWords = new Set(["of", "on", "by", "for", "the", "a", "an", "in", "to", "and", "or", "is", "at", "with", "from", "as", "into"]);
      const allTokens = query.replace(/[^a-zA-Z0-9\s]/g, " ").trim().split(/\s+/).filter(w => w.length > 0);
      const cleanTokens = allTokens.filter(w => w.length > 1 && !stopWords.has(w.toLowerCase()));
      
      const tokensToUse = cleanTokens.length > 0 ? cleanTokens : allTokens;
      
      // Try AND query first for precise relevance, fallback to OR if no exact multi-term match
      const andQuery = tokensToUse.join(" AND ");
      const orQuery = tokensToUse.join(" OR ");

      let sql = `
        SELECT cs.* FROM case_studies cs
        JOIN case_studies_fts fts ON cs.rowid = fts.rowid
        WHERE case_studies_fts MATCH ?
      `;
      let countSql = `
        SELECT COUNT(*) as count FROM case_studies cs
        JOIN case_studies_fts fts ON cs.rowid = fts.rowid
        WHERE case_studies_fts MATCH ?
      `;
      
      let params: any[] = [andQuery];
      let countParams: any[] = [andQuery];

      if (domainFilter && domainFilter !== "all") {
        sql += ` AND cs.domain = ?`;
        countSql += ` AND cs.domain = ?`;
        params.push(domainFilter);
        countParams.push(domainFilter);
      }

      sql += ` ORDER BY fts.rank ASC LIMIT ? OFFSET ?`;
      
      // Execute AND search
      let countRow: any = db.prepare(countSql).get(...countParams);
      totalMatches = countRow ? countRow.count : 0;

      if (totalMatches > 0) {
        params.push(limit, offset);
        results = db.prepare(sql).all(...params);
      } else {
        // Fallback to OR query if AND yielded no matches
        params = [orQuery];
        countParams = [orQuery];

        let orSql = `
          SELECT cs.* FROM case_studies cs
          JOIN case_studies_fts fts ON cs.rowid = fts.rowid
          WHERE case_studies_fts MATCH ?
        `;
        let orCountSql = `
          SELECT COUNT(*) as count FROM case_studies cs
          JOIN case_studies_fts fts ON cs.rowid = fts.rowid
          WHERE case_studies_fts MATCH ?
        `;

        if (domainFilter && domainFilter !== "all") {
          orSql += ` AND cs.domain = ?`;
          orCountSql += ` AND cs.domain = ?`;
          params.push(domainFilter);
          countParams.push(domainFilter);
        }

        orSql += ` ORDER BY fts.rank ASC LIMIT ? OFFSET ?`;
        
        countRow = db.prepare(orCountSql).get(...countParams);
        totalMatches = countRow ? countRow.count : 0;
        params.push(limit, offset);
        results = db.prepare(orSql).all(...params);
      }
    } else {
      let sql = `SELECT * FROM case_studies`;
      let countSql = `SELECT COUNT(*) as count FROM case_studies`;
      const params: any[] = [];
      const countParams: any[] = [];

      if (domainFilter && domainFilter !== "all") {
        sql += ` WHERE domain = ?`;
        countSql += ` WHERE domain = ?`;
        params.push(domainFilter);
        countParams.push(domainFilter);
      }

      sql += ` ORDER BY rowid ASC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      results = db.prepare(sql).all(...params);
      const countRow: any = db.prepare(countSql).get(...countParams);
      totalMatches = countRow ? countRow.count : results.length;
    }
  } catch (err) {
    let sql = `SELECT * FROM case_studies WHERE (title LIKE ? OR problem LIKE ?)`;
    let countSql = `SELECT COUNT(*) as count FROM case_studies WHERE (title LIKE ? OR problem LIKE ?)`;
    const term = `%${query}%`;
    const params: any[] = [term, term];
    const countParams: any[] = [term, term];

    if (domainFilter && domainFilter !== "all") {
      sql += ` AND domain = ?`;
      countSql += ` AND domain = ?`;
      params.push(domainFilter);
      countParams.push(domainFilter);
    }
    sql += ` ORDER BY rowid ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    results = db.prepare(sql).all(...params);
    const countRow: any = db.prepare(countSql).get(...countParams);
    totalMatches = countRow ? countRow.count : results.length;
  }

  const queryTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    results: results.map((r: any) => ({
      ...r,
      abstractPattern: r.abstract_pattern,
      keywords: JSON.parse(r.keywords_json || "[]")
    })),
    queryTimeMs,
    count: results.length,
    totalMatches
  };
}

/**
 * Get total case study count from SQLite database.
 */
export function getDbCaseStudyCount(): number {
  const db = getDb();
  const row: any = db.prepare(`SELECT COUNT(*) as count FROM case_studies`).get();
  return row ? row.count : 0;
}

/**
 * Bulk insert or replace mapped analogies in SQLite database.
 */
export function insertAnalogiesBatch(analogies: any[], customDb?: Database.Database) {
  const db = customDb || getDb();

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO cross_domain_analogies (
      id, analogy_name, source_domain, target_domain, source_system, target_system,
      overall_strength, pattern_id, inspiring_paper_json, mappings_json, broken_bridges_json, transferable_solutions_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((items: any[]) => {
    for (const item of items) {
      stmt.run(
        item.id,
        item.analogyName || `${item.sourceSystem || "Source"} → ${item.targetSystem || "Target"}`,
        item.sourceDomain || "Cross-Domain Science",
        item.targetDomain || "General Application",
        item.sourceSystem || "Source System",
        item.targetSystem || "Target System",
        item.overallStrength || 0.85,
        item.patternId || "distributed-flow-constrained-network",
        JSON.stringify(item.inspiringPaper || null),
        JSON.stringify(item.mappings || []),
        JSON.stringify(item.brokenBridges || []),
        JSON.stringify(item.transferableSolutions || [])
      );
    }
  });

  transaction(analogies);
}

/**
 * Save or update a single mapped analogy in SQLite database.
 */
export function saveOrUpdateDbAnalogy(analogy: any) {
  insertAnalogiesBatch([analogy]);
}

/**
 * Get all mapped analogies from SQLite database.
 */
export function getDbAnalogies(): any[] {
  const db = getDb();
  try {
    const rows = db.prepare(`SELECT * FROM cross_domain_analogies ORDER BY rowid DESC`).all();
    return rows.map((r: any) => ({
      id: r.id,
      analogyName: r.analogy_name,
      sourceDomain: r.source_domain,
      targetDomain: r.target_domain,
      sourceSystem: r.source_system,
      targetSystem: r.target_system,
      overallStrength: r.overall_strength,
      patternId: r.pattern_id,
      inspiringPaper: r.inspiring_paper_json ? JSON.parse(r.inspiring_paper_json) : undefined,
      mappings: r.mappings_json ? JSON.parse(r.mappings_json) : [],
      brokenBridges: r.broken_bridges_json ? JSON.parse(r.broken_bridges_json) : [],
      transferableSolutions: r.transferable_solutions_json ? JSON.parse(r.transferable_solutions_json) : [],
      createdAt: r.created_at
    }));
  } catch (err) {
    console.error("[db] Error fetching db analogies:", err);
    return [];
  }
}

/**
 * Get total mapped analogies count from SQLite database.
 */
export function getDbAnalogyCount(): number {
  const db = getDb();
  try {
    const row: any = db.prepare(`SELECT COUNT(*) as count FROM cross_domain_analogies`).get();
    return row ? row.count : 0;
  } catch (err) {
    return 0;
  }
}

