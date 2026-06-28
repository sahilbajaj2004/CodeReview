import {
  ShieldCheck,
  Code,
  Lightning,
  TreeStructure,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/app/components/landing/Reveal";

const LENSES = [
  {
    Icon: ShieldCheck,
    name: "Security",
    body: "Injection, hardcoded secrets, unsafe input handling, auth gaps, path traversal, SSRF.",
  },
  {
    Icon: Code,
    name: "Code quality",
    body: "Readability, naming, dead code, error handling, and the tests that should exist but don't.",
  },
  {
    Icon: Lightning,
    name: "Performance",
    body: "Hot paths, N+1 queries, needless allocation, blocking I/O, and quietly quadratic loops.",
  },
  {
    Icon: TreeStructure,
    name: "Structure",
    body: "Module boundaries, coupling, mixed responsibilities, and how the project is organized.",
  },
];

export default function Lenses() {
  return (
    <section id="lenses" className="mx-auto max-w-6xl px-5 py-24">
      <Reveal className="max-w-2xl">
        <h2 className="text-balance text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold leading-tight tracking-[-0.02em] text-ink">
          Four lenses, every review
        </h2>
        <p className="mt-3 max-w-md text-base leading-relaxed text-ink-muted">
          Each finding is typed, ranked by severity, and tied to a line. No vague
          advice, no false confidence.
        </p>
      </Reveal>

      <div className="mt-12 divide-y divide-border border-y border-border">
        {LENSES.map(({ Icon, name, body }, i) => (
          <Reveal key={name} delay={i * 0.06}>
            <div className="grid grid-cols-1 gap-2 py-6 sm:grid-cols-[1fr_2fr] sm:items-baseline sm:gap-8">
              <div className="flex items-center gap-3">
                <Icon size={20} className="text-accent" />
                <h3 className="text-lg font-medium text-ink">{name}</h3>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
                {body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
