import { Reveal } from "@/app/components/landing/Reveal";

const STEPS = [
  {
    n: "01",
    title: "Load",
    body: "Pull a repo or ZIP. Noise gets filtered out (node_modules, lockfiles, binaries) and the source that matters is kept, ranked, and capped.",
  },
  {
    n: "02",
    title: "Review",
    body: "Each file is reviewed independently by the model you pick, streaming in as it finishes. A final pass synthesizes the architecture.",
  },
  {
    n: "03",
    title: "Fix",
    body: "Every finding cites a file and line, jumps the editor there, and brings a corrected snippet you can copy in one click.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="border-y border-border bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <Reveal className="max-w-2xl">
          <h2 className="text-balance text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold leading-tight tracking-[-0.02em] text-ink">
            From repo to fix in three steps
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-y-10 sm:grid-cols-3 sm:gap-x-8">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12} className="relative">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-accent">{s.n}</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <h3 className="mt-5 text-xl font-medium text-ink">{s.title}</h3>
              <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-ink-muted">
                {s.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
