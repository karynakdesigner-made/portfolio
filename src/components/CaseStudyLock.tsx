"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────
 * CaseStudyLock — password gate shared by every case study.
 * Styled strictly with the portfolio's existing system:
 *   - Colors: #181212, #211B1C, #4a4a4a, #6b6b6b, #ececec, #f8f8f8
 *   - Type: Mosvita (inherited) + Patience for the script logo
 *   - Layout: the case studies' [1fr_2fr] label/content grid
 *   - Motion: fadeUp + EASE, same as every page
 * Unlocks persist per browser (localStorage), so a recruiter
 * enters the password once and can browse all case studies.
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

const PASSWORD = "Welcome!";
const STORAGE_KEY = "case-studies-unlocked";
const CONTACT_EMAIL = "karynak.designer@gmail.com";

function ArrowRight({ size = 18 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="12" x2="20" y2="12" />
      <polyline points="13,5 20,12 13,19" />
    </svg>
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

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4,12 10,18 20,6" />
    </svg>
  );
}

/* Email pill with copy button — same pattern as the homepage footer's
   contact card, with visible "Copied!" feedback. */
function EmailPill() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — the address stays visible and selectable.
    }
  };

  return (
    <div className="flex w-fit max-w-full items-center gap-2 rounded-full bg-[#f8f8f8] py-2 pl-5 pr-2">
      <a
        href={`mailto:${CONTACT_EMAIL}?subject=Portfolio%20password%20request`}
        className="min-w-0 truncate text-[15px] text-[#211B1C] underline-offset-4 transition-colors hover:underline sm:text-[16px]"
      >
        {CONTACT_EMAIL}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Email copied" : "Copy email"}
        className={
          "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition-colors " +
          (copied
            ? "bg-[#181212] text-white"
            : "bg-white text-[#211B1C] hover:bg-[#ececec]")
        }
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        <span>{copied ? "Copied!" : "Copy"}</span>
      </button>
    </div>
  );
}

export function CaseStudyLock({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"checking" | "locked" | "unlocked">(
    "checking"
  );
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* The one render pass this costs is the point of the "checking" state:
     localStorage doesn't exist during SSR, so the unlock can only be read
     after mount, and rendering the form before we know would flash the
     password gate at someone who has already unlocked. Deliberate — not
     the accidental cascade the rule is aimed at. */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(
      localStorage.getItem(STORAGE_KEY) === "1" ? "unlocked" : "locked"
    );
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "1");
      setState("unlocked");
    } else {
      setError(true);
      inputRef.current?.select();
    }
  };

  if (state === "unlocked") return <>{children}</>;
  /* Avoid a lock-screen flash for already-unlocked visitors */
  if (state === "checking") return null;

  return (
    <div className="flex min-h-screen flex-col px-5 pt-6 sm:px-8 lg:px-16 lg:pt-8">
      {/* Two-line script logo — same treatment as the homepage sidebar */}
      <Link
        href="/"
        style={{ fontFamily: "var(--font-patience), serif" }}
        className="block w-fit text-[28px] font-normal leading-[1.15] text-[#181212]"
        aria-label="Karina Kravchenko"
      >
        <motion.span
          aria-hidden
          className="block pr-3"
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
        >
          Karina
        </motion.span>
        <motion.span
          aria-hidden
          className="block pr-3"
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: 1.0, delay: 0.65, ease: [0.65, 0, 0.35, 1] }}
        >
          Kravchenko
        </motion.span>
      </Link>

      <motion.section
        className="mt-16 grid grid-cols-1 items-start gap-x-12 gap-y-6 sm:mt-24 lg:mt-[160px] lg:grid-cols-[1fr_2fr]"
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.12, delayChildren: 0.05 }}
      >
        {/* Left rail — same style as the case studies' section labels */}
        <motion.p
          variants={labelSlide}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-[18px] font-semibold leading-[1.3] text-[#181212] sm:text-[22px]"
        >
          Locked
        </motion.p>

        {/* Right column — headline, explanation, password form */}
        <div className="flex max-w-[760px] flex-col gap-10">
          <div className="flex flex-col gap-5">
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 1.1, ease: EASE }}
              className="text-balance text-[34px] font-semibold leading-[1.1] text-[#181212] sm:text-[48px] sm:leading-[1.05] lg:text-[56px]"
            >
              This work is shared privately.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.9, ease: EASE }}
              className="max-w-[640px] text-[18px] leading-[1.5] text-[#4a4a4a]"
            >
              My case studies go deep into product work I keep off the open
              web, so they sit behind a password. I&apos;m happy to share it —
              drop me a line and I&apos;ll send it over.
            </motion.p>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.85, ease: EASE }}
            >
              <EmailPill />
            </motion.div>
          </div>

          <motion.form
            variants={fadeUp}
            transition={{ duration: 0.85, ease: EASE }}
            onSubmit={submit}
            className="flex flex-col gap-8"
          >
            <div className="flex flex-col gap-3">
              {/* Same label style as the meta strip's dt entries */}
              <label
                htmlFor="cs-password"
                className="text-[14px] text-[#6b6b6b]"
              >
                Password
              </label>
              <input
                ref={inputRef}
                id="cs-password"
                type="password"
                autoFocus
                autoComplete="off"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError(false);
                }}
                className={
                  "w-full max-w-[480px] border-b bg-transparent pb-3 text-[18px] text-[#181212] outline-none transition-colors duration-200 placeholder:text-[#6b6b6b] " +
                  (error
                    ? "border-[#181212]"
                    : "border-[#ececec] focus:border-[#181212]")
                }
              />
              {/* Reserved line so the error never shifts the layout */}
              <p
                aria-live="polite"
                className="min-h-[22px] text-[15px] italic text-[#6b6b6b]"
              >
                {error ? "That's not it — double-check and try again." : ""}
              </p>
            </div>

            <button
              type="submit"
              className="group inline-flex w-fit items-center gap-1.5 rounded-full bg-[#181212] px-7 py-3 text-[16px] font-semibold text-white transition-colors hover:bg-[#2a2a2a]"
            >
              <span>Unlock</span>
              <span className="inline-flex items-center transition-transform duration-300 ease-out group-hover:translate-x-1">
                <ArrowRight size={18} />
              </span>
            </button>
          </motion.form>
        </div>
      </motion.section>
    </div>
  );
}
