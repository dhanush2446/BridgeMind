const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "..", "src", "data", "analogy_engine.db");
const STATS_PATH = path.join(__dirname, "..", "src", "data", "dataset-stats.json");
const CASE_STUDIES_PATH = path.join(__dirname, "..", "src", "data", "case-studies.json");

const db = new Database(DB_PATH);
const stats = require(STATS_PATH);
const caseStudiesJson = require(CASE_STUDIES_PATH);

const dbCount = db.prepare("SELECT COUNT(*) as c FROM case_studies").get().c;
console.log("=== VERIFICATION SUMMARY ===");
console.log("DB Total Case Studies:", dbCount);
console.log("dataset-stats.json totalCaseStudies:", stats.totalCaseStudies);
console.log("case-studies.json total:", caseStudiesJson.total);
console.log("case-studies.json studies array length:", caseStudiesJson.studies.length);

// Check duplicate titles
const dupTitles = db.prepare("SELECT LOWER(TRIM(title)) as t, COUNT(*) as c FROM case_studies GROUP BY LOWER(TRIM(title)) HAVING c > 1").all();
console.log("Duplicate Titles in DB:", dupTitles.length);

// Check duplicate IDs
const dupIds = db.prepare("SELECT id, COUNT(*) as c FROM case_studies GROUP BY id HAVING c > 1").all();
console.log("Duplicate IDs in DB:", dupIds.length);

// Check duplicate URLs
const dupUrls = db.prepare("SELECT url, COUNT(*) as c FROM case_studies WHERE url IS NOT NULL AND url != '' GROUP BY url HAVING c > 1").all();
console.log("Duplicate URLs in DB:", dupUrls.length);

// Check FTS5
const ftsTest = db.prepare("SELECT COUNT(*) as c FROM case_studies_fts WHERE case_studies_fts MATCH 'neural OR traffic OR quantum'").get();
console.log("FTS5 Search Test Result:", ftsTest.c, "matches");

// Print domain distribution
const dbDomains = db.prepare("SELECT domain, COUNT(*) as c FROM case_studies GROUP BY domain ORDER BY c DESC").all();
console.log("\n=== DOMAIN DISTRIBUTION (" + dbDomains.length + " Domains) ===");
dbDomains.forEach(d => console.log("  [" + d.c + "] " + d.domain));

db.close();
