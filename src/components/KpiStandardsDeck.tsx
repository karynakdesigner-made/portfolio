"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/* ─────────────────────────────────────────────────────────────
 * KPI Platform - the visualisation-standards deck, page by page.
 *
 * The exported pages of "Creating Consistent KPIs", generated from the
 * Guide folder into public/figma/kpi-standards.
 *
 * This replaced a fanned 3D stack that riffled through the deck. The
 * fan looked good in motion but it dimmed and shrank every page behind
 * the front one, which is the opposite of what a reference deck is for:
 * each page has to be legible on its own. Same carousel as the
 * accessibility guide now - one page at a time, at full opacity.
 *
 * The track is a CSS transform rather than an animation library:
 * transforms re-target from wherever they are, so a fast click during a
 * move can't leave the deck out of step with the dots.
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

/* Kept in sync with public/figma/kpi-standards, which is generated from
   the Guide folder. The deck was renumbered - it now runs 1–15 with no
   gaps, where it previously skipped 11 and ended at 16. */
const PAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const TOTAL = PAGES.length;

export function KpiStandardsDeck() {
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

  /* Loops continuously while on screen. Picking a page restarts the timer
     rather than ending the loop, so the reader can browse and let it carry
     on. Pause is an explicit control. */
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
            {PAGES.map((page, i) => (
              <img
                key={page}
                src={`/figma/kpi-standards/${page}.webp`}
                alt={
                  i === index
                    ? `Visualisation standards deck, page ${page} of ${TOTAL}`
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

        {/* Page label + controls */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[13px] text-[#181212] sm:text-[14px]">
            Page {PAGES[index]} of {TOTAL}
          </span>

          <div className="flex flex-wrap items-center justify-center gap-2">
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
              aria-label="Deck pages"
              onKeyDown={onKeyDown}
              className="flex items-center gap-1 rounded-full border border-[#e0e0e0] bg-white/70 px-2 py-1.5 backdrop-blur"
            >
              {PAGES.map((page, i) => {
                const selected = i === index;
                return (
                  <button
                    key={page}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-label={`Page ${page}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => select(i)}
                    className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181212]"
                    style={{
                      width: selected ? 16 : 5,
                      height: 5,
                      background: selected ? "#181212" : "#c4c4c4",
                      transition: reduce
                        ? "none"
                        : `width 300ms ${EASE}, background 300ms ease`,
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
