import Link from "next/link";
import { Sparkle, ArrowRight } from "@phosphor-icons/react/dist/ssr";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#lenses", label: "What it checks" },
  { href: "#models", label: "Models" },
];

/** Sticky landing nav. One line at desktop; links collapse on mobile. */
export default function LandingNav() {
  return (
    <header
      className="fixed inset-x-0 top-0 border-b border-border/60 bg-bg/70 backdrop-blur-md"
      style={{ zIndex: "var(--z-sticky)" }}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5">
        <Link href="/" className="flex items-center gap-2">
          <Sparkle size={18} weight="fill" className="text-accent" />
          <span className="font-mono text-sm font-semibold tracking-tight">
            code<span className="text-accent">/</span>review
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-7 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>

        <Link
          href="/app"
          className="ml-auto flex items-center gap-1.5 rounded bg-accent px-3.5 py-1.5 text-sm font-medium text-accent-ink transition-[transform,background] hover:bg-accent-hover active:scale-[0.98] md:ml-0"
        >
          Open the reviewer
          <ArrowRight size={14} weight="bold" />
        </Link>
      </nav>
    </header>
  );
}
