"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionTemplate } from "motion/react";
import { Sidebar } from "@/components/Sidebar";
import { Hero } from "@/components/Hero";

/* True only at lg+ (≥1024px). Starts false (mobile-first) to avoid hydration
   mismatch, then resolves on mount. Used to gate the sticky-stack animation —
   on mobile the cards are tall single-column, so we render them as a plain
   static stack instead of pinning/frosting. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const labelSlide = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

const cardReveal = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const itemFade = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const testimonialReveal = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1 },
};



/* ─── Case study card artwork — single composite image per case study ─── */

function GenerativeEngineVisual() {
  return (
    <motion.a
      href="/case-studies/generative-engine"
      aria-label="Generative Engine Platform case study"
      variants={cardReveal}
      transition={{ duration: 0.7, ease: EASE }}
      className="group relative block w-full max-w-[560px] overflow-hidden transition-transform duration-300 ease-out hover:-translate-y-1"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/figma/case-gep-card.png"
        alt="Generative Engine Platform — Capgemini's internal platform, shown as a row of AI provider logos above a Studio Management screenshot with a lavender folder caption."
        className="block h-auto w-full"
      />
    </motion.a>
  );
}

function NytGamesVisual() {
  return (
    <motion.a
      href="/case-studies/nyt-games"
      aria-label="NYT Games App case study"
      variants={cardReveal}
      transition={{ duration: 0.7, ease: EASE }}
      className="group relative block w-full max-w-[560px] overflow-hidden transition-transform duration-300 ease-out hover:-translate-y-1"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/figma/case-nyt-card.png"
        alt="NYT Games App — collage of game icons (Crossword, Wordle, Connections, Spelling Bee, Letter Boxed) with the iPhone home screen and a yellow folder caption."
        className="block h-auto w-full"
      />
    </motion.a>
  );
}

function VestigeVisual() {
  return (
    <motion.a
      href="/case-studies/vestige"
      aria-label="Vestige case study"
      variants={cardReveal}
      transition={{ duration: 0.7, ease: EASE }}
      className="group relative block w-full max-w-[560px] overflow-hidden transition-transform duration-300 ease-out hover:-translate-y-1"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/figma/Vestige.png"
        alt="Vestige — three iPhone screens showing the taste summary, the camera viewfinder pointed at a Van Gogh self-portrait, and an artwork story page, with a peach folder caption reading 'Point at any artwork. A story in the moment. A collection that grows. A taste map that sharpens.'"
        className="block h-auto w-full"
      />
    </motion.a>
  );
}

function KpiPlatformVisual() {
  return (
    <motion.a
      href="/case-studies/kpi-platform"
      aria-label="KPI Platform case study"
      variants={cardReveal}
      transition={{ duration: 0.7, ease: EASE }}
      className="group relative block w-full max-w-[560px] overflow-hidden transition-transform duration-300 ease-out hover:-translate-y-1"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/figma/KPI Platform.png"
        alt="KPI Platform — On Time Delivery dashboard on a desktop monitor with monthly and daily delivery charts, and a grey caption card reading 'One platform, whole company. Metrics by level. Access by group. Clarity for everyone.'"
        className="block h-auto w-full"
      />
    </motion.a>
  );
}

/* ─── New "spread" magazine-style layout ─── */

type CaseStudy = {
  year: string;
  title: string;
  summary: string;
  meta: { label: string; value: string }[];
  href: string;
  comingSoon?: boolean;
  visual: React.ReactNode;
};

