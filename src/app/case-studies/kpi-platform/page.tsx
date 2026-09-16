"use client";

import { motion } from "motion/react";
import { CaseStudySidebar } from "@/components/CaseStudySidebar";
import { KpiHeroShowcase } from "@/components/KpiHeroShowcase";
import { KpiProblemVisual } from "@/components/KpiProblemVisual";
import { KpiViewSwitcher } from "@/components/KpiViewSwitcher";
import { KpiStandardsDeck } from "@/components/KpiStandardsDeck";
import { KpiPaletteSystem } from "@/components/KpiPaletteSystem";
import { KpiA11yGuide } from "@/components/KpiA11yGuide";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────
 * KPI Platform — Case Study
 * Text-only pass. Images arrive later; every visual slot renders
 * an accessible, correctly-proportioned placeholder that carries
 * the final image's alt text now (role="img" + aria-label) so a
 * drop-in swap needs no a11y rework.
 *
 * Matches the shared case-study conventions: sidebar + scrollspy,
 * 1fr_2fr heading/body grid, type scale, palette, and motion.
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

/* Sidebar / scrollspy — one entry per section id below. */
const KPI_NAV = [
  { id: "overview", label: "Overview" },
  { id: "problem", label: "The Problem" },
  { id: "role", label: "Role & Approach" },
  { id: "solution", label: "The Solution" },
  { id: "decisions", label: "Key Decisions" },
  { id: "outcomes", label: "Outcomes" },
  { id: "learnings", label: "Learnings" },
];

/* Shared focus ring for links — the site's links only style :hover, so
   this adds the visible keyboard-focus state the a11y brief requires. */
const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#181212] focus-visible:rounded-sm";

/* Image placeholder — subtle tile, centered filename, ~16:9, and the
   real image's alt text pre-wired via role="img" + aria-label. */
function ImagePlaceholder({
  filename,
  alt,
  ratio = "16 / 9",
}: {
  filename: string;
  alt: string;
  ratio?: string;
}) {
  return (
    <div
      role="img"
      aria-label={alt}
      className="relative flex w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-[24px] border border-[#ececec] bg-[#f8f8f8] px-6 text-center"
      style={{ aspectRatio: ratio }}
    >
      <svg
        aria-hidden
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6b6b6b"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21,15 16,10 5,21" />
      </svg>
      <span className="text-[15px] font-semibold text-[#181212]">{filename}</span>
      <span className="text-[13px] uppercase tracking-[0.12em] text-[#6b6b6b]">
        Image placeholder
      </span>
    </div>
  );
}

/* ───────── Content (verbatim — light typographic formatting only) ───────── */

const META = [
  { label: "Role", value: "Senior User Experience Designer" },
  { label: "Timeline", value: "~5 months" },
  {
    label: "Team",
    value: "Data engineers, frontend developers, analysts & data owners",
  },
  {
    label: "Scope",
    value: "UX/UI, data visualization system, accessibility guide for data viz",
  },
];

const PRINCIPLES = [
  {
    n: "01",
    lead: "One home for every KPI",
    rest: "if a metric matters, it lives here.",
  },
  {
    n: "02",
    lead: "Data should look like the brand",
    rest: "charts as recognizable as the logo.",
  },
  {
    n: "03",
    lead: "Readable by everyone",
    rest: "accessibility as a system rule, not an afterthought.",
  },
];

type Solution = {
  n: string;
  heading: string;
  body: string;
  /* Set when the block renders a real interactive visual instead of
     image placeholders. */
  visual?: "view-switcher" | "standards-deck" | "a11y-guide";
  images: { filename: string; alt: string }[];
};

const SOLUTIONS: Solution[] = [
  {
    n: "1",
    heading: "One source of truth",
    body: "A unified analytics platform, powered by a well-structured data lake, brought every KPI into one place. Users can filter and drill down by team, period, and segment; compare metrics and periods side by side; land on role-based dashboards tailored to how they work; and export or share any view.",
    visual: "view-switcher",
    images: [],
  },
  {
    n: "2",
    heading: "Brand-aligned chart system",
    body: "Every chart and graph follows the brand palette, giving company data a consistent, recognizable visual identity. Instead of each team improvising chart styles, the system defines chart types, color usage, typography, and states — so a chart from any team looks like it belongs to the same company.",
    visual: "standards-deck",
    images: [],
  },
  {
    n: "3",
    heading: "Accessibility guide for charts",
    body: "To make the system scalable, I created a guide with clear rules for building charts readable by everyone — including users with low vision and color blindness: contrast requirements, color-independent encoding (patterns, labels, direct annotation), and text sizing. Anyone adding a new chart can keep it accessible and on-brand without me in the room.",
    visual: "a11y-guide",
    images: [],
  },
];

