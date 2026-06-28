"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Reveal — scroll-into-view entrance. Content is rendered in the DOM either
 * way; motion only adds the entrance. Honors prefers-reduced-motion (no
 * transform, instant) so the section never ships blank.
 */
export function Reveal({ children, delay = 0, y = 20, className, as = "div" }) {
  const reduce = useReducedMotion();
  const M = motion[as] || motion.div;
  return (
    <M
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </M>
  );
}
