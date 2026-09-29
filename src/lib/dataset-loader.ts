import fs from "fs";
import path from "path";
import {
  searchCaseStudiesFTS,
  getDbCaseStudyCount,
  getDbAnalogies,
  getDbAnalogyCount,
  saveOrUpdateDbAnalogy
} from "./db";

/* ══════════════════════════════════════════════════════════════
   DATASET LOADER UTILITY LAYER (TIER B SQLITE + FTS5 INTEGRATION)
   
   Reads, parses, and provides sub-5ms FTS5 full-text search across
   SQLite analogy_engine.db with fallback to src/data/*.json files.
   ══════════════════════════════════════════════════════════════ */

export interface DatasetCaseStudy {
  id: string;
  source: string;
  domain: string;
  title: string;
  problem: string;
  solution?: string;
  abstractPattern: string;
  keywords: string[];
}

export interface DatasetAnalogyMapping {
  sourceNode: string;
  targetNode: string;
  strength: number;
  reason: string;
}

export interface DatasetBrokenBridge {
  breakPoint: string;
  reason: string;
  severity: "high" | "medium" | "low";
}

export interface DatasetAnalogy {
  id: string;
  analogyName?: string;
  sourceDomain: string;
  targetDomain: string;
  sourceSystem: string;
  targetSystem: string;
  overallStrength: number;
  patternId?: string;
  inspiringPaper?: {
    title: string;
    authors: string;
    journal?: string;
    year?: number;
    url?: string;
  };
  mappings: DatasetAnalogyMapping[];
  brokenBridges: DatasetBrokenBridge[];
  transferableSolutions: string[];
  createdAt?: string;
}

export interface DatasetStats {
  lastHarvested: string;
  totalCaseStudies: number;
  totalAnalogies: number;
  totalPatterns: number;
  totalDomains: number;
  domainCounts: Record<string, number>;
  sources: string[];
  pipelineVersion: string;
  tier: string;
}

const DATA_DIR = path.join(process.cwd(), "src", "data");

function readJsonFile<T>(filename: string, fallback: T): T {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`[DatasetLoader] Error reading ${filename}:`, error);
    return fallback;
  }
}

function writeJsonFile(filename: string, data: any): void {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`[DatasetLoader] Error writing ${filename}:`, error);
  }
}

/**
 * Retrieves dataset statistics, dynamically integrating SQLite counts.
 */
export function getDatasetStats(): DatasetStats {
  const jsonStats = readJsonFile<DatasetStats>("dataset-stats.json", {
    lastHarvested: new Date().toISOString(),
    totalCaseStudies: 1040,
    totalAnalogies: 8,
    totalPatterns: 15,
    totalDomains: 17,
    domainCounts: {},
    sources: ["SQLite Embedded FTS5 Database Engine"],
    pipelineVersion: "3.0.0 (Tier B)",
    tier: "Tier B (SQLite + FTS5)"
  });

  try {
    const dbCount = getDbCaseStudyCount();
    if (dbCount > 0) {
      jsonStats.totalCaseStudies = dbCount;
      jsonStats.tier = "Tier B (SQLite + FTS5 Virtual Table)";
    }
    const analogyDbCount = getDbAnalogyCount();
    if (analogyDbCount > 0) {
      jsonStats.totalAnalogies = analogyDbCount;
    }
  } catch (err) {
    // Ignore db fallback
  }

  return jsonStats;
}

/**
 * Returns case studies (queries SQLite database).
 */
export function getCaseStudies(limit = 100): { total: number; domains: string[]; studies: DatasetCaseStudy[] } {
  try {
    const { results } = searchCaseStudiesFTS("", "all", limit);
    if (results && results.length > 0) {
      const domains = Array.from(new Set(results.map((r: any) => r.domain)));
      return {
        total: getDatasetStats().totalCaseStudies,
        domains,
        studies: results
      };
    }
  } catch (err) {
    console.warn("[DatasetLoader] SQLite fallback to JSON:", err);
  }

  return readJsonFile("case-studies.json", {
    total: 0,
    domains: [],
    studies: []
  });
}

/**
 * Returns cross-domain structural analogies from SQLite DB with JSON fallback.
 */
