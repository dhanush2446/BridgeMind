/**
 * DEPRECATED SYNTHETIC SEEDER - DISABLED.
 * 
 * To populate the database, use scripts/harvest-real-corpus.ts which fetches
 * 100% REAL, peer-reviewed scientific research papers from ArXiv and OpenAlex
 * with zero synthetic templates and 100% real direct URLs.
 */

console.log("==========================================================");
console.log(" NOTICE: Synthetic seeding is disabled.");
console.log(" Running harvest-real-corpus.ts instead to populate real papers...");
console.log("==========================================================\n");

require("child_process").execSync("npx tsx scripts/harvest-real-corpus.ts", { stdio: "inherit" });