const CASE_STUDIES: CaseStudy[] = [
  {
    year: "Web Application",
    title: "Generative Engine Platform",
    summary:
      "An engineer-built tool, redesigned into an AI platform for the entire company.",
    meta: [
      { label: "Client", value: "Capgemini" },
      { label: "Role", value: "Lead UX Designer" },
      { label: "Duration", value: "Q2 2025 – Q2 2026" },
      { label: "Status", value: "Shipped" },
    ],
    href: "/case-studies/generative-engine",
    visual: <GenerativeEngineVisual />,
  },
  {
    year: "Mobile App",
    title: "NYT Games App",
    summary:
      "Improving the experience behind The Crossword, Spelling Bee, and the full NYT Games suite — onboarding experiments, social features, and accessibility at scale. 2024 Apple Design Award finalist.",
    meta: [
      { label: "Client", value: "The New York Times" },
      { label: "Role", value: "Senior UX Designer" },
      { label: "Duration", value: "2022 – 2023" },
      { label: "Status", value: "Shipped" },
    ],
    href: "/case-studies/nyt-games",
    visual: <NytGamesVisual />,
  },
  {
    year: "Mobile App",
    title: "Vestige",
    summary:
      "Treating art taste as a personal metric — capture flows, a taste map, and a private catalogue of what moved you. From ten interviews to a working prototype.",
    meta: [
      { label: "Ownership", value: "Personal project" },
      { label: "Role", value: "Product Designer" },
      { label: "Duration", value: "2026 – ongoing" },
      { label: "Status", value: "Prototype" },
    ],
    href: "/case-studies/vestige",
    comingSoon: true,
    visual: <VestigeVisual />,
  },
  {
    year: "Web Application",
    title: "KPI Platform",
    summary:
      "From scattered spreadsheets to a single source of truth — a branded, accessible analytics platform unifying every KPI in one interactive view.",
    meta: [
      { label: "Client", value: "Top global nuclear operator" },
      { label: "Role", value: "Lead UX Designer" },
      { label: "Duration", value: "Q1–Q2 2025" },
      { label: "Status", value: "Shipped" },
    ],
    href: "/case-studies/kpi-platform",
    comingSoon: true,
    visual: <KpiPlatformVisual />,
  },
];

function Spread({
  year,
  title,
  summary,
  meta,
  href,
  comingSoon,
  visual,
}: CaseStudy) {
  return (
    <motion.article
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10%" }}
      transition={{ staggerChildren: 0.08 }}
      className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-start gap-20 rounded-[24px] border border-[#ececec] bg-[#f8f8f8] p-6 sm:rounded-[32px] sm:p-8 lg:p-12 max-[900px]:grid-cols-1 max-[900px]:gap-8"
    >
      {/* Left column — text */}
      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.7, ease: EASE }}
        className="flex flex-col"
      >
        <p className="pb-4 text-[14px] text-[#6b6b6b]">{year}</p>
        <h3 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#181212] sm:text-[36px] lg:text-[44px] lg:leading-[1.05]">
          {title}
        </h3>
        <p
          className="mt-3 w-full text-[16px] leading-[1.5] text-[#4a4a4a] sm:text-[18px]"
          style={{ textWrap: "pretty" as React.CSSProperties["textWrap"] }}
        >
          {summary}
        </p>
        <dl className="mt-4 grid max-w-[480px] grid-cols-2 gap-x-6 gap-y-3 sm:mt-5 sm:gap-x-8">
          {meta.map((m) => (
            <div key={m.label} className="flex flex-col gap-0.5">
              <dt className="text-[12px] text-[#6b6b6b]">{m.label}</dt>
              <dd className="text-[15px] text-[#181212]">{m.value}</dd>
            </div>
          ))}
        </dl>
        {comingSoon ? (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="mt-10 inline-flex w-fit cursor-not-allowed items-center rounded-full border-2 border-[#c9c9c9] bg-white px-7 py-3 text-[16px] font-semibold text-[#8a8a8a]"
          >
            <span className="whitespace-nowrap">Coming soon</span>
          </button>
        ) : (
          <a
            href={href}
            className="group mt-10 inline-flex w-fit items-center gap-1.5 rounded-full border-2 border-[#181212] bg-white px-7 py-3 text-[16px] font-semibold text-[#211B1C] transition-colors duration-200 ease-out hover:bg-[#181212] hover:text-white"
          >
            <span className="whitespace-nowrap">Read case study</span>
            <span className="inline-flex items-center transition-transform duration-300 ease-out group-hover:translate-x-1">
              <ArrowRight size={18} />
            </span>
          </a>
        )}
      </motion.div>

      {/* Right column — existing artwork, natural size, centered */}
      <div className="flex w-full items-center justify-center">{visual}</div>
    </motion.article>
  );
}

/* One card in the sticky stack. Every card except the last frosts (scales down,
   blurs, and whitens) as the next card climbs up and covers it — desktop only.
   Each card measures its own document position so the frost range stays correct
   no matter how many cards there are or how tall their visuals get. */
