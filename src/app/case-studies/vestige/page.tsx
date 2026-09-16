"use client";

import { motion } from "motion/react";
import { CaseStudySidebar } from "@/components/CaseStudySidebar";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────
 * Vestige — Case Study
 * Uses the same layout, sidebar, type, and color palette as the
 * NYT Games and Gen AI Engineering Platform case studies and the main page.
 *   - Body font: Mosvita (inherited)
 *   - Colors: #181212, #211B1C, #4a4a4a, #6b6b6b, #ececec, #f8f8f8
 *   - Section sizes: label 18/22px / body 18px / meta 14–18px
 *   - Section pattern: title (left) + content (right), full-width visuals below
 * App-brand colors (cream/terracotta/navy) appear only inside future
 * screenshots — the page chrome stays in the site palette.
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

const VESTIGE_NAV = [
  { id: "overview", label: "Overview" },
  { id: "idea", label: "Initial Idea" },
  { id: "thesis", label: "Thesis" },
  { id: "research", label: "Research" },
  { id: "empathize", label: "Empathize" },
  { id: "insights", label: "Key Insights" },
  { id: "project", label: "The Project" },
  { id: "personas", label: "Personas" },
  { id: "principles", label: "Principles" },
  { id: "ia", label: "IA" },
  { id: "capture", label: "Capture Flow" },
  { id: "solution", label: "The Solution" },
  { id: "craft", label: "The Craft" },
  { id: "scope", label: "Scope" },
  { id: "limitations", label: "Limitations" },
  { id: "reflection", label: "Reflection" },
];

/* ───────── Reusable bits (match NYT Games page) ───────── */

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

/* Placeholder figure — the [VISUAL] description doubles as the visible
   caption so real images can be swapped in by id later. */
function PlaceholderFigure({
  id,
  ratio,
  desc,
}: {
  id: string;
  ratio: string;
  desc: string;
}) {
  return (
    <motion.figure
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10%" }}
      variants={fadeUp}
      transition={{ duration: 0.9, ease: EASE }}
      className="flex w-full flex-col gap-5"
    >
      <figcaption className="text-[15px] italic text-[#6b6b6b]">
        {desc}
      </figcaption>
      <PlaceholderBox id={id} ratio={ratio} label="Image placeholder" />
    </motion.figure>
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

/* Hairline-divided list row — number (optional), lead, one-line body.
   Shared rhythm for hypotheses, principles, capture flow, solution, craft. */
function ListRow({
  number,
  title,
  body,
}: {
  number?: string;
  title: string;
  body: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.6, ease: EASE }}
      className={
        "grid items-start gap-x-5 gap-y-2 border-b border-[#ececec] pb-6 last:border-b-0 last:pb-0 " +
        (number ? "grid-cols-[44px_1fr]" : "grid-cols-1")
      }
    >
      {number && (
        <span className="text-[16px] font-semibold leading-none text-[#6b6b6b]">
          {number}
        </span>
      )}
      <div className="flex flex-col gap-2">
        <p className="text-[18px] font-semibold leading-[1.3] text-[#181212]">
          {title}
        </p>
        <p className="text-[16px] leading-[1.55] text-[#211B1C]">{body}</p>
      </div>
    </motion.div>
  );
}

/* Section shell: label (left) + content (right) — NYT Games pattern. */
function Section({
  id,
  label,
  children,
  after,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  after?: React.ReactNode;
}) {
  return (
    <section id={id} className="pt-12 pb-12 flex flex-col gap-20 lg:pt-[100px] lg:pb-[100px]">
      <div className="grid grid-cols-1 items-start gap-x-12 gap-y-5 lg:grid-cols-[1fr_2fr]">
        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          variants={labelSlide}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
        >
          {label}
        </motion.p>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          variants={fadeUp}
          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
          className="flex flex-col gap-4 text-[18px] leading-[1.5] text-[#211B1C]"
        >
          {children}
        </motion.div>
      </div>
      {after}
    </section>
  );
}

