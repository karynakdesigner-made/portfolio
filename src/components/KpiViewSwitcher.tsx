"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/* ─────────────────────────────────────────────────────────────
 * KPI Platform - programme-view switcher.
 *
 * One dashboard, two programme views. The interface itself holds
 * still - sidebar, page title, Year/Team filters, card chrome - and
 * only the tab indicator and the charts change. Nothing about this is
 * a screenshot swap: the artboard JPG supplies the static chrome, the
 * charts are the real Figma SVG exports positioned over it, and the
 * tab control is live HTML.
 *
 * When the view changes, each chart's bars grow back up from the
 * baseline, staggered left to right, so the data redraws in place.
 *
 * Bars carry their own `transform="translate(...)"` attribute, so a CSS
 * transform on the rect would replace it and fling the bar to the
 * origin. Each bar is therefore wrapped in a plain <g> at runtime and
 * the wrapper is what animates.
 * ───────────────────────────────────────────────────────────── */

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/* Card grid in Figma's own units: two 600-wide columns with a 24 gap. */
const GRID = { w: 1224, h: 756 };

/* Placement of each export's *canvas* inside the grid. pp3-3 and pp3-4
   export 1px wider on the left than their card (their white card rect is
   at x=1), so their canvases sit 1 unit left of the card slot. */
type Chart = { file: string; x: number; y: number; w: number; h: number };

const VIEWS: Record<"PP3" | "RTY", Chart[]> = {
  PP3: [
    { file: "pp3-1", x: 0, y: 0, w: 600, h: 378 },
    { file: "pp3-2", x: 624, y: 0, w: 600, h: 376 },
    { file: "pp3-3", x: -1, y: 402, w: 641, h: 354 },
    { file: "pp3-4", x: 623, y: 402, w: 633, h: 354 },
  ],
  RTY: [
    { file: "rty-1", x: 0, y: 0, w: 600, h: 376 },
    { file: "rty-2", x: 624, y: 0, w: 600, h: 376 },
    { file: "rty-3", x: 0, y: 400, w: 1224, h: 348 },
  ],
};

const IDS = ["PP3", "RTY"] as const;
type ViewId = (typeof IDS)[number];

/* Regions on the artboard, as percentages of the export. The tab strip is
   sampled from the artboard's own pixels: the white tab runs 77.97→87.97%
   and the grey one 88.01→97.97%, top edge at 3.27%, bottom at 7.36%. */
const CONTENT = { left: 22.0, top: 17.6, width: 76.5, height: 77.5 };
const TABS = { left: 77.97, top: 3.27, width: 20.0, height: 4.09 };

/* Straight off the artboard rather than eyeballed. */
const TAB_INACTIVE_BG = "#e0e0e0";
const TAB_UNDERLINE = "#000000";

/* Everything in the control is sized in cqw - 1% of the screen's own width
   - so it stays proportional to the dashboard at any column width. Fixed
   px kept the labels at full size while the artboard shrank. */
const TAB_FONT = "0.86cqw";
const TAB_UNDERLINE_H = "0.12cqw";

const LOOP_MS = 5000;

/* Shared styling for the prev / play-pause / next buttons. */
const CTRL =
  "flex h-7 w-7 items-center justify-center rounded-full border border-[#e0e0e0] " +
  "bg-white/70 text-[#6b6b6b] backdrop-blur transition-colors duration-200 " +
  "hover:text-[#181212] focus-visible:outline focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 focus-visible:outline-[#181212]";

/* Module-level cache so a replay or a second mount doesn't refetch. */
const svgCache = new Map<string, string>();

async function loadSvg(file: string) {
  const hit = svgCache.get(file);
  if (hit) return hit;
  const res = await fetch(`/figma/kpi-views/${file}.svg`);
  const text = await res.text();
  svgCache.set(file, text);
  return text;
}

/* Grow every bar back from the baseline. Bars are the only rects with a
   hex fill (card and label backgrounds are `fill="white"`), and the real
   bars all share a bottom edge - which is what separates them from the
   value chips on the line charts. */