function StackedCard({
  study,
  topOffset,
  isLast,
  isDesktop,
}: {
  study: CaseStudy;
  topOffset: number;
  isLast: boolean;
  isDesktop: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Window scroll (pixels) — the default useScroll mode, which is reliable.
  // (useScroll with a `target` ref silently no-ops in this setup.)
  const { scrollY } = useScroll();
  // Pixel scroll range over which this card frosts: from the moment it pins
  // (its top reaches the viewport) through the next ~0.6vh of scroll, during
  // which the following card climbs up and covers it.
  const [range, setRange] = useState<[number, number]>([0, 1]);
  useEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      setRange([top, top + window.innerHeight * 0.6]);
    };
    measure();
    const t = setTimeout(measure, 600); // re-measure after images load
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
    };
  }, [isDesktop]);

  const scale = useTransform(scrollY, range, [1, 0.8], { clamp: true });
  const blurPx = useTransform(scrollY, range, [0, 12], { clamp: true });
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  const glassOpacity = useTransform(scrollY, range, [0, 0.6], { clamp: true });

  return (
    <div ref={ref} className="lg:sticky" style={{ top: `${topOffset}px` }}>
      {isDesktop && !isLast ? (
        <motion.div className="relative" style={{ scale, filter }}>
          <Spread {...study} />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[32px] bg-white"
            style={{ opacity: glassOpacity }}
          />
        </motion.div>
      ) : (
        <Spread {...study} />
      )}
    </div>
  );
}

function CaseStudies() {
  const isDesktop = useIsDesktop();

  return (
    <section className="mt-24 lg:mt-[160px]">
      {/* h2 sticks at top (desktop only) while cards stack underneath. White bg
          + z-30 keeps it above the stacking cards. py-3 gives it substance so
          cards visually dock against it. On mobile it's a plain heading. */}
      <h2 className="z-30 bg-white py-3 text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px] lg:sticky lg:top-0">
        Case Studies
      </h2>
      {/* Non-sticky track — cards pin inside it. Each card pins 24px lower than
          the previous one so the stack peeks as it builds up. */}
      <div className="relative mt-6 flex flex-col gap-6">
        {CASE_STUDIES.map((study, i) => (
          <StackedCard
            key={study.title}
            study={study}
            topOffset={72 + i * 24}
            isLast={i === CASE_STUDIES.length - 1}
            isDesktop={isDesktop}
          />
        ))}
        {/* Tail spacer gives the stack scroll runway (desktop only) */}
        <div aria-hidden className="hidden h-[55vh] lg:block" />
      </div>
    </section>
  );
}


/* Drop photos into /public/about with these filenames (or edit the list).
   Tiles match the NYT games-card treatment: white border, rounded corners,
   scattered rotation, and a springy pop + straighten on hover. */
const ABOUT_PHOTOS = [
  {
    src: "/about/photo-4.jpg",
    alt: "Portrait of Karina",
    rotate: -7,
  },
  {
    src: "/about/photo-1.jpg",
    alt: "Karina sketching a flow with sticky notes on a wall",
    rotate: 5,
  },
  {
    src: "/about/photo-2.jpg",
    alt: "Karina mapping sticky notes on a wall during a working session",
    rotate: -3,
  },
  {
    src: "/about/photo-3.jpg",
    alt: "Karina smiling in a green armchair",
    rotate: 6,
  },
  {
    src: "/about/photo-5.jpg",
    alt: "Karina leaning on a stack of design books",
    rotate: -5,
  },
  {
    src: "/about/photo-6.jpg",
    alt: "Karina at her desk with a laptop, sticky notes on the wall behind her",
    rotate: 4,
  },
];

function AboutPhotos() {
  return (
    <div className="mt-8 flex items-center">
      {ABOUT_PHOTOS.map((p, i) => (
        <motion.div
          key={p.src}
          initial={{ opacity: 0, y: 20, rotate: 0 }}
          whileInView={{ opacity: 1, y: 0, rotate: p.rotate }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.15 + i * 0.08 }}
          whileHover={{
            scale: 1.08,
            rotate: 0,
            y: -8,
            zIndex: 10,
            transition: { type: "spring", stiffness: 300, damping: 18 },
          }}
          className="relative -ml-3 aspect-square min-w-0 max-w-[136px] flex-1 overflow-hidden rounded-[12px] border-4 border-white shadow-[0_10px_28px_rgba(0,0,0,0.16)] first:ml-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.src} alt={p.alt} className="size-full object-cover" />
        </motion.div>
      ))}
    </div>
  );
}

