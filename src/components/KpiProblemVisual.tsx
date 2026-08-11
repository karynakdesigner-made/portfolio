"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/* ─────────────────────────────────────────────────────────────
 * KPI Problem visual — "metrics lived in disconnected Excel files".
 *
 * Five mismatched spreadsheet-file cards float in their own silos,
 * each with a different team's format and messy filename. Dashed
 * connectors toward the center never arrive — each is broken with an
 * ✕ — and the middle holds an empty dashed slot where the shared
 * picture should be.
 *
 * Palette is restricted to the hero dashboard's chart colors:
 * #FE5716 / #95C583 / #4F9E30 / #FFB210 / #10367A (plus neutrals).
 * ───────────────────────────────────────────────────────────── */

const EASE = [0.22, 1, 0.36, 1] as const;

/* Hero-dashboard chart palette */
const PALETTE = {
  orange: "#FE5716",
  lgreen: "#95C583",
  dgreen: "#4F9E30",
  yellow: "#FFB210",
  navy: "#10367A",
};

type FileCard = {
  name: string;
  owner: string;
  accent: string;
  headerText: string; // filename color — dark on the light accents
  chart: "bars" | "line" | "table" | "stacked" | "spark";
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  rotate: number;
  floatDur: number;
  delay: number;
};

/* Card offsets are balanced so the topmost and bottommost card edges sit
   the same distance from the container — the cluster reads as centered. */
const CARDS: FileCard[] = [
  { name: "Sales_KPIs_FINAL_v3.xlsx", owner: "Sales", accent: PALETTE.dgreen, headerText: "rgba(255,255,255,0.95)", chart: "bars", left: "8%", top: "13%", rotate: -3, floatDur: 5.2, delay: 0 },
  { name: "ops-metrics (2).xlsx", owner: "Operations", accent: PALETTE.navy, headerText: "rgba(255,255,255,0.95)", chart: "table", right: "8%", top: "15%", rotate: 2.5, floatDur: 6.1, delay: 0.12 },
  { name: "Finance_Q3 copy.xlsx", owner: "Finance", accent: PALETTE.orange, headerText: "rgba(255,255,255,0.95)", chart: "line", left: "10%", bottom: "9%", rotate: 2, floatDur: 5.6, delay: 0.24 },
  { name: "hr_dashboard_OLD.xls", owner: "HR", accent: PALETTE.yellow, headerText: "#181212", chart: "stacked", right: "10%", bottom: "8%", rotate: -2.5, floatDur: 6.6, delay: 0.36 },
  { name: "mktg_numbers_v7.xlsx", owner: "Marketing", accent: PALETTE.lgreen, headerText: "#181212", chart: "spark", left: "38%", top: "8%", rotate: 1.5, floatDur: 5.9, delay: 0.48 },
];

/* Centre slot size, as a fraction of the container, with a floor so the
   label still reads on two lines at narrow widths. The connector maths and
   the rendered slot both derive from these, so the two never drift apart. */
const SLOT_W = 0.22;
const SLOT_H = 0.24;
const SLOT_MIN_W = 132;

const slotHalfSize = (w: number, h: number) => ({
  hw: Math.max(w * SLOT_W, SLOT_MIN_W) / 2,
  hh: (h * SLOT_H) / 2,
});

/* How far beyond the slot's border each ✕ sits, in px. Because this is
   applied along each connector's own ray in real pixel space, every break
   lands the same distance out — an even ring around the centre. */
const CROSS_GAP = 20;

type Geometry = {
  w: number;
  h: number;
  /** One connector per card: card centre → exact point on the slot border,
      plus the ✕ position CROSS_GAP px further out along the same ray. */
  links: { x1: number; y1: number; x2: number; y2: number; cx: number; cy: number }[];
};

/* Connectors are computed from measured pixel geometry rather than
   percentages: a percentage step is a different number of pixels
   horizontally than vertically in a non-square box, which skews both the
   ray directions and the ✕ spacing. Working in px keeps them isotropic. */
function computeGeometry(w: number, h: number, cardCentres: { x: number; y: number }[]): Geometry {
  const cx = w / 2;
  const cy = h / 2;
  const { hw, hh } = slotHalfSize(w, h);

  const links = cardCentres.map((p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const len = Math.hypot(dx, dy);
    // A card sitting exactly on the centre has no ray to draw along; fall
    // back to straight up so the maths never divides by zero.
    const ux = len < 1e-6 ? 0 : dx / len;
    const uy = len < 1e-6 ? -1 : dy / len;

    // Distance from centre to where this ray exits the slot rectangle.
    const tx = Math.abs(ux) < 1e-6 ? Infinity : hw / Math.abs(ux);
    const ty = Math.abs(uy) < 1e-6 ? Infinity : hh / Math.abs(uy);
    const t = Math.min(tx, ty);

    return {
      // Line starts at the card's centre; the stretch under the card is
      // hidden because cards paint above the connector layer.
      x1: p.x,
      y1: p.y,
      x2: cx + ux * t, // lands exactly on the slot border
      y2: cy + uy * t,
      cx: cx + ux * (t + CROSS_GAP),
      cy: cy + uy * (t + CROSS_GAP),
    };
  });

  return { w, h, links };
}