/* Pull-quote band — the site's existing large-quote treatment
   (Patience serif, generous spacing). */
function QuoteBand({ id, quote }: { id: string; quote: string }) {
  return (
    <motion.blockquote
      id={id}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10%" }}
      variants={fadeUp}
      transition={{ duration: 1.0, ease: EASE }}
      className="grid grid-cols-1 items-start gap-x-12 lg:grid-cols-[1fr_2fr]"
    >
      <span className="hidden lg:block" />
      <p
        className="border-l-2 border-[#181212] py-4 pl-6 text-[28px] leading-[1.3] text-[#181212] sm:text-[32px]"
        style={{ fontFamily: "var(--font-patience), Georgia, serif" }}
      >
        {quote}
      </p>
    </motion.blockquote>
  );
}

/* ───────── Page ───────── */

export default function VestigeCaseStudy() {
  return (
    <div className="flex">
      <CaseStudySidebar items={VESTIGE_NAV} />
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
              Vestige
            </motion.h1>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.9, ease: EASE }}
              className="max-w-[900px] text-[20px] font-semibold leading-[1.25] text-[#181212] sm:text-[24px] lg:text-[28px]"
            >
              A museum app that learns you.
            </motion.p>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.85, ease: EASE }}
              className="text-[15px] italic text-[#6b6b6b]"
            >
              Jan 2026 — ongoing
            </motion.p>
          </div>

          {/* Meta grid */}
          <motion.dl
            variants={fadeUp}
            transition={{ duration: 0.8, ease: EASE }}
            className="grid grid-cols-2 gap-x-8 gap-y-6 border-y border-[#ececec] py-8 sm:grid-cols-4 sm:gap-y-0"
          >
            <div className="flex flex-col gap-2">
              <dt className="text-[14px] text-[#6b6b6b]">Client</dt>
              <dd className="text-[18px] text-[#181212]">Personal project</dd>
            </div>
            <div className="flex flex-col gap-2">
              <dt className="text-[14px] text-[#6b6b6b]">Role</dt>
              <dd className="text-[18px] text-[#181212]">
                Senior User Experience Designer
              </dd>
            </div>
            <div className="flex flex-col gap-2">
              <dt className="text-[14px] text-[#6b6b6b]">Timeline</dt>
              <dd className="text-[18px] text-[#181212]">2024 — ongoing</dd>
            </div>
            <div className="flex flex-col gap-2">
              <dt className="text-[14px] text-[#6b6b6b]">Status</dt>
              <dd className="text-[18px] text-[#181212]">
                Prototype complete · build next
              </dd>
            </div>
          </motion.dl>

          {/* [VISUAL] Hero */}
          <motion.figure
            variants={fadeUp}
            transition={{ duration: 1.0, ease: EASE }}
            className="flex w-full flex-col gap-5"
          >
            <figcaption className="text-[15px] italic text-[#6b6b6b]">
              {`Full-width hero — the Capture reveal (viewfinder blurring out, The Milkmaid fading in). App screens keep their own warm brand (cream/terracotta/navy); they sit on the portfolio's white ground inside the same dark rounded hero container used on MemoArt. No text overlay.`}
            </figcaption>
            <PlaceholderBox id="v-hero" ratio="1312 / 720" label="Image placeholder" />
          </motion.figure>
        </motion.section>

        {/* ─── THE INITIAL IDEA ─── */}
        <Section id="idea" label="The Initial Idea">
          <p>
            {`I kept noticing the same thing in museums: everyone photographs the art, and almost no one ever looks at those photos again. I do it myself. The capture is a reflex — the return never comes.`}
          </p>
          <p>
            {`That gap felt worth designing for. Not access to art (everything is one search away now), but the fact that the moment a work moves you almost never becomes something you keep. Products this decade moved inward — Oura made sleep a metric, Strava made running a record of you. Art never made that move. And that's how Vestige was born.`}
          </p>
        </Section>

        {/* ─── THE THESIS ─── */}
        <Section
          id="thesis"
          label="The Thesis"
          after={
            /* [VISUAL] Statement band — site's standard pull-quote treatment */
            <QuoteBand
              id="v-thesis-quote"
              quote="Taste is a mirror, not a measurement."
            />
          }
        >
          <p>
            {`One idea holds the product together: taste is a mirror, not a measurement. A wearable can track sleep because sleep is real and measurable. Taste isn't — there's no ground truth, so any score would only pretend. Vestige doesn't score you. It reflects you, writing your attention back as prose instead of a chart. That restraint is the design.`}
          </p>
        </Section>

        {/* ─── FOUNDATIONAL RESEARCH ─── */}
        <Section
          id="research"
          label="Foundational Research"
          after={
            <PlaceholderFigure
              id="v-research-strip"
              ratio="1312 / 440"
              desc={`Reuse the MemoArt-style annotated research strip — screenshots/clippings with hand-drawn circle highlights, arranged full-width. Same treatment as the existing Foundational Research band.`}
            />
          }
        >
          <p>
            {`Before talking to anyone, I wrote down what I believed and treated it as something to test.`}
          </p>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            transition={{ staggerChildren: 0.08 }}
            className="mt-2 flex flex-col gap-6"
          >
            <ListRow
              title="Hypothesis 1"
              body={`People take photos in museums but rarely revisit them.`}
            />
            <ListRow
              title="Hypothesis 2"
              body={`Visitors struggle to recall where they saw a specific piece.`}
            />
            <ListRow
              title="Hypothesis 3"
              body={`People want to deepen their knowledge of works they liked.`}
            />
            <ListRow
              title="Hypothesis 4"
              body={`Visitors want to know a museum's must-sees before they go.`}
            />
          </motion.div>
        </Section>

        {/* ─── EMPATHIZE — THE RESEARCH ─── */}
        <Section
          id="empathize"
          label="Empathize — the research"
          after={
            <>
              <PlaceholderFigure
                id="v-guide-revision"
                ratio="1312 / 560"
                desc={`Two-part figure. Left: the 13-question guide; right: the 6-question revision, with one compound question shown collapsing into one open question. White ground, dark text, hairline dividers — same table rhythm as the rest of the site.`}
              />
              <PlaceholderFigure
                id="v-empathy-map"
                ratio="16 / 10"
                desc={`One completed empathy map (Says / Thinks / Does / Feels), using the existing black-circle USER template already on the site.`}
              />
            </>
          }
        >
          <p>
            {`Ten in-depth interviews with frequent museum-goers — professionals in their early-to-mid thirties across tech, operations, and management — synthesised through empathy and affinity mapping.`}
          </p>
          <p>
            {`The first interview guide ran to thirteen questions, many multi-part. In early sessions I watched compound questions raise cognitive load: people answered only the last part, and the data flattened. I rewrote the guide mid-study — six open, single-focus questions. The answers got richer and less prompted.`}
          </p>
          <p>
            {`Lesson learned: respecting a participant's attention is itself a research finding.`}
          </p>
        </Section>

        {/* ─── KEY INSIGHTS ─── */}
        <Section
          id="insights"
          label="Key Insights"
          after={
            /* [VISUAL] Five insight cards — site card style, monochrome */
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10%" }}
              variants={fadeUp}
              transition={{ duration: 0.9, ease: EASE }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              <InfoCard number="01" title="Read vs. listen">
                {`Participant 1 reads wall notes and skips audio; Participant 2 only listens — and is blocked when there's no English. Two modes the product has to hold at once.`}
              </InfoCard>
              <InfoCard number="02" title="Capture, rarely return">
                {`Participant 1 revisits photos "sometimes"; Participant 2 shoots "for TikTok" and never reopens them. So the capture moment itself has to deliver.`}
              </InfoCard>
              <InfoCard number="03" title="Gamification rejected">
                {`Participants 1 and 2 both found quiz scenarios "boring"; Participant 2 wouldn't "be engaged in the process." A quiz-first build would target the loudest "no" in the data.`}
              </InfoCard>
              <InfoCard number="04" title="Language is a real barrier">
                {`Participant 2's sharpest pain: no English, no translation, no way to know what he's looking at. Recognition in your own language solves it in the room.`}
              </InfoCard>
              <InfoCard number="05" title="Cultural investment">
                {`Participant 3 visits to "see a masterpiece in real life" and "understand a style." A collection that accrues meaning over time answers that.`}
              </InfoCard>
            </motion.div>
          }
        >
          <p>
            {`Five findings shaped everything after. Each comes straight from what participants said.`}
          </p>
        </Section>

        {/* ─── THE PROJECT ─── */}
        <Section id="project" label="The Project">
          <p>
            {`The mobile app that turns museum visits into a personal record of taste: point your camera at a work, Vestige recognises it and tells you something worth knowing — shaped by what has already moved you. Keep it, and your collection grows; the app's map of your taste sharpens.`}
          </p>
        </Section>

        {/* ─── PERSONAS ─── */}
        <Section
          id="personas"
          label="Personas"
          after={
            /* [VISUAL] Two persona cards side by side — site persona slots */
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10%" }}
              variants={fadeUp}
              transition={{ duration: 0.9, ease: EASE }}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <InfoCard title="Marta — the Knowledge Builder">
                {`"A museum is cultural investment — I want to understand a style, not just have seen it." She reads, revisits, organizes. Wants depth; rejects gimmicks.`}
              </InfoCard>
              <InfoCard title="Tomek — the Experience Seeker">
                {`"I'm here to enjoy it — but I hate not knowing what I'm looking at." He listens rather than reads, shoots and forgets, learns passively. Rejects anything forced.`}
              </InfoCard>
            </motion.div>
          }
        >
          <p>
            {`From the interviews, two groups emerged — and they sit on the axis that defines the feature set: one builds, one experiences.`}
          </p>
          <p>
            {`The core loop — capture → instant context → an accruing taste map — costs zero effort but rewards anyone who engages. One design, both users.`}
          </p>
        </Section>

        {/* ─── DESIGN PRINCIPLES ─── */}
        <Section id="principles" label="Design Principles">
          <p>
            {`Every principle here is an answer to something a participant said.`}
          </p>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            transition={{ staggerChildren: 0.08 }}
            className="mt-2 flex flex-col gap-6"
          >
            <ListRow
              number="01"
              title="Prose, not a score"
              body={`A reading, not a chart.`}
            />
            <ListRow
              number="02"
              title="Quiet capture"
              body={`No reticles, no theatre.`}
            />
            <ListRow
              number="03"
              title="Editorial voice"
              body={`Serif word-mark navigation; the app reads like a catalogue, not a utility.`}
            />
            <ListRow
              number="04"
              title="Public-domain only"
              body={`Rijksmuseum, the Met, the Art Institute of Chicago. Legally clean, zero content cost.`}
            />
            <ListRow
              number="05"
              title="Gentle, never forceful"
              body={`No quizzes, no streaks.`}
            />
          </motion.div>
        </Section>

        {/* ─── INFORMATION ARCHITECTURE ─── */}
        <Section
          id="ia"
          label="Information Architecture"
          after={
            <PlaceholderFigure
              id="v-ia-map"
              ratio="4 / 3"
              desc={`The IA node map (from FigJam) — full tree with missing states tagged in red. Caption: "Design is the states a demo skips." Keep the red tags; the honesty is the point.`}
            />
          }
        >
          <p>
            {`I mapped the whole product as one tree to find the holes. It showed something uncomfortable: the polished prototype was a tour of the happy path. Almost every gap was a state or a failure — recognition failure, empty states, offline, camera denied, the read/listen toggle, notes, settings.`}
          </p>
        </Section>

        {/* ─── THE CAPTURE FLOW ─── */}
        <Section
          id="capture"
          label="The Capture Flow, Deeply Resolved"
          after={
            <PlaceholderFigure
              id="v-capture-strip"
              ratio="1312 / 380"
              desc={`Eight-screen wireframe strip, low-fi, in one horizontal row. Missing-state screens tagged. Low fidelity is deliberate — this block is about reasoning, not polish.`}
            />
          }
        >
          <p>
            {`Capture is the spine of the app, so it's the flow I resolved first — every screen, every state.`}
          </p>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            transition={{ staggerChildren: 0.06 }}
            className="mt-2 flex flex-col gap-6"
          >
            <ListRow
              title="Permission priming"
              body={`One line in the app's voice before the iOS dialog; a denied user still gets search. No dead ends.`}
            />
            <ListRow title="Viewfinder" body={`Quiet framing.`} />
            <ListRow
              title="Recognising"
              body={`A real loading state; wait capped at ~3–4 seconds; offline fallback.`}
            />
            <ListRow
              title="Recognised"
              body={`Story, a detail to look for, a question back to you, and "why this, for you."`}
            />
            <ListRow
              title="No match"
              body={`The branch the prototype skipped. Honesty, not error: search, keep as unidentified, or discard.`}
            />
            <ListRow
              title="Search & confirm"
              body={`Title or artist → open-collection results → a normal context card.`}
            />
            <ListRow
              title="Camera denied"
              body={`Settings link plus search.`}
            />
            <ListRow
              title="Offline"
              body={`Queue, don't block; identify on reconnect.`}
            />
          </motion.div>
          <p>
            {`About 30% of this flow existed as the built happy path. The other 70% — failures and system states — is what completes the product, and it's exactly the layer that lifts the UI from demo to craft.`}
          </p>
        </Section>

        {/* ─── THE SOLUTION ─── */}
        <Section
          id="solution"
          label="The Solution"
          after={
            <PlaceholderFigure
              id="v-prototype-tour"
              ratio="1312 / 720"
              desc={`Prototype tour — nine screens, three per flow, each with a one-line caption. Full-fidelity app screens on the portfolio's white ground; this is the payoff block, give it room.`}
            />
          }
        >
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            transition={{ staggerChildren: 0.08 }}
            className="flex flex-col gap-6"
          >
            <ListRow
              title="Onboarding"
              body={`A welcome, a swipe calibration on curated works (keep or pass), and a first reading of your taste — in prose, never a score.`}
            />
            <ListRow
              title="Capture"
              body={`Point, hold, the work fades in. A card slides up with a short story, a detail to seek out, and a question that sharpens what Vestige knows about you. Keep it, and it joins your collection.`}
            />
            <ListRow
              title="Collection & Taste Map"
              body={`An editorial catalogue of what has held you, and a constellation linking works by shared thread — a century, a medium, a mood — with a prose reading underneath.`}
            />
          </motion.div>
        </Section>

        {/* ─── THE CRAFT ─── */}
        <Section
          id="craft"
          label="The Craft"
          after={
            <PlaceholderFigure
              id="v-motion-timeline"
              ratio="1312 / 420"
              desc={`Motion timeline of the capture reveal — a horizontal staggered-timing diagram in the site's monochrome style, app-brand colors appearing only inside the screen thumbnails.`}
            />
          }
        >
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            transition={{ staggerChildren: 0.08 }}
            className="flex flex-col gap-6"
          >
            <ListRow
              title="The capture reveal"
              body={`Staggered, ease-out, nothing snaps: shutter → viewfinder blurs → the work fades in → the title rises → "why this, for you" settles last.`}
            />
            <ListRow
              title="Haptics"
              body={`Keep confirms with one soft tap; the only time the device speaks back.`}
            />
            <ListRow
              title="Typography"
              body={`An editorial serif on a baseline grid, optical sizing, controlled measure.`}
            />
            <ListRow
              title="Colour"
              body={`Cream ground, navy depth, terracotta only on the few moments that matter.`}
            />
          </motion.div>
        </Section>

        {/* ─── SCOPE AS A DESIGN DECISION ─── */}
        <Section
          id="scope"
          label="Scope as a Design Decision"
          after={
            /* [VISUAL] Simple two-column table — hairline rules, no fills */
            <motion.figure
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10%" }}
              variants={fadeUp}
              transition={{ duration: 0.9, ease: EASE }}
              className="flex w-full flex-col gap-5"
            >
              <table
                id="v-scope-table"
                className="w-full border-collapse text-left"
              >
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="w-1/2 border-b border-[#ececec] py-4 pr-6 text-[16px] font-semibold text-[#181212]"
                    >
                      In v1
                    </th>
                    <th
                      scope="col"
                      className="w-1/2 border-b border-[#ececec] py-4 text-[16px] font-semibold text-[#181212]"
                    >
                      Not in v1
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[16px] leading-[1.5] text-[#211B1C]">
                  {[
                    ["Open-collection recognition", "Universal recognition"],
                    ["Capture → context", "Room-level location"],
                    ["A local collection", "Social"],
                    ["The taste map", "Live theming"],
                    ["Read/listen", "Notifications"],
                  ].map(([inV1, notV1], i) => (
                    <tr key={i}>
                      <td className="border-b border-[#ececec] py-4 pr-6 align-top">
                        {inV1}
                      </td>
                      <td className="border-b border-[#ececec] py-4 align-top">
                        {notV1}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.figure>
          }
        >
          <p>
            {`In v1 — open-collection recognition, capture → context, a local collection, the taste map, read/listen. Local-first: no backend, near-zero cost.`}
          </p>
          <p>
            {`Not in v1 — universal recognition, room-level location, social, live theming, notifications.`}
          </p>
          <p>
            {`The biggest cut — open collections only — does triple duty: it ships, it stays public-domain, and it turns the failure path into a designed feature instead of a bug.`}
          </p>
        </Section>

        {/* ─── LIMITATIONS & NEXT ─── */}
        <Section
          id="limitations"
          label="Limitations & Next"
          after={
            /* [VISUAL] Quiet caveat panel — 1px border, low emphasis */
            <motion.div
              id="v-caveat"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10%" }}
              variants={fadeUp}
              transition={{ duration: 0.9, ease: EASE }}
              className="grid grid-cols-1 items-start gap-x-12 lg:grid-cols-[1fr_2fr]"
            >
              <span className="hidden lg:block" />
              <div className="rounded-[16px] border border-[#ececec] p-6">
                <p className="text-[16px] leading-[1.55] text-[#6b6b6b]">
                  {`Cohort: frequent museum visitors, early-to-mid-thirties professionals. Findings are directional, not conclusive.`}
                </p>
              </div>
            </motion.div>
          }
        >
          <p>
            {`The cohort was deliberately narrow — frequent visitors, early-to-mid-thirties professionals — so these findings are directional, not conclusive.`}
          </p>
          <p>
            {`Next: widen the sample to occasional visitors, students, and older adults; test whether the taste map actually reads; and pressure-test recognition and offline behaviour in a real gallery.`}
          </p>
        </Section>

        {/* ─── REFLECTION ─── */}
        <Section
          id="reflection"
          label="Reflection"
          after={
            /* [VISUAL] Closing pull quote — site's standard large-quote treatment */
            <QuoteBand
              id="v-closing-quote"
              quote="Taste is a mirror, not a measurement."
            />
          }
        >
          <p>
            {`The hardest decision was the smallest: refusing to score taste. Every instinct pushes toward a number — it's legible, it's shareable, it demos well. But taste has no sensor, and a fake metric would betray the whole premise.`}
          </p>
          <p>
            {`The real value wasn't in the screens that demo well. It was in the states a demo skips, the interview guide I rewrote mid-study, and the one scope cut that made an impossible feature shippable. Judgment lives in the parts nobody photographs.`}
          </p>
        </Section>

        {/* Bottom page-to-page nav — matches NYT Games */}
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
