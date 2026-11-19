"use client";

import { useEffect, useRef, useState } from "react";

type CountUpProps = {
  to: number;
  suffix?: string;
  label: string;
};

/** Counts once on enter. The accessible name stays the final figure. */
export function CountUp({ to, suffix = "", label }: CountUpProps) {
  const ref = useRef<HTMLElement>(null);
  const [text, setText] = useState(label);

  useEffect(() => {
    const el = ref.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduce || !("IntersectionObserver" in window)) {
      setText(label);
      return;
    }

    let frame = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();
        const start = performance.now();
        const duration = 1100;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          const current = Math.round(to * eased);
          const formatted = to >= 1000 ? current.toLocaleString("en-US") : String(current);
          setText(`${formatted}${suffix}`);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.45 }
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [label, suffix, to]);

  return (
    <b ref={ref}>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">{text}</span>
    </b>
  );
}
