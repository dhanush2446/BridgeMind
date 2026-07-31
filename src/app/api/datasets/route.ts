import { NextRequest, NextResponse } from "next/server";
import { getDatasetStats, getAnalogies, getTaxonomy, searchDatasets } from "@/lib/dataset-loader";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const domain = searchParams.get("domain") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    const stats = getDatasetStats();
    const searchResults = searchDatasets(query, domain, page, limit);

    const analogies = getAnalogies();
    const taxonomy = getTaxonomy();

    return NextResponse.json({
      stats,
      caseStudies: {
        total: searchResults.totalMatches,
        page: searchResults.page,
        limit: searchResults.limit,
        totalPages: searchResults.totalPages,
        searchTimingMs: searchResults.searchTimingMs,
        studies: searchResults.caseStudies
      },
      analogies,
      taxonomy
    });
  } catch (error: any) {
    console.error("GET /api/datasets error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dataset collection.", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[API:Datasets] Dynamic dataset re-harvest requested...");
    const { stdout, stderr } = await execAsync("npx tsx scripts/collect-datasets.ts");
    console.log("[API:Datasets] Harvest output:", stdout);
    if (stderr) console.warn("[API:Datasets] Harvest warnings:", stderr);

    const updatedStats = getDatasetStats();

    return NextResponse.json({
      message: "Dataset harvesting completed successfully.",
      stats: updatedStats,
      log: stdout
    });
  } catch (error: any) {
    console.error("POST /api/datasets error:", error);
    return NextResponse.json(
      { error: "Failed to execute dataset harvest pipeline.", details: error.message },
      { status: 500 }
    );
  }
}
