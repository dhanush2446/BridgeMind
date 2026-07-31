import { NextResponse } from "next/server";
import { getAllPatterns, searchPatterns } from "@/lib/analogy-engine";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (query) {
    const results = searchPatterns(query);
    return NextResponse.json(results);
  }

  const patterns = getAllPatterns();
  return NextResponse.json(patterns);
}
