"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./navbar.module.css";

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: "⬡" },
  { path: "/studio", label: "Diagram Studio", icon: "✏️" },
  { path: "/simulate", label: "Simulator", icon: "⚙️" },
  { path: "/matrix", label: "Domain Matrix", icon: "📊" },
  { path: "/patterns", label: "Pattern Library", icon: "📐" },
  { path: "/knowledge", label: "Knowledge Graph", icon: "🧠" },
  { path: "/datasets", label: "Datasets", icon: "💾" },
  { path: "/about", label: "About", icon: "ℹ" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Don't show on analyze page (it has its own top bar)
  if (pathname === "/analyze") return null;

  return (
    <nav className={`${styles.nav} ${isScrolled ? styles.navScrolled : ""}`}>
      <div className={styles.navInner}>
        {/* Logo */}
        <button className={styles.logo} onClick={() => router.push("/")}>
          <div className={styles.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="4" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="20" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="4" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="20" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
              <line x1="9.5" y1="10.5" x2="5.5" y2="7.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
              <line x1="14.5" y1="10.5" x2="18.5" y2="7.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
              <line x1="9.5" y1="13.5" x2="5.5" y2="16.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
              <line x1="14.5" y1="13.5" x2="18.5" y2="16.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            </svg>
          </div>
          <span className={styles.logoText}>Analogy Engine</span>
        </button>

        {/* Desktop Links */}
        <div className={styles.links}>
          {NAV_ITEMS.filter((item) => item.path !== "/").map((item) => (
            <button
              key={item.path}
              className={`${styles.link} ${pathname === item.path ? styles.linkActive : ""}`}
              onClick={() => router.push(item.path)}
            >
              <span className={styles.linkIcon}>{item.icon}</span>
              {item.label}
              {pathname === item.path && <span className={styles.activeIndicator} />}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className={styles.cta}>
          {pathname !== "/" && (
            <button
              className={styles.analyzeBtn}
              onClick={() => router.push("/")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              Analyze Problem
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className={`${styles.hamburger} ${isMobileOpen ? styles.hamburgerOpen : ""}`}
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle navigation menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${isMobileOpen ? styles.mobileMenuOpen : ""}`}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            className={`${styles.mobileLink} ${pathname === item.path ? styles.mobileLinkActive : ""}`}
            onClick={() => router.push(item.path)}
          >
            <span className={styles.mobileLinkIcon}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
