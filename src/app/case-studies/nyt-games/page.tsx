"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CaseStudySidebar } from "@/components/CaseStudySidebar";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────
 * NYT Games App - Case Study
 * Uses the same layout, sidebar, type, and color palette as the
 * Gen AI Engineering Platform case study and the main page.
 *   - Body font: Mosvita (inherited)
 *   - Colors: #181212, #211B1C, #4a4a4a, #6b6b6b, #ececec, #f8f8f8, #faf7f0
 *   - Section sizes: heading 28px / body 18px / meta 14–18px
 *   - Section pattern: title (left) + content (right), full-width visuals below
 * ───────────────────────────────────────────────────────────── */

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const labelSlide = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0 },
};

const NYT_NAV = [
  { id: "overview", label: "Overview" },
  { id: "scope", label: "Scope" },
  { id: "ab-testing", label: "A/B Testing" },
  { id: "social", label: "Social Features" },
  { id: "accessibility", label: "Accessibility & Quality" },
  { id: "recognition", label: "Recognition" },
];

/* ───────── Reusable bits (match Gen AI Engineering Platform page) ───────── */

function PlaceholderBox({
  id,
  ratio,
  label,
}: {
  id: string;
  ratio: string;
  label: string;
}) {
  return (
    <div
      id={id}
      className="relative flex w-full items-center justify-center overflow-hidden rounded-[24px] bg-[#f8f8f8]"
      style={{ aspectRatio: ratio }}
    >
      <p className="max-w-[640px] px-6 text-center text-[14px] leading-[1.5] text-[#6b6b6b]">
        {label}
      </p>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#ececec] bg-[#f8f8f8] px-3 py-1.5 text-[14px] font-semibold text-[#211B1C]">
      {children}
    </span>
  );
}

function InfoCard({
  number,
  title,
  children,
}: {
  number?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[16px] border border-[#ececec] bg-white p-7">
      {number && (
        <p className="mb-3 text-[14px] font-semibold text-[#6b6b6b]">
          {number}
        </p>
      )}
      <h3 className="mb-3 text-[20px] font-semibold leading-[1.3] text-[#181212]">
        {title}
      </h3>
      <p className="text-[16px] leading-[1.55] text-[#211B1C]">{children}</p>
    </div>
  );
}

function FigureCaption({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[15px] italic text-[#6b6b6b]">
      {children}
    </p>
  );
}

/* ───────── Hero Bento Grid ─────────
 * 5-card bento layout:
 *   ┌──────┬───────┬──────┐
 *   │ Logo │       │ Award│
 *   ├──────┤ Phone ├──────┤
 *   │ Icons│       │ Reco │
 *   └──────┴───────┴──────┘
 * Desktop: CSS Grid 3 cols × 3 rows with span placements.
 * Mobile: stacks vertically with sensible min-heights per card.
 * Loading animation: each card fades up + scales in, staggered (0.1s).
 */

/* ───────── Game icons row ───────── */
/* 8 game cards. Each cascades in on scroll, then gently floats
   on its own timer (different durations + delays per card so the
   row never moves in lockstep). Subtle drop shadow gives a lifted
   feel. Hover slightly lifts and tilts the card. */

const GAME_CARDS = [
  { src: "/figma/nyt-card-wordle.svg", label: "Wordle" },
  { src: "/figma/nyt-card-sb.svg", label: "Spelling Bee" },
  { src: "/figma/nyt-card-connections.svg", label: "Connections" },
  { src: "/figma/nyt-card-mini.svg", label: "The Mini" },
  { src: "/figma/nyt-card-crossword.svg", label: "The Crossword" },
  { src: "/figma/nyt-card-sudoku.svg", label: "Sudoku" },
  { src: "/figma/nyt-card-lb.svg", label: "Letter Boxed" },
  { src: "/figma/nyt-card-tiles.svg", label: "Tiles" },
];

function NYTGameIconsRow() {
  return (
    <motion.ul
      id="GAME-ICONS-STRIP"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-15%" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
      }}
      className="flex w-full flex-wrap items-center justify-center gap-4 lg:flex-nowrap lg:justify-between"
    >
      {GAME_CARDS.map((card, i) => (
        <motion.li
          key={card.label}
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.9 },
            show: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
            },
          }}
          className="shrink-0"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 3 + (i % 4) * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: (i % 4) * 0.3,
            }}
            whileHover={{ y: -8, rotate: -3, scale: 1.06 }}
            className="cursor-default drop-shadow-[0_8px_18px_rgba(0,0,0,0.12)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                  loading="lazy"
                  decoding="async"
              src={card.src}
              alt={card.label}
              className="block h-[80px] w-[80px] sm:h-[100px] sm:w-[100px] lg:h-[76px] lg:w-[76px] xl:h-[104px] xl:w-[104px] 2xl:h-[128px] 2xl:w-[128px]"
            />
          </motion.div>
        </motion.li>
      ))}
    </motion.ul>
  );
}

/* ───────── A/B Test showcase ─────────
 * Two-column interactive:
 *   - Left: phone showing the active variant (A or B), with a
 *     toggle below to switch between them.
 *   - Right: header, key differences (re-key on variant), and a
 *     results panel that animates in a bar chart + winner badge
 *     when "Show Results" is clicked. Reset returns to A. */

const AB_METRICS = [
  { name: "Engagement", a: 42, b: 58 },
  { name: "Conversion", a: 71, b: 55 },
  { name: "Click-through", a: 33, b: 35 },
];

const AB_DIFFERENCES = [
  { label: "Headline", a: "Welcome framing", b: "Value-prop framing" },
  { label: "CTA order", a: "Play first → Log in", b: "Log in → Play" },
  { label: "Strategy", a: "Account creation focus", b: "Engagement hook" },
];

const AB_COLORS = {
  A: { light: "#D6E4FF", mid: "#A8C8F0", dark: "#4A90D9" },
  B: { light: "#FFF8DC", mid: "#F5D44B", dark: "#C5A200" },
};

