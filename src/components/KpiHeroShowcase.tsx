"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

/* ─────────────────────────────────────────────────────────────
 * KPI Platform hero — the "GBR QAR Review Items" dashboard artboard
 * with live-animating stacked-bar charts.
 *
 * Composition:
 *  - Base: the full artboard JPG (sidebar, page title, "View for" bar).
 *  - Overlays: the two chart-card SVG frames (exported bar-less from
 *    Figma) positioned at their exact export regions — the JPG is a 4×
 *    export, cards are exactly 1224×348 at 1× starting at (344, 173)
 *    and (344, 545), so the overlays cover the JPG's own charts
 *    pixel-perfectly.
 *  - Bars, value labels, totals, and the metric chips are drawn here in
 *    SVG viewBox coordinates and animate in when scrolled into view:
 *    segments fill bottom-to-top, then labels fade, then the total and
 *    the navy metric chip pop in.
 * ───────────────────────────────────────────────────────────── */

const EASE = [0.22, 1, 0.36, 1] as const;

/* Bar segment palette (matches the chart legend) */
const C = {
  orange: "#FE5716",
  lgreen: "#95C583",
  dgreen: "#4F9E30",
  yellow: "#FFB210",
  navy: "#10367A",
};

type Seg = { color: string; y: number; h: number; label: string };
type Bar = {
  x: number; // bar left, svg coords
  w: number;
  segs: Seg[]; // bottom → top (animation order)
  total: { text: string; x: number; y: number };
  chip: { text: string; x: number; y: number };
};

/* Geometry measured from the source artboard (1224×348 card space).
   Both cards share identical bar geometry in the design. */
const BARS: Bar[] = [
  {
    x: 129,
    w: 64,
    segs: [
      { color: C.orange, y: 263, h: 22.5, label: "7" },
      { color: C.lgreen, y: 167, h: 96, label: "24" },
      { color: C.dgreen, y: 111.5, h: 55.5, label: "19" },
      { color: C.yellow, y: 98, h: 13.5, label: "4" },
    ],
    total: { text: "54", x: 161, y: 91 },
    chip: { text: "80%", x: 171, y: 102.5 },
  },
  {
    x: 211,
    w: 64,
    segs: [
      { color: C.orange, y: 262.5, h: 23, label: "7" },
      { color: C.lgreen, y: 166.3, h: 96.2, label: "24" },
      { color: C.dgreen, y: 130.75, h: 35.55, label: "10" },
      { color: C.yellow, y: 117.5, h: 13.25, label: "4" },
    ],
    total: { text: "45", x: 243, y: 110.5 },
    chip: { text: "70%", x: 252, y: 124.5 },
  },
];

const CHIP_W = 32;
const CHIP_H = 14;

/* Per-segment animation delays (s) — bars fill bottom-to-top */
const SEG_DELAY = [0.15, 0.4, 0.7, 0.95];
const SEG_DUR = [0.5, 0.55, 0.5, 0.4];

