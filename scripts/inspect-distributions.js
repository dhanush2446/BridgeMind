const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.join(__dirname, "..", "src", "data", "analogy_engine.db"));

const count = db.prepare("SELECT COUNT(*) as c FROM case_studies").get();
console.log("Total papers:", count.c);

const patterns = db.prepare("SELECT abstract_pattern, COUNT(*) as c FROM case_studies GROUP BY abstract_pattern ORDER BY c DESC").all();
console.log("\nPattern distribution:");
for (const p of patterns) {
  console.log("  " + p.abstract_pattern + ": " + p.c);
}

const domains = db.prepare("SELECT domain, COUNT(*) as c FROM case_studies GROUP BY domain ORDER BY c DESC").all();
console.log("\nDomain distribution:");
for (const d of domains) {
  console.log("  " + d.domain + ": " + d.c);
}

// Check some misclassified papers
console.log("\n--- Sample papers to check classification ---");
const samples = db.prepare("SELECT domain, title, abstract_pattern FROM case_studies WHERE title LIKE '%neural%' OR title LIKE '%machine learning%' OR title LIKE '%laser%' OR title LIKE '%crypto%' LIMIT 10").all();
for (const s of samples) {
  console.log("  [" + s.domain + "] " + s.title.substring(0, 80) + " | Pattern: " + s.abstract_pattern);
}
