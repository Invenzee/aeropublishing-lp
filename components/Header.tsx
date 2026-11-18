import Link from "next/link";

export function Header() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/">
          <img src="/logo.webp" alt="Aero Publishing" className="logo" />
        </Link>
        <div className="kicker">For Founders, Coaches &amp; Experts</div>
      </div>
    </header>
  );
}