function AnimatedChart({
  frameSrc,
  delayOffset,
  reduced,
}: {
  frameSrc: string;
  delayOffset: number;
  reduced: boolean;
}) {
  return (
    <svg
      viewBox="0 0 1224 348"
      className="absolute h-full w-full"
      aria-hidden
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      {/* Bar-less chart frame exported from Figma (axes, gridlines,
          月labels, legend, marker line) — covers the JPG's own chart */}
      <image href={frameSrc} width="1224" height="348" />

      {BARS.map((bar, b) => (
        <g key={b}>
          {/* Segments — grow from their own bottom edge, in order */}
          {bar.segs.map((s, i) => (
            <motion.rect
              key={i}
              x={bar.x}
              y={s.y}
              width={bar.w}
              height={s.h}
              fill={s.color}
              style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
              variants={{
                hidden: { scaleY: reduced ? 1 : 0 },
                show: {
                  scaleY: 1,
                  transition: {
                    delay: delayOffset + SEG_DELAY[i],
                    duration: SEG_DUR[i],
                    ease: EASE,
                  },
                },
              }}
            />
          ))}

          {/* Segment value labels */}
          {bar.segs.map((s, i) =>
            s.h < 12 ? null : (
              <motion.text
                key={`l${i}`}
                x={bar.x + bar.w / 2}
                y={s.y + s.h / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="11"
                fill="#181212"
                style={{ transformBox: "fill-box" }}
                variants={{
                  hidden: { opacity: reduced ? 1 : 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      delay: delayOffset + SEG_DELAY[i] + 0.3,
                      duration: 0.35,
                    },
                  },
                }}
              >
                {s.label}
              </motion.text>
            )
          )}

          {/* Total above the bar */}
          <motion.text
            x={bar.total.x}
            y={bar.total.y}
            textAnchor="middle"
            fontSize="12"
            fill="#8C8C8C"
            style={{ transformBox: "fill-box" }}
            variants={{
              hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 6 },
              show: {
                opacity: 1,
                y: 0,
                transition: { delay: delayOffset + 1.3, duration: 0.45, ease: EASE },
              },
            }}
          >
            {bar.total.text}
          </motion.text>

          {/* Navy metric chip — pops in last */}
          <motion.g
            style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
            variants={{
              hidden: reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 },
              show: {
                opacity: 1,
                scale: 1,
                transition: {
                  delay: delayOffset + 1.45,
                  type: "spring",
                  stiffness: 380,
                  damping: 22,
                },
              },
            }}
          >
            <rect
              x={bar.chip.x}
              y={bar.chip.y}
              width={CHIP_W}
              height={CHIP_H}
              rx="2"
              fill={C.navy}
            />
            <text
              x={bar.chip.x + CHIP_W / 2}
              y={bar.chip.y + CHIP_H / 2 + 0.5}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="9.5"
              fontWeight="bold"
              fill="#ffffff"
            >
              {bar.chip.text}
            </text>
          </motion.g>
        </g>
      ))}
    </svg>
  );
}

/* Overlay placement — exact export regions of the two cards within the
   6400×3904 artboard JPG (4× scale): cards are 4896×1392 at x=1376,
   y=692 (card 1) and y=2180 (card 2). */
const CARD_LEFT = "21.5%"; // 1376 / 6400
const CARD_WIDTH = "76.5%"; // 4896 / 6400
const CARD1_TOP = "17.7254%"; // 692 / 3904
const CARD2_TOP = "55.8402%"; // 2180 / 3904
const CARD_HEIGHT = "35.6557%"; // 1392 / 3904

/* Replay interval — the fill animation restarts this often while the
   visual stays on screen. */
const LOOP_MS = 5000;

export function KpiHeroShowcase() {
  const reduced = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.55 });
  /* A latch, not a second piece of state: once the chart has been seen
     it stays "started" for good. Observing with once:true says that
     directly, where setting a flag from inside the effect cost an extra
     render pass on every scroll into view. */
  const started = useInView(ref, { amount: 0.55, once: true });
  const [cycle, setCycle] = useState(0);

  /* While visible, replay the fill every LOOP_MS. */
  useEffect(() => {
    if (!inView || reduced) return;
    const id = setInterval(() => setCycle((c) => c + 1), LOOP_MS);
    return () => clearInterval(id);
  }, [inView, reduced]);

  return (
    <div className="relative w-full overflow-hidden rounded-[24px] bg-[#ececec] p-4 sm:p-8 lg:p-12">
      <div
        ref={ref}
        role="img"
        aria-label="GBR QAR Review Items dashboard — stacked-bar charts tracking review completion against 75% and 90% benchmarks, animating as data fills in."
        className="relative w-full overflow-hidden rounded-[12px] border border-[#e0e0e0] bg-white"
        style={{ aspectRatio: "6400 / 3904" }}
      >
        {/* Full artboard — sidebar, page title, view-for bar */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/figma/KPI%2023/kpi%2323.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Chart card overlays — bar-less SVG frames + animated bars.
            Keyed by cycle so each tick remounts and replays the fill. */}
        <motion.div
          key={cycle}
          initial="hidden"
          animate={started || reduced ? "show" : "hidden"}
          className="absolute inset-0"
        >
          <div
            className="absolute"
            style={{ left: CARD_LEFT, top: CARD1_TOP, width: CARD_WIDTH, height: CARD_HEIGHT }}
          >
            <AnimatedChart
              frameSrc="/figma/KPI%2023/table1.svg"
              delayOffset={0}
              reduced={reduced}
            />
          </div>
          <div
            className="absolute"
            style={{ left: CARD_LEFT, top: CARD2_TOP, width: CARD_WIDTH, height: CARD_HEIGHT }}
          >
            <AnimatedChart
              frameSrc="/figma/KPI%2023/table2.svg"
              delayOffset={0.4}
              reduced={reduced}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
