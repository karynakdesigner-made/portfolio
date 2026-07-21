"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

/* Subtle 3D tilt-on-hover. The wrapped content rotates gently toward the
   cursor (±6°, spring-smoothed) and springs back on leave. Same parameters
   as the GEP Welcome hero so the effect feels identical across visuals. */
export function Tilt3D({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
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

  return (
    <div style={{ perspective: 1400 }} className={className}>
      <motion.div
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onMouseLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
