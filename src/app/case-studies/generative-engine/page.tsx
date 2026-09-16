"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CaseStudySidebar } from "@/components/CaseStudySidebar";
import { GepWelcomeHero } from "@/components/GepWelcomeHero";
import { Tilt3D } from "@/components/Tilt3D";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────
 * Studio Playground showcase — cycles through 4 stages:
 *   1. Welcome (Capgemini landing)
 *   2. Studio Playground empty state
 *   3. Same empty state + typewriter in the input field
 *   4. Full conversation revealed top-to-bottom (clip-path wipe)
 * ───────────────────────────────────────────────────────────── */

function TypewriterText({ text, speed = 50 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  /* Clear during render rather than from inside the effect: a new line
     of text has to start empty, and doing it here drops the extra
     render pass that showed a frame of the previous line. */
  const [renderedFor, setRenderedFor] = useState(text);
  if (renderedFor !== text) {
    setRenderedFor(text);
    setDisplayed("");
  }
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return (
    <span>
      {displayed}
      <span className="ml-[1px] inline-block h-[0.9em] w-[1.5px] animate-pulse bg-current align-middle" />
    </span>
  );
}

type StudioStage = "welcome" | "start" | "typing" | "conversation";

const STUDIO_STAGES: { type: StudioStage; duration: number }[] = [
  { type: "welcome", duration: 3000 },
  { type: "start", duration: 2000 },
  { type: "typing", duration: 4000 },
  { type: "conversation", duration: 8500 },
];

const USER_QUESTION = "Help me set up a Python client for the generative API";

/* AI response — appears line by line. Each entry is one rendered row.
   Mix of text rows and code rows, in the order they animate in. */
const AI_RESPONSE_LINES: { type: "text" | "code" | "blank"; content?: string }[] = [
  { type: "text", content: "Here's a starter for your Python client. The Gen AI Engineering Platform exposes an OpenAI-compatible endpoint:" },
  { type: "blank" },
  { type: "code", content: "import os" },
  { type: "code", content: "from openai import OpenAI" },
  { type: "blank" },
  { type: "code", content: "client = OpenAI(" },
  { type: "code", content: "    api_key=os.environ[\"GEN_API_KEY\"]," },
  { type: "code", content: "    base_url=\"https://api.gen-engine.capgemini.com/v1\"," },
  { type: "code", content: ")" },
  { type: "blank" },
  { type: "code", content: "response = client.chat.completions.create(" },
  { type: "code", content: "    model=\"gpt-5-nano\"," },
  { type: "code", content: "    messages=[{\"role\": \"user\", \"content\": \"Hi\"}]," },
  { type: "code", content: ")" },
];

function StudioPlaygroundShowcase() {
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStageIdx((s) => (s + 1) % STUDIO_STAGES.length);
    }, STUDIO_STAGES[stageIdx].duration);
    return () => clearTimeout(timer);
  }, [stageIdx]);

  const type = STUDIO_STAGES[stageIdx].type;
  // Playground-start screenshot stays visible across start/typing/conversation
  // so the sidebar and shell never animate. Only the centre chat area changes.
  const showPlaygroundShell = type === "start" || type === "typing" || type === "conversation";

  return (
    <div className="relative w-full overflow-hidden rounded-[24px] bg-[#f8f8f8] p-4 sm:p-8 lg:p-12">
      <div className="relative aspect-[1440/1024] w-full overflow-hidden rounded-[12px] bg-white">
        {/* Welcome — page-loading style entrance */}
        <motion.img
          src="/figma/studio-welcome.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          initial={false}
          animate={
            type === "welcome"
              ? { opacity: 1, filter: "blur(0px)", scale: 1 }
              : { opacity: 0, filter: "blur(6px)", scale: 1.015 }
          }
          transition={{
            opacity: { duration: 0.6, ease: "easeOut" },
            filter: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
          }}
        />
        {/* Page-load progress strip at top of welcome */}
        <motion.div
          className="absolute left-0 top-0 h-[2px] bg-[#3B82F6]"
          initial={false}
          animate={
            type === "welcome"
              ? { width: "100%", opacity: [0, 1, 1, 0] }
              : { width: "0%", opacity: 0 }
          }
          transition={
            type === "welcome"
              ? {
                  width: { duration: 1.6, ease: "easeOut" },
                  opacity: { duration: 2.4, times: [0, 0.05, 0.85, 1] },
                }
              : { duration: 0.2 }
          }
        />

        {/* Playground shell (visible during start, typing, conversation) */}
        <motion.img
          src="/figma/studio-start.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          initial={false}
          animate={{ opacity: showPlaygroundShell ? 1 : 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        />

        {/* Typewriter overlay inside the input field */}
        {type === "typing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.3 }}
            className="absolute left-[27.5%] top-[91%] flex h-[3.5%] w-[50%] items-center bg-white text-[12px] leading-none text-[#181212]"
          >
            <TypewriterText text={USER_QUESTION} speed={42} />
          </motion.div>
        )}

        {/* Conversation chat overlay — appears in chat area, sidebar never moves */}
        {type === "conversation" && <ChatThread />}
      </div>
    </div>
  );
}

