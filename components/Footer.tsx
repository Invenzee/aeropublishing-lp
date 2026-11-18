import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-row">
          <span>© 2026 Aero Publishing. All rights reserved.</span>
          <span className="footer-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </span>
        </div>
        <p>
          This site is not part of, or endorsed by, Amazon, Meta or any platform referenced. Results described by authors are not typical and depend on each author&apos;s effort, market and book. [Add your own disclaimer here.]
        </p>
      </div>
    </footer>
  );
}