/* Tiny mismatched chart previews — every team draws data differently */
function MiniChart({ kind, accent }: { kind: FileCard["chart"]; accent: string }) {
  switch (kind) {
    case "bars":
      return (
        <svg viewBox="0 0 64 28" className="h-full w-full">
          {[14, 22, 9, 18, 25, 12].map((h, i) => (
            <rect key={i} x={3 + i * 10} y={27 - h} width="6" height={h} rx="1" fill={accent} opacity={0.85} />
          ))}
        </svg>
      );
    case "line":
      return (
        <svg viewBox="0 0 64 28" className="h-full w-full">
          <polyline points="2,6 14,12 26,10 38,18 50,16 62,24" fill="none" stroke={accent} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      );
    case "stacked":
      return (
        <svg viewBox="0 0 64 28" className="h-full w-full">
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={4 + i * 16} y={13} width="9" height={14} fill={accent} opacity={0.9} />
              <rect x={4 + i * 16} y={13 - (4 + i * 2)} width="9" height={4 + i * 2} fill={accent} opacity={0.45} />
            </g>
          ))}
        </svg>
      );
    case "spark":
      return (
        <svg viewBox="0 0 64 28" className="h-full w-full">
          <polyline points="2,20 12,14 22,17 32,8 42,12 52,5 62,9" fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="62" cy="9" r="2.2" fill={accent} />
        </svg>
      );
    case "table":
      return (
        <div className="grid h-full w-full grid-cols-4 gap-[2px]">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[1px]"
              style={{ backgroundColor: i % 4 === 0 ? "rgba(16,54,122,0.16)" : "rgba(16,54,122,0.07)" }}
            />
          ))}
        </div>
      );
  }
}

