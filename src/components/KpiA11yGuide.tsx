"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/* ─────────────────────────────────────────────────────────────
 * KPI Platform - the accessibility guide, page by page.
 *
 * The real exported pages of "Creating Accessible Charts". They're
 * ordered by the page numbers printed on the slides, which run
 * opposite to the filenames: 20 is page 4, 17 is page 7.
 *
 * The track is a CSS transform rather than an animation library -
 * transforms re-target from wherever they are, so a fast click
 * during a move can't leave the deck out of step with the dots.
 * ───────────────────────────────────────────────────────────── */

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const ADVANCE_MS = 3800;
const SLIDE_MS = 640;

/* Shared styling for the prev / play-pause / next buttons. */
const CTRL =
  "flex h-7 w-7 items-center justify-center rounded-full border border-[#e0e0e0] " +
  "bg-white/70 text-[#6b6b6b] backdrop-blur transition-colors duration-200 " +
  "hover:text-[#181212] focus-visible:outline focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 focus-visible:outline-[#181212]";

/* Cover, then the summary up front - it frames what the following pages
   go on to detail. */
const PAGES = [
  { file: 23, title: "Creating Accessible Charts" },
  { file: 22, title: "Summary" },
  { file: 21, title: "Creating accessible charts" },
  { file: 20, title: "Colour contrast" },
  { file: 19, title: "Graphical elements colour contrast" },
  { file: 18, title: "Communicate data beyond colour" },
  { file: 17, title: "Alt text" },
] as const;

export function KpiA11yGuide() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(false);
  /* Bumped on every manual move so the interval restarts from that page
     rather than firing part-way through it. */
  const [nonce, setNonce] = useState(0);

  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Loops continuously while on screen. Picking a page no longer ends the
     loop - it just restarts the timer - so the reader can browse and let
     it carry on. Pause is an explicit control. */
  useEffect(() => {
    if (!inView || !playing || reduce) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % PAGES.length),
      ADVANCE_MS,
    );
    return () => window.clearInterval(id);
  }, [inView, playing, reduce, nonce]);

  const select = useCallback((next: number) => {
    setIndex((next + PAGES.length) % PAGES.length);
    setNonce((n) => n + 1);
  }, []);

  const step = useCallback(
    (delta: number) => select(index + delta),
    [index, select],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    step(e.key === "ArrowRight" ? 1 : -1);
  };

  const active = PAGES[index];

  return (
    <div ref={wrapRef} className="w-full">
      <div className="relative flex w-full flex-col gap-5 overflow-hidden rounded-[24px] bg-[#ececec] p-4 sm:gap-6 sm:p-8 lg:p-12">
        {/* Screen */}
        <div
          className="relative w-full overflow-hidden rounded-[12px] border border-[#e0e0e0] bg-white"
          style={{ aspectRatio: "16 / 9" }}
          aria-live="polite"
        >
          {/* Track is one screen wide; each page is a full-width flex item
              overflowing to its right, so translating by 100% per index
              advances exactly one page. */}
          <div
            className="flex h-full w-full"
            style={{
              transform: `translateX(-${index * 100}%)`,
              transition: reduce ? "none" : `transform ${SLIDE_MS}ms ${EASE}`,
            }}
          >
            {PAGES.map((p, i) => (
              <img
                key={p.file}
                src={`/figma/kpi-a11y/${p.file}.webp`}
                alt={
                  i === index
                    ? `Accessibility guide page: ${p.title}`
                    : ""
                }
                /* Not lazy: these sit on a translated track, so they never
                   intersect the viewport and would stay unloaded - the
                   later pages would arrive blank. */
                decoding="async"
                className="h-full w-full shrink-0 object-cover"
              />
            ))}
          </div>
        </div>

        {/* Title + page dots */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[13px] text-[#181212] sm:text-[14px]">
            {active.title}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous page"
              className={CTRL}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="15,5 8,12 15,19" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setPlaying((v) => !v)}
              aria-label={playing ? "Pause" : "Play"}
              aria-pressed={playing}
              className={CTRL}
            >
              {playing ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <polygon points="7,4 20,12 7,20" />
                </svg>
              )}
            </button>

            <div
              role="tablist"
              aria-label="Guide pages"
              onKeyDown={onKeyDown}
              className="flex items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white/70 px-2 py-1.5 backdrop-blur"
            >
              {PAGES.map((p, i) => {
              const selected = i === index;
              return (
                <button
                  key={p.file}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-label={p.title}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(i)}
                  className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181212]"
                  style={{
                    width: selected ? 18 : 6,
                    height: 6,
                    background: selected ? "#181212" : "#c4c4c4",
                    transition: reduce
                      ? "none"
                      : `width 320ms ${EASE}, background 320ms ease`,
                  }}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next page"
              className={CTRL}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="9,5 16,12 9,19" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