function ChatThread() {
  return (
    <>
      {/* White panel covering the "Lets get started!" cards beneath */}
      <motion.div
        className="absolute left-[14%] top-[4%] bottom-[15%] right-[10%] bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      {/* User message bubble — appears first */}
      <motion.div
        className="absolute right-[10%] top-[7%] max-w-[55%] rounded-[8px] bg-[#f3f3f3] px-[1.2%] py-[0.8%] text-[12px] leading-[1.45] text-[#181212]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
      >
        {USER_QUESTION}
      </motion.div>

      {/* AI response — model header + line-by-line reveal */}
      <motion.div
        className="absolute left-[14%] top-[22%] flex flex-col gap-[0.4%] text-[12px] leading-[1.5] text-[#181212]"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.28, delayChildren: 1.1 } },
        }}
      >
        {/* Model header */}
        <motion.div
          className="mb-[0.6%] flex items-center gap-2 text-[12px] text-[#181212]"
          variants={{
            hidden: { opacity: 0, y: 6 },
            show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
          }}
        >
          <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#181212] text-[10px] font-bold text-white">
            ⌬
          </span>
          <span>openai-gpt-5-nano</span>
        </motion.div>

        {/* Response lines */}
        {AI_RESPONSE_LINES.map((line, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, y: 4 },
              show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
            }}
            className={
              line.type === "blank"
                ? "h-[0.4em]"
                : line.type === "code"
                  ? "font-mono text-[11px] text-[#181212]"
                  : "text-[12px] text-[#181212]"
            }
          >
            {line.content ?? " "}
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}

type BeforeCard = {
  src: string;
  label: string;
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  rotate: number;
  floatDuration: number;
  yAmp: number;
  delay: number;
  /** Pixel translation needed to bring the card's center to container center at the design viewport */
  hoverX: number;
  hoverY: number;
};

const BEFORE_CARDS: BeforeCard[] = [
  { src: "gep-old-chat.png", label: "Before — chat view", left: "2%", top: "6%", rotate: -4, floatDuration: 6, yAmp: -6, delay: 0, hoverX: 303, hoverY: 136 },
  { src: "gep-old-grid.png", label: "Before — agent grid", right: "3%", top: "3%", rotate: 5, floatDuration: 7, yAmp: -8, delay: 0.6, hoverX: -293, hoverY: 152 },
  { src: "gep-old-history.png", label: "Before — asset collection", left: "32%", top: "34%", rotate: -2, floatDuration: 5.5, yAmp: -5, delay: 0.3, hoverX: 10, hoverY: -17 },
  { src: "gep-old-studio.png", label: "Before — Studio playground", left: "4%", bottom: "4%", rotate: 4, floatDuration: 6.5, yAmp: -7, delay: 1.0, hoverX: 283, hoverY: -147 },
  { src: "gep-old-plans.png", label: "Before — plans selection", right: "3%", bottom: "5%", rotate: -5, floatDuration: 7.5, yAmp: -6, delay: 0.9, hoverX: -293, hoverY: -141 },
];

function BeforeCollage() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-[24px] bg-[#f8f8f8] p-4 sm:h-[480px] sm:p-8 lg:h-[640px] lg:p-12">
      <div className="relative h-full w-full">
        {BEFORE_CARDS.map((card, i) => {
          const isHovered = hovered === i;
          const isOtherHovered = hovered !== null && hovered !== i;
          return (
            <motion.div
              key={i}
              aria-label={card.label}
              className="absolute w-[34%] origin-center cursor-pointer overflow-hidden rounded-[8px] border-[6px] border-white bg-[#e8e8e8] bg-cover bg-top transition-[filter,opacity,box-shadow] duration-300 ease-out"
              style={{
                left: card.left,
                top: card.top,
                right: card.right,
                bottom: card.bottom,
                aspectRatio: "16 / 10",
                backgroundImage: `url(/figma/${card.src})`,
                zIndex: isHovered ? 50 : 1,
                filter: isOtherHovered ? "blur(2px)" : "blur(0px)",
                opacity: isOtherHovered ? 0.55 : 1,
                boxShadow: isHovered
                  ? "0 30px 70px -15px rgba(0,0,0,0.4)"
                  : "0 12px 28px -10px rgba(0,0,0,0.22)",
              }}
              onHoverStart={() => setHovered(i)}
              onHoverEnd={() => setHovered(null)}
              initial={{ rotate: card.rotate, x: 0, y: 0, scale: 1 }}
              animate={
                isHovered
                  ? { scale: 2.4, rotate: 0, x: card.hoverX, y: card.hoverY }
                  : { y: 0, x: 0, scale: 1, rotate: card.rotate }
              }
              transition={
                isHovered
                  ? { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
                  : { duration: 0 }
              }
            />
          );
        })}
      </div>
    </div>
  );
}

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const labelSlide = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0 },
};

function PlaceholderBox({
  ratio,
  label,
  tight = false,
}: {
  ratio: string;
  label: string;
  tight?: boolean;
}) {
  return (
    <div
      className={`relative flex w-full items-center justify-center overflow-hidden rounded-[24px] bg-[#f8f8f8] ${tight ? "" : ""}`}
      style={{ aspectRatio: ratio }}
    >
      <p className="px-6 text-center text-[14px] text-[#6b6b6b]">{label}</p>
    </div>
  );
}