function SpreadsheetCard({
  card,
  reduced,
  measureRef,
}: {
  card: FileCard;
  reduced: boolean;
  measureRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <motion.div
      ref={measureRef}
      className="absolute w-[27%] min-w-[118px] max-w-[240px] sm:min-w-0"
      style={{ left: card.left, right: card.right, top: card.top, bottom: card.bottom }}
      variants={{
        hidden: reduced ? {} : { opacity: 0, y: 18, scale: 0.92 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.7, ease: EASE, delay: card.delay },
        },
      }}
    >
      <motion.div
        className="overflow-hidden rounded-[10px] border border-[#e4e4e4] bg-white shadow-[0_14px_30px_-14px_rgba(0,0,0,0.18)]"
        initial={{ rotate: card.rotate }}
        animate={
          reduced
            ? { rotate: card.rotate }
            : {
                rotate: [card.rotate, card.rotate + 1.2, card.rotate],
                y: [0, -7, 0],
              }
        }
        transition={
          reduced
            ? undefined
            : { duration: card.floatDur, repeat: Infinity, ease: "easeInOut", delay: card.delay }
        }
      >
        {/* File chrome — each team's own header tint */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5" style={{ backgroundColor: card.accent }}>
          {/* excel-ish grid glyph */}
          <svg viewBox="0 0 12 12" className="h-3 w-3 shrink-0" aria-hidden>
            <rect x="0.5" y="0.5" width="11" height="11" rx="1.5" fill="white" opacity="0.9" />
            <path d="M4.2 3.2 5.6 6 4.1 8.8h1.3L6.3 7l0.9 1.8h1.3L7 6l1.4-2.8H7.2L6.3 5 5.5 3.2Z" fill={card.accent} />
          </svg>
          <span className="truncate text-[10px] font-medium" style={{ color: card.headerText }}>
            {card.name}
          </span>
        </div>
        {/* Sheet body — mini grid + mismatched chart */}
        <div className="flex flex-col gap-1.5 p-2.5">
          <div className="grid grid-cols-5 gap-[2px]">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={`h-[5px] rounded-[1px] ${i % 5 === 0 ? "bg-[#e3e3e3]" : "bg-[#f0f0f0]"}`} />
            ))}
          </div>
          <div className="h-[38px]">
            <MiniChart kind={card.chart} accent={card.accent} />
          </div>
        </div>
        {/* Owner lock line */}
        <div className="flex items-center gap-1 border-t border-[#f0f0f0] px-2.5 py-1">
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 shrink-0" fill="none" stroke="#8a8a8a" strokeWidth="1.2" aria-hidden>
            <rect x="2.5" y="5" width="7" height="5" rx="1" />
            <path d="M4 5V3.8a2 2 0 0 1 4 0V5" />
          </svg>
          <span className="text-[9px] text-[#8a8a8a]">Only {card.owner} can see this</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function KpiProblemVisual() {
  const reduced = useReducedMotion() ?? false;
  const stageRef = useRef<HTMLDivElement>(null);
  const cardEls = useRef<(HTMLDivElement | null)[]>([]);
  const [geo, setGeo] = useState<Geometry | null>(null);

  /* Measure with offset* rather than getBoundingClientRect: offsets report
     the layout box, so the cards' float/entry transforms don't perturb the
     connector geometry. */
  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const w = stage.offsetWidth;
    const h = stage.offsetHeight;
    if (!w || !h) return;

    // Wait until every card has mounted — a missing one would otherwise
    // contribute a degenerate ray and skew nothing but waste a render.
    const els = CARDS.map((_, i) => cardEls.current[i]);
    if (els.some((el) => !el)) return;

    const centres = (els as HTMLDivElement[]).map((el) => ({
      x: el.offsetLeft + el.offsetWidth / 2,
      y: el.offsetTop + el.offsetHeight / 2,
    }));

    setGeo(computeGeometry(w, h, centres));
  }, []);

  useLayoutEffect(() => {
    measure();
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    cardEls.current.forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, [measure]);

  /* Card heights depend on webfont metrics, so re-measure once fonts land. */
  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) return;
    document.fonts.ready.then(measure).catch(() => {});
  }, [measure]);

  return (
    <motion.div
      role="img"
      aria-label="Before — company KPIs scattered across disconnected Excel files, each in a different team's format, none connected to a shared view."
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.35 }}
      className="relative h-[480px] w-full overflow-hidden rounded-[24px] border border-[#ececec] bg-[#f8f8f8] sm:h-[520px] lg:h-[580px]"
    >
      <div ref={stageRef} className="relative h-full w-full">
        {/* Broken connectors toward the center */}
        {geo && (
          <motion.svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${geo.w} ${geo.h}`}
            preserveAspectRatio="none"
            aria-hidden
            variants={{
              hidden: reduced ? {} : { opacity: 0 },
              show: { opacity: 1, transition: { duration: 0.8, delay: 0.7 } },
            }}
          >
            {geo.links.map((l, i) => (
              <line
                key={i}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke="#c6c6c6"
                strokeWidth="1.5"
                strokeDasharray="5 6"
                strokeLinecap="round"
              />
            ))}
          </motion.svg>
        )}

        {/* ✕ break marks — each CROSS_GAP px out from the slot border */}
        {geo?.links.map((l, i) => (
          <motion.span
            key={i}
            className="absolute flex h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-white text-[10px] font-semibold leading-none shadow-[0_4px_10px_-4px_rgba(0,0,0,0.2)]"
            style={{ left: l.cx, top: l.cy, color: PALETTE.orange, borderColor: "rgba(254,87,22,0.35)" }}
            variants={{
              hidden: reduced ? {} : { opacity: 0, scale: 0.4 },
              show: {
                opacity: 1,
                scale: 1,
                transition: { delay: 1.0 + i * 0.1, type: "spring", stiffness: 400, damping: 20 },
              },
            }}
          >
            ✕
          </motion.span>
        ))}

        {/* Center — the shared picture that doesn't exist. Sits above the
            cards so the message stays legible when they crowd it on narrow
            screens. */}
        <motion.div
          className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-[14px] backdrop-blur-[2px]"
          style={{
            // Driven by the same helper the connector maths uses, so the
            // lines always land exactly on this border.
            width: geo ? slotHalfSize(geo.w, geo.h).hw * 2 : `${SLOT_W * 100}%`,
            height: `${SLOT_H * 100}%`,
            backgroundColor: "rgba(248,248,248,0.92)",
          }}
          variants={{
            hidden: reduced ? {} : { opacity: 0, scale: 0.9 },
            show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE, delay: 0.9 } },
          }}
        >
          {/* Marching-ants dashed border in navy */}
          <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
            <motion.rect
              x="1"
              y="1"
              width="100%"
              height="100%"
              rx="14"
              style={{ width: "calc(100% - 2px)", height: "calc(100% - 2px)" }}
              fill="none"
              stroke={PALETTE.navy}
              strokeOpacity="0.45"
              strokeWidth="1.6"
              strokeDasharray="7 7"
              animate={reduced ? undefined : { strokeDashoffset: [0, -28] }}
              transition={
                reduced ? undefined : { duration: 3.2, repeat: Infinity, ease: "linear" }
              }
            />
          </svg>
          <motion.span
            className="text-[26px] font-semibold leading-none sm:text-[32px]"
            style={{ color: PALETTE.navy }}
            animate={reduced ? undefined : { opacity: [0.45, 0.95, 0.45], scale: [1, 1.06, 1] }}
            transition={reduced ? undefined : { duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
            aria-hidden
          >
            ?
          </motion.span>
          <span className="px-2 text-center text-[10px] leading-[1.35] text-[#6b6b6b] sm:text-[11px]">
            no shared view
            <br />
            of performance
          </span>
        </motion.div>

        {/* The five silos */}
        {CARDS.map((c, i) => (
          <SpreadsheetCard
            key={c.name}
            card={c}
            reduced={reduced}
            measureRef={(el) => {
              cardEls.current[i] = el;
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