function About() {
  return (
    <section className="mt-24 grid grid-cols-1 items-start gap-x-12 gap-y-6 lg:mt-[160px] lg:grid-cols-[1fr_2fr]">
      <motion.h2
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-10%" }}
        variants={labelSlide}
        transition={{ duration: 0.6, ease: EASE }}
        className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
      >
        About
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1.2, ease: EASE, delay: 0.1 }}
        className="flex flex-col gap-4 text-[16px] leading-[1.5] text-[#211B1C] sm:text-[18px]"
      >
        <p>
          I&apos;m a senior UX designer with{" "}
          <span className="font-semibold">eight years</span> spent shipping
          complex products across{" "}
          <span className="font-semibold">
            AI, fintech, healthcare, and games
          </span>
          . I had the good fortune of working on the New York Times Games app,
          which won an Apple Design Award in 2024.
        </p>
        <p>
          <span className="font-semibold">
            I think in systems and stay close to research
          </span>
          , but mostly I&apos;m just deeply curious — the kind of designer who
          keeps tinkering long after the workday ends.{" "}
          <span className="font-semibold">
            AI is what&apos;s got my attention these days
          </span>
          ; I&apos;m genuinely optimistic about it, and I love exploring what
          it makes possible for the things we get to design and build.
        </p>
        <AboutPhotos />
      </motion.div>
    </section>
  );
}

type ExperienceItemProps = {
  period: string;
  title: string;
  company: string;
  companyHref?: string;
};

function ExperienceItem({ period, title, company, companyHref }: ExperienceItemProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <p className="text-[16px] leading-[1.48] text-[#6b6b6b] sm:text-[18px]">{period}</p>
      <p className="text-[26px] font-semibold leading-[1.1] text-[#181212] sm:text-[32px] sm:leading-none lg:text-[36px]">{title}</p>
      {companyHref ? (
        <a
          href={companyHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit text-[16px] leading-[1.48] text-[#211B1C] underline-offset-4 transition-colors hover:underline sm:text-[18px]"
        >
          {company}
        </a>
      ) : (
        <p className="text-[16px] leading-[1.48] text-[#211B1C] sm:text-[18px]">{company}</p>
      )}
    </div>
  );
}

function Experience() {
  return (
    <motion.section
      className="mt-24 grid grid-cols-1 items-start gap-x-12 gap-y-8 lg:mt-[160px] lg:grid-cols-[1fr_2fr]"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <h2 className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]">Experience</h2>
      <div className="flex flex-col gap-10">
        <ExperienceItem
          period="2020 – Now"
          title="Senior User Experience Designer"
          company="Capgemini Engineering"
          companyHref="https://www.capgemini.com/"
        />
        <ExperienceItem
          period="2019 – 2020"
          title="User Experience Designer"
          company="GlobalDev (former Steelkiwi)"
          companyHref="https://globaldev.tech/blog/steelkiwi-to-join-globaldev-group"
        />
        <ExperienceItem
          period="2019"
          title="UX/UI Designer"
          company="Arounda — Digital Product Design Agency"
          companyHref="https://arounda.agency/"
        />
        <ExperienceItem
          period="2018"
          title="UX/UI Designer"
          company="Keepsolid Internship, Freelance Projects"
          companyHref="https://www.keepsolid.com/"
        />
      </div>
    </motion.section>
  );
}

type TestimonialProps = {
  quote: string;
  role: string;
  name: string;
};

function Testimonial({ quote, role, name }: TestimonialProps) {
  return (
    <motion.article
      variants={cardReveal}
      transition={{ duration: 0.7, ease: EASE }}
      className="relative flex flex-col rounded-[24px] border border-[#ececec] bg-[#f8f8f8] p-8"
    >
      <span
        aria-hidden
        className="block text-[80px] font-light leading-none text-[#4a4a4a]"
      >
        “
      </span>
      <p className="-mt-8 text-[20px] font-semibold leading-[1.4] text-[#181212]">
        {quote}
      </p>
      <div className="mt-auto flex flex-col pt-5 text-[16px] leading-[1.35] text-[#181212]">
        <p className="font-semibold">{name}</p>
        <p className="text-[#6b6b6b]">{role}</p>
      </div>
    </motion.article>
  );
}