function animateBars(host: HTMLElement, reduce: boolean) {
  const svg = host.querySelector("svg");
  if (!svg) return;

  const rects = Array.from(
    svg.querySelectorAll<SVGRectElement>('rect[fill^="#"]'),
  );
  if (!rects.length) return;

  const boxes = rects.map((r) => {
    try {
      return r.getBBox();
    } catch {
      return null;
    }
  });

  /* The baseline is the bottom edge the most rects share. Taking the
     lowest edge instead would pick the legend swatches, which sit below
     the plot area and would leave every real bar unanimated. */
  const groups = new Map<number, number>();
  boxes.forEach((b) => {
    if (!b) return;
    const k = Math.round(b.y + b.height);
    groups.set(k, (groups.get(k) ?? 0) + 1);
  });

  let baseline: number | null = null;
  let best = 0;
  groups.forEach((count, k) => {
    if (count > best || (count === best && baseline !== null && k > baseline)) {
      best = count;
      baseline = k;
    }
  });

  /* Fewer than three sharing an edge means this isn't a bar chart - the
     navy blocks are value chips scattered up a line plot. Leave them be. */
  if (baseline === null || best < 3) return;
  const base = baseline as number;

  /* Everything at or above the baseline is part of a column; anything
     below it is legend furniture. Stacked segments all scale toward the
     same baseline, so a stack grows as one piece instead of coming apart. */
  const bars: { el: SVGRectElement; box: DOMRect }[] = [];
  rects.forEach((el, i) => {
    const b = boxes[i];
    if (b && b.y + b.height <= base + 1.5) {
      bars.push({ el, box: b as DOMRect });
    }
  });
  if (bars.length < 3) return;

  bars.sort((a, b) => a.box.x - b.box.x);

  bars.forEach(({ el, box }, i) => {
    let g = el.parentElement;
    if (!g || g.dataset?.barWrap !== "1") {
      const wrap = document.createElementNS("http://www.w3.org/2000/svg", "g");
      wrap.dataset.barWrap = "1";
      el.parentNode?.insertBefore(wrap, el);
      wrap.appendChild(el);
      g = wrap as unknown as HTMLElement;
    }
    const node = g as unknown as SVGGElement;

    /* Origin in user units - transform-box defaults to view-box, so this
       is unambiguous across browsers. */
    node.style.transformOrigin = `${box.x + box.width / 2}px ${base}px`;

    if (reduce) {
      node.style.transition = "none";
      node.style.transform = "none";
      return;
    }

    /* Commit the collapsed state with a forced reflow rather than waiting
       on requestAnimationFrame - rAF is throttled in a background tab, and
       a reader who arrives that way would find the bars stuck at zero. */
    node.style.transition = "none";
    node.style.transform = "scaleY(0)";
    void node.getBoundingClientRect();
    node.style.transition = `transform 620ms ${EASE} ${i * 12}ms`;
    node.style.transform = "scaleY(1)";
  });
}

function ChartCard({
  chart,
  visible,
  playKey,
  reduce,
}: {
  chart: Chart;
  visible: boolean;
  playKey: number;
  reduce: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [markup, setMarkup] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    loadSvg(chart.file).then((m) => {
      if (alive) setMarkup(m);
    });
    return () => {
      alive = false;
    };
  }, [chart.file]);

  /* Re-run the growth each time this view becomes the active one. */
  useEffect(() => {
    if (!markup || !visible || !ref.current) return;
    animateBars(ref.current, reduce);
  }, [markup, visible, playKey, reduce]);

  return (
    <div
      ref={ref}
      /* The exports carry their own width/height attributes, so without
         this they'd render at their intrinsic 600px and burst the slot. */
      className="absolute [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
      style={{
        left: `${(chart.x / GRID.w) * 100}%`,
        top: `${(chart.y / GRID.h) * 100}%`,
        width: `${(chart.w / GRID.w) * 100}%`,
        height: `${(chart.h / GRID.h) * 100}%`,
      }}
      dangerouslySetInnerHTML={markup ? { __html: markup } : undefined}
    />
  );
}

