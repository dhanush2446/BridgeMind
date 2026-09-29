/**
 * Client-safe research paper utility functions.
 * Has 0 Node.js native dependencies (fs, path, better-sqlite3) so it can be safely imported
 * by Next.js React Client Components ("use client").
 */

export function getCleanPaperUrl(title: string, rawUrl?: string): string {
  if (
    rawUrl &&
    rawUrl.trim().length > 0 &&
    !rawUrl.includes("scholar.google.com") &&
    (rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))
  ) {
    return rawUrl.trim();
  }

  let cleanTitle = (title || "")
    .replace(/\s*\(Paper\s*#?\d+\)\s*/gi, "")
    .replace(/Paper\s*#?\d+/gi, "")
    .trim();

  cleanTitle = cleanTitle
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const searchTerms = cleanTitle.split(" ").slice(0, 10).join(" ");

  return `https://scholar.google.com/scholar?q=${encodeURIComponent(searchTerms || title)}`;
}