function References() {
  return (
    <motion.section
      className="mt-12 grid grid-cols-1 gap-5 sm:gap-6 md:mt-[64px] md:grid-cols-3 md:gap-8"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-20%" }}
      transition={{ staggerChildren: 0.1 }}
    >
      <Testimonial
        quote="She has a great sense for usability and visual clarity, always delivering clean, intuitive interfaces."
        role="Founder & CEO at Arounda"
        name="Vlad Gavriluk"
      />
      <Testimonial
        quote="Her ability to translate abstract ideas into tangible, user-friendly interfaces is truly remarkable."
        role="Senior Operational Leader"
        name="Zoltan Felszeghy"
      />
      <Testimonial
        quote="She works very fluidly with the engineering team resulting in smooth product launches."
        role="Experience Design Leader"
        name="Jen Scheerer"
      />
    </motion.section>
  );
}

function CopyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15 V 5 a 2 2 0 0 1 2 -2 h 10" />
    </svg>
  );
}

function ArrowRight({ size = 18 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="12" x2="20" y2="12" />
      <polyline points="13,5 20,12 13,19" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.77.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 0z"/>
    </svg>
  );
}

function Footer() {
  const copyEmail = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard?.writeText("karynak.designer@gmail.com");
    }
  };
  return (
    <footer className="-mx-5 mt-12 flex flex-col px-5 pb-8 sm:-mx-8 sm:px-8 lg:-mx-16 lg:mt-16 lg:px-16">
      <motion.div
        className="flex items-start gap-12"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-10%" }}
        transition={{ staggerChildren: 0.12 }}
      >
        {/* Contact card — neutral light grey, no inline footer row */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex w-full flex-col gap-6 rounded-[24px] border border-[#ececec] bg-[#f8f8f8] p-6 sm:rounded-[32px] sm:p-8"
        >
          <p className="text-[20px] font-semibold leading-[1.3] text-[#211B1C] sm:text-[28px]">
            Always happy to connect — whether it&apos;s a new opportunity or
            just a good conversation.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-5 py-3">
              <span className="min-w-0 flex-1 truncate text-[15px] text-[#211B1C] sm:text-[16px]">
                karynak.designer@gmail.com
              </span>
              <button
                type="button"
                onClick={copyEmail}
                aria-label="Copy email"
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#6b6b6b] transition-colors hover:bg-[#f3f3f3] hover:text-[#211B1C]"
              >
                <CopyIcon />
              </button>
            </div>
            <span className="text-center text-[15px] text-[#6b6b6b] sm:text-[16px]">
              or
            </span>
            <a
              href="https://www.linkedin.com/in/karina-kravchenko-60a915bb/"
              target="_blank"
              rel="noreferrer"
              className="group flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#181212] px-6 py-3 text-[16px] font-semibold text-white transition-colors hover:bg-[#2a2a2a]"
            >
              <span>Connect on LinkedIn</span>
              <span className="inline-flex items-center transition-transform duration-300 ease-out group-hover:translate-x-1">
                <ArrowRight size={18} />
              </span>
            </a>
          </div>
        </motion.div>
      </motion.div>

      {/* Slim bottom row — outside the card, right-aligned with the card above. */}
      <div className="mt-6 flex justify-end text-[13px] sm:text-[14px]">
        <p className="text-right text-[#6b6b6b]">
          2026 © Karina Kravchenko. Build with Claude Code. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="flex">
      <Sidebar />
      <main id="top" className="min-w-0 flex-1 px-5 pt-6 sm:px-8 lg:px-16 lg:pt-8">
        {/* Mobile logo header — shown only when the sidebar is hidden */}
        <a
          href="/"
          style={{ fontFamily: "var(--font-patience), serif" }}
          className="mb-6 block text-[26px] leading-none text-[#181212] lg:hidden"
          aria-label="Karina Kravchenko"
        >
          Karina Kravchenko
        </a>
        <div className="flex min-h-[calc(100vh-64px)] flex-col justify-between">
          <section id="intro"><Hero /></section>
          <section id="references"><References /></section>
        </div>
        <section id="case-studies"><CaseStudies /></section>
        <section id="about"><About /></section>
        <section id="experience"><Experience /></section>
        <Footer />
      </main>
    </div>
  );
}