export function KpiViewSwitcher() {
  const [view, setView] = useState<ViewId>("PP3");
  const [playKey, setPlayKey] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(false);
  /* Bumped on every manual switch so the interval restarts from that view
     rather than firing part-way through it. */
  const [nonce, setNonce] = useState(0);
  /* Drives the countdown bar: false snaps it back to empty, true runs it
     across over one interval. */
  const [barFull, setBarFull] = useState(false);
  const reduce = useReducedMotion() ?? false;

  const wrapRef = useRef<HTMLDivElement>(null);

  /* Loop only while the visual is actually on screen. */
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

  /* Cycles so the swap is visible without interaction. Picking a tab no
     longer ends the loop - it restarts the timer - so a reader can look
     at one view and still have the comparison carry on. Pause is an
     explicit control. */
  useEffect(() => {
    if (!inView || !playing || reduce) return;
    const id = window.setInterval(() => {
      setView((v) => (v === "PP3" ? "RTY" : "PP3"));
      setPlayKey((k) => k + 1);
      setNonce((n) => n + 1);
    }, LOOP_MS);
    return () => window.clearInterval(id);
  }, [inView, playing, reduce, nonce]);

  /* Restart the countdown bar whenever a new interval begins. Both writes
     are deferred a tick so neither runs synchronously inside the effect. */
  useEffect(() => {
    const reset = window.setTimeout(() => setBarFull(false), 0);
    if (!inView || !playing || reduce) {
      return () => window.clearTimeout(reset);
    }
    const fill = window.setTimeout(() => setBarFull(true), 60);
    return () => {
      window.clearTimeout(reset);
      window.clearTimeout(fill);
    };
  }, [inView, playing, reduce, nonce]);

  const select = useCallback((next: ViewId) => {
    setView(next);
    setPlayKey((k) => k + 1);
    setNonce((n) => n + 1);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = IDS.indexOf(view);
    select(IDS[(i + (e.key === "ArrowRight" ? 1 : -1) + IDS.length) % IDS.length]);
  };

  return (
    <div ref={wrapRef} className="w-full">
      <div className="relative w-full overflow-hidden rounded-[24px] bg-[#ececec] p-4 sm:p-8 lg:p-12">
        {/* container-type makes cqw resolve against the screen's own width,
            which is what keeps the tab control proportional. */}
        <div
          className="relative w-full overflow-hidden rounded-[12px] border border-[#e0e0e0] bg-white"
          style={{ containerType: "inline-size" }}
        >
          {/* Static chrome: sidebar, title, Year/Team, card frames. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/figma/kpi-view-pp3.webp"
            alt="KPI platform dashboard: sidebar navigation, the D1 HLPS Milestones Adherence title, and Year and Team filters."
            className="block w-full"
          />

          {/* Charts - the real Figma exports, laid over the artboard's own
              chart area. Both views stay mounted so switching is a fade of
              the layer plus a redraw of the bars, not a remount. */}
          <div
            className="absolute"
            style={{
              left: `${CONTENT.left}%`,
              top: `${CONTENT.top}%`,
              width: `${CONTENT.width}%`,
              height: `${CONTENT.height}%`,
            }}
          >
            {IDS.map((id) => (
              <div
                key={id}
                className="absolute inset-0"
                style={{
                  opacity: view === id ? 1 : 0,
                  transition: `opacity ${reduce ? 0 : 380}ms ${EASE}`,
                  pointerEvents: "none",
                }}
                aria-hidden={view !== id}
              >
                {VIEWS[id].map((chart) => (
                  <ChartCard
                    key={chart.file}
                    chart={chart}
                    visible={view === id}
                    playKey={playKey}
                    reduce={reduce}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Live tab control, sitting exactly on the artboard's own tabs
              and matching its fills, weights and proportions. The indicator
              is a CSS transform on a half-width block - both tabs are equal
              width, so sliding it is all the switch needs. */}
          <div
            role="tablist"
            aria-label="Programme view"
            onKeyDown={onKeyDown}
            className="absolute flex"
            style={{
              left: `${TABS.left}%`,
              top: `${TABS.top}%`,
              width: `${TABS.width}%`,
              height: `${TABS.height}%`,
              background: TAB_INACTIVE_BG,
              fontSize: TAB_FONT,
            }}
          >
            <div
              aria-hidden
              className="absolute inset-y-0 left-0 w-1/2 bg-white"
              style={{
                transform: `translateX(${IDS.indexOf(view) * 100}%)`,
                transition: reduce
                  ? "none"
                  : `transform 420ms ${EASE}`,
              }}
            >
              <span
                className="absolute inset-x-0 bottom-0"
                style={{ height: TAB_UNDERLINE_H, background: TAB_UNDERLINE }}
              />
            </div>

            {IDS.map((id) => {
              const selected = view === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(id)}
                  className="relative z-10 flex flex-1 items-center justify-center leading-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-[#181212]"
                  style={{
                    color: selected ? "#000000" : "#7c7c7c",
                    fontWeight: selected ? 600 : 500,
                    transition: reduce ? "none" : "color 300ms ease",
                  }}
                >
                  {id}
                </button>
              );
            })}
          </div>
        </div>

        {/* Playback controls, on the canvas under the screen. Deliberately
            no PP3/RTY buttons here - the artboard already carries those,
            and a second set reads as a duplicate. */}
        <div className="mt-5 flex items-center justify-center gap-2 sm:mt-6">
          <button
            type="button"
            onClick={() => select(view === "PP3" ? "RTY" : "PP3")}
            aria-label="Previous view"
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

          {/* Countdown to the next switch - tells the reader the view is
              about to change rather than surprising them. */}
          <div className="h-[3px] w-24 overflow-hidden rounded-full bg-white/70 sm:w-32">
            <div
              className="h-full rounded-full bg-[#181212]/35"
              style={{
                width: barFull ? "100%" : "0%",
                transition: barFull ? `width ${LOOP_MS}ms linear` : "none",
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => select(view === "PP3" ? "RTY" : "PP3")}
            aria-label="Next view"
            className={CTRL}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="9,5 16,12 9,19" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
