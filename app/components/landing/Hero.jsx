"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, GithubLogo } from "@phosphor-icons/react";
import ReviewPreview from "@/app/components/landing/ReviewPreview";

const ease = [0.16, 1, 0.3, 1];

export default function Hero() {
  const reduce = useReducedMotion();
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: 0.05 } },
  };
  const item = {
    hidden: reduce ? {} : { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
  };

  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden">
      {/* atmosphere: faint grid + single soft accent wash, behind content */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent 75%)",
          }}
        />
        <div
          className="absolute -top-32 right-[-10%] h-[36rem] w-[36rem] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, var(--accent), transparent 60%)" }}
        />
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-5 pt-24 pb-16 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        {/* Left: message */}
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-xl">
          <motion.h1
            variants={item}
            className="text-balance text-[clamp(2.5rem,6vw,4.25rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-ink"
          >
            Senior code review for{" "}
            <span className="text-accent">any repo</span>.
            <span className="cr-cursor" aria-hidden />
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-5 max-w-md text-base leading-relaxed text-ink-muted sm:text-lg"
          >
            Paste a GitHub repo or drop a ZIP and get cited findings across
            quality, security, performance, and structure.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/app"
              className="flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-ink transition-[transform,background] hover:bg-accent-hover active:scale-[0.98]"
            >
              Open the reviewer
              <ArrowRight size={16} weight="bold" />
            </Link>
            <button
              onClick={() => signIn("github", { callbackUrl: "/app" })}
              className="flex items-center gap-2 rounded-md border border-border px-5 py-3 text-sm font-medium text-ink-muted transition-colors hover:border-border-strong hover:text-ink active:scale-[0.98]"
            >
              <GithubLogo size={17} weight="fill" />
              Sign in with GitHub
            </button>
          </motion.div>
        </motion.div>

        {/* Right: real product preview */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease, delay: 0.15 }}
          className="flex justify-center lg:justify-end"
        >
          <ReviewPreview />
        </motion.div>
      </div>
    </section>
  );
}
