import type { Metadata } from "next";
import "./globals.css";
import NavBarWrapper from "@/components/navbar-wrapper";

export const metadata: Metadata = {
  title: "Universal Analogy Engine — A Living Map of Problem Structures",
  description:
    "Discover hidden structural similarities between problems across all domains of human knowledge. Transfer solutions, visualize mappings, and build a growing library of universal problem patterns.",
  keywords: [
    "analogy engine",
    "cross-domain reasoning",
    "structural similarity",
    "problem solving",
    "biomimicry",
    "knowledge graph",
    "innovation",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="bg-grid" />
        <div className="bg-mesh" />
        <div className="bg-mesh-orb" />
        <NavBarWrapper />
        {children}
      </body>
    </html>
  );
}
