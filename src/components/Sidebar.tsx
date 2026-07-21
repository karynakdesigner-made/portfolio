"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

const navItems = [
  { id: "intro", label: "Intro" },
  { id: "case-studies", label: "Case Studies" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
];

export function Sidebar() {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    navItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <aside className="sticky top-0 z-40 hidden h-screen w-[240px] shrink-0 flex-col justify-between bg-white py-8 pl-12 pr-6 lg:flex">
      {/* Top: logo + nav */}
      <div className="flex flex-col gap-12">
        <a
          href="/"
          style={{ fontFamily: "var(--font-patience), serif" }}
          className="text-[28px] font-normal leading-[1.15] text-[#181212]"
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
        </a>
        <nav className="flex flex-col gap-3 text-[16px]">
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={
                  "underline-offset-4 transition-colors duration-200 " +
                  (isActive
                    ? "font-semibold text-[#181212]"
                    : "text-[#6b6b6b] hover:text-[#181212] hover:underline")
                }
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
      {/* Bottom: contact */}
      <div className="flex flex-col gap-3 text-[16px]">
        <a
          href="https://www.linkedin.com/in/karina-kravchenko-60a915bb/"
          target="_blank"
          rel="noreferrer"
          className="text-[#6b6b6b] underline-offset-4 transition-colors duration-200 hover:text-[#181212] hover:underline"
        >
          LinkedIn
        </a>
        <a
          href="mailto:karynak.designer@gmail.com"
          className="text-[#6b6b6b] underline-offset-4 transition-colors duration-200 hover:text-[#181212] hover:underline"
        >
          Email
        </a>
      </div>
    </aside>
  );
}
