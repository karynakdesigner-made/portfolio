"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/* ─────────────────────────────────────────────────────────────
 * KPI Platform - the chart palette, and the charts it produces.
 *
 * Three things happen at once, which is the whole argument of the
 * decision this illustrates: the palette is one grid, every chart is
 * built only from it, and each colour is checked before it ships.
 *
 * The grid is rebuilt in HTML rather than dropped in as pallete.svg.
 * The exported palette has its labels outlined as paths, so nothing in
 * it is addressable - and the point of the visual is to light up the
 * nine-or-so cells a given chart actually draws from. The hexes below
 * are lifted straight off that export's swatch rects, so the grid is
 * the same artefact, just animatable.
 *
 * Which cells light up is read from the chart's own markup at runtime,
 * not hand-listed here: swap an SVG in the folder and the highlighting
 * and the contrast rows follow it.
 * ───────────────────────────────────────────────────────────── */

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const ADVANCE_MS = 5200;
const FADE_MS = 420;

/* Shared styling for the prev / play-pause / next buttons. */
const CTRL =
  "flex h-7 w-7 items-center justify-center rounded-full border border-[#e0e0e0] " +
  "bg-white/70 text-[#6b6b6b] backdrop-blur transition-colors duration-200 " +
  "hover:text-[#181212] focus-visible:outline focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 focus-visible:outline-[#181212]";

/* ── The palette, straight off pallete.svg's swatch rects ───────── */

const LEVELS = [50, 40, 30, 20, 10] as const;

type Ramp = { name: string; tints: string[] };
type Group = { name: string; ramps: Ramp[] };

const PALETTE: Group[] = [
  {
    name: "Orange",
    ramps: [
      { name: "Dark orange", tints: ["#FE5716", "#FE7945", "#FE9A73", "#FFBCA2", "#FFDDD0"] },
      { name: "Medium orange", tints: ["#FF861D", "#FF9E4A", "#FFB677", "#FFCFA5", "#FFE7D2"] },
      { name: "Light orange", tints: ["#FFB210", "#FFC140", "#FFD170", "#FFE09F", "#FFF0CF"] },
    ],
  },
  {
    name: "Blue",
    ramps: [
      { name: "Dark blue", tints: ["#10367A", "#405E95", "#7086AF", "#9FAFCA", "#CFD7E4"] },
      { name: "Medium blue", tints: ["#1057C8", "#4079D3", "#709ADE", "#9FBCE9", "#CFDDF4"] },
      { name: "Light blue", tints: ["#1089FF", "#40A1FF", "#70B8FF", "#9FD0FF", "#CFE7FF"] },
    ],
  },
  {
    name: "Green",
    ramps: [
      { name: "Dark green", tints: ["#4F9E30", "#72B159", "#95C583", "#B9D8AC", "#DCECD6"] },
      { name: "Medium green", tints: ["#88D910", "#A0E140", "#B8E870", "#CFF09F", "#E7F7CF"] },
      { name: "Light green", tints: ["#C0E410", "#CDE940", "#D9EF70", "#E6F49F", "#F2FACF"] },
    ],
  },
];

/* hex → "Dark blue 50", for the contrast rows. */
const TOKEN_NAME = new Map<string, string>();
PALETTE.forEach((g) =>
  g.ramps.forEach((r) =>
    r.tints.forEach((hex, i) => TOKEN_NAME.set(hex, `${r.name} ${LEVELS[i]}`)),
  ),
);

/* ── Contrast ───────────────────────────────────────────────────
 * WCAG 2.1 relative luminance. Chart marks are graphical objects, so
 * the bar they have to clear is 1.4.11 Non-text Contrast at 3:1 -
 * not the 4.5:1 that applies to body text.
 * ───────────────────────────────────────────────────────────── */

const THRESHOLD = 3;

