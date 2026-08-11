"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type NavItem = { id: string; label: string };

const DEFAULT_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview" },
  { id: "impact", label: "Impact" },
  { id: "context", label: "Context" },
  { id: "role", label: "My Role" },
  { id: "problem", label: "Strategic Problem" },
  { id: "research", label: "Research → Principles" },
  { id: "work", label: "The Work" },
  { id: "design-system", label: "Design System" },
  { id: "reflection", label: "What I'd Do Differently" },
];

/* Scrollspy: the active section is the last one whose top has crossed a line
   35% down the viewport. At the very bottom of the page the final item wins
   even if its section is too short to reach the line. */
function useScrollSpy(items: NavItem[]) {
  const [activeId, setActiveId] = useState<string>(items[0].id);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 400);
      const doc = document.documentElement;
      const atBottom =
        window.innerHeight + window.scrollY >= doc.scrollHeight - 2;
      if (atBottom) {
        setActiveId(items[items.length - 1].id);
        return;
      }
      const line = window.innerHeight * 0.35;
      let current = items[0].id;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= line) current = item.id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  return { activeId, scrolled };
}

export function CaseStudySidebar({ items = DEFAULT_ITEMS }: { items?: NavItem[] }) {
  const { activeId, scrolled } = useScrollSpy(items);
  const chipRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  /* Keep the active chip visible in the mobile bar */
  useEffect(() => {
    chipRefs.current[activeId]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeId]);

  return (
    <>
      <aside className="sticky top-0 z-40 hidden h-screen w-[240px] shrink-0 flex-col bg-white py-8 pl-12 pr-6 lg:flex">
        <Link
          href="/"
          className="mb-12 inline-flex w-fit items-center gap-2 text-[16px] font-semibold text-[#181212] underline-offset-4 transition-colors hover:underline"
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
          <span>Back</span>
        </Link>
        <nav className="flex flex-col gap-3 text-[16px]">
          {items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={
                  "underline-offset-4 transition-colors duration-200 " +
                  (isActive
                    ? "text-[#181212] font-semibold"
                    : "text-[#6b6b6b] hover:text-[#181212] hover:underline")
                }
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Mobile wayfinding — slides in once the reader is past the hero */}
      <nav
        aria-label="Sections"
        className={
          "fixed inset-x-0 top-0 z-40 flex gap-2 overflow-x-auto border-b border-[#ececec] bg-white/90 px-5 py-2.5 backdrop-blur-md transition-transform duration-300 ease-out [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden " +
          (scrolled ? "translate-y-0" : "-translate-y-full")
        }
      >
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              ref={(el) => {
                chipRefs.current[item.id] = el;
              }}
              className={
                "shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[14px] transition-colors " +
                (isActive
                  ? "bg-[#181212] font-semibold text-white"
                  : "bg-[#f3f3f3] text-[#6b6b6b]")
              }
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    </>
  );
}
