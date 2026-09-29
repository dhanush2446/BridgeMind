const db = require('better-sqlite3')('./src/data/analogy_engine.db');

// 1. List tables
const tables = db.prepare("SELECT name, type FROM sqlite_master WHERE type IN ('table','view')").all();
console.log("=== TABLES ===");
tables.forEach(t => {
  try {
    const count = db.prepare(`SELECT COUNT(*) as c FROM "${t.name}"`).get();
    console.log(`  ${t.name} (${count.c} rows)`);
  } catch(e) {
    console.log(`  ${t.name} (error reading: ${e.message})`);
  }
});

// 2. case_studies columns
const cols = db.prepare("PRAGMA table_info(case_studies)").all();
console.log("\n=== CASE_STUDIES COLUMNS ===");
console.log(cols.map(c => c.name).join(', '));

// 3. Domain → Pattern cross-reference
console.log("\n=== DOMAIN × PATTERN CROSS-REFERENCE ===");
const crossRef = db.prepare(`
  SELECT domain, abstract_pattern, COUNT(*) as count 
  FROM case_studies 
  WHERE domain IS NOT NULL AND abstract_pattern IS NOT NULL
  GROUP BY domain, abstract_pattern 
  ORDER BY domain, count DESC
`).all();
crossRef.forEach(r => {
  console.log(`  ${r.domain} | ${r.abstract_pattern} | ${r.count}`);
});

// 4. Sample paper from each domain
console.log("\n=== ALL DOMAINS + SAMPLE PAPER ===");
const domains = db.prepare("SELECT DISTINCT domain FROM case_studies WHERE domain IS NOT NULL ORDER BY domain").all();
domains.forEach(d => {
  const sample = db.prepare("SELECT title, abstract_pattern FROM case_studies WHERE domain = ? LIMIT 1").get(d.domain);
  const count = db.prepare("SELECT COUNT(*) as c FROM case_studies WHERE domain = ?").get(d.domain);
  console.log(`  [${count.c}] ${d.domain}: "${sample?.title}" [${sample?.abstract_pattern}]`);
});
