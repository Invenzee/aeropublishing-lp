"use client";

import { useLayoutEffect, useState, type CSSProperties } from "react";

/**
 * Scroll reveal + off-screen pause for infinite motion.
 * Visibility is stored in React state so later renders keep `is-visible`
 * (an imperative classList add would be wiped on the next setState).
 * Content stays visible until this hook adds `js-reveal` on <html>.
 */
export function useReveal() {
  const [shown, setShown] = useState<ReadonlySet<string>>(() => new Set());
  const [playing, setPlaying] = useState<ReadonlySet<string>>(() => new Set());

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealEls = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const liveEls = Array.from(document.querySelectorAll<HTMLElement>("[data-live]"));
    document.body.classList.add("js-reveal");

    const nextShown = new Set<string>();
    const nextPlaying = new Set<string>();

    const inView = (el: HTMLElement, bottomInset = 0.9) => {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight * bottomInset && rect.bottom > 24;
    };

    if (reduce || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => {
        if (el.dataset.reveal) nextShown.add(el.dataset.reveal);
      });
      liveEls.forEach((el) => {
        if (el.dataset.live) nextPlaying.add(el.dataset.live);
      });
      setShown(nextShown);
      setPlaying(nextPlaying);
      return;
    }

    revealEls.forEach((el) => {
      if (el.dataset.reveal && inView(el)) nextShown.add(el.dataset.reveal);
    });
    liveEls.forEach((el) => {
      if (el.dataset.live && inView(el, 1)) nextPlaying.add(el.dataset.live);
    });
    setShown(nextShown);
    setPlaying(nextPlaying);

    const revealIO = new IntersectionObserver(
      (entries) => {
        const add: string[] = [];
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = (entry.target as HTMLElement).dataset.reveal;
          if (id) add.push(id);
          revealIO.unobserve(entry.target);
        });
        if (!add.length) return;
        setShown((prev) => {
          const next = new Set(prev);
          add.forEach((id) => next.add(id));
          return next;
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    const liveIO = new IntersectionObserver(
      (entries) => {
        setPlaying((prev) => {
          const next = new Set(prev);
          let changed = false;
          entries.forEach((entry) => {
            const id = (entry.target as HTMLElement).dataset.live;
            if (!id) return;
            if (entry.isIntersecting && !next.has(id)) {
              next.add(id);
              changed = true;
            } else if (!entry.isIntersecting && next.has(id)) {
              next.delete(id);
              changed = true;
            }
          });
          return changed ? next : prev;
        });
      },
      { threshold: 0 }
    );

    revealEls.forEach((el) => {
      if (!el.dataset.reveal || nextShown.has(el.dataset.reveal)) return;
      revealIO.observe(el);
    });
    liveEls.forEach((el) => liveIO.observe(el));

    return () => {
      revealIO.disconnect();
      liveIO.disconnect();
    };
  }, []);

  return {
    reveal(id: string) {
      return shown.has(id) ? " is-visible" : "";
    },
    live(id: string) {
      return playing.has(id) ? " is-inview" : "";
    },
  };
}

export function motionDelay(index: number): CSSProperties {
  return { "--i": index } as CSSProperties;
}