function channel(c: number) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(hex: string, against = "#FFFFFF") {
  const a = luminance(hex);
  const b = luminance(against);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/* ── Charts ─────────────────────────────────────────────────────
 * The real Figma exports. `ratio` is each artboard's own aspect - the
 * stage animates to it rather than letterboxing everything into one
 * box, because a 600-wide table in a 1224-wide frame reads as a
 * mistake rather than as a different chart type.
 * ───────────────────────────────────────────────────────────── */

type ChartDef = { file: string; label: string; kind: string; ratio: number };

const CHARTS: ChartDef[] = [
  { file: "chart1", label: "Adherence", kind: "Column + target", ratio: 1224 / 376 },
  { file: "chart2", label: "Review duration", kind: "Paired columns", ratio: 1224 / 376 },
  { file: "chart3", label: "Forecast", kind: "Columns + baseline", ratio: 1224 / 348 },
  { file: "chart5", label: "Delivered", kind: "Target fill", ratio: 1224 / 376 },
  { file: "chart6", label: "Variance table", kind: "Table", ratio: 600 / 378 },
  { file: "chart8", label: "Qualifications", kind: "Composition + gauge", ratio: 1224 / 476 },
];

const DIR = "/figma/Final Visual for KPI";

/* Module-level cache so re-entering the section doesn't refetch. */
const svgCache = new Map<string, string>();

async function loadSvg(file: string) {
  const hit = svgCache.get(file);
  if (hit) return hit;
  const res = await fetch(`${encodeURI(DIR)}/${file}.svg`);
  const text = await res.text();
  svgCache.set(file, text);
  return text;
}

/* Every palette colour the export actually paints with, most-used
   first. Axis grey and the gauge track aren't tokens, so they fall out
   on their own. */
function tokensUsed(markup: string) {
  const counts = new Map<string, number>();
  for (const m of markup.matchAll(/fill="(#[0-9A-Fa-f]{6})"/g)) {
    const hex = m[1].toUpperCase();
    if (TOKEN_NAME.has(hex)) counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([hex]) => hex);
}

/* ── Bar growth ─────────────────────────────────────────────────
 * Lifted from the view switcher, and for the same reason: bars carry
 * their own transform attribute, so animating the rect would fling it
 * to the origin. Each one gets a plain <g> wrapper to scale instead.
 * Charts with no shared baseline - the table, the gauge - fail the
 * guard and are left alone rather than distorted.
 * ───────────────────────────────────────────────────────────── */
function growBars(host: HTMLElement, reduce: boolean) {
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

  /* The baseline is the bottom edge the most rects share - the lowest
     edge would pick the legend swatches instead. */
  const edges = new Map<number, number>();
  boxes.forEach((b) => {
    if (!b) return;
    const k = Math.round(b.y + b.height);
    edges.set(k, (edges.get(k) ?? 0) + 1);
  });

  let baseline: number | null = null;
  let best = 0;
  edges.forEach((count, k) => {
    if (count > best || (count === best && baseline !== null && k > baseline)) {
      best = count;
      baseline = k;
    }
  });
  if (baseline === null || best < 3) return;
  const base = baseline as number;

  const bars: { el: SVGRectElement; box: DOMRect }[] = [];
  rects.forEach((el, i) => {
    const b = boxes[i];
    if (b && b.y + b.height <= base + 1.5) bars.push({ el, box: b as DOMRect });
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
    node.style.transformOrigin = `${box.x + box.width / 2}px ${base}px`;

    if (reduce) {
      node.style.transition = "none";
      node.style.transform = "none";
      return;
    }

    /* Forced reflow rather than rAF - rAF is throttled in a background
       tab, and a reader arriving that way would find bars at zero. */
    node.style.transition = "none";
    node.style.transform = "scaleY(0)";
    void node.getBoundingClientRect();
    node.style.transition = `transform 560ms ${EASE} ${i * 10}ms`;
    node.style.transform = "scaleY(1)";
  });
}

/* ── Component ──────────────────────────────────────────────── */

export function KpiPaletteSystem() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(false);
  /* Seeded from the module cache so a remount paints immediately
     instead of flashing an empty stage. */
  const [loaded, setLoaded] = useState<Record<string, string>>(() =>
    Object.fromEntries(svgCache),
  );
  /* Bumped on every manual move so the interval restarts from that
     chart rather than firing part-way through it. */
  const [nonce, setNonce] = useState(0);
  const [barFull, setBarFull] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;

  const chart = CHARTS[index];
  const markup = loaded[chart.file] ?? null;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Fetch only once the visual is on screen - these exports carry
     outlined type and run a few hundred KB each. */
  useEffect(() => {
    if (!inView) return;
    let alive = true;
    loadSvg(chart.file).then((m) => {
      if (!alive) return;
      setLoaded((c) => (c[chart.file] === m ? c : { ...c, [chart.file]: m }));
    });
    return () => {
      alive = false;
    };
  }, [inView, chart.file]);

  /* Warm the next chart so the swap isn't a blank frame. */
  useEffect(() => {
    if (!inView) return;
    void loadSvg(CHARTS[(index + 1) % CHARTS.length].file);
  }, [inView, index]);

  useEffect(() => {
    if (!markup || !stageRef.current) return;
    growBars(stageRef.current, reduce);
  }, [markup, reduce]);

  useEffect(() => {
    if (!inView || !playing || reduce) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % CHARTS.length),
      ADVANCE_MS,
    );
    return () => window.clearInterval(id);
  }, [inView, playing, reduce, nonce]);

  /* Restart the countdown whenever a new interval begins. Both writes
     are deferred a tick so neither runs synchronously in the effect. */
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
  }, [inView, playing, reduce, nonce, index]);

  const select = useCallback((next: number) => {
    setIndex((next + CHARTS.length) % CHARTS.length);
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

  /* Read off the markup, so the grid and the rows can't drift from
     what the chart actually paints. */
  const used = useMemo(() => (markup ? tokensUsed(markup) : []), [markup]);
  const usedSet = useMemo(() => new Set(used), [used]);

  return (
    <div ref={wrapRef} className="w-full">
      <div className="flex w-full flex-col gap-5 overflow-hidden rounded-[24px] bg-[#ececec] p-4 sm:gap-6 sm:p-8 lg:p-12">
        {/* ── Palette ───────────────────────────────────────── */}
        <div className="rounded-[12px] border border-[#e0e0e0] bg-white p-4 sm:p-5">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <span className="text-[13px] font-semibold text-[#181212]">
              Chart palette
            </span>
            <span className="text-[12px] text-[#6b6b6b]">
              9 ramps · 5 tints
            </span>
          </div>

          <div className="flex gap-3 sm:gap-5">
            {/* Tint scale, once down the left. Mirrors the swatch stack's
                own row height and gap rather than distributing over the
                column - the group name sits below the swatches, and
                justify-between would drag every label a row out of true. */}
            <div className="flex shrink-0 flex-col gap-[3px] self-start">
              {LEVELS.map((l) => (
                <span
                  key={l}
                  className="flex h-[clamp(14px,2.6vw,26px)] items-center text-[10px] tabular-nums text-[#9a9a9a] sm:text-[11px]"
                >
                  {l}
                </span>
              ))}
            </div>

            <div className="flex min-w-0 flex-1 gap-3 sm:gap-5">
              {PALETTE.map((group) => (
                <div key={group.name} className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex gap-[3px]">
                    {group.ramps.map((ramp) => (
                      <div key={ramp.name} className="flex min-w-0 flex-1 flex-col gap-[3px]">
                        {ramp.tints.map((hex, i) => {
                          const on = usedSet.has(hex);
                          return (
                            <div
                              key={hex}
                              title={`${ramp.name} ${LEVELS[i]} · ${hex}`}
                              className="h-[clamp(14px,2.6vw,26px)] w-full rounded-[2px]"
                              style={{
                                background: hex,
                                opacity: used.length === 0 ? 1 : on ? 1 : 0.18,
                                /* Active tints lift off the grid rather than
                                   getting outlined. A white ring cuts them
                                   free of their neighbours without adding a
                                   colour of its own, and the elevation does
                                   the pointing - an ink outline fought the
                                   swatch it was meant to single out. */
                                transform: on
                                  ? "translateY(-1px) scale(1.04)"
                                  : "scale(0.88)",
                                boxShadow: on
                                  ? "0 0 0 2px #fff, 0 4px 10px -2px rgba(24,18,18,0.28), 0 2px 4px -1px rgba(24,18,18,0.12)"
                                  : "none",
                                transition: reduce
                                  ? "none"
                                  : `opacity 340ms ease ${i * 18}ms, transform 340ms ${EASE} ${i * 18}ms, box-shadow 340ms ease`,
                              }}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <span className="truncate text-[10px] uppercase tracking-[0.06em] text-[#9a9a9a] sm:text-[11px]">
                    {group.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Chart + contrast ──────────────────────────────── */}
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
          {/* Stage. The aspect box animates to each artboard's own
              ratio, so nothing is letterboxed or stretched. */}
          <div className="min-w-0 flex-1">
            <div
              className="relative w-full overflow-hidden rounded-[12px] border border-[#e0e0e0] bg-white"
              style={{
                paddingBottom: `${100 / chart.ratio}%`,
                transition: reduce ? "none" : `padding-bottom 520ms ${EASE}`,
              }}
              aria-live="polite"
            >
              <div
                key={chart.file}
                ref={stageRef}
                className="absolute inset-0 p-3 [&>svg]:h-full [&>svg]:w-full"
                style={{
                  animation: reduce
                    ? "none"
                    : `kpsFade ${FADE_MS}ms ${EASE} both`,
                }}
                role="img"
                aria-label={`${chart.label} - ${chart.kind}, drawn from the chart palette.`}
                dangerouslySetInnerHTML={markup ? { __html: markup } : undefined}
              />
            </div>
          </div>

          {/* Contrast check for exactly the colours on screen. */}
          <div className="flex w-full shrink-0 flex-col rounded-[12px] border border-[#e0e0e0] bg-white p-4 lg:w-[292px]">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] font-semibold text-[#181212]">
                Contrast check
              </span>
              <span className="text-[11px] text-[#6b6b6b]">on white</span>
            </div>
            <p className="mt-1 text-[11px] leading-[1.45] text-[#6b6b6b]">
              WCAG 1.4.11 non-text contrast - chart marks need {THRESHOLD}:1.
            </p>

            <ul className="mt-3 flex flex-col gap-2">
              {used.map((hex, i) => {
                const r = contrast(hex);
                const pass = r >= THRESHOLD;
                return (
                  <li
                    key={hex}
                    className="flex items-center gap-2.5"
                    style={{
                      animation: reduce
                        ? "none"
                        : `kpsRow 380ms ${EASE} ${i * 70}ms both`,
                    }}
                  >
                    <span
                      aria-hidden
                      className="h-7 w-7 shrink-0 rounded-[4px] border border-black/10"
                      style={{ background: hex }}
                    />
                    <span className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate text-[12px] text-[#181212]">
                        {TOKEN_NAME.get(hex)}
                      </span>
                      <span className="text-[11px] tabular-nums text-[#9a9a9a]">
                        {hex}
                      </span>
                    </span>
                    <span className="shrink-0 text-[12px] tabular-nums text-[#181212]">
                      {r.toFixed(2)}:1
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                        pass
                          ? "bg-[#181212] text-white"
                          : "border border-[#e0e0e0] text-[#6b6b6b]"
                      }`}
                    >
                      {pass ? "PASS" : "LOW"}
                    </span>
                  </li>
                );
              })}
              {used.length === 0 && (
                <li className="text-[12px] text-[#9a9a9a]">Loading chart…</li>
              )}
            </ul>

          </div>
        </div>

        {/* ── Controls ──────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[13px] text-[#181212] sm:text-[14px]">
            {chart.label} - <span className="text-[#6b6b6b]">{chart.kind}</span>
          </span>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous chart"
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
              aria-label="Charts"
              onKeyDown={onKeyDown}
              className="flex items-center gap-1 rounded-full border border-[#e0e0e0] bg-white/70 px-2 py-1.5 backdrop-blur"
            >
              {CHARTS.map((c, i) => {
                const selected = i === index;
                return (
                  <button
                    key={c.file}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-label={c.label}
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
              aria-label="Next chart"
              className={CTRL}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="9,5 16,12 9,19" />
              </svg>
            </button>

            {/* Countdown to the next chart, so the swap is expected. */}
            <div className="h-[3px] w-24 overflow-hidden rounded-full bg-white/70 sm:w-32">
              <div
                className="h-full rounded-full bg-[#181212]/35"
                style={{
                  width: barFull ? "100%" : "0%",
                  transition: barFull ? `width ${ADVANCE_MS}ms linear` : "none",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes kpsFade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes kpsRow {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