const DECISIONS = [
  {
    lead: "A platform, not better spreadsheets.",
    body: "Standardizing the Excel files would have been faster, but it would have preserved the core problem: fragmented ownership and static data. Building on a data lake cost more upfront and paid it back in trust — one pipeline, one definition per metric, always current.",
  },
  {
    lead: "Winning over the data owners.",
    body: "Teams didn’t want to give up “their” spreadsheets — those files were ownership and control. I involved analysts as co-designers of their own dashboards rather than presenting a finished tool, so the platform arrived as theirs, not as a replacement imposed on them.",
  },
  {
    lead: "One chart system instead of per-team styles.",
    body: "Letting each team keep familiar chart styles felt friendlier but would have rebuilt the inconsistency we were escaping. A single component-based chart system meant every new dashboard got consistency — and accessibility — for free.",
  },
  {
    lead: "Brand palette vs. accessible contrast.",
    body: "The brand colors weren’t all accessible on data visualizations. Rather than choosing between brand and readability, I extended the palette: adjusted tints for chart use that keep the brand recognizable while meeting contrast requirements — codified in the guide so the trade-off never has to be re-argued.",
  },
];

/* The phrase carrying each outcome is set semibold so the four cards can be
   skimmed on the claim alone. Same inline-emphasis span used on the home page. */
const OUTCOMES = [
  <>
    The platform became the{" "}
    <span className="font-semibold">
      single, interactive home for company data
    </span>{" "}
    — visible, explorable, and consistent across the organization.
  </>,
  <>
    <span className="font-semibold">Cross-team metrics</span> that previously
    required requesting files from their owners{" "}
    <span className="font-semibold">became self-serve</span>.
  </>,
  <>
    The visual language gave company data{" "}
    <span className="font-semibold">
      a recognizable identity in every report
    </span>{" "}
    and review.
  </>,
  <>
    The <span className="font-semibold">accessibility guide</span> outlived the
    project: it became <span className="font-semibold">the standard</span> for
    building new charts, making the system scalable by design.
  </>,
];

