"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { coverFileName, coverGenres } from "@/lib/cover-prompt";
import {
  books,
  coverThemes,
  faqs,
  fullPrice,
  included,
  money,
  packages,
  reasons,
  speeds,
  steps,
} from "@/lib/content";

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

type CoverResponse = {
  image?: unknown;
  error?: unknown;
  used?: unknown;
};

const COVER_PHASES = [
  "Checking your details",
  "Reading the genre",
  "Setting the palette",
  "Thinking through the cover",
  "Composing the layout",
  "Setting the title",
  "Generating the image",
  "Hold on — almost ready",
];

const IDEA_MIN = 200;

export function Landing() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [billing, setBilling] = useState<"full" | "monthly">("full");
  const [open, setOpen] = useState(0);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [idea, setIdea] = useState("");
  const [theme, setTheme] = useState<number | null>(null);
  const [genre, setGenre] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState(0);
  const [used, setUsed] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const coverRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const play = video.play();
    if (play) play.catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cover")
      .then((response) => response.json())
      .then((data: CoverResponse) => {
        if (!cancelled && data?.used === true) setUsed(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      setPhase(0);
      return;
    }
    const timer = window.setInterval(() => {
      setPhase((current) => (current + 1) % COVER_PHASES.length);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [loading]);

  function setRate(rate: number) {
    setSpeed(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
  }

  function unmute() {
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      video.loop = false;
      video.currentTime = 0;
      video.playbackRate = speed || 1;
      const play = video.play();
      if (play) play.catch(() => {});
    }
    setSoundOn(true);
  }

  const picked = theme === null ? undefined : coverThemes[theme];
  const cur = picked ?? { name: "", bg: "#1c2430", fg: "#f6f1e7", mo: "#c4b8a5" };
  const ideaText = idea.trim();
  const displayTitle = title.trim() || "Your Book Title";
  const displayAuthor = author.trim() || "Your Name";
  const coverTag = ideaText
    ? ideaText.length > 34
      ? ideaText.slice(0, 34) + "…"
      : ideaText
    : picked
      ? "A " + picked.name + " cover"
      : "Your cover";
  const full = billing === "full";

  function clearArt() {
    if (used || image) return;
    coverRequest.current?.abort();
    setLoading(false);
    setError("");
  }

  function stepError(index: number) {
    if (index === 0) {
      if (!title.trim()) return "Add the book title to continue.";
      if (!author.trim()) return "Add the author name to continue.";
    }
    if (index === 1 && !genre) return "Choose a genre to continue.";
    if (index === 2 && theme === null) return "Choose a colour theme to continue.";
    if (index === 3 && idea.trim().length < IDEA_MIN) {
      return `Describe the cover in at least ${IDEA_MIN} characters. ${idea.trim().length} so far.`;
    }
    return "";
  }

  function openStep(target: number) {
    for (let index = 0; index < target; index += 1) {
      const message = stepError(index);
      if (message) {
        setStep(index);
        setError(message);
        return;
      }
    }
    setError("");
    setStep(target);
  }

  async function imageFile(src: string, name: string) {
    if (src.startsWith("blob:")) {
      const blob = await fetch(src).then((item) => item.blob());
      return new File([blob], name, { type: blob.type || "image/jpeg" });
    }
    const mime = src.startsWith("data:image/png") ? "image/png" : "image/jpeg";
    const bytes = Uint8Array.from(atob(src.split(",")[1] || ""), (char) => char.charCodeAt(0));
    return new File([bytes], name, { type: mime });
  }

  async function saveCover(src: string | null) {
    if (!src) return;
    const name = coverFileName(title);
    const url = URL.createObjectURL(await imageFile(src, name));
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function shareCover(src: string | null) {
    if (!src) return;
    const name = coverFileName(title);
    const file = await imageFile(src, name);
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: displayTitle });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    await saveCover(src);
  }

  function goNext() {
    const message = stepError(step);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    const next = Math.min(3, step + 1);
    setReached((max) => Math.max(max, next));
    setStep(next);
  }

  function goBack() {
    setError("");
    setStep((current) => Math.max(0, current - 1));
  }

  async function generateCover() {
    if (used) {
      setError("A cover was already created from this connection.");
      return;
    }
    for (let index = 0; index < 4; index += 1) {
      const message = stepError(index);
      if (message) {
        setStep(index);
        setError(message);
        return;
      }
    }
    if (!picked) return;

    coverRequest.current?.abort();
    const controller = new AbortController();
    coverRequest.current = controller;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          theme: picked.name,
          genre,
          idea: idea.trim(),
        }),
      });
      const type = response.headers.get("content-type") || "";
      if (controller.signal.aborted) return;
      if (response.ok && type.startsWith("image/")) {
        const blob = await response.blob();
        if (controller.signal.aborted) return;
        setUsed(true);
        setImage((current) => {
          if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
          return URL.createObjectURL(blob);
        });
        return;
      }
      const data = (await response.json().catch(() => null)) as CoverResponse | null;
      if (controller.signal.aborted) return;
      if (data?.used === true) setUsed(true);
      const message = data && typeof data.error === "string" ? data.error : "The cover could not be created. Try again.";
      throw new Error(message);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "The cover could not be created. Try again.");
    } finally {
      if (coverRequest.current === controller) setLoading(false);
    }
  }

  return (
    <>
      <a className="offer" href="#free-cover">
        Limited offer: Get your book cover designed FREE with our AI Cover Studio →
      </a>
      <Header />

      <section className="hero">
        <div className="wrap-hero hero-inner">
          <div className="eyebrow-soft">For founders, coaches &amp; experts ready to publish</div>
          <h1>
            Get your book professionally published —{" "}
            <span className="hl">on Amazon and 40+ stores worldwide.</span>
          </h1>
          <p className="lede">
            In this short video, our founder Anees Shahnawaz walks you through exactly how we take your manuscript to a published book: formatting, editing, cover design and worldwide distribution.
          </p>

          <div className="video-col">
            <div className="video-frame">
              <video
                ref={videoRef}
                src="/media/founder-video.mp4"
                poster="/media/video-poster.jpg"
                autoPlay
                muted={!soundOn}
                loop={!soundOn}
                playsInline
                controls={soundOn}
                preload="auto"
                aria-label="Founder video: Anees explains how we publish your book"
              />
              {!soundOn && (
                <button type="button" className="unmute" onClick={unmute} aria-label="Play the video with sound">
                  <span className="unmute-pill">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M11 5 6 9H2v6h4l5 4z" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                    Your video has started
                  </span>
                  <span className="unmute-play">
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M11 5 6 9H2v6h4l5 4z" fill="currentColor" />
                      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                      <path d="M19 5a10 10 0 0 1 0 14" />
                    </svg>
                  </span>
                  <span className="unmute-label">Click to listen</span>
                </button>
              )}
            </div>
            <div className="speeds">
              <span>Playback speed</span>
              {speeds.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  className={rate === speed ? "speed on" : "speed"}
                  aria-pressed={rate === speed}
                  onClick={() => setRate(rate)}
                >
                  {rate}×
                </button>
              ))}
            </div>
          </div>

          <a className="btn btn-accent" href="#packages">
            Choose Your Package →
          </a>
          <div className="fine">Plans from $99/month · Save 13% when you pay in full · Free AI book cover</div>
        </div>
      </section>

      <section id="free-cover" className="section paper rule-bottom">
        <div className="wrap stack" style={{ gap: 44 }}>
          <div className="stack center cover-head">
            <div className="badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
                <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
              </svg>
              Free offer · AI Cover Studio
            </div>
            <h2>
              Get your book cover designed <span className="hl">free</span>, in minutes.
            </h2>
            <p className="sub">
              Move through the steps with Next. At the end, one cover is designed from your title, genre, colours and idea.
            </p>
          </div>

          <div className="cover-studio">
            <form className="cover-wizard" onSubmit={(e) => e.preventDefault()}>
              <div className="wizard-progress" aria-label="Cover steps">
                {["Book", "Genre", "Colours", "Idea"].map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    className={i === step ? "on" : i < reached ? "done" : ""}
                    aria-current={i === step ? "step" : undefined}
                    disabled={i > reached}
                    onClick={() => openStep(i)}
                  >
                    <span>{i + 1}</span>
                    {label}
                  </button>
                ))}
              </div>

              <section className="cover-step">
                {step === 0 && (
                  <>
                    <div className="step-label">
                      <div className="num">1</div>
                      <div className="step-copy">
                        <label htmlFor="c-title">The book</label>
                        <span>Title and author, exactly as they should be printed.</span>
                      </div>
                    </div>
                    <input
                      id="c-title"
                      type="text"
                      maxLength={120}
                      placeholder="e.g. The Quiet Founder"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        clearArt();
                      }}
                    />
                    <label className="sub-label" htmlFor="c-author">Author name</label>
                    <input
                      id="c-author"
                      type="text"
                      maxLength={80}
                      placeholder="e.g. Jane Smith"
                      value={author}
                      onChange={(e) => {
                        setAuthor(e.target.value);
                        clearArt();
                      }}
                    />
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="step-label">
                      <div className="num">2</div>
                      <div className="step-copy">
                        <label htmlFor="c-genre">The genre</label>
                        <span>So the type and mood match the shelf it belongs on.</span>
                      </div>
                    </div>
                    <select
                      id="c-genre"
                      value={genre}
                      onChange={(e) => {
                        setGenre(e.target.value);
                        clearArt();
                      }}
                    >
                      <option value="">Choose a genre</option>
                      {coverGenres.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="step-label">
                      <div className="num">3</div>
                      <div className="step-copy">
                        <div id="c-theme-label">The colours</div>
                        <span>The palette the cover stays inside.</span>
                      </div>
                    </div>
                    <div className="theme-grid" role="group" aria-labelledby="c-theme-label">
                      {coverThemes.map((item, i) => (
                        <button
                          key={item.name}
                          type="button"
                          className={i === theme ? "theme-btn on" : "theme-btn"}
                          aria-pressed={i === theme}
                          onClick={() => {
                            setTheme(i);
                            clearArt();
                          }}
                        >
                          <span
                            className="swatch"
                            aria-hidden="true"
                            style={{
                              background: item.bg,
                              boxShadow: `inset 0 0 0 5px ${item.bg}, inset 0 0 0 11px ${item.mo}`,
                            }}
                          />
                          <span>{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="step-label">
                      <div className="num">4</div>
                      <div className="step-copy">
                        <label htmlFor="c-idea">The idea</label>
                        <span>At least 200 characters, so the cover is specific to this book.</span>
                      </div>
                    </div>
                    <textarea
                      id="c-idea"
                      rows={5}
                      maxLength={800}
                      required
                      placeholder="Describe the scene, mood, and what the title should feel like. Be specific — this needs at least 200 characters."
                      value={idea}
                      onChange={(e) => {
                        setIdea(e.target.value);
                        clearArt();
                      }}
                    />
                    <p className={idea.trim().length >= IDEA_MIN ? "idea-count ok" : "idea-count"}>
                      {idea.trim().length} / {IDEA_MIN} characters minimum
                    </p>
                  </>
                )}

                {error && <div className="cover-error" role="alert">{error}</div>}
                <div className="wizard-nav">
                  {step > 0 && (
                    <button type="button" className="btn btn-ghost" onClick={goBack}>Back</button>
                  )}
                  {step < 3 ? (
                    <button type="button" className="btn btn-navy" onClick={goNext}>Next</button>
                  ) : (
                    <button type="button" className="btn btn-navy" onClick={generateCover} disabled={loading || used}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
                      </svg>
                      {used ? "Used" : loading ? "Generating…" : "Generate"}
                    </button>
                  )}
                </div>
                <div className="hint">One cover · No card needed · Included free with every package</div>
              </section>
            </form>

            <div className="studio">
              <div className="preview">
                <div className="preview-label">{image ? "Your cover" : "Live preview"}</div>
                <div
                  className={loading ? "book is-loading" : "book"}
                  style={loading ? undefined : { background: cur.bg, color: cur.fg }}
                >
                  {image && <img className="book-art" src={image} alt={`Cover for ${displayTitle}`} />}
                  {!image && (
                    <>
                      <div className="book-tag">{coverTag}</div>
                      <div className="book-mid">
                        <div
                          className="motif"
                          style={{
                            border: `2px solid ${cur.mo}`,
                            boxShadow: `inset 0 0 0 14px ${cur.bg}, inset 0 0 0 44px ${cur.mo}`,
                          }}
                        />
                        <div className="book-title">{displayTitle}</div>
                      </div>
                      <div className="book-by">{displayAuthor}</div>
                    </>
                  )}
                  {loading && (
                    <div className="book-loading" role="status" aria-live="polite">
                      <span className="cover-orbit" aria-hidden="true" />
                      <p key={phase} className="cover-phase">{COVER_PHASES[phase]}</p>
                    </div>
                  )}
                </div>
                {image && (
                  <div className="cover-actions">
                    <button type="button" className="btn btn-navy" onClick={() => saveCover(image)}>Download</button>
                    <button type="button" className="btn btn-ghost" onClick={() => shareCover(image)}>Share</button>
                  </div>
                )}
                <p className="preview-note">
                  {image
                    ? "AI artwork, not a finished template. Our designers polish this for print."
                    : "A colour sketch only. Design the cover to replace it with one original image."}
                </p>
              </div>
            </div>
          </div>

          <div className="trio">
            <div className="card">
              <span className="t">Instant AI concepts</span>
              <span className="d">One cover built from your own title, genre, colours and idea.</span>
            </div>
            <div className="card">
              <span className="t">Polished by real designers</span>
              <span className="d">Our team refines your favourite into a print-ready front, spine and back cover.</span>
            </div>
            <div className="card">
              <span className="t">Free when you publish with us</span>
              <span className="d">Every package includes your final, print-ready cover at no extra cost.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap-narrow stack problem">
          <h2>You&apos;ve written the book. Now comes the confusing part.</h2>
          <p>You&apos;ve poured months into your manuscript. You&apos;re ready for readers to hold it.</p>
          <p>Then you hit trim sizes, bleed, ISBNs, metadata, KDP settings and a dozen different store dashboards.</p>
          <p className="punch">The problem isn&apos;t your book. It&apos;s the publishing maze.</p>
          <p>Get the formatting or setup wrong and your book looks self-published, or never reaches readers outside Amazon.</p>
          <p className="callout">
            That&apos;s why we built a <strong>simple, fixed-price publishing service</strong>. Pick a package, check out in minutes, and we handle the formatting, editing, cover and distribution for you.
          </p>
        </div>
      </section>

      <section className="section paper rule">
        <div className="wrap stack" style={{ gap: 48 }}>
          <div className="stack center" style={{ gap: 12 }}>
            <div className="eyebrow">How it works</div>
            <h2>Five steps from manuscript to bookshelf</h2>
            <p className="sub" style={{ maxWidth: 620 }}>
              The same process Anees explains in the video. You bring the book, we handle the publishing.
            </p>
          </div>
          <div className="steps-grid">
            {steps.map((step) => (
              <div className="step-card" key={step.n}>
                <div className="step-n">{step.n}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <a className="btn btn-navy" href="#packages">Choose Your Package →</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap stack" style={{ gap: 44 }}>
          <div className="stack center" style={{ gap: 12 }}>
            <div className="eyebrow">What&apos;s included</div>
            <h2>Everything it takes to publish properly</h2>
          </div>
          <div className="include-grid">
            {included.map((item) => (
              <div className="include" key={item.title}>
                <div className="check"><Check /></div>
                <div className="stack" style={{ gap: 4 }}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <div className="tier">{item.tier}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="bonus">
            <div className="eyebrow" style={{ color: "var(--accent-on-dark)" }}>Bonuses</div>
            <div className="bonus-row">
              <div>
                <h3>FREE AI Book Cover Design</h3>
                <p>Create cover concepts in our AI Cover Studio from your title, colours and idea, then our designers make them print-ready.</p>
              </div>
              <div>
                <h3>Kickoff Call with Anees</h3>
                <p>Book it straight after checkout. We go through your manuscript, your goals and your publishing timeline.</p>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <a className="btn btn-accent" href="#packages">Get Started Now →</a>
          </div>
        </div>
      </section>

      <section className="section on-dark">
        <div className="wrap stack" style={{ gap: 44 }}>
          <div className="stack" style={{ gap: 12, maxWidth: 720 }}>
            <div className="eyebrow" style={{ color: "var(--accent-on-dark)" }}>Why authors choose us</div>
            <h2>Most publishing services are complicated. Ours is one simple checkout.</h2>
          </div>
          <div className="reason-grid">
            {reasons.map((reason) => (
              <div className="reason" key={reason.n}>
                <div className="reason-n">{reason.n}</div>
                <div className="stack" style={{ gap: 4 }}>
                  <h3>{reason.title}</h3>
                  <p>{reason.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div>
            <a className="btn btn-accent" href="#packages">Secure Your Spot Now →</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap stack" style={{ gap: 40 }}>
          <div className="stack center" style={{ gap: 12 }}>
            <div className="eyebrow">Our authors&apos; shelf</div>
            <h2>Books we&apos;ve helped bring to life</h2>
            <p className="sub">Children’s books, memoirs, faith and self-help: a few of the 1,400+ titles we’ve published worldwide.</p>
          </div>
          <div className="shelf" aria-label="Books we've published">
            <div className="shelf-track">
              {[0, 1].map((copy) => (
                <div className="shelf-group" key={copy} aria-hidden={copy === 1 || undefined}>
                  {books.map((book) => (
                    <div className="book-item" key={`${copy}-${book.src}`}>
                      <div className="book-slot">
                        <img
                          src={book.src}
                          alt={book.author ? `Cover of ${book.title} by ${book.author}` : `Cover of ${book.title}`}
                        />
                      </div>
                      <div className="meta">
                        <span className="name">{book.title}</span>
                        {book.author && <span className="by">by {book.author}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <a className="btn btn-navy" href="#packages">I&apos;m Ready — Choose My Package →</a>
          </div>
        </div>
      </section>

      <section className="section paper rule">
        <div className="wrap founder">
          <div className="portrait">
            <img src="/media/founder.jpg" alt="Anees, founder" />
          </div>
          <div className="founder-copy">
            <div className="eyebrow">Meet your publisher</div>
            <h2>Anees Shahnawaz</h2>
            <div className="role">Founder &amp; Publisher</div>
            <p>
              For the past 8 years, Anees Shahnawaz has helped first-time authors, coaches and experts turn their manuscripts into professionally published books. He and his team have published more than 1,400 titles, from children’s picture books to memoirs, faith and self-help, for authors who now sell around the world.
            </p>
            <p>
              His belief is simple: publishing your book shouldn’t be confusing, expensive or slow. That’s why every author gets clear, fixed-price packages, a real team behind their book, and a kickoff call with Anees himself.
            </p>
            <div className="stats">
              <div className="stat"><b>1,400+</b><span>Books published</span></div>
              <div className="stat"><b>8</b><span>Years in publishing</span></div>
              <div className="stat"><b>Global</b><span>Our authors sell worldwide</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="packages" className="section">
        <div className="wrap stack" style={{ gap: 40 }}>
          <div className="stack center pkg-head">
            <div className="eyebrow">Choose your package</div>
            <h2>Sign up in 5 minutes. Start your book this week.</h2>
            <p>Pick a package, create your author account and check out. Every package includes your free AI book cover.</p>
            <div className="toggle" role="group" aria-label="Payment option">
              <button type="button" className={full ? "on" : ""} aria-pressed={full} onClick={() => setBilling("full")}>
                Pay in full <span className="pill pill-green">SAVE 13%</span>
              </button>
              <button type="button" className={!full ? "on" : ""} aria-pressed={!full} onClick={() => setBilling("monthly")}>
                Monthly plan <span className="pill pill-navy">FROM $99/MO</span>
              </button>
            </div>
          </div>

          <div className="pkg-grid">
            {packages.map((item) => {
              const disc = fullPrice(item.price);
              const hot = !!item.popular;
              const href = `/checkout?package=${item.slug}&billing=${billing}`;
              return (
                <div className={hot ? "pkg hot" : "pkg"} key={item.slug}>
                  <div className="stack" style={{ gap: 8 }}>
                    {hot && <div className="pop">Most popular</div>}
                    <h3>{item.name}</h3>
                    <div className="tag">{item.tagline}</div>
                  </div>
                  <div className="stack" style={{ gap: 8 }}>
                    <div className="price-row">
                      <span className="price">{full ? money(disc) : "$99"}</span>
                      <span className="unit">{full ? "paid once" : "/month to start"}</span>
                    </div>
                    {full ? (
                      <div className="save-row">
                        <span className="struck">{money(item.price)}</span>
                        <span className="save">You save {money(item.price - disc)}</span>
                      </div>
                    ) : (
                      <div className="note">
                        Start today for $99, then easy monthly payments until {money(item.price)} is paid. Or pay {money(disc)} in full.
                      </div>
                    )}
                  </div>
                  <ul className="features">
                    {item.features.map((feature) => (
                      <li key={feature}>
                        <Check />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link className={hot ? "btn btn-accent btn-block" : "btn btn-navy btn-block"} href={href}>
                    {full ? `Get ${item.name} for ${money(disc)} →` : `Start ${item.name} for $99 →`}
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="note-grid">
            <div className="note green">
              <div className="bubble green">13%</div>
              <div className="stack" style={{ gap: 4 }}>
                <h3>Pay in full and save 13%</h3>
                <p>Standard $260 (save $39) · Essential $434 (save $65) · Professional $782 (save $117).</p>
              </div>
            </div>
            <div className="note plain">
              <div className="bubble navy">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <line x1="8" y1="3" x2="8" y2="7" />
                  <line x1="16" y1="3" x2="16" y2="7" />
                </svg>
              </div>
              <div className="stack" style={{ gap: 4 }}>
                <h3>Start your book for just $99/month</h3>
                <p>Pay $99 today to get your project started, then spread the rest over easy monthly payments. Available on every package.</p>
              </div>
            </div>
          </div>
          <div className="trust">
            <span>Secure checkout</span>
            <span>Free AI book cover on every package</span>
            <span>[Your guarantee]</span>
          </div>
        </div>
      </section>

      <div className="guarantee-wrap">
        <div className="guarantee">
          <svg width="170" height="170" viewBox="0 0 200 200" role="img" aria-label="100% money-back guarantee seal" style={{ flex: "none" }}>
            <polygon points="198.0,100.0 187.2,111.5 194.7,125.4 181.3,133.7 184.9,149.0 169.8,153.6 169.3,169.3 153.6,169.8 149.0,184.9 133.7,181.3 125.4,194.7 111.5,187.2 100.0,198.0 88.5,187.2 74.6,194.7 66.3,181.3 51.0,184.9 46.4,169.8 30.7,169.3 30.2,153.6 15.1,149.0 18.7,133.7 5.3,125.4 12.8,111.5 2.0,100.0 12.8,88.5 5.3,74.6 18.7,66.3 15.1,51.0 30.2,46.4 30.7,30.7 46.4,30.2 51.0,15.1 66.3,18.7 74.6,5.3 88.5,12.8 100.0,2.0 111.5,12.8 125.4,5.3 133.7,18.7 149.0,15.1 153.6,30.2 169.3,30.7 169.8,46.4 184.9,51.0 181.3,66.3 194.7,74.6 187.2,88.5" fill="#E0A33A" />
            <circle cx="100" cy="100" r="80" fill="#0F1B2D" />
            <circle cx="100" cy="100" r="71" fill="none" stroke="#E0A33A" strokeWidth="2" strokeDasharray="3 4" />
            <text x="100" y="68" textAnchor="middle" fill="#E0A33A" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="700" letterSpacing="2">MONEY-BACK</text>
            <text x="100" y="114" textAnchor="middle" fill="#F6F1E7" fontFamily="Fraunces, Georgia, serif" fontSize="44" fontWeight="700">100%</text>
            <rect x="34" y="124" width="132" height="26" rx="3" fill="#E0A33A" />
            <text x="100" y="142" textAnchor="middle" fill="#0F1B2D" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="800" letterSpacing="2.5">GUARANTEE</text>
            <text x="100" y="168" textAnchor="middle" fill="#E0A33A" fontSize="12" letterSpacing="4">★★★</text>
          </svg>
          <div className="guarantee-copy">
            <div className="eyebrow">Zero risk to you</div>
            <h2>Your book, published right — or your money back.</h2>
            <p>After 1,400+ books, we know our process works. If we don&apos;t deliver everything included in your package, you get a full refund. No awkward conversations, no fine print games.</p>
            <p className="small">[Confirm your refund conditions and time window, e.g. requests within 30 days of purchase.]</p>
            <div className="chips">
              <span className="chip">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2F6B3A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>
                100% Money-Back Guarantee
              </span>
              <span className="chip">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2F6B3A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                Secure SSL Checkout
              </span>
              <span className="chip">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2F6B3A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                1,400+ Books Published
              </span>
            </div>
            <div style={{ marginTop: 6 }}>
              <a className="btn btn-navy" href="#packages" style={{ minHeight: 52, padding: "0 28px" }}>Get Started Risk-Free →</a>
            </div>
          </div>
        </div>
      </div>

      <section className="section paper rule-top">
        <div className="wrap-faq stack" style={{ gap: 28 }}>
          <h2 style={{ textAlign: "center" }}>Frequently asked questions</h2>
          <div className="faq-list">
            {faqs.map((item, i) => {
              const isOpen = open === i;
              return (
                <div className="faq" key={item.q}>
                  <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : i)}>
                    <span>{item.q}</span>
                    <span className="icon" aria-hidden="true">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && <p>{item.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="final">
        <div className="final-inner">
          <h2>
            Your book deserves readers. <span className="hl">Let&apos;s put it everywhere they shop.</span>
          </h2>
          <p>
            Start from just $99/month, or pay in full and save 13%. Pick a package, check out in minutes and book your kickoff call with Anees. Your cover design is on us.
          </p>
          <a className="btn btn-accent btn-lg" href="#packages">Choose Your Package →</a>
        </div>
      </section>

      <Footer />
    </>
  );
}
