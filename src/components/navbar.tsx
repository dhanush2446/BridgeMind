"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./navbar.module.css";

const PUBLIC_NAV_ITEMS = [
  { path: "/", label: "Home", icon: "⬡" },
  { path: "/datasets", label: "Datasets", icon: "💾" },
  { path: "/about", label: "About", icon: "ℹ" },
];

const V2_NAV_ITEMS = [
  { path: "/studio", label: "Diagram Studio", icon: "✏️", desc: "Interactive canvas for problem flowcharts and bottlenecks." },
  { path: "/simulate", label: "Simulator", icon: "⚙️", desc: "4-stage mechanism transfer & boundary stress test simulator." },
  { path: "/matrix", label: "Domain Matrix", icon: "📊", desc: "10x10 cross-domain isomorphism transferability heatmap." },
  { path: "/patterns", label: "Pattern Library", icon: "📐", desc: "Atlas of recurring abstract problem patterns across sciences." },
  { path: "/knowledge", label: "Knowledge Graph", icon: "🧠", desc: "Self-evolving graph mapping global problem structures." },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showV2Portal, setShowV2Portal] = useState(false);
  const [showV2InNav, setShowV2InNav] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check saved preference or URL query param for V2 nav visibility
  useEffect(() => {
    const saved = localStorage.getItem("bridgemind_v2_unlocked");
    const searchParams = new URLSearchParams(window.location.search);
    if (saved === "true" || searchParams.get("v2") === "true") {
      setShowV2InNav(true);
    }
  }, []);

  // Keyboard shortcut listener: Ctrl+Shift+K or Alt+S or Shift+?
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA");
      if (isInput) return;

      // Ctrl + Shift + K or Alt + S
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "k") || (e.altKey && e.key.toLowerCase() === "s")) {
        e.preventDefault();
        setShowV2Portal((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleV2NavDisplay = () => {
    const nextVal = !showV2InNav;
    setShowV2InNav(nextVal);
    localStorage.setItem("bridgemind_v2_unlocked", String(nextVal));
  };

  // Active items list: public + optional V2 items if unlocked by user preference
  const currentNavItems = showV2InNav
    ? [...PUBLIC_NAV_ITEMS.slice(0, 1), ...V2_NAV_ITEMS, ...PUBLIC_NAV_ITEMS.slice(1)]
    : PUBLIC_NAV_ITEMS;

  // Don't show on analyze page (it has its own top bar)
  if (pathname === "/analyze") return null;

  return (
    <>
      <nav className={`${styles.nav} ${isScrolled ? styles.navScrolled : ""}`}>
        <div className={styles.navInner}>
          {/* Logo on Left */}
          <button
            className={styles.logo}
            onClick={() => router.push("/")}
            onDoubleClick={() => setShowV2Portal(true)}
            title="Analogy Engine"
          >
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

          {/* Right Side Corner: Datasets, About & Analyze CTA */}
          <div className={styles.rightGroup}>
            {showV2InNav && (
              <div className={styles.links}>
                {V2_NAV_ITEMS.map((item) => (
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
            )}

            <div className={styles.rightNavLinks}>
              <button
                className={`${styles.link} ${pathname === "/datasets" ? styles.linkActive : ""}`}
                onClick={() => router.push("/datasets")}
              >
                <span className={styles.linkIcon}>💾</span>
                Datasets
                {pathname === "/datasets" && <span className={styles.activeIndicator} />}
              </button>

              <button
                className={`${styles.link} ${pathname === "/about" ? styles.linkActive : ""}`}
                onClick={() => router.push("/about")}
              >
                <span className={styles.linkIcon}>ℹ</span>
                About
                {pathname === "/about" && <span className={styles.activeIndicator} />}
              </button>
            </div>

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
          <button
            className={`${styles.mobileLink} ${pathname === "/" ? styles.mobileLinkActive : ""}`}
            onClick={() => router.push("/")}
          >
            <span className={styles.mobileLinkIcon}>⬡</span>
            Home
          </button>
          <button
            className={`${styles.mobileLink} ${pathname === "/datasets" ? styles.mobileLinkActive : ""}`}
            onClick={() => router.push("/datasets")}
          >
            <span className={styles.mobileLinkIcon}>💾</span>
            Datasets
          </button>
          <button
            className={`${styles.mobileLink} ${pathname === "/about" ? styles.mobileLinkActive : ""}`}
            onClick={() => router.push("/about")}
          >
            <span className={styles.mobileLinkIcon}>ℹ</span>
            About
          </button>
          {showV2InNav && V2_NAV_ITEMS.map((item) => (
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

      {/* ── V2 Staging Portal Modal (Secret Developer Shortcut Access) ── */}
      {showV2Portal && (
        <div className={styles.portalOverlay} onClick={() => setShowV2Portal(false)}>
          <div className={styles.portalModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.portalHeader}>
              <div className={styles.portalTitleGroup}>
                <span className={styles.portalBadge}>V2 STAGING PORTAL</span>
                <h2>Next Version Features</h2>
                <p>These 5 modules are hidden from public view and staged for the upcoming V2 release.</p>
              </div>
              <button className={styles.portalCloseBtn} onClick={() => setShowV2Portal(false)}>✕</button>
            </div>

            <div className={styles.portalGrid}>
              {V2_NAV_ITEMS.map((item) => (
                <div
                  key={item.path}
                  className={styles.portalCard}
                  onClick={() => { router.push(item.path); setShowV2Portal(false); }}
                >
                  <div className={styles.portalCardHeader}>
                    <span className={styles.portalCardIcon}>{item.icon}</span>
                    <span className={styles.portalCardPath}>{item.path}</span>
                  </div>
                  <h3>{item.label}</h3>
                  <p>{item.desc}</p>
                  <button className={styles.portalLaunchBtn}>Launch Module ↗</button>
                </div>
              ))}
            </div>

            <div className={styles.portalFooter}>
              <div className={styles.portalToggleRow}>
                <label className={styles.portalToggleLabel}>
                  <input
                    type="checkbox"
                    checked={showV2InNav}
                    onChange={toggleV2NavDisplay}
                  />
                  <span>Show V2 links in top navigation bar (for testing)</span>
                </label>
              </div>
              <div className={styles.portalKbdHint}>
                💡 <strong>Shortcut:</strong> Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>K</kbd> or <kbd>Alt</kbd> + <kbd>S</kbd> anywhere to open this portal.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
