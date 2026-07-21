"use client";

import { useEffect, useState } from "react";

const downloadArrow = (
  <span className="relative inline-block size-[18px] overflow-hidden">
    <span className="absolute inset-0 flex items-center justify-center text-[16px] font-medium leading-none transition-transform duration-300 ease-out group-hover:translate-y-full">
      ↓
    </span>
    <span className="absolute inset-0 flex items-center justify-center text-[16px] font-medium leading-none -translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
      ↓
    </span>
  </span>
);

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-4 z-50 flex items-center justify-between rounded-full border-2 transition-all duration-300 ease-out ${
        scrolled
          ? "bg-white/85 backdrop-blur-2xl backdrop-saturate-150 border-white/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] p-1.5"
          : "bg-white border-[#ececec] p-2"
      }`}
    >
      <span className="pl-4 text-[16px] font-semibold text-[#181212] transition-all duration-300 ease-out">
        Karina Kravchenko
      </span>
      <nav className="flex items-center gap-6">
        <a
          href="https://www.linkedin.com/in/karina-kravchenko-60a915bb/"
          target="_blank"
          rel="noreferrer"
          className="py-2 text-[16px] text-[#181212] underline-offset-4 hover:underline"
        >
          LinkedIn
        </a>
        <a
          href="mailto:karynak.designer@gmail.com"
          className="py-2 text-[16px] text-[#181212] underline-offset-4 hover:underline"
        >
          Email
        </a>
        <a
          href="/cv.pdf"
          className={`group grid w-fit grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-full border-2 border-[#181212] bg-white font-semibold text-[#211B1C] transition-all duration-300 ease-out hover:bg-[#181212] hover:text-white ${
            scrolled ? "px-4 py-1 text-[14px]" : "px-5 py-2 text-[16px]"
          }`}
        >
          <span aria-hidden />
          <span className="whitespace-nowrap">Download CV</span>
          <span className="justify-self-end">{downloadArrow}</span>
        </a>
      </nav>
    </header>
  );
}
