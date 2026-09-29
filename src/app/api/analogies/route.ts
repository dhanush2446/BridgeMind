import { NextRequest, NextResponse } from "next/server";
import { getAnalogies, addOrUpdateMappedAnalogy, type DatasetAnalogy } from "@/lib/dataset-loader";
import { analyzeProblem } from "@/lib/analogy-engine";

export async function GET() {
  try {
    const data = getAnalogies();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("GET /api/analogies error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mapped analogies.", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, problem, solution, sourceDomain, targetDomain, analogyName, sourceSystem } = body;

    const inputQuestion = (question || problem || "").trim();
    const inputSolution = (solution || "").trim();

    if (!inputQuestion) {
      return NextResponse.json(
        { error: "Please provide a question or problem description." },
        { status: 400 }
      );
    }

    // Perform structural analysis to get isomorphic mappings
    const analysis = await analyzeProblem(inputQuestion);
    const topAnalogy = analysis.analogies[0];
    const topBridgeReport = analysis.brokenBridgeReports[0];

    const slug = inputQuestion.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30).replace(/^-|-$/g, "");
    const id = `analogy-${slug || "custom"}-${Date.now().toString().slice(-5)}`;

    const newAnalogy: DatasetAnalogy = {
      id,
      analogyName: analogyName || (topAnalogy ? `${topAnalogy.sourceSystem} → ${inputQuestion.slice(0, 40)}` : `Analogy: ${inputQuestion.slice(0, 40)}`),
      sourceDomain: sourceDomain || (topAnalogy ? topAnalogy.sourceDomain : "Cross-Domain Science"),
      targetDomain: targetDomain || "Applied System",
      sourceSystem: sourceSystem || (topAnalogy ? topAnalogy.sourceSystem : "Structural Model"),
      targetSystem: inputQuestion,
      overallStrength: topAnalogy ? topAnalogy.overallStrength : 0.88,
      patternId: analysis.matchedPattern ? analysis.matchedPattern.id : "distributed-flow-constrained-network",
      inspiringPaper: {
        title: topAnalogy ? topAnalogy.sourceSystem : "User Submitted Problem-Solution Analogy",
        authors: "BridgeMind Analogy Synthesis",
        url: topAnalogy?.url || "https://scholar.google.com"
      },
      mappings: topAnalogy ? topAnalogy.mappings.map(m => ({
        sourceNode: m.sourceNode,
        targetNode: m.targetNode,
        strength: m.strength,
        reason: m.reason
      })) : [
        { sourceNode: "Input Demand", targetNode: "System Load", strength: 0.9, reason: "Isomorphic flow dynamic" }
      ],
      brokenBridges: topBridgeReport ? topBridgeReport.failures.map(f => ({
        breakPoint: f.breakPoint,
        reason: f.reason,
        severity: f.severity
      })) : [],
      transferableSolutions: inputSolution ? [inputSolution, ...(topAnalogy?.transferableSolutions || [])] : (topAnalogy?.transferableSolutions || [analysis.hybridSolution.description]),
      createdAt: new Date().toISOString()
    };

    const updated = addOrUpdateMappedAnalogy(newAnalogy);

    return NextResponse.json({
      message: "Mapped analogy created and persisted successfully.",
      createdAnalogy: newAnalogy,
      analogiesCount: updated.analogiesCount,
      analogies: updated.analogies
    });
  } catch (error: any) {
    console.error("POST /api/analogies error:", error);
    return NextResponse.json(
      { error: "Failed to create mapped analogy.", details: error.message },
      { status: 500 }
    );
  }
}
