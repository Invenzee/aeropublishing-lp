"use client";

/**
 * Edits:
 * - Client component so a scroll listener can add `is-scrolled`.
 * - `logo-link` on the home link for the gold underline.
 * Existing classes `topbar`, `topbar-inner`, `logo`, and `kicker` are unchanged.
 */

import Link from "next/link";
import { useEffect, useState } from "react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={scrolled ? "topbar is-scrolled" : "topbar"}>
      <div className="topbar-inner">
        <Link href="/" className="logo-link">
          <img src="/logo.webp" alt="Aero Publishing" className="logo" />
        </Link>
        <div className="kicker">For Founders, Coaches &amp; Experts</div>
      </div>
    </header>
  );
}
