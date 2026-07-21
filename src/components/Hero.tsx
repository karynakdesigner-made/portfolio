"use client";

import { motion } from "motion/react";

const reveal = {
  hidden: { opacity: 0, y: 16, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function Hero() {
  return (
    <motion.section
      className="mt-12 flex flex-col gap-12 sm:mt-20 lg:mt-[110px]"
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.18, delayChildren: 0.05 }}
    >
      <div className="flex flex-col gap-4 sm:gap-5">
        <motion.h1
          variants={reveal}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[1209px] text-balance text-[34px] font-semibold leading-[1.1] text-[#181212] sm:text-[48px] sm:leading-[1.05] lg:text-[72px]"
        >
          Senior UX designer working on AI products, complex systems, and the
          interfaces in between.
        </motion.h1>
        <motion.p
          variants={reveal}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-[18px] font-semibold text-[#181212] sm:text-[22px] lg:text-[28px]"
        >
          Currently at Capgemini, building toward what comes next.
        </motion.p>
      </div>
    </motion.section>
  );
}
