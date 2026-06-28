import { Reveal } from "@/app/components/landing/Reveal";
import { MODELS, DEFAULT_MODEL } from "@/lib/models";

export default function Models() {
  return (
    <section id="models" className="border-y border-border bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <Reveal className="max-w-2xl">
          <h2 className="text-balance text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold leading-tight tracking-[-0.02em] text-ink">
            Run it on free models
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-muted">
            Every model in the picker is free on OpenRouter and supports the
            structured output the review depends on. Swap one in with a single
            click; per-file failures never sink the whole run.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex flex-wrap gap-3">
          {MODELS.map((m) => {
            const isDefault = m.id === DEFAULT_MODEL;
            return (
              <span
                key={m.id}
                className={`flex items-center gap-2 rounded-md border px-3.5 py-2 ${
                  isDefault ? "border-accent/50 bg-accent/10" : "border-border bg-surface"
                }`}
              >
                <span className="text-sm font-medium text-ink">{m.label}</span>
                <span className="font-mono text-[11px] text-ink-faint">
                  {m.provider}
                </span>
                {isDefault && (
                  <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                    default
                  </span>
                )}
              </span>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
