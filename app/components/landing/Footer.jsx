import Link from "next/link";
import { Sparkle } from "@phosphor-icons/react/dist/ssr";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Sparkle size={16} weight="fill" className="text-accent" />
          <span className="font-mono text-sm font-semibold tracking-tight text-ink">
            code<span className="text-accent">/</span>review
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-muted">
          <a href="#how" className="transition-colors hover:text-ink">How it works</a>
          <a href="#lenses" className="transition-colors hover:text-ink">What it checks</a>
          <a href="#models" className="transition-colors hover:text-ink">Models</a>
          <Link href="/app" className="transition-colors hover:text-ink">Open the reviewer</Link>
        </nav>

        <p className="font-mono text-xs text-ink-faint">
          Built by Sahil Bajaj · {year}
        </p>
      </div>
    </footer>
  );
}
