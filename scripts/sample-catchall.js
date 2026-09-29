const db = require("better-sqlite3")("./src/data/analogy_engine.db");
const papers = db.prepare("SELECT title, problem, solution FROM case_studies WHERE abstract_pattern = 'Complex System Dynamics & Optimization' LIMIT 50").all();
papers.forEach((p, i) => {
  console.log(`${i+1}. ${p.title.slice(0,90)}`);
  console.log(`   P: ${(p.problem||"").slice(0,80)}`);
  console.log(`   S: ${(p.solution||"").slice(0,80)}`);
  console.log();
});
