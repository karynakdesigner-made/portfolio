"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Entrance: parent staggers children; each element fades + rises + unblurs. */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
};
/* Media slots come in a touch later with a soft scale-up. */
const media = {
  hidden: { opacity: 0, scale: 0.92, filter: "blur(8px)" },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE },
  },
};

const V = "/figma/welcome-vid";

type Slot = {
  src: string;
  poster: string;
  style: React.CSSProperties;
};

/* Four media slots, positioned as % of the 1440×1024 design canvas. */
const SLOTS: Slot[] = [
  {
    // Top-right - cloud particles
    src: `${V}/vid-cloud.mp4`,
    poster: `${V}/vid-cloud-poster.jpg`,
    style: { left: "61.74%", top: "8.89%", width: "17.99%", height: "14.26%" },
  },
  {
    // Top-far-right - cubes
    src: `${V}/vid-cubes.mp4`,
    poster: `${V}/vid-cubes-poster.jpg`,
    style: { left: "81.39%", top: "3.52%", width: "13.61%", height: "10.74%" },
  },
  {
    // Bottom-left - laptop / coding
    src: `${V}/vid-laptop.mp4`,
    poster: `${V}/vid-laptop-poster.jpg`,
    style: { left: "5%", top: "77.54%", width: "24.03%", height: "18.95%" },
  },
  {
    // Bottom-center - 3D form
    src: `${V}/vid-center.mp4`,
    poster: `${V}/vid-center-poster.jpg`,
    style: { left: "30.69%", top: "81.93%", width: "8.4%", height: "15.33%" },
  },
];

export function GepWelcomeHero() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Re-sync every video to the start every 10s, so the loops cycle together.
  // Users with prefers-reduced-motion get the static posters instead.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotionPref = () => {
      videoRefs.current.forEach((v) => {
        if (!v) return;
        if (reduced.matches) {
          v.pause();
          v.currentTime = 0;
        } else {
          v.play().catch(() => {});
        }
      });
    };
    applyMotionPref();
    reduced.addEventListener("change", applyMotionPref);
    const id = window.setInterval(() => {
      if (reduced.matches) return;
      videoRefs.current.forEach((v) => {
        if (!v) return;
        v.currentTime = 0;
        v.play().catch(() => {});
      });
    }, 10000);
    return () => {
      window.clearInterval(id);
      reduced.removeEventListener("change", applyMotionPref);
    };
  }, []);

  // ── 3D tilt on hover ──────────────────────────────────────────
  const mx = useMotionValue(0); // -0.5 … 0.5
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), {
    stiffness: 150,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), {
    stiffness: 150,
    damping: 18,
  });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div style={{ perspective: 1400 }}>
      <motion.div
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="w-full rounded-[12px] shadow-[0_30px_80px_-24px_rgba(18,26,56,0.45)] transition-shadow duration-300 ease-out hover:shadow-[0_40px_100px_-24px_rgba(18,26,56,0.55)]"
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative w-full overflow-hidden rounded-[12px] bg-[#121a38]"
          style={{
            aspectRatio: "1440 / 1024",
            containerType: "inline-size",
            // Ubuntu - the font from the original Figma design, scoped to this
            // visual only (never touches the rest of the project's typography).
            fontFamily: "var(--font-ubuntu), system-ui, sans-serif",
          }}
        >
          {/* ── Media slots (videos) ── */}
          {SLOTS.map((slot, i) => (
            <motion.div
              key={slot.src}
              variants={media}
              className="absolute overflow-hidden rounded-[6px]"
              style={slot.style}
            >
              <video
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                src={slot.src}
                poster={slot.poster}
                muted
                loop
                autoPlay
                playsInline
                preload="auto"
                className="h-full w-full object-cover"
              />
            </motion.div>
          ))}

          {/* ── Capgemini logo (top-left) ── */}
          <motion.img
            variants={item}
            src={`${V}/capgemini-logo.svg`}
            alt="Capgemini"
            className="absolute"
            style={{ left: "5.07%", top: "3.52%", width: "12.43%", height: "auto", aspectRatio: "179 / 40" }}
          />

          {/* ── Left gradient accent bar ── */}
          <motion.div
            variants={item}
            aria-hidden
            className="absolute"
            style={{
              left: 0,
              top: "30.86%",
              width: "24.1%",
              height: "2.54%",
              background:
                "linear-gradient(to right, transparent 0%, #2e7be3 35%, #1db8f2 100%)",
            }}
          />

          {/* ── Right gradient accent bar ── */}
          <motion.div
            variants={item}
            aria-hidden
            className="absolute"
            style={{
              left: "73.26%",
              top: "57.91%",
              width: "26.74%",
              height: "2.54%",
              background:
                "linear-gradient(to right, #1db8f2 0%, #2e7be3 65%, transparent 100%)",
            }}
          />

          {/* ── Title block ── */}
          <div
            className="absolute inset-0 text-white"
            style={{ fontWeight: 300, lineHeight: 1 }}
          >
            <motion.p
              variants={item}
              className="absolute whitespace-nowrap"
              style={{ top: "18.95%", left: "5.07%", fontSize: "2.78cqw", lineHeight: 1.4 }}
            >
              Welcome to
            </motion.p>
            <motion.p
              variants={item}
              className="absolute whitespace-nowrap"
              style={{ top: "28.32%", left: "27.29%", fontSize: "6.67cqw", lineHeight: 1.05 }}
            >
              Capgemini
            </motion.p>
            <motion.p
              variants={item}
              className="absolute whitespace-nowrap"
              style={{ top: "40.82%", left: "4.58%", fontSize: "6.67cqw", lineHeight: 1.05 }}
            >
              Gen AI Engineering
            </motion.p>
            <motion.p
              variants={item}
              className="absolute whitespace-nowrap"
              style={{ top: "53.32%", left: "45.9%", fontSize: "6.67cqw", lineHeight: 1.05 }}
            >
              Platform
            </motion.p>

            {/* Italic subtitle */}
            <motion.p
              variants={item}
              className="absolute italic"
              style={{
                top: "65.9%",
                left: "46.53%",
                width: "26.25%",
                fontSize: "1.53cqw",
                lineHeight: 1.5,
              }}
            >
              Explore, leverage, and share resources to unleash the potential of AI.
            </motion.p>

            {/* Login button - cyan, glows softly */}
            <motion.button
              variants={item}
              type="button"
              className="absolute"
              style={{
                top: "75.2%",
                left: "46.53%",
                background: "#1db8f2",
                color: "#171a22",
                padding: "0.95cqw 2.1cqw",
                borderRadius: "0.62cqw",
                fontSize: "1.18cqw",
                fontWeight: 400,
                lineHeight: 1.4,
                border: "none",
                cursor: "pointer",
              }}
            >
              Log in with Capgemini
            </motion.button>

            {/* Support text */}
            <motion.p
              variants={item}
              className="absolute"
              style={{
                top: "82.4%",
                left: "46.53%",
                width: "29.3%",
                fontSize: "0.9cqw",
                lineHeight: 1.55,
                fontWeight: 300,
              }}
            >
              If you have any issues logging in, raise a support request via{" "}
              <span
                style={{
                  color: "#1db8f2",
                  textDecoration: "underline",
                  textUnderlineOffset: "2px",
                }}
              >
                this link
              </span>
              .
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
