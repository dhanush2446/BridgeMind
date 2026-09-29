import { NextRequest, NextResponse } from "next/server";
import { analyzeProblem } from "@/lib/analogy-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { problem } = body;

    if (!problem || typeof problem !== "string" || problem.trim().length === 0) {
      return NextResponse.json(
        { error: "Please provide a problem description." },
        { status: 400 }
      );
    }

    const trimmedProblem = problem.trim();

    // Try calling Python ML Backend (FastAPI on port 8000)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const pyResponse = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: trimmedProblem }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (pyResponse.ok) {
        const mlData = await pyResponse.json();
        return NextResponse.json({
          ...mlData,
          mlPowered: true,
          engineInfo: "Python ML Backend (Contrastive Embeddings + FAISS + GIN + IDDW)"
        });
      }
    } catch (pyError) {
      console.warn("[API Route] Python ML Backend offline or timed out. Falling back to TypeScript Engine.");
    }

    // Fallback to local TypeScript Engine
    const analysis = await analyzeProblem(trimmedProblem);
    return NextResponse.json({
      ...analysis,
      analogiesUpdated: true
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "An error occurred during analysis." },
      { status: 500 }
    );
  }
}

