import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/app/components/landing/Reveal";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.1]"
        style={{ background: "radial-gradient(circle, var(--accent), transparent 60%)" }}
      />
      <div className="mx-auto max-w-3xl px-5 py-28 text-center">
        <Reveal>
          <h2 className="text-balance text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-ink">
            See what a staff engineer would flag
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-muted">
            Point it at a repo and read the findings in under a minute. No signup
            for public code.
          </p>
          <div className="mt-9 flex justify-center">
            <Link
              href="/app"
              className="flex items-center gap-2 rounded-md bg-accent px-6 py-3.5 text-sm font-medium text-accent-ink transition-[transform,background] hover:bg-accent-hover active:scale-[0.98]"
            >
              Open the reviewer
              <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