/** Largest metric value - bars scale against this so they use the full height. */
const AB_MAX = Math.max(...AB_METRICS.flatMap((m) => [m.a, m.b]));

/* Reset arrow - currentColor so it picks up the button's hover transition. */
function ResetIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 12a9 9 0 1 1 3 6.7" />
      <polyline points="3 21 3 15 9 15" />
    </svg>
  );
}

/* Small medal mark - replaces the emoji trophy, matches the page's stroke icons */
function MedalIcon({ color }: { color: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="9" r="5.5" />
      <path d="M9.5 13.5 8 21l4-2 4 2-1.5-7.5" />
    </svg>
  );
}

function NYTABTestShowcase() {
  const [active, setActive] = useState<"A" | "B">("A");
  const [revealed, setRevealed] = useState(false);
  const [showWinner, setShowWinner] = useState(false);

  const reveal = () => {
    setRevealed(true);
    setTimeout(() => setShowWinner(true), 900);
  };

  const reset = () => {
    setRevealed(false);
    setShowWinner(false);
    setActive("A");
  };

  const activeColors = AB_COLORS[active];

  return (
    <motion.div
      id="AB-TEST-INTERACTIVE"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.16, delayChildren: 0.1 } },
      }}
      className="grid w-full grid-cols-[1fr_1.2fr] overflow-hidden rounded-[24px] border border-[#ececec] bg-[#f8f8f8] max-md:grid-cols-1"
    >
      {/* LEFT - Phone + Variant Toggle */}
      <motion.div
        variants={{
          hidden: { opacity: 0, x: -30, filter: "blur(8px)" },
          show: {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            transition: {
              type: "spring",
              stiffness: 120,
              damping: 16,
              opacity: { duration: 0.5, ease: EASE },
              filter: { duration: 0.6, ease: EASE },
            },
          },
        }}
        className="relative flex flex-col items-center justify-center gap-8 bg-white px-6 py-14"
      >
        {/* Phone screenshot - crossfade between variants */}
        <div className="relative aspect-square w-full max-w-[400px] overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.img
                  loading="lazy"
                  decoding="async"
              key={active}
              src={active === "A" ? "/figma/nyt-ab-a.webp" : "/figma/nyt-ab-b.webp"}
              alt={`Onboarding variant ${active}`}
              className="absolute inset-0 h-full w-full object-contain"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{
                opacity: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
                scale: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
              }}
            />
          </AnimatePresence>
        </div>

        {/* Variant toggle */}
        <div className="flex gap-1 rounded-full border border-[#e3e3e3] bg-white/70 p-1 backdrop-blur">
          {(["A", "B"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setActive(v)}
              className={
                "flex items-center gap-2 rounded-full px-4 py-2 text-[13px] transition-all duration-200 " +
                (active === v
                  ? "bg-white font-semibold text-[#181212] shadow-sm"
                  : "text-[#6b6b6b]")
              }
            >
              <span
                className={"h-2 w-2 rounded-full border transition-transform " + (active === v ? "scale-110" : "")}
                style={{
                  background: AB_COLORS[v].mid,
                  borderColor: AB_COLORS[v].dark,
                }}
              />
              Version {v}
            </button>
          ))}
        </div>
      </motion.div>

      {/* RIGHT - Info + Results */}
      <motion.div
        variants={{
          hidden: { opacity: 0, x: 30, filter: "blur(8px)" },
          show: {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            transition: {
              type: "spring",
              stiffness: 120,
              damping: 16,
              opacity: { duration: 0.5, ease: EASE },
              filter: { duration: 0.6, ease: EASE },
            },
          },
        }}
        className="flex flex-col gap-6 px-7 py-14"
      >
        {/* Header */}
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#6b6b6b]">
            A/B Test
          </p>
          <h3 className="mt-2 text-[22px] font-semibold leading-[1.2] text-[#181212]">
            Onboarding - welcome vs. value-prop
          </h3>
          <p className="mt-1 text-[15px] leading-[1.55] text-[#4a4a4a]">
            Onboarding screen · 7-day test · cross-platform
          </p>
        </div>

        {/* Differences */}
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#6b6b6b]">
            Key differences
          </p>
          <ul className="flex flex-col gap-2">
            {AB_DIFFERENCES.map((d) => (
              <li
                key={d.label}
                className="flex items-center gap-3 text-[16px]"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full border transition-all duration-300"
                  style={{
                    background: activeColors.mid,
                    borderColor: activeColors.dark,
                  }}
                />
                <span className="min-w-[80px] text-[14px] text-[#6b6b6b]">
                  {d.label}
                </span>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={`${d.label}-${active}`}
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -2 }}
                    transition={{ duration: 0.25 }}
                    className="text-[#211B1C]"
                  >
                    {active === "A" ? d.a : d.b}
                  </motion.span>
                </AnimatePresence>
              </li>
            ))}
          </ul>
        </div>

        {/* Results panel */}
        <div className="mt-auto rounded-[14px] border border-[#ececec] bg-white p-5">
          {/* Header - title + legend */}
          <div className="mb-7 flex items-center justify-between">
            <p className="text-[15px] font-semibold text-[#181212]">Results</p>
            <div className="flex items-center gap-3">
              {(["A", "B"] as const).map((v) => (
                <div key={v} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: AB_COLORS[v].mid }}
                  />
                  <span className="text-[12px] font-medium text-[#6b6b6b]">
                    Version {v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart - scaffold is always present; bars fill on reveal, and a
              frosted CTA sits over the empty state so the panel never jumps. */}
          {/* Sits low in the panel on purpose. The footer below reserves room
              for the winner banner, so anchoring the chart high left the CTA
              landing straight on the metric labels - the extra top margin and
              the wider bar-to-label gap give the overlay somewhere to be. */}
          <div className="relative mt-10">
            <div className="flex h-[136px] items-end justify-around gap-4 border-b border-[#ececec]">
              {AB_METRICS.map((m, i) => (
                <div
                  key={m.name}
                  className="flex flex-1 flex-col items-center gap-4"
                >
                  <div className="flex h-[100px] items-end gap-2">
                    {(["a", "b"] as const).map((key, j) => {
                      const value = key === "a" ? m.a : m.b;
                      const variantKey = key === "a" ? "A" : "B";
                      const pct = (value / AB_MAX) * 100;
                      return (
                        <div
                          key={key}
                          className="relative flex h-full w-[22px] items-end"
                        >
                          {/* ghost track - the skeleton you see before reveal */}
                          <div className="absolute inset-0 rounded-t-[4px] bg-[#f4f4f4]" />
                          <motion.div
                            initial={false}
                            animate={{ height: revealed ? `${pct}%` : "0%" }}
                            transition={{
                              type: "spring",
                              stiffness: 120,
                              damping: 18,
                              delay: revealed ? 0.1 + i * 0.08 + j * 0.04 : 0,
                            }}
                            className="relative z-10 w-full rounded-t-[4px]"
                            style={{ background: AB_COLORS[variantKey].mid }}
                          >
                            {revealed && (
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.45 + i * 0.08 + j * 0.04 }}
                                className="absolute -top-[18px] left-1/2 -translate-x-1/2 text-[11px] font-semibold tabular-nums"
                                style={{ color: AB_COLORS[variantKey].dark }}
                              >
                                {value}
                              </motion.span>
                            )}
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] font-medium text-[#6b6b6b]">
                    {m.name}
                  </p>
                </div>
              ))}
            </div>

            {/* Pre-reveal - frosted overlay with the prompt + CTA */}
            <AnimatePresence>
              {!revealed && (
                <motion.div
                  initial={false}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  /* bottom clears the label row (gap + line) so the CTA centres
                     over the bars alone; no top padding, which is what used to
                     shove it down onto the labels. */
                  className="absolute inset-x-0 -top-1 bottom-[34px] flex flex-col items-center justify-center gap-3 rounded-[8px] bg-white/55 backdrop-blur-[2px]"
                >
                  <p className="text-[13px] text-[#6b6b6b]">
                    See how the variants performed
                  </p>
                  <button
                    type="button"
                    onClick={reveal}
                    className="rounded-full bg-[#181212] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_14px_-3px_rgba(24,18,18,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_7px_18px_-3px_rgba(24,18,18,0.4)] active:translate-y-0 active:scale-95"
                  >
                    Show results
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer - winner callout + reset. Height is reserved up-front so the
              late-appearing winner banner never pushes the panel taller. */}
          <div className="mt-4 flex min-h-[52px] items-center justify-between gap-3">
            <AnimatePresence>
              {showWinner && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  /* Left edge is deliberately square. With a radius on all
                     four corners the accent followed the curve and pulled
                     away from the top and bottom, reading as a smudge rather
                     than a rule - squaring that one edge lets it run the full
                     height of the banner. */
                  className="flex items-center gap-3 rounded-r-[10px] border-l-[3px] bg-[#f8f8f8] py-2.5 pl-3.5 pr-4"
                  style={{ borderColor: AB_COLORS.A.dark }}
                >
                  <MedalIcon color={AB_COLORS.A.dark} />
                  <div>
                    <p className="text-[12px] font-semibold text-[#181212]">
                      Version A won
                    </p>
                    <p className="text-[11px] text-[#6b6b6b]">
                      Higher conversion - the primary metric
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {revealed && (
              <button
                type="button"
                onClick={reset}
                className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full border border-[#ececec] py-1.5 pl-2.5 pr-3.5 text-[12px] font-medium text-[#6b6b6b] transition-colors duration-200 hover:bg-[#f8f8f8] hover:text-[#181212]"
              >
                <ResetIcon />
                Reset
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ───────── Dynamic Type accessibility demo ─────────
 * Slider scrubs through 6 actual screenshots of the Games Tab
 * rendered at different iOS Dynamic Type sizes. Caption updates
 * per step to explain what's happening to the layout. */

const TYPE_SIZES = [
  {
    key: "s",
    label: "Small",
    src: "/figma/nyt-type-xs.webp",
    caption: "Compact text - more content fits on screen.",
    tone: "small",
    pct: 85,
  },
  {
    key: "default",
    label: "Default",
    src: "/figma/nyt-type-s.webp",
    caption: "iOS default - the baseline experience most users see.",
    tone: "default",
    pct: 100,
  },
  {
    key: "l",
    label: "Large",
    src: "/figma/nyt-type-default.webp",
    caption: "Cards and text scale smoothly without breaking the layout.",
    tone: "default",
    pct: 120,
  },
  {
    key: "xl",
    label: "xLarge",
    src: "/figma/nyt-type-large.webp",
    caption: "Larger text - still comfortable to read, more breathing room.",
    tone: "default",
    pct: 145,
  },
  {
    key: "xxl",
    label: "xxLarge",
    src: "/figma/nyt-type-xlarge.webp",
    caption: "Secondary cards collapse - content is prioritized for readability.",
    tone: "large",
    pct: 170,
  },
  {
    key: "xxxl",
    label: "xxxLarge",
    src: "/figma/nyt-type-xxlarge.webp",
    caption: "Maximum accessibility - layout fully adapts, key content stays clear.",
    tone: "large",
    pct: 200,
  },
] as const;

const TYPE_TONE_COLOR: Record<string, string> = {
  small: "#4A90D9",
  default: "#8BC34A",
  large: "#E85D4A",
};

function NYTDynamicTypeShowcase() {
  const [idx, setIdx] = useState(1);
  const step = TYPE_SIZES[idx];

  return (
    <div
      id="ACCESSIBILITY-DEMO"
      className="w-full overflow-hidden rounded-[24px] border border-[#ececec] bg-[#f8f8f8]"
    >
      {/* Phone screenshot - crossfade between sizes, centered with symmetric padding */}
      <div className="flex items-center justify-center p-10">
        <div className="relative aspect-square w-full max-w-[440px] overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.img
                  loading="lazy"
                  decoding="async"
              key={step.key}
              src={step.src}
              alt={`Games Tab - Dynamic Type ${step.label}`}
              className="absolute inset-0 h-full w-full object-contain"
              initial={{ opacity: 0, scale: 1.015 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{
                opacity: { duration: 0.55, ease: [0.4, 0, 0.2, 1] },
                scale: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
              }}
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="border-t border-[#ececec] bg-white px-7 py-6">
        {/* Hint - lets the user know the slider is interactive */}
        <p className="mb-3 text-center text-[11px] uppercase tracking-[0.12em] text-[#6b6b6b]">
          Drag to change text size
        </p>
        {/* Slider with small/large A labels */}
        <div className="flex items-center gap-4">
          <span className="w-4 shrink-0 text-center text-[11px] font-medium text-[#6b6b6b]">
            A
          </span>
          <input
            type="range"
            min={0}
            max={TYPE_SIZES.length - 1}
            value={idx}
            onChange={(e) => setIdx(parseInt(e.target.value, 10))}
            aria-label="Dynamic Type size"
            className="nyt-type-slider flex-1"
          />
          <span className="w-4 shrink-0 text-center text-[16px] font-bold text-[#6b6b6b]">
            A
          </span>
        </div>

        {/* Size label + percentage */}
        <div className="mt-3 flex items-center justify-center gap-2 text-[13px] font-semibold text-[#181212]">
          <span
            className="h-1.5 w-1.5 rounded-full transition-colors"
            style={{ background: TYPE_TONE_COLOR[step.tone] }}
          />
          {step.label}
          <span className="font-normal text-[#6b6b6b]">({step.pct}%)</span>
        </div>

        {/* Caption - crossfade */}
        <div className="relative mx-auto mt-2 h-[40px] max-w-[420px]">
          <AnimatePresence initial={false}>
            <motion.p
              key={step.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 text-center text-[13px] leading-[1.5] text-[#6b6b6b]"
            >
              {step.caption}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Slider styles - match the project's dark/light palette */}
      <style jsx>{`
        .nyt-type-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 3px;
          border-radius: 2px;
          background: #ececec;
          outline: none;
          cursor: pointer;
        }
        .nyt-type-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #181212;
          cursor: grab;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
          transition: transform 0.15s ease;
        }
        .nyt-type-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
        }
        .nyt-type-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border: none;
          border-radius: 50%;
          background: #181212;
          cursor: grab;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
        }
      `}</style>
    </div>
  );
}

/* ───────── Friend Invite - three-screen flow ───────── */
/* Auto-playing carousel cycling through 3 phone screenshots:
   Leaderboard → Send Invite → Accept Invite.
   Clicking a pill jumps to that step and pauses auto-play.
   Bottom dots indicate active step; caption describes the step.
   A play/pause status dot at the bottom shows the loop state. */

const INVITE_STEPS = [
  {
    src: "/figma/nyt-invite-1.webp",
    label: "Leaderboard",
    caption:
      "Players see the leaderboard with a clear prompt to add friends - no hunting through menus.",
  },
  {
    src: "/figma/nyt-invite-2.webp",
    label: "Send Invite",
    caption:
      "One-tap invite with a plain-English value proposition - no confusion about what happens next.",
  },
  {
    src: "/figma/nyt-invite-3.webp",
    label: "Accept Invite",
    caption:
      "Receiving an invite is just as simple - accept or reject in one tap, then you're playing together.",
  },
];

function NYTInviteShowcase() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    // Longer interval (5500ms) so each screen breathes before the next slide.
    const id = setInterval(() => {
      setStep((s) => (s + 1) % INVITE_STEPS.length);
    }, 5500);
    return () => clearInterval(id);
  }, [playing]);

  const goTo = (i: number) => {
    if (i === step) return;
    setPlaying(false);
    setStep(i);
  };

  return (
    <div
      id="FRIEND-INVITE-INTERACTIVE"
      className="flex w-full flex-col items-center rounded-[24px] bg-[#f8f8f8] px-4 py-10 sm:px-10 sm:py-16"
    >
      {/* Step pills - matches the A/B test toggle styling (white-on-white active),
          but without per-step dots since the steps aren't variant-colored. */}
      <div className="flex gap-1 rounded-full border border-[#e3e3e3] bg-white/70 p-1 backdrop-blur">
        {INVITE_STEPS.map((s, i) => (
          <button
            key={s.label}
            type="button"
            onClick={() => goTo(i)}
            className={
              "rounded-full px-4 py-2 text-[13px] transition-all duration-200 " +
              (step === i
                ? "bg-white font-semibold text-[#181212] shadow-sm"
                : "text-[#6b6b6b]")
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Phone screenshots - all three stay mounted and crossfade with a gentle
          directional drift on one shared ease, so nothing remounts, pops, or
          settles out of sync mid-transition. mt-6 matches A/B test's gap-6. */}
      <div className="relative mt-6 aspect-square w-full max-w-[440px] overflow-hidden">
        {INVITE_STEPS.map((s, i) => (
          <motion.img
            key={s.src}
            decoding="async"
            src={s.src}
            alt={s.label}
            initial={false}
            animate={
              i === step
                ? { opacity: 1, x: 0, scale: 1 }
                : { opacity: 0, x: i < step ? -32 : 32, scale: 0.985 }
            }
            transition={{ duration: 0.7, ease: EASE }}
            className="absolute inset-0 h-full w-full object-contain"
            style={{ zIndex: i === step ? 1 : 0 }}
          />
        ))}
      </div>

      {/* Step dots - sit close to the phone screen */}
      <div className="-mt-1 flex items-center gap-2">
        {INVITE_STEPS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to step ${i + 1}`}
            className={
              "h-1.5 rounded-full transition-all duration-500 ease-out " +
              (step === i ? "w-7 bg-[#181212]" : "w-1.5 bg-[#d4d4d4]")
            }
          />
        ))}
      </div>

      {/* Caption - crossfades on the same ease, slightly quicker than the screen */}
      <div className="relative mt-5 h-[48px] w-full max-w-[460px]">
        {INVITE_STEPS.map((s, i) => (
          <motion.p
            key={s.src}
            initial={false}
            animate={
              i === step
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: i < step ? -14 : 14 }
            }
            transition={{ duration: 0.6, ease: EASE }}
            className="absolute inset-0 text-center text-[15px] leading-[1.55] text-[#4a4a4a]"
          >
            {s.caption}
          </motion.p>
        ))}
      </div>
    </div>
  );
}

/* Hero bento - five separate blocks, each animated in with a choreographed
   stagger. Note: the on-disk filenames for the phone/icons blocks are swapped
   relative to their content (icons file = phone screen, phone file = icon grid). */
type BentoBlock = {
  key: string;
  src: string;
  alt: string;
  bg: string;
  /** grid placement (col / row spans) */
  area: React.CSSProperties;
  /** entrance offset */
  from: { x?: number; y?: number; scale?: number; rotate?: number };
  /** object-fit handling */
  fit: string;
  /** optional inner padding so artwork breathes inside the card */
  pad?: string;
};

const BENTO_BLOCKS: BentoBlock[] = [
  {
    key: "logo",
    src: "/figma/nyt-bento-logo.webp",
    alt: "NYT Games logo",
    bg: "#fbd300",
    area: { gridColumn: 1, gridRow: 1 },
    from: { y: -44, rotate: -3 },
    fit: "object-cover",
  },
  {
    key: "icons",
    src: "/figma/nyt-bento-phone.webp",
    alt: "The Games puzzle icons - Connections, Mini, Wordle, Crossword, Vertex, Spelling Bee, Sudoku and more",
    bg: "#f4f4f4",
    area: { gridColumn: 1, gridRow: "2 / span 2" },
    from: { x: -44, rotate: 2 },
    fit: "object-contain",
    pad: "p-[6%]",
  },
  {
    key: "phone",
    src: "/figma/nyt-bento-icons.webp",
    alt: "NYT Games app home screen - Good morning, choose a puzzle to play",
    bg: "#f4f4f4",
    area: { gridColumn: 2, gridRow: "1 / span 3" },
    from: { y: 56, scale: 0.9 },
    fit: "object-cover",
  },
  {
    key: "award",
    src: "/figma/nyt-bento-award.webp",
    alt: "Apple Design Award 2024 trophy",
    bg: "#000000",
    area: { gridColumn: 3, gridRow: "1 / span 2" },
    from: { x: 44, scale: 0.9, rotate: 3 },
    fit: "object-cover",
  },
  {
    key: "recognition",
    src: "/figma/nyt-bento-recognition.webp",
    alt: "Recognition - the app was recognized by Apple as a winner in the Delight and Fun category",
    bg: "#f4f4f4",
    area: { gridColumn: 3, gridRow: 3 },
    from: { y: 40 },
    fit: "object-contain",
  },
];

function NYTHeroBento() {
  return (
    <motion.div
      id="HERO-BENTO-GRID"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.14, delayChildren: 0.15 } },
      }}
      className="grid w-full gap-3 sm:gap-4"
      style={{
        gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "704fr 872fr 864fr",
        aspectRatio: "4320 / 2440",
      }}
    >
      {BENTO_BLOCKS.map((block) => (
        <motion.div
          key={block.key}
          style={{ ...block.area, background: block.bg }}
          variants={{
            hidden: {
              opacity: 0,
              x: block.from.x ?? 0,
              y: block.from.y ?? 0,
              scale: block.from.scale ?? 1,
              rotate: block.from.rotate ?? 0,
              filter: "blur(10px)",
            },
            show: {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              rotate: 0,
              filter: "blur(0px)",
              transition: {
                // springy, slightly overshooting settle for the transforms…
                type: "spring",
                stiffness: 120,
                damping: 14,
                mass: 0.9,
                // …with a smooth tween for opacity + de-blur
                opacity: { duration: 0.5, ease: EASE },
                filter: { duration: 0.6, ease: EASE },
              },
            },
          }}
          whileHover={{
            y: -6,
            scale: 1.015,
            transition: { type: "spring", stiffness: 300, damping: 20 },
          }}
          className="overflow-hidden rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:rounded-[18px]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
                  loading="lazy"
                  decoding="async"
            src={block.src}
            alt={block.alt}
            className={"h-full w-full " + block.fit + (block.pad ? " " + block.pad : "")}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ───────── Page ───────── */

export default function NYTGamesCaseStudy() {
  return (
    <div className="flex">
      <CaseStudySidebar items={NYT_NAV} />
      <main className="min-w-0 flex-1 px-5 pt-6 sm:px-8 lg:px-16 lg:pt-8">
        {/* Mobile back link - shown only when the sidebar is hidden */}
        <Link
          href="/"
          className="mb-6 inline-flex w-fit items-center gap-2 text-[15px] font-semibold text-[#181212] underline-offset-4 transition-colors hover:underline lg:hidden"
        >
          <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="20" y1="12" x2="4" y2="12" />
            <polyline points="11,5 4,12 11,19" />
          </svg>
          <span>Back</span>
        </Link>
        {/* ─── HERO ─── */}
        <motion.section
          id="overview"
          className="mt-6 flex flex-col gap-10 pb-12 sm:mt-12 lg:mt-[72px] lg:pb-[100px]"
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.15, delayChildren: 0.05 }}
        >
          <div className="flex flex-col gap-5">
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 1.1, ease: EASE }}
              className="max-w-[1100px] text-balance text-[34px] font-semibold leading-[1.1] text-[#181212] sm:text-[48px] sm:leading-[1.05] lg:text-[64px]"
            >
              The New York Times Games App
            </motion.h1>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.9, ease: EASE }}
              className="max-w-[900px] text-[20px] font-semibold leading-[1.25] text-[#181212] sm:text-[24px] lg:text-[28px]"
            >
              Designing for a daily habit
            </motion.p>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.85, ease: EASE }}
              className="max-w-[720px] text-[18px] leading-[1.5] text-[#4a4a4a]"
            >
              I joined through Capgemini Engineering and worked inside the NYT
              Games design team - on friend invites, onboarding, and the
              redesign that turned a crossword app into a home for every game.
              In 2024, the app won the Apple Design Award for Delight and Fun.
            </motion.p>
          </div>

          {/* Meta grid */}
          <motion.dl
            variants={fadeUp}
            transition={{ duration: 0.8, ease: EASE }}
            className="grid grid-cols-2 gap-x-8 gap-y-6 border-y border-[#ececec] py-8 sm:grid-cols-4 sm:gap-y-0"
          >
            <div className="flex flex-col gap-2">
              <dt className="text-[14px] text-[#6b6b6b]">Product</dt>
              <dd className="text-[18px] text-[#181212]">
                The New York Times Games App
              </dd>
            </div>
            <div className="flex flex-col gap-2">
              <dt className="text-[14px] text-[#6b6b6b]">Role</dt>
              <dd className="text-[18px] text-[#181212]">
                Senior Product Designer
              </dd>
            </div>
            <div className="flex flex-col gap-2">
              <dt className="text-[14px] text-[#6b6b6b]">Timeline</dt>
              <dd className="text-[18px] text-[#181212]">Q2 2022 – Q4 2023</dd>
            </div>
            <div className="flex flex-col gap-2">
              <dt className="text-[14px] text-[#6b6b6b]">Team</dt>
              <dd className="text-[18px] text-[#181212]">
                Design, Eng, PM, QA
              </dd>
            </div>
          </motion.dl>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-[15px] italic text-[#6b6b6b]"
          >
            Some metrics are directional to respect confidentiality.
          </motion.p>

          {/* Hero bento grid */}
          <motion.figure
            variants={fadeUp}
            transition={{ duration: 1.0, ease: EASE }}
            className="flex w-full flex-col gap-5"
          >
            <NYTHeroBento />
          </motion.figure>
        </motion.section>

        {/* ─── SCOPE ─── */}
        <section id="scope" className="pt-12 pb-12 flex flex-col gap-20 lg:pt-[100px] lg:pb-[100px]">
          <div className="grid grid-cols-1 items-start gap-x-12 gap-y-5 lg:grid-cols-[1fr_2fr]">
            <motion.h2
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10%" }}
              variants={labelSlide}
              transition={{ duration: 0.6, ease: EASE }}
              className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
            >
              Scope
            </motion.h2>
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10%" }}
              variants={fadeUp}
              transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
              className="flex flex-col gap-8 text-[18px] leading-[1.5] text-[#211B1C]"
            >
              <p className="text-[18px] font-normal leading-[1.5] text-[#4a4a4a]">
                I owned the friend invite fix and the Games Tab introduction,
                designed the onboarding test variants, and wrote the dynamic
                type specs for the new game cards.
              </p>
              <div className="flex flex-col gap-4">
                <InfoCard number="01" title="Friend invites">
                  Streamlined sending from three steps to two and resolved an
                  issue that invalidated invites when they were closed.
                </InfoCard>
                <InfoCard number="02" title="Onboarding">
                  Designed two variants of the first-launch screen. The selected
                  version remains in production as of 2026.
                </InfoCard>
                <InfoCard number="03" title="Games Tab introduction">
                  Designed the modal introducing the redesigned home. As of 2026,
                  the pattern is still used for new feature launches.
                </InfoCard>
                <InfoCard number="04" title="Dynamic type">
                  Defined how game cards adapt across text sizes on iOS and
                  Android, and conducted visual QA with engineering.
                </InfoCard>
              </div>
            </motion.div>
          </div>

          {/* Game icons strip - full width. mt-16 adds extra breathing room
              above the strip, on top of the section's gap-12. */}
          <motion.figure
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            variants={fadeUp}
            transition={{ duration: 0.9, ease: EASE }}
            className="mt-16 flex w-full flex-col gap-10"
          >
            <FigureCaption>The Games suite at a glance in 2023</FigureCaption>
            <NYTGameIconsRow />
          </motion.figure>
        </section>

        {/* ─── A/B TESTING ─── */}
        <section id="ab-testing" className="pt-12 pb-12 flex flex-col gap-20 lg:pt-[100px] lg:pb-[100px]">
          <div className="grid grid-cols-1 items-start gap-x-12 gap-y-5 lg:grid-cols-[1fr_2fr]">
            <motion.h2
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10%" }}
              variants={labelSlide}
              transition={{ duration: 0.6, ease: EASE }}
              className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
            >
              Onboarding. Designing the first-launch screen
            </motion.h2>
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10%" }}
              variants={fadeUp}
              transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-4 text-[18px] leading-[1.5] text-[#211B1C]">
                <p>
                  The first screen after download decides how a new player meets
                  the app. The team needed to choose between leading with the
                  value of a free account and simply welcoming players into the
                  games. Accounts matter to the business, but the product grows
                  through daily habit - and only players build habits.
                </p>
                <p>
                  I designed both variants. The NYT UX research team evaluated
                  them with users, and Version A was selected. As of 2026, it
                  remains in production.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Chip>Activation lift</Chip>
                <Chip>Conversion gain</Chip>
                <Chip>Stronger retention</Chip>
              </div>
            </motion.div>
          </div>

          <motion.figure
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            variants={fadeUp}
            transition={{ duration: 0.9, ease: EASE }}
            className="flex w-full flex-col gap-5"
          >
            <NYTABTestShowcase />
          </motion.figure>
        </section>

        {/* ─── SOCIAL FEATURES ─── */}
        <section id="social" className="pt-12 pb-12 flex flex-col gap-20 lg:pt-[100px] lg:pb-[100px]">
          <div className="grid grid-cols-1 items-start gap-x-12 gap-y-5 lg:grid-cols-[1fr_2fr]">
            <motion.h2
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10%" }}
              variants={labelSlide}
              transition={{ duration: 0.6, ease: EASE }}
              className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
            >
              Fixing the friend invite flow
            </motion.h2>
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10%" }}
              variants={fadeUp}
              transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-4 text-[18px] leading-[1.5] text-[#211B1C]">
                <p>
                  Players wanted to compete with friends but dropped off -
                  confusing CTAs, unclear value, 4 unnecessary steps.
                </p>
                <p>
                  I redesigned the flow end-to-end through usability testing:{" "}
                  <span className="font-semibold text-[#181212]">
                    cut steps in half, added contextual prompts at natural
                    moments, and rewrote every CTA
                  </span>{" "}
                  with action-oriented language.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Chip>Higher invite completion</Chip>
                <Chip>Two rounds of usability testing; key issues fixed before launch</Chip>
              </div>
            </motion.div>
          </div>

          <motion.figure
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            variants={fadeUp}
            transition={{ duration: 0.9, ease: EASE }}
            className="flex w-full flex-col gap-5"
          >
            <FigureCaption>Friend invite - three-screen flow</FigureCaption>
            <NYTInviteShowcase />
          </motion.figure>
        </section>

        {/* ─── ACCESSIBILITY & QUALITY ─── */}
        <section id="accessibility" className="pt-12 pb-12 flex flex-col gap-20 lg:pt-[100px] lg:pb-[100px]">
          <div className="grid grid-cols-1 items-start gap-x-12 gap-y-5 lg:grid-cols-[1fr_2fr]">
            <motion.h2
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10%" }}
              variants={labelSlide}
              transition={{ duration: 0.6, ease: EASE }}
              className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
            >
              Accessibility &amp; Quality
            </motion.h2>
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10%" }}
              variants={fadeUp}
              transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
              className="flex flex-col gap-6"
            >
              <p className="text-[18px] leading-[1.5] text-[#211B1C]">
                With millions of daily players across iOS and Android, every
                detail matters - especially during big launches like the new
                Games Tab.
              </p>
              <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoCard title="Accessibility-first">
                  I sat with QA regularly to catch issues early - dynamic
                  type, layout scaling, the stuff that breaks quietly if
                  nobody&apos;s watching.
                </InfoCard>
                <InfoCard title="Design system">
                  Standardized specs, improved documentation, regular
                  cross-team syncs. Fewer inconsistencies, faster handoffs.
                </InfoCard>
              </div>
            </motion.div>
          </div>

          {/* Dynamic type demo - full width */}
          <motion.figure
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            variants={fadeUp}
            transition={{ duration: 0.9, ease: EASE }}
            className="flex w-full flex-col gap-5"
          >
            <FigureCaption>
              Dynamic type - the UI reflows at every size
            </FigureCaption>
            <NYTDynamicTypeShowcase />
          </motion.figure>

          {/* Games Tab launch - text + visual. mt-[120px] on top of the
              section's gap-20 (80px) = 200px total, matching the inter-section
              spacing so this reads as its own section. */}
          <div className="mt-20 grid grid-cols-1 items-start gap-x-12 gap-y-5 lg:mt-[120px] lg:grid-cols-[1fr_2fr]">
            <motion.h2
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10%" }}
              variants={labelSlide}
              transition={{ duration: 0.6, ease: EASE }}
              className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
            >
              Games Tab launch support
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10%" }}
              variants={fadeUp}
              transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
              className="text-[18px] leading-[1.5] text-[#211B1C]"
            >
              Designed the onboarding modal for the Games Tab launch - a
              welcome moment seen by millions of players. The pattern was later
              reused across the product for other feature introductions.
            </motion.p>
          </div>

          <motion.figure
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            variants={fadeUp}
            transition={{ duration: 0.9, ease: EASE }}
            className="flex w-full flex-col gap-5"
          >
            <FigureCaption>Welcome modal - the launch animation</FigureCaption>
            <div
              id="WELCOME-MODAL"
              className="relative flex w-full items-center justify-center overflow-hidden rounded-[24px] bg-[#f8f8f8] py-12"
            >
              {/* Soft radial spotlight - lifts the phone off the flat canvas
                  and keeps it the focal point. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 40% 52% at 50% 50%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)",
                }}
              />

              {/* Floating game cards behind the phone, arranged in a 3-tier
                  depth field. "near" cards are larger / sharper / more opaque
                  and anchor opposite corners; "far" cards are small, blurred and
                  faint so they recede. Each drifts on its own phase for an
                  organic, parallax-like float. */}
              <div aria-hidden className="pointer-events-none absolute inset-0">
                {(() => {
                  const DEPTH = {
                    near: { size: 96, opacity: 0.55, blur: 0, shadow: "0 14px 26px rgba(0,0,0,0.08)", bob: 12, drift: 5, dur: 5 },
                    mid:  { size: 74, opacity: 0.4,  blur: 0.6, shadow: "0 9px 18px rgba(0,0,0,0.05)", bob: 8, drift: 3, dur: 6.6 },
                    far:  { size: 58, opacity: 0.24, blur: 1.4, shadow: "0 6px 12px rgba(0,0,0,0.03)", bob: 5, drift: 2, dur: 8.2 },
                  } as const;
                  const CARDS: {
                    src: string;
                    top: string;
                    left?: string;
                    right?: string;
                    rot: number;
                    depth: keyof typeof DEPTH;
                    delay: number;
                  }[] = [
                    // left side, top → bottom
                    { src: "/figma/nyt-card-sudoku.svg",      top: "8%",  left: "19%", rot: -4, depth: "far",  delay: 0.4 },
                    { src: "/figma/nyt-card-crossword.svg",   top: "34%", left: "8%",  rot: 5,  depth: "mid",  delay: 1.4 },
                    { src: "/figma/nyt-card-wordle.svg",      top: "60%", left: "4%",  rot: -9, depth: "near", delay: 0 },
                    { src: "/figma/nyt-card-sb.svg",          top: "82%", left: "20%", rot: 7,  depth: "mid",  delay: 0.8 },
                    // right side, top → bottom
                    { src: "/figma/nyt-card-tiles.svg",       top: "9%",  right: "23%", rot: -8, depth: "far",  delay: 1.1 },
                    { src: "/figma/nyt-card-connections.svg", top: "13%", right: "5%",  rot: 9,  depth: "near", delay: 0.3 },
                    { src: "/figma/nyt-card-mini.svg",        top: "48%", right: "8%",  rot: -6, depth: "mid",  delay: 1.0 },
                    { src: "/figma/nyt-card-lb.svg",          top: "74%", right: "18%", rot: 6,  depth: "far",  delay: 1.6 },
                  ];
                  return CARDS.map((c, i) => {
                    const d = DEPTH[c.depth];
                    return (
                      <motion.img
                  loading="lazy"
                  decoding="async"
                        key={i}
                        src={c.src}
                        alt=""
                        style={{
                          position: "absolute",
                          top: c.top,
                          left: c.left,
                          right: c.right,
                          width: d.size,
                          height: d.size,
                          opacity: d.opacity,
                          filter: `blur(${d.blur}px) drop-shadow(${d.shadow})`,
                          willChange: "transform",
                        }}
                        animate={{
                          y: [0, -d.bob, 0],
                          x: [0, d.drift, 0, -d.drift, 0],
                          rotate: [c.rot - 1.5, c.rot + 1.5, c.rot - 1.5],
                        }}
                        transition={{
                          duration: d.dur + (i % 3) * 0.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: c.delay,
                        }}
                      />
                    );
                  });
                })()}
              </div>

              {/* Phone frame composited with the welcome-modal GIF - sits above the cards */}
              <div className="relative z-10 aspect-square w-full max-w-[460px]">
                {/* iPhone frame */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  loading="lazy"
                  decoding="async"
                  src="/figma/iphone-frame.webp"
                  alt=""
                  className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                />
                {/* Welcome modal GIF in the phone's screen area */}
                <div
                  className="absolute overflow-hidden"
                  style={{
                    top: "5.6%",
                    bottom: "5.6%",
                    left: "29.2%",
                    right: "29.7%",
                    borderRadius: "13% / 6%",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                  loading="lazy"
                  decoding="async"
                    src="/figma/nyt-welcome-modal.gif"
                    alt="Games Tab welcome modal - puzzle grid animates in, then 'Introducing the Games tab' headline and 'Got it' button appear"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </motion.figure>
        </section>

        {/* ─── RECOGNITION ─── */}
        <section id="recognition" className="pt-12 pb-12 flex flex-col gap-20 lg:pt-[100px] lg:pb-[100px]">
          <div className="grid grid-cols-1 items-start gap-x-12 gap-y-5 lg:grid-cols-[1fr_2fr]">
            <motion.h2
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10%" }}
              variants={labelSlide}
              transition={{ duration: 0.6, ease: EASE }}
              className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
            >
              Award-winning product, incredible team
            </motion.h2>
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10%" }}
              variants={fadeUp}
              transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
              className="flex flex-col gap-4"
            >
              <p className="text-[18px] leading-[1.5] text-[#211B1C]">
                Proud to have been part of the team behind a 2024 Apple Design
                Award winner in Delight and Fun - an award that reflects what
                this team cared about most: craft, play, and making things feel
                right.
              </p>
            </motion.div>
          </div>

          <motion.figure
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            variants={fadeUp}
            transition={{ duration: 0.9, ease: EASE }}
            className="flex w-full flex-col gap-5"
          >
            <FigureCaption>
              Apple Design Award - winner, 2024
            </FigureCaption>
            <div
              id="RECOGNITION-PHONES"
              className="relative flex w-full justify-center overflow-hidden rounded-[24px] bg-[#f8f8f8] p-6 sm:p-12 lg:p-20"
            >
              {/* Soft spotlight fades in behind the phones for depth + focus */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 1.1, ease: EASE }}
                style={{
                  background:
                    "radial-gradient(ellipse 55% 62% at 50% 52%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 72%)",
                }}
              />
              {/* Phones rise into focus - spring scale + de-blur, matching the
                  page's other reveal animations. */}
              <motion.img
                  loading="lazy"
                  decoding="async"
                src="/figma/nyt-recognition.webp"
                alt="Two 3D-rendered iPhone mockups - one showing the Games Tab welcome modal, the other showing the Games Tab home screen"
                className="relative z-10 block h-auto w-[92%] max-w-[920px] rounded-[12px]"
                initial={{ opacity: 0, scale: 0.92, y: 36, filter: "blur(12px)" }}
                whileInView={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{
                  type: "spring",
                  stiffness: 90,
                  damping: 16,
                  mass: 0.9,
                  opacity: { duration: 0.6, ease: EASE },
                  filter: { duration: 0.7, ease: EASE },
                }}
                whileHover={{
                  y: -6,
                  scale: 1.01,
                  transition: { type: "spring", stiffness: 300, damping: 22 },
                }}
              />
            </div>
          </motion.figure>
        </section>

        {/* Bottom page-to-page nav, matches Back link style of the case study sidebar */}
        <nav className="mt-12 lg:mt-[100px] flex items-center justify-between gap-8 pb-[80px] text-[16px]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-semibold text-[#181212] underline-offset-4 transition-colors hover:underline"
          >
            <svg
              aria-hidden
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="20" y1="12" x2="4" y2="12" />
              <polyline points="11,5 4,12 11,19" />
            </svg>
            <span>Home</span>
          </Link>
          <Link
            href="/case-studies/kpi-platform"
            className="inline-flex items-center gap-2 font-semibold text-[#181212] underline-offset-4 transition-colors hover:underline"
          >
            <span>Next case study</span>
            <svg
              aria-hidden
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="12" x2="20" y2="12" />
              <polyline points="13,5 20,12 13,19" />
            </svg>
          </Link>
        </nav>
      </main>
    </div>
  );
}