export function getAnalogies(): { analogiesCount: number; analogies: DatasetAnalogy[] } {
  try {
    const dbAnalogies = getDbAnalogies();
    if (dbAnalogies && dbAnalogies.length > 0) {
      return {
        analogiesCount: dbAnalogies.length,
        analogies: dbAnalogies
      };
    }
  } catch (err) {
    console.warn("[DatasetLoader] Error querying analogies from DB, using JSON fallback:", err);
  }

  return readJsonFile("analogies.json", {
    analogiesCount: 0,
    analogies: []
  });
}

/**
 * Add or update a mapped analogy automatically in SQLite database, JSON file, and stats.
 */
export function addOrUpdateMappedAnalogy(analogy: DatasetAnalogy): { analogiesCount: number; analogies: DatasetAnalogy[] } {
  try {
    // 1. Persist to SQLite
    saveOrUpdateDbAnalogy(analogy);

    // 2. Fetch full current dataset from DB
    const allAnalogies = getDbAnalogies();

    // 3. Sync back to analogies.json file
    const analogiesPayload = {
      updatedAt: new Date().toISOString(),
      analogiesCount: allAnalogies.length,
      analogies: allAnalogies
    };
    writeJsonFile("analogies.json", analogiesPayload);

    // 4. Update dataset-stats.json file
    const currentStats = getDatasetStats();
    currentStats.totalAnalogies = allAnalogies.length;
    currentStats.lastHarvested = new Date().toISOString();
    writeJsonFile("dataset-stats.json", currentStats);

    return {
      analogiesCount: allAnalogies.length,
      analogies: allAnalogies
    };
  } catch (err) {
    console.error("[DatasetLoader] Failed to add or update mapped analogy:", err);
    return getAnalogies();
  }
}

/**
 * Returns domain taxonomy dictionary.
 */
export function getTaxonomy(): Record<string, any> {
  const data = readJsonFile<any>("domain-taxonomy.json", { taxonomy: {} });
  return data.taxonomy || {};
}

/**
 * Performs sub-5ms FTS5 Search across SQLite case studies database with server-side pagination.
 */
export function searchDatasets(query: string, domainFilter = "all", page = 1, limit = 50) {
  let searchTimingMs = 0;
  let studies: DatasetCaseStudy[] = [];
  let totalMatches = 0;

  const offset = (page - 1) * limit;

  try {
    const ftsResult = searchCaseStudiesFTS(query, domainFilter, limit, offset);
    studies = ftsResult.results;
    searchTimingMs = ftsResult.queryTimeMs;
    totalMatches = ftsResult.totalMatches;
  } catch (err) {
    const fallbackStudies = getCaseStudies().studies;
    const qLower = query.toLowerCase();
    const allFiltered = fallbackStudies.filter((cs) => {
      const matchesDomain = !domainFilter || domainFilter === "all" || cs.domain.toLowerCase() === domainFilter.toLowerCase();
      const matchesText = !query || 
        cs.title.toLowerCase().includes(qLower) || 
        cs.problem.toLowerCase().includes(qLower);
      return matchesDomain && matchesText;
    });
    totalMatches = allFiltered.length;
    studies = allFiltered.slice(offset, offset + limit);
  }

  const { analogies } = getAnalogies();
  const qLower = query.toLowerCase();

  const filteredAnalogies = analogies.filter((an) => {
    const matchesDomain = !domainFilter || domainFilter === "all" || 
      an.sourceDomain.toLowerCase() === domainFilter.toLowerCase() ||
      an.targetDomain.toLowerCase() === domainFilter.toLowerCase();
    const matchesText = !query ||
      an.sourceSystem.toLowerCase().includes(qLower) ||
      an.targetSystem.toLowerCase().includes(qLower);
    return matchesDomain && matchesText;
  });

  const totalPages = Math.ceil(totalMatches / limit) || 1;

  return {
    caseStudies: studies,
    analogies: filteredAnalogies,
    totalMatches,
    page,
    limit,
    totalPages,
    searchTimingMs,
    engine: "SQLite FTS5 Full-Text Search Engine"
  };
}
