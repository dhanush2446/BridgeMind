// Test the new analogy engine with a sample query
const http = require("http");

const testQueries = [
  "Hospital emergency rooms are overcrowded with long wait times during peak hours",
  "Traffic congestion in cities causes pollution and wasted fuel",
  "Fake news spreads faster than real news on social media platforms",
];

async function testQuery(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ problem: query });
    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/api/analyze",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  for (const query of testQueries) {
    console.log("\n" + "=".repeat(80));
    console.log("QUERY: " + query.substring(0, 60));
    console.log("=".repeat(80));

    try {
      const result = await testQuery(query);

      console.log("\nPattern Detected: " + (result.structure?.abstractPattern || "N/A"));
      console.log("Analogies found: " + (result.analogies?.length || 0));

      const domains = new Set();
      if (result.analogies) {
        for (const a of result.analogies) {
          domains.add(a.sourceDomain);
          console.log("\n  [" + a.sourceDomain + "] " + (a.sourceSystem || "").substring(0, 70));
          console.log("    Novelty Score: " + Math.round((a.overallStrength || 0) * 100) + "%");
          console.log("    Explanation: " + (a.explanation || "").substring(0, 150) + "...");
        }
      }
      console.log("\n  DOMAIN DIVERSITY: " + domains.size + " unique domains: " + [...domains].join(", "));
    } catch (e) {
      console.log("  ERROR: " + e.message);
    }
  }
}

main().catch(console.error);