export default function KpiPlatformCaseStudy() {
  return (
    <div className="flex">
      <CaseStudySidebar items={KPI_NAV} />
      <main className="min-w-0 flex-1 px-5 pt-6 sm:px-8 lg:px-16 lg:pt-8">
        {/* Mobile back link — shown only when the sidebar is hidden */}
        <Link
          href="/"
          className={`mb-6 inline-flex w-fit items-center gap-2 text-[15px] font-semibold text-[#181212] underline-offset-4 transition-colors hover:underline lg:hidden ${FOCUS_RING}`}
        >
          <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="20" y1="12" x2="4" y2="12" />
            <polyline points="11,5 4,12 11,19" />
          </svg>
          <span>Back</span>
        </Link>

        {/* ─────────────── HERO ─────────────── */}
        <motion.section
          id="overview"
          className="mt-6 flex flex-col gap-10 sm:mt-12 lg:mt-[72px]"
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
              KPI Platform: From Spreadsheets to a Single Source of Truth
            </motion.h1>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.9, ease: EASE }}
              className="max-w-[900px] text-[20px] font-semibold leading-[1.25] text-[#181212] sm:text-[24px] lg:text-[28px]"
            >
              A unified analytics platform replacing dozens of spreadsheets
              with one interactive home for company KPIs.
            </motion.p>
          </div>

          {/* Meta block */}
          <motion.dl
            variants={fadeUp}
            transition={{ duration: 0.8, ease: EASE }}
            className="grid grid-cols-2 gap-x-8 gap-y-6 border-y border-[#ececec] py-8 sm:grid-cols-4 sm:gap-y-0"
          >
            {META.map((m) => (
              <div key={m.label} className="flex flex-col gap-2">
                <dt className="text-[14px] text-[#6b6b6b]">{m.label}</dt>
                <dd className="text-[18px] text-[#181212]">{m.value}</dd>
              </div>
            ))}
          </motion.dl>

          {/* NDA note */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.85, ease: EASE }}
            className="-mt-4 text-[14px] italic leading-[1.5] text-[#6b6b6b]"
          >
            Note: specific metrics are under NDA; outcomes are described
            qualitatively.
          </motion.p>

          {/* Hero visual — dashboard artboard with animated charts */}
          <motion.figure
            variants={fadeUp}
            transition={{ duration: 1.0, ease: EASE }}
            className="w-full"
          >
            <KpiHeroShowcase />
          </motion.figure>
        </motion.section>

        {/* ─────────────── THE PROBLEM ─────────────── */}
        <motion.section
          id="problem"
          className="mt-16 grid grid-cols-1 items-start gap-x-12 gap-y-5 lg:mt-[120px] lg:grid-cols-[1fr_2fr]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          transition={{ staggerChildren: 0.12 }}
        >
          <motion.h2
            variants={labelSlide}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
          >
            The Problem
          </motion.h2>
          <div className="flex flex-col gap-14">
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.9, ease: EASE }}
              className="flex flex-col gap-4 text-[18px] leading-[1.5] text-[#211B1C]"
            >
              <p>
                The company’s key metrics lived in disconnected Excel files —
                each owned by a different team, each invisible to everyone else.
              </p>
              <p>
                There was no shared view of performance: leadership couldn’t see
                the whole picture, and teams couldn’t see each other’s numbers.
                The data wasn’t interactive — no filtering, no drill-down, no
                exploration. And with every file following its own formats and
                conventions, even shared data was hard to read and easy to
                misinterpret.
              </p>
            </motion.div>

            <motion.figure
              variants={fadeUp}
              transition={{ duration: 0.9, ease: EASE }}
              className="flex w-full flex-col gap-5"
            >
              <KpiProblemVisual />
              <figcaption className="text-[15px] italic text-[#6b6b6b]">
                Before — metrics scattered across disconnected, team-owned
                spreadsheets.
              </figcaption>
            </motion.figure>
          </div>
        </motion.section>

        {/* ─────────────── MY ROLE & APPROACH ─────────────── */}
        <motion.section
          id="role"
          className="mt-16 flex flex-col gap-14 lg:mt-[120px]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          transition={{ staggerChildren: 0.12 }}
        >
          <div className="grid grid-cols-1 items-start gap-x-12 gap-y-5 lg:grid-cols-[1fr_2fr]">
            <motion.h2
              variants={labelSlide}
              transition={{ duration: 0.6, ease: EASE }}
              className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
            >
              My Role &amp; Approach
            </motion.h2>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.9, ease: EASE }}
              className="flex flex-col gap-4 text-[18px] leading-[1.5] text-[#211B1C]"
            >
              <p>
                As the only designer, I led the design end-to-end: from mapping
                how teams actually used their spreadsheets, through the
                platform’s UX and visual system, to the accessibility guide that
                let the system scale without me. Data engineers built the data
                lake; frontend developers implemented the UI; analysts and data
                owners were my key partners — and my toughest audience to win
                over.
              </p>
              <p className="text-[16px] font-semibold text-[#181212]">
                Three principles guided the work:
              </p>
            </motion.div>
          </div>

          {/* Principles — numbered cards */}
          <motion.ol
            variants={fadeUp}
            transition={{ duration: 0.8, ease: EASE }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-3"
          >
            {PRINCIPLES.map((p) => (
              <li
                key={p.n}
                className="flex flex-col gap-4 rounded-[20px] border border-[#ececec] bg-[#f8f8f8] p-7"
              >
                <span
                  aria-hidden
                  className="text-[40px] font-semibold leading-none tracking-[-0.02em] text-[#181212]"
                >
                  {p.n}
                </span>
                <p className="text-[18px] leading-[1.45] text-[#211B1C]">
                  <span className="font-semibold text-[#181212]">{p.lead}</span>{" "}
                  — {p.rest}
                </p>
              </li>
            ))}
          </motion.ol>
        </motion.section>

        {/* ─────────────── THE SOLUTION ─────────────── */}
        <motion.section
          id="solution"
          className="mt-24 grid grid-cols-1 items-start gap-x-12 gap-y-8 lg:mt-[160px] lg:grid-cols-[1fr_2fr]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          transition={{ staggerChildren: 0.1 }}
        >
          <motion.h2
            variants={labelSlide}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
          >
            The Solution
          </motion.h2>

          {/* Content column — the first block's heading sits on the same
              line as "The Solution", matching every other section. */}
          <div className="flex flex-col gap-16 lg:gap-24">
            {SOLUTIONS.map((s) => (
              <motion.div
                key={s.n}
                variants={fadeUp}
                transition={{ duration: 0.7, ease: EASE }}
                className="flex flex-col gap-8"
              >
                <div className="flex flex-col gap-3">
                  <h3 className="text-[18px] font-semibold leading-[1.5] text-[#181212]">
                    {s.n}. {s.heading}
                  </h3>
                  <p className="text-[18px] leading-[1.5] text-[#211B1C]">
                    {s.body}
                  </p>
                </div>
                {s.visual === "view-switcher" ? (
                  <figure className="flex w-full flex-col gap-5">
                    <KpiViewSwitcher />
                    <figcaption className="text-[15px] italic text-[#6b6b6b]">
                      One page, two programme views.
                    </figcaption>
                  </figure>
                ) : s.visual === "a11y-guide" ? (
                  <figure className="flex w-full flex-col gap-5">
                    <KpiA11yGuide />
                    <figcaption className="text-[15px] italic text-[#6b6b6b]">
                      The guide itself — contrast rules, colour-independent
                      encoding, and alt text, page by page.
                    </figcaption>
                  </figure>
                ) : s.visual === "standards-deck" ? (
                  <figure className="flex w-full flex-col gap-5">
                    <KpiStandardsDeck />
                    <figcaption className="text-[15px] italic text-[#6b6b6b]">
                      The standards deck the system ships with — chart
                      types, colour usage, typography, and the colour-pair
                      rules every chart is built against.
                    </figcaption>
                  </figure>
                ) : (
                  <div
                    className={
                      s.images.length > 1
                        ? "grid grid-cols-1 gap-5 sm:grid-cols-2"
                        : "grid grid-cols-1 gap-5"
                    }
                  >
                    {s.images.map((img) => (
                      <ImagePlaceholder
                        key={img.filename}
                        filename={img.filename}
                        alt={img.alt}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ─────────────── KEY DECISIONS ─────────────── */}
        <motion.section
          id="decisions"
          className="mt-24 flex flex-col gap-14 lg:mt-[160px]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          transition={{ staggerChildren: 0.1 }}
        >
          <motion.h2
            variants={labelSlide}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
          >
            Key Decisions
          </motion.h2>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.8, ease: EASE }}
            className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 md:gap-y-12"
          >
            {DECISIONS.map((d) => (
              <div
                key={d.lead}
                className="flex flex-col gap-3 border-t border-[#ececec] pt-6"
              >
                <p className="text-[18px] leading-[1.5] text-[#211B1C]">
                  <span className="font-semibold text-[#181212]">{d.lead}</span>{" "}
                  {d.body}
                </p>
              </div>
            ))}
          </motion.div>

          {/* The brand-palette / accessible-contrast decision, shown rather
              than asserted: the grid, the charts built from it, and the
              contrast each tint clears. */}
          <motion.figure
            variants={fadeUp}
            transition={{ duration: 0.9, ease: EASE }}
            className="flex w-full flex-col gap-5"
          >
            <KpiPaletteSystem />
            <figcaption className="text-[15px] italic text-[#6b6b6b]">
              Extending the brand palette — the tints each chart draws from
              light up in the grid, and each one is checked for contrast
              before it ships.
            </figcaption>
          </motion.figure>
        </motion.section>

        {/* ─────────────── OUTCOMES ─────────────── */}
        <motion.section
          id="outcomes"
          className="mt-24 grid grid-cols-1 items-start gap-x-12 gap-y-8 lg:mt-[160px] lg:grid-cols-[1fr_2fr]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          transition={{ staggerChildren: 0.1 }}
        >
          <motion.h2
            variants={labelSlide}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
          >
            Outcomes
          </motion.h2>

          <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
            {OUTCOMES.map((o, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                transition={{ duration: 0.7, ease: EASE }}
                className="flex flex-col gap-3 border-t border-[#ececec] pt-6"
              >
                <span
                  aria-hidden
                  /* Same type as the section heading above it. */
                  className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[18px] leading-[1.5] text-[#211B1C] sm:text-[20px]">
                  {o}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ─────────────── LEARNINGS ─────────────── */}
        <motion.section
          id="learnings"
          className="mt-24 grid grid-cols-1 items-start gap-x-12 gap-y-5 lg:mt-[160px] lg:grid-cols-[1fr_2fr]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          transition={{ staggerChildren: 0.12 }}
        >
          <motion.h2
            variants={labelSlide}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
          >
            Learnings
          </motion.h2>
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            /* Same body type as the Key Decisions paragraphs. */
            className="flex max-w-[680px] flex-col gap-4 text-[18px] leading-[1.5] text-[#211B1C]"
          >
            <p>
              Consolidating data is an organizational challenge wearing a
              technical costume — the hardest design work was earning trust from
              the people who owned the spreadsheets.
            </p>
            <p>
              And writing the accessibility guide changed how I design charts
              permanently: color is now the last encoding I reach for, not the
              first.
            </p>
          </motion.div>
        </motion.section>

        {/* Bottom page-to-page nav — points at Gen AI Engineering Platform while
            Vestige is still coming soon. */}
        <nav className="mt-24 flex items-center justify-between gap-8 pb-[80px] text-[16px] lg:mt-[160px]">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 font-semibold text-[#181212] underline-offset-4 transition-colors hover:underline ${FOCUS_RING}`}
          >
            <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="20" y1="12" x2="4" y2="12" />
              <polyline points="11,5 4,12 11,19" />
            </svg>
            <span>Home</span>
          </Link>
          <Link
            href="/case-studies/generative-engine"
            className={`inline-flex items-center gap-2 font-semibold text-[#181212] underline-offset-4 transition-colors hover:underline ${FOCUS_RING}`}
          >
            <span>Next case study</span>
            <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12" />
              <polyline points="13,5 20,12 13,19" />
            </svg>
          </Link>
        </nav>
      </main>
    </div>
  );
}