type SurfaceLine = { label: string; body: string };
type SurfaceVisual = { ratio: string; caption: string; threeCol?: boolean };

function Surface({
  title,
  tier,
  lines,
  visuals,
  customVisual,
}: {
  title: string;
  tier: "hero" | "supporting" | "supporting-pivotal";
  lines: SurfaceLine[];
  visuals: SurfaceVisual[];
  customVisual?: React.ReactNode;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10%" }}
      transition={{ staggerChildren: 0.12 }}
      className="flex flex-col gap-20"
    >
      {/* Title + lines (2-col grid) */}
      <div className="grid grid-cols-1 items-start gap-x-12 gap-y-5 lg:grid-cols-[1fr_2fr]">
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex flex-col gap-2"
        >
          <h3 className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]">
            {title}
          </h3>
          {tier === "supporting-pivotal" && (
            <span className="mt-1 self-start rounded-full bg-[#faf7f0] px-3 py-1 text-[14px] font-semibold text-[#4a4a4a]">
              pivotal
            </span>
          )}
        </motion.div>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex flex-col gap-4 text-[18px] leading-[1.5]"
        >
          {lines.map((l, i) => (
            <p key={i}>
              <span className="font-semibold text-[#181212]">{l.label}</span>{" "}
              <span className="text-[#211B1C]">{l.body}</span>
            </p>
          ))}
        </motion.div>
      </div>

      {/* Visuals — full content width */}
      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.7, ease: EASE }}
        className="flex w-full flex-col gap-12"
      >
        {customVisual ?? visuals.map((v, i) =>
          v.threeCol ? (
            <figure key={i} className="flex w-full flex-col gap-5">
              <figcaption className="text-[15px] italic text-[#6b6b6b]">{v.caption}</figcaption>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {["Template", "Configure", "Preview / Publish"].map((step, j) => (
                  <PlaceholderBox key={j} ratio="320 / 240" label={`Step ${j + 1} — ${step}`} />
                ))}
              </div>
            </figure>
          ) : (
            <figure key={i} className="flex w-full flex-col gap-5">
              <figcaption className="text-[15px] italic text-[#6b6b6b]">{v.caption}</figcaption>
              <PlaceholderBox ratio={v.ratio} label={`Visual placeholder — ${title}`} />
            </figure>
          )
        )}
      </motion.div>
    </motion.div>
  );
}

/* ───── Generic step carousel — large preview on top, clickable thumbnails
   below. Hovering the hero reveals prev/next arrows; clicking the left or
   right half of the hero steps through the sequence like a carousel.
   Thumbnails still jump straight to a given step; active thumb gets a
   Capgemini-cyan ring; crossfade between previews.
   Used by Create Agent and Studio Management sections. */
type CarouselStep = { src: string; caption: string; alt: string };

function CarouselArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points={direction === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
    </svg>
  );
}

