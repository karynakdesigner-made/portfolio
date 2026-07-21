"use client";

import { motion } from "motion/react";
import { CaseStudySidebar } from "@/components/CaseStudySidebar";

/* ─────────────────────────────────────────────────────────────
 * KPI Platform — Case Study (stub)
 * Same layout, sidebar, type, and palette as the other case
 * studies. Full content to follow — this keeps the homepage
 * card's link live in the meantime.
 * ───────────────────────────────────────────────────────────── */

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const KPI_NAV = [{ id: "overview", label: "Overview" }];

export default function KpiPlatformCaseStudy() {
  return (
    <div className="flex">
      <CaseStudySidebar items={KPI_NAV} />
      <main className="min-w-0 flex-1 px-5 pt-6 sm:px-8 lg:px-16 lg:pt-8">
        {/* Mobile back link — shown only when the sidebar is hidden */}
        <a
          href="/"
          className="mb-6 inline-flex w-fit items-center gap-2 text-[15px] font-semibold text-[#181212] underline-offset-4 transition-colors hover:underline lg:hidden"
        >
          <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="20" y1="12" x2="4" y2="12" />
            <polyline points="11,5 4,12 11,19" />
          </svg>
          <span>Back</span>
        </a>

        {/* ─── HERO ─── */}
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
              KPI Platform
            </motion.h1>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.9, ease: EASE }}
              className="max-w-[900px] text-[20px] font-semibold leading-[1.25] text-[#181212] sm:text-[24px] lg:text-[28px]"
            >
              One platform, whole company. Metrics by level. Access by group.
              Clarity for everyone.
            </motion.p>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.85, ease: EASE }}
              className="text-[15px] italic text-[#6b6b6b]"
            >
              Full case study coming soon.
            </motion.p>
          </div>

          {/* Hero visual — the dashboard artwork from the homepage card */}
          <motion.figure
            variants={fadeUp}
            transition={{ duration: 1.0, ease: EASE }}
            className="flex w-full flex-col gap-5"
          >
            <div className="relative flex w-full items-center justify-center overflow-hidden rounded-[24px] bg-[#f8f8f8] p-6 sm:p-12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/figma/KPI Platform.png"
                alt="KPI Platform — On Time Delivery dashboard with monthly and daily delivery charts"
                className="block h-auto w-full max-w-[920px]"
              />
            </div>
          </motion.figure>
        </motion.section>

        {/* Bottom page-to-page nav — matches the other case studies */}
        <nav className="mt-24 flex items-center justify-between gap-8 pb-[80px] text-[16px] lg:mt-[200px]">
          <a
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
          </a>
          <a
            href="/case-studies/generative-engine"
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
          </a>
        </nav>
      </main>
    </div>
  );
}
