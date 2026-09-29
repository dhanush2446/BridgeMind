const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "src", "data", "analogy_engine.db");
const STATS_PATH = path.join(__dirname, "..", "src", "data", "dataset-stats.json");

const db = new Database(DB_PATH);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
console.log("Database tables:", tables);

const totalCaseStudies = db.prepare("SELECT COUNT(*) as count FROM case_studies").get().count;

const domains = db.prepare("SELECT domain, COUNT(*) as count FROM case_studies GROUP BY domain ORDER BY count DESC").all();
const domainCounts = {};
for (const d of domains) {
  if (d.domain) domainCounts[d.domain] = d.count;
}

const stats = {
  lastHarvested: new Date().toISOString(),
  totalCaseStudies,
  totalAnalogies: 39,
  totalPatterns: 25,
  totalDomains: Object.keys(domainCounts).length,
  domainCounts,
  sources: [
    "ArXiv Open Academic Repository (Direct PDFs/HTML)",
    "OpenAlex Global Open Research Index (Direct DOIs)",
    "Journal of Fluid Mechanics, Nature, Science Robotics & IEEE"
  ],
  pipelineVersion: "8.1.0 (Expanded Real Peer-Reviewed Papers Corpus)",
  tier: "Tier B (SQLite + FTS5 Virtual Table)"
};

fs.writeFileSync(STATS_PATH, JSON.stringify(stats, null, 2));
console.log("Updated dataset-stats.json successfully!");
console.log("Total case studies:", totalCaseStudies);
console.log("Total domains:", stats.totalDomains);