function StepCarousel({ steps }: { steps: readonly CarouselStep[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = steps[activeIdx];
  // Map step count to a 2-/3-col Tailwind class for the thumb strip.
  const gridCols = steps.length === 2 ? "grid-cols-2" : "grid-cols-3";

  const goPrev = () => setActiveIdx((i) => (i - 1 + steps.length) % steps.length);
  const goNext = () => setActiveIdx((i) => (i + 1) % steps.length);

  return (
    <div className="flex w-full flex-col gap-8">
      {/* Hero preview — crossfades when the active step changes. The aspect
          ratio is locked to the source images (5760×4096 ≈ 45/32) so the
          container size never shifts between transitions. Tilt3D adds the
          subtle 3D hover (main visual only — thumbnails stay flat). */}
      <div className="relative w-full overflow-hidden rounded-[24px] bg-[#f8f8f8] p-4 sm:p-8 lg:p-12">
        <Tilt3D className="w-full">
          <div className="group/hero relative w-full overflow-hidden rounded-[12px] aspect-[5760/4096]">
            <AnimatePresence initial={false}>
              <motion.img
                key={active.src}
                src={active.src}
                alt={active.alt}
                className="absolute inset-0 h-full w-full rounded-[12px] object-cover shadow-[0_20px_50px_-20px_rgba(0,0,0,0.18)]"
                initial={{ opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.995 }}
                transition={{
                  opacity: { duration: 0.55, ease: [0.4, 0, 0.2, 1] },
                  scale: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                }}
              />
            </AnimatePresence>

            {steps.length > 1 && (
              <>
                {/* Left half — click to go to the previous step */}
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous step"
                  className="absolute inset-y-0 left-0 flex w-1/2 items-center justify-start pl-4 opacity-0 outline-none transition-opacity duration-300 group-hover/hero:opacity-100 focus-visible:opacity-100 sm:pl-6"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#181212] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-110">
                    <CarouselArrowIcon direction="left" />
                  </span>
                </button>

                {/* Right half — click to go to the next step */}
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next step"
                  className="absolute inset-y-0 right-0 flex w-1/2 items-center justify-end pr-4 opacity-0 outline-none transition-opacity duration-300 group-hover/hero:opacity-100 focus-visible:opacity-100 sm:pr-6"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#181212] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-110">
                    <CarouselArrowIcon direction="right" />
                  </span>
                </button>
              </>
            )}
          </div>
        </Tilt3D>
      </div>

      {/* Thumbnail strip — clickable buttons that select which step shows above */}
      <div className={`grid w-full gap-5 ${gridCols}`}>
        {steps.map((step, i) => {
          const isActive = i === activeIdx;
          return (
            <button
              key={step.caption}
              type="button"
              onClick={() => setActiveIdx(i)}
              aria-pressed={isActive}
              aria-label={`Show ${step.caption} step`}
              className={
                "group/step flex flex-col gap-3 text-left outline-none transition-opacity duration-300 " +
                (isActive ? "" : "opacity-70 hover:opacity-100")
              }
            >
              <div
                className={
                  "overflow-hidden rounded-[16px] bg-[#f8f8f8] p-5 transition-all duration-300 " +
                  (isActive
                    ? "ring-2 ring-[#1db8f2] ring-offset-2 ring-offset-white"
                    : "ring-1 ring-transparent hover:bg-[#f0f0f0]")
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  loading="lazy"
                  decoding="async"
                  src={step.src}
                  alt={step.alt}
                  className="block h-auto w-full rounded-[8px] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.15)]"
                />
              </div>
              <figcaption
                className={
                  "text-center text-[15px] italic transition-colors duration-300 " +
                  (isActive ? "text-[#181212]" : "text-[#6b6b6b]")
                }
              >
                {step.caption}
              </figcaption>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const CREATE_AGENT_STEPS: readonly CarouselStep[] = [
  {
    src: "/figma/create-agent-step1.webp",
    caption: "Identity",
    alt: "Create Agent — Step 1: Agent Info. Name, title, descriptions and avatar grid.",
  },
  {
    src: "/figma/create-agent-step2.webp",
    caption: "Configuration",
    alt: "Create Agent — Step 2: Agent Config.",
  },
  {
    src: "/figma/create-agent-step3.webp",
    caption: "Access",
    alt: "Create Agent — Step 3: User Management.",
  },
];

const STUDIO_MGMT_STEPS: readonly CarouselStep[] = [
  {
    src: "/figma/gep-studio-users.webp",
    caption: "Users",
    alt: "Studio Management — User Management tab showing the monthly budget meter, cost breakdown cards, and a Studio Users table with roles, budgets, usage bars, and a Catherine Lee row in red indicating a 100% budget overflow.",
  },
  {
    src: "/figma/gep-studio-keys.webp",
    caption: "Keys",
    alt: "Studio Management — API Keys tab showing Studio API Keys and User Keys tables with scope, budget, usage, expiry, status, and a context menu with Change budget / Regenerate key / Delete key.",
  },
  {
    src: "/figma/gep-studio-agents.webp",
    caption: "Agents",
    alt: "Studio Management — Studio Agents tab showing the Studio (Custom) Agents table with agent name, role, and cumulative usage.",
  },
];

export default function GenAiEngineeringCaseStudy() {
  return (
    <div className="flex">
      <CaseStudySidebar />
      <main className="min-w-0 flex-1 px-5 pt-6 sm:px-8 lg:px-16 lg:pt-8">
      {/* Mobile back link — shown only when the sidebar is hidden */}
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

      {/* BLOCK 1 — HERO */}
      <motion.section
        id="overview"
        className="mt-6 flex flex-col gap-10 pb-12 sm:mt-12 lg:mt-[72px] lg:pb-[100px]"
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.15, delayChildren: 0.05 }}
      >
        {/* Title + Subtitle */}
        <div className="flex flex-col gap-5">
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 1.1, ease: EASE }}
            className="max-w-[1100px] text-balance text-[34px] font-semibold leading-[1.1] text-[#181212] sm:text-[48px] sm:leading-[1.05] lg:text-[64px]"
          >
            Gen AI Engineering Platform
          </motion.h1>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.9, ease: EASE }}
            className="max-w-[900px] text-[20px] font-semibold leading-[1.25] text-[#181212] sm:text-[24px] lg:text-[28px]"
          >
            Redesigning an Internal AI Ecosystem for 300k+ Employees
          </motion.p>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.85, ease: EASE }}
            className="max-w-[720px] text-[18px] leading-[1.5] text-[#4a4a4a]"
          >
            How I led the UX transformation of Capgemini&apos;s Gen AI
            Engineering Platform — from engineer&apos;s tool to platform anyone
            can use.
          </motion.p>
        </div>

        {/* Meta grid with dividers */}
        <motion.dl
          variants={fadeUp}
          transition={{ duration: 0.8, ease: EASE }}
          className="grid grid-cols-2 gap-x-8 gap-y-6 border-y border-[#ececec] py-8 sm:grid-cols-4 sm:gap-y-0"
        >
          <div className="flex flex-col gap-2">
            <dt className="text-[14px] text-[#6b6b6b]">Product</dt>
            <dd className="text-[18px] text-[#181212]">
              Gen AI Engineering Platform
            </dd>
          </div>
          <div className="flex flex-col gap-2">
            <dt className="text-[14px] text-[#6b6b6b]">Role</dt>
            <dd className="text-[18px] text-[#181212]">Senior User Experience Designer</dd>
          </div>
          <div className="flex flex-col gap-2">
            <dt className="text-[14px] text-[#6b6b6b]">Timeline</dt>
            <dd className="text-[18px] text-[#181212]">Q2 2025 – Q2 2026</dd>
          </div>
          <div className="flex flex-col gap-2">
            <dt className="text-[14px] text-[#6b6b6b]">Scope</dt>
            <dd className="text-[18px] text-[#181212]">
              20+ features · Design system
            </dd>
          </div>
        </motion.dl>

        {/* Hero visual — animated Welcome screen with looping video slots */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 1.0, ease: EASE }}
          className="relative w-full overflow-hidden rounded-[24px] bg-[#f8f8f8] p-4 sm:p-8 lg:p-12"
        >
          <GepWelcomeHero />
        </motion.div>
      </motion.section>


      {/* BLOCK 2 — IMPACT */}
      {(() => {
        const stats = [
          {
            num: (
              <>
                10<span className="text-[0.6em]">k</span>+
              </>
            ),
            title: "Active Users",
            description:
              "Grew from 300 to 10,000+ active users in 3 months — from an engineers-only tool into everyday use across the organization.",
          },
          {
            num: "20+",
            title: "Features Shipped",
            description:
              "Studio Management, Create Agent, AI Team, Marketplace, n8n Integration, API Key Management, Publish-as-Agent, and more — all under a single design system.",
          },
          {
            num: "1",
            title: "Design System",
            description:
              "Built a foundational design system from scratch covering tokens, components, and patterns adopted by every squad.",
          },
          {
            num: "Sole",
            title: "Product Designer",
            description:
              "Embedded with product and engineering, owning research, design, and design systems end-to-end.",
          },
        ];
        return (
          <motion.section
            id="impact"
            className="mt-16 lg:mt-[120px] grid grid-cols-1 items-start gap-x-12 gap-y-5 lg:grid-cols-[1fr_2fr]"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            transition={{ staggerChildren: 0.1 }}
          >
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.8, ease: EASE }}
              className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
            >
              Impact &amp;
              <br />
              Business Outcomes
            </motion.h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:gap-x-12 sm:gap-y-14">
              {stats.map((s, i) => (
                <motion.div
                  key={`stat-${i}`}
                  variants={fadeUp}
                  transition={{ duration: 0.7, ease: EASE }}
                  className="flex flex-col border-t border-[#ececec] pt-6"
                >
                  <p className="whitespace-nowrap text-[44px] font-semibold leading-none tracking-[-0.02em] text-[#181212] sm:text-[56px] lg:text-[72px]">
                    {s.num}
                  </p>
                  <p className="mt-4 text-[16px] font-semibold leading-[1.4] text-[#181212] sm:text-[18px]">
                    {s.title}
                  </p>
                  <p className="mt-2 max-w-[320px] text-[15px] leading-[1.6] text-[#6b6b6b]">
                    {s.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        );
      })()}

      {/* BLOCK 3 — CONTEXT */}
      <section id="context" className="mt-16 lg:mt-[120px] grid grid-cols-1 items-start gap-x-12 gap-y-5 lg:grid-cols-[1fr_2fr]">
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          variants={labelSlide}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
        >
          Context
        </motion.h2>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          transition={{ staggerChildren: 0.12 }}
          className="flex flex-col gap-20"
        >
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.9, ease: EASE }}
            className="text-[18px] leading-[1.5] text-[#211B1C]"
          >
            Capgemini&apos;s Gen AI Engineering Platform started as an internal tool for
            engineers experimenting with LLMs. The redesign had to make it usable
            for 300,000+ employees doing real work — without engineering help.
          </motion.p>

          {/* Personas */}
          <motion.figure
            variants={fadeUp}
            transition={{ duration: 0.9, ease: EASE }}
            className="flex w-full flex-col gap-5"
          >
            <figcaption className="text-[15px] italic text-[#6b6b6b]">
              These personas guided our decisions throughout the redesign — from the non-technical
              employee opening the tool for the first time to the engineer who built it.
            </figcaption>
            <div className="relative w-full overflow-hidden rounded-[24px] bg-[#f8f8f8] p-4 sm:p-8 lg:p-12">
              <Tilt3D className="w-full">
                {/* Keyline drawn here rather than baked into the export. The
                    previous JPG carried its own border at a ~4px effective
                    radius, which rounded-[12px] clipped straight through —
                    breaking the line at all four corners. This export is
                    edge-to-edge white, so CSS owns the border and the radius
                    and the arcs stay closed at any render width. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  loading="lazy"
                  decoding="async"
                  src="/figma/Personas.jpg"
                  alt="User personas developed for the Gen AI Engineering Platform redesign, covering the range of technical and non-technical employees the platform needed to serve."
                  className="block h-auto w-full rounded-[12px] border border-[#D9D9D9]"
                />
              </Tilt3D>
            </div>
          </motion.figure>
        </motion.div>
      </section>

      {/* BLOCK 4 — MY ROLE */}
      <section id="role" className="mt-16 lg:mt-[120px] grid grid-cols-1 items-start gap-x-12 gap-y-5 lg:grid-cols-[1fr_2fr]">
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          variants={labelSlide}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
        >
          My Role
        </motion.h2>
        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          variants={fadeUp}
          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
          className="text-[18px] leading-[1.5] text-[#211B1C]"
        >
          Sole Product Designer, embedded with product and engineering. End-to-end
          ownership across research, IA, interaction, visual design, and the
          design system. I wrote the component documentation myself.
        </motion.p>
      </section>

      {/* BLOCK 5 — THE STRATEGIC PROBLEM */}
      <section id="problem" className="mt-16 flex flex-col gap-20 lg:mt-[120px]">
        <div className="grid grid-cols-1 items-start gap-x-12 gap-y-5 lg:grid-cols-[1fr_2fr]">
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            variants={labelSlide}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
          >
            Strategic Problem
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            variants={fadeUp}
            transition={{ duration: 0.9, ease: EASE }}
            className="flex flex-col gap-4 text-[18px] leading-[1.5] text-[#211B1C]"
          >
            <p>
              The platform was built by engineers, for engineers. Every screen
              assumed you knew what a temperature parameter was, what a system
              prompt did, what to do with a knowledge base.
            </p>
            <p>
              The non-technical users we needed to bring on opened the tool,
              didn&apos;t know where to start, and didn&apos;t come back. The
              redesign had to make AI configuration disappear behind decisions
              a non-engineer would actually make.
            </p>
          </motion.div>
        </div>

        {/* "Before" animated collage — full content width */}
        <motion.figure
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          variants={fadeUp}
          transition={{ duration: 0.9, ease: EASE }}
          className="flex w-full flex-col gap-5"
        >
          <figcaption className="text-[15px] italic text-[#6b6b6b]">
            Before — the engineering-first interface
          </figcaption>
          <BeforeCollage />
        </motion.figure>
      </section>

      {/* BLOCK 6 — RESEARCH → PRINCIPLES */}
      <section id="research" className="pt-12 pb-12 lg:pt-[100px] lg:pb-[100px] grid grid-cols-1 items-start gap-x-12 gap-y-5 lg:grid-cols-[1fr_2fr]">
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          variants={labelSlide}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
        >
          Research → Principles
        </motion.h2>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          transition={{ staggerChildren: 0.12 }}
          className="flex flex-col gap-20"
        >
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.9, ease: EASE }}
            className="text-[18px] leading-[1.5] text-[#211B1C]"
          >
            12+ user interviews plus surveys across the organization. Three
            insights that shaped the platform&apos;s design.
          </motion.p>

          {/* Synthesis table */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.9, ease: EASE }}
            className="flex flex-col"
          >
            {/* Header row */}
            <div className="hidden grid-cols-[1fr_1fr_1fr] gap-8 border-b border-[#ececec] pb-4 text-[14px] font-semibold uppercase text-[#6b6b6b] lg:grid">
              <span>Insight</span>
              <span>Decision</span>
              <span>Shipped as</span>
            </div>
            {[
              {
                insight: "Non-technical users didn’t know what to type.",
                principle: "Lower the floor — every surface starts with examples or a template.",
                shipped: "AI Team’s pre-built specialists, Marketplace browsing",
              },
              {
                insight: "Users configured once and lost everything.",
                principle: "Persistent state — your work is always there when you come back.",
                shipped: "Save Config (Studio)",
              },
              {
                insight: "Users built something good and didn’t know what to do next.",
                principle: "Make the path from experiment to share obvious.",
                shipped: "Publish-as-Agent flow",
              },
            ].map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-3 border-b border-[#ececec] py-6 lg:grid-cols-[1fr_1fr_1fr] lg:gap-8 lg:py-8"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6b6b6b] lg:hidden">
                    Insight
                  </span>
                  <p className="text-[20px] font-semibold leading-[1.4] text-[#211B1C]">
                    {row.insight}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6b6b6b] lg:hidden">
                    Decision
                  </span>
                  <p className="text-[18px] leading-[1.5] text-[#211B1C]">
                    {row.principle}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6b6b6b] lg:hidden">
                    Shipped as
                  </span>
                  <p className="text-[18px] leading-[1.5] text-[#6b6b6b]">
                    {row.shipped}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Card sorting exercise — full content width */}
          <motion.figure
            variants={fadeUp}
            transition={{ duration: 0.9, ease: EASE }}
            className="flex w-full flex-col gap-5"
          >
            <figcaption className="text-[15px] italic text-[#6b6b6b]">
              A card sorting exercise with employees across the organization — used to validate
              how non-technical users expected the platform&apos;s features to be grouped and named.
            </figcaption>
            <div className="relative w-full overflow-hidden rounded-[24px] bg-[#f8f8f8] p-4 sm:p-8 lg:p-12">
              <Tilt3D className="w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  loading="lazy"
                  decoding="async"
                  src="/figma/GEP Card Sorting.jpg"
                  alt="Card sorting exercise results — participants grouping Gen AI Engineering Platform features and terminology into categories that matched their mental model."
                  className="block h-auto w-full rounded-[12px]"
                />
              </Tilt3D>
            </div>
          </motion.figure>
        </motion.div>
      </section>

      {/* BLOCK 7 — THE WORK */}
      <section id="work" className="mt-24 flex flex-col gap-20 lg:mt-[200px] lg:gap-[120px]">
        {/* 7A — Studio Playground (hero surface) */}
        <Surface
          title="Studio Playground"
          tier="hero"
          lines={[
            { label: "The problem:", body: "Every visit started from zero — model, parameters, prompt, knowledge base, all reset." },
            { label: "The move:", body: "A persistent config primitive that saves your setup automatically and bridges to publishing." },
            { label: "The outcome:", body: "Studio became the most-used surface on the platform." },
          ]}
          visuals={[]}
          customVisual={
            <div className="relative w-full overflow-hidden rounded-[24px] bg-[#f8f8f8] p-4 sm:p-8 lg:p-12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                  loading="lazy"
                  decoding="async"
                src="/figma/studio-conversation.webp"
                alt="Studio Playground — conversation view with model selector, knowledge base, and AI response containing markdown and a code snippet"
                className="block h-auto w-full rounded-[12px]"
              />
            </div>
          }
        />

        {/* 7B — Create Agent (hero surface) */}
        <Surface
          title="Create Agent"
          tier="hero"
          lines={[
            { label: "The problem:", body: "Building an agent meant facing one screen full of technical fields with no structure." },
            { label: "The move:", body: "Three steps, each with one purpose — identity, configuration, access." },
            { label: "The outcome:", body: "Non-technical users built and shipped agents without engineering help." },
          ]}
          visuals={[]}
          customVisual={<StepCarousel steps={CREATE_AGENT_STEPS} />}
        />

        {/* 7C — AI Team (supporting) */}
        <Surface
          title="AI Team"
          tier="supporting"
          lines={[
            { label: "The problem:", body: "Users didn’t know which model or agent to pick." },
            { label: "The move:", body: "A team of pre-built AI specialists framed as people, not parameters." },
            { label: "The outcome:", body: "First-message friction collapsed." },
          ]}
          visuals={[]}
          customVisual={
            <div className="relative w-full overflow-hidden rounded-[24px] bg-[#f8f8f8] p-4 sm:p-8 lg:p-12">
              <Tilt3D className="w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  loading="lazy"
                  decoding="async"
                  src="/figma/gep-aiteam.webp"
                  alt="AI Team — pre-built specialist agents (Naomi, Tom, Helen, Brin) shown as a browsable grid with category filters and Jenn as Daily Companion at the top."
                  className="block h-auto w-full rounded-[12px]"
                />
              </Tilt3D>
            </div>
          }
        />

        {/* 7D — Marketplace */}
        <Surface
          title="Marketplace / Community"
          tier="supporting"
          lines={[
            { label: "The problem:", body: "Teams across Capgemini were building AI work — agents, plugins, tools, full client solutions — but had no way to share, find, or build on each other’s output." },
            { label: "The move:", body: "A central library with browsable categories, asset preview cards, and a detail page for every asset: full description, video, downloads, try-it, and direct contact with the author." },
            { label: "The deeper move:", body: "Treat reuse as the floor, not the ceiling. The Marketplace had to support discovery, inspiration, contribution, and collaboration — not just transactional download." },
            { label: "The outcome:", body: "Cross-team reuse went from accident to default. The Marketplace became the place AI work got found, extended, and built on." },
          ]}
          visuals={[]}
          customVisual={
            <div className="relative w-full overflow-hidden rounded-[24px] bg-[#f8f8f8] p-4 sm:p-8 lg:p-12">
              <Tilt3D className="w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  loading="lazy"
                  decoding="async"
                  src="/figma/gep-marketplace.webp"
                  alt="Marketplace — Welcome to Generative Engine Marketplace with category filters and a grid of shared resources (guides, tutorials, e-books, webinars) showing authors, ratings, and one-click adoption actions."
                  className="block h-auto w-full rounded-[12px]"
                />
              </Tilt3D>
            </div>
          }
        />

        {/* 7E — Studio Management */}
        <Surface
          title="Studio Management"
          tier="supporting"
          lines={[
            { label: "The problem:", body: "AI costs scale unpredictably per request. Studio owners had no way to set guardrails before bills arrived." },
            { label: "The move:", body: "A governance layer where owners set budgets, assign roles, and watch usage in real time — across users, API keys, and custom agents." },
            { label: "The outcome:", body: "Studios stayed solvent. Owners shipped AI without finance pulling the plug." },
          ]}
          visuals={[]}
          customVisual={<StepCarousel steps={STUDIO_MGMT_STEPS} />}
        />
      </section>

      {/* BLOCK 8 — DESIGN SYSTEM */}
      <section id="design-system" className="pt-12 pb-12 flex flex-col gap-20 lg:pt-[100px] lg:pb-[100px]">
        <div className="grid grid-cols-1 items-start gap-x-12 gap-y-5 lg:grid-cols-[1fr_2fr]">
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            variants={labelSlide}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
          >
            Design System
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            variants={fadeUp}
            transition={{ duration: 0.9, ease: EASE }}
            className="flex flex-col gap-4 text-[18px] leading-[1.5] text-[#211B1C]"
          >
            <p>
              The platform was a zoo. Self-written components, fragments of
              three or four libraries, no shared logic underneath. Engineering
              was stuck. Design couldn&apos;t fix it the long way — there was
              no time to build a system from scratch and no room to drop the
              Capgemini brand.
            </p>
            <p>
              So I made the call. shadcn/ui as the foundation, restyled to
              brand. The AI-specific components — Chat Input, User Prompt, and
              the publishing flow — didn&apos;t exist in any library, so I
              designed and documented them myself.
            </p>
            <p>Fast enough to unblock the work.</p>
          </motion.div>
        </div>

        {/* Component sheet — 4 specs sharing one gray container */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          variants={fadeUp}
          transition={{ duration: 0.9, ease: EASE }}
          className="flex w-full flex-col gap-5"
        >
          <p className="text-[16px] italic leading-[1.5] text-[#4a4a4a]">
            A small slice — <span className="font-semibold text-[#181212]">1,750+ components and variants</span> live in the design system in total.
          </p>
          <div className="w-full rounded-[24px] bg-[#080d1f] p-6 sm:p-12">
            <div className="grid w-full grid-cols-2 gap-5 sm:gap-8 lg:grid-cols-4">
              {[
                { src: "/figma/ds-button.webp", caption: "Button", alt: "Button component spec — Primary, Secondary, Outline, Ghost, Destructive variants across Regular / Large / Small / Mini sizes and Default / Hover & Active / Focus / Disabled states." },
                { src: "/figma/ds-icon-button.webp", caption: "Icon Button", alt: "Icon Button component spec — Primary, Secondary, Outline, Ghost, Destructive variants across Regular / Large / Small / Mini sizes and Default / Hover & Active / Focus / Disabled states." },
                { src: "/figma/ds-loading-button.webp", caption: "Loading Button", alt: "Loading Button component spec — Regular / Large / Small / Mini sizes across Default / Hover & Active / Focus states with embedded spinner." },
                { src: "/figma/ds-link-button.webp", caption: "Link Button", alt: "Link Button component spec — text, underlined, and outlined link styles across multiple sizes." },
              ].map((c) => (
                <figure key={c.caption} className="flex w-full flex-col gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                  loading="lazy"
                  decoding="async"
                    src={c.src}
                    alt={c.alt}
                    className="block h-auto w-full rounded-[8px]"
                  />
                  <figcaption className="text-center text-[15px] italic text-white">
                    {c.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Documentation page — Chat Input spec + docs page, sharing one gray container */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          variants={fadeUp}
          transition={{ duration: 0.9, ease: EASE }}
          className="mt-12 flex w-full flex-col gap-5"
        >
          <p className="text-[15px] italic text-[#6b6b6b]">
            Component documentation, written alongside the design.
          </p>
          <div className="w-full rounded-[24px] bg-[#080d1f] p-6 sm:p-12">
            <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2">
              {[
                { src: "/figma/ds-chat-input.webp", caption: "Chat Input — states", alt: "Chat Input component spec — Default, Incognito, Active, Image, Files, Multiple Images, and Offline states stacked vertically." },
                { src: "/figma/ds-chat-input-docs.webp", caption: "Chat Input — documentation", alt: "Documentation page for the Chat Input component — Overview, Layout & Sizing, Actions, and Modes sections written alongside the design." },
              ].map((c) => (
                <figure key={c.caption} className="flex w-full flex-col gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                  loading="lazy"
                  decoding="async"
                    src={c.src}
                    alt={c.alt}
                    className="block h-auto w-full rounded-[8px]"
                  />
                  <figcaption className="text-center text-[15px] italic text-white">
                    {c.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* BLOCK 10 — WHAT I'D DO DIFFERENTLY */}
      <section id="reflection" className="pt-12 pb-12 lg:pt-[100px] lg:pb-[100px] grid grid-cols-1 items-start gap-x-12 gap-y-5 lg:grid-cols-[1fr_2fr]">
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          variants={labelSlide}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
        >
          What I&apos;d Do Differently
        </motion.h2>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          variants={fadeUp}
          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
          className="flex flex-col gap-4 text-[18px] leading-[1.5] text-[#211B1C]"
        >
          <p>
            If I started again, I&apos;d ship the design system first, not the
            surfaces. Building components reactively as new screens shipped
            meant retrofitting more than I&apos;d like.
          </p>
          <p>
            Second: I&apos;d push harder for analytics access from day one —
            directional research is fine, but measurable design decisions are
            better.
          </p>
        </motion.div>
      </section>

      {/* Bottom page-to-page nav, matches NYT case study's simple Home/Next style */}
      <nav className="mt-12 flex items-center justify-between gap-8 pb-[80px] text-[16px] lg:mt-[100px]">
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
          href="/case-studies/nyt-games"
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
