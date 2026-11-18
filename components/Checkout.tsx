"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { findPackage, fullPrice, money, packages } from "@/lib/content";

export function Checkout() {
  const params = useSearchParams();
  const initial = findPackage(params.get("package"));
  const initialBilling = params.get("billing") === "monthly" ? "monthly" : "full";
  const [slug, setSlug] = useState(initial.slug);
  const [billing, setBilling] = useState<"full" | "monthly">(initialBilling);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [book, setBook] = useState("");

  const selected = useMemo(() => findPackage(slug), [slug]);
  const disc = fullPrice(selected.price);
  const payNow = billing === "full" ? disc : 99;

  function submit(event: FormEvent) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <>
      <Header />
      <main className="page">
        <div className="wrap">
          <div className="stack" style={{ gap: 8, marginBottom: 28 }}>
            <div className="eyebrow">Checkout</div>
            <h1 style={{ fontSize: "clamp(34px, 4vw, 52px)" }}>Start your book this week.</h1>
            <p style={{ margin: 0, color: "var(--muted)", maxWidth: 640 }}>
              Create your author account. Every package includes your free AI book cover and a kickoff call with Anees.
            </p>
          </div>

          <div className="checkout">
            <form className="panel" onSubmit={submit}>
              <div className="field">
                <label htmlFor="pkg">Package</label>
                <select
                  id="pkg"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSent(false);
                  }}
                >
                  {packages.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.name} — {money(item.price)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="bill">Payment</label>
                <select
                  id="bill"
                  value={billing}
                  onChange={(e) => {
                    setBilling(e.target.value as "full" | "monthly");
                    setSent(false);
                  }}
                >
                  <option value="full">Pay in full and save 13% — {money(disc)}</option>
                  <option value="monthly">Monthly plan — $99 today</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="name">Your name</label>
                <input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Anees would call you…" />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
              </div>
              <div className="field">
                <label htmlFor="book">Book title</label>
                <input id="book" required value={book} onChange={(e) => setBook(e.target.value)} placeholder="The Quiet Founder" />
              </div>
              <button className="btn btn-accent" type="submit">
                Confirm {selected.name} — {money(payNow)}
              </button>
              {sent && (
                <div className="success" role="status">
                  You&apos;re in, {name.split(" ")[0]}. Your {selected.name} spot for <strong>{book}</strong> is reserved
                  {billing === "full" ? ` at ${money(disc)} paid in full` : " with $99 to start"}. Next you&apos;d get your receipt and login by email, then book your kickoff call with Anees and upload the manuscript.
                </div>
              )}
              <Link href="/#packages" style={{ fontWeight: 700, color: "var(--accent)" }}>
                ← Back to packages
              </Link>
            </form>

            <aside className="panel summary">
              <div className="eyebrow">{selected.popular ? "Most popular" : "Your package"}</div>
              <h2>{selected.name}</h2>
              <p style={{ margin: 0, color: "var(--muted)" }}>{selected.tagline}</p>
              <div className="total">{money(payNow)}</div>
              <div className="line">
                <span>{billing === "full" ? "Paid once" : "Due today"}</span>
                <span>{billing === "full" ? `Save ${money(selected.price - disc)}` : `Then monthly until ${money(selected.price)}`}</span>
              </div>
              <ul className="features">
                {selected.features.map((feature) => (
                  <li key={feature}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>
                Secure checkout · Free AI book cover · 100% money-back guarantee
              </p>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
