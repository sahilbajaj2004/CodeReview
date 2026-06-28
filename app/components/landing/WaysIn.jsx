import { GithubLogo, LinkSimple, FileZip } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/app/components/landing/Reveal";

const WAYS = [
  {
    Icon: GithubLogo,
    title: "Your repos",
    body: "Sign in with GitHub to review your own repositories, public or private. The token stays on the server.",
  },
  {
    Icon: LinkSimple,
    title: "Public URL",
    body: "Paste any github.com/owner/repo. No account, no setup, nothing to install.",
  },
  {
    Icon: FileZip,
    title: "ZIP upload",
    body: "Drop a .zip to review code that never touches GitHub. Parsed and guarded on the server.",
  },
];

export default function WaysIn() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <Reveal className="max-w-2xl">
        <h2 className="text-balance text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold leading-tight tracking-[-0.02em] text-ink">
          Start from where your code lives
        </h2>
        <p className="mt-3 max-w-md text-base leading-relaxed text-ink-muted">
          Three ways in, one review. The public URL and ZIP paths never ask you
          to log in.
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 divide-y divide-border border-t border-border md:grid-cols-3 md:divide-x md:divide-y-0">
        {WAYS.map(({ Icon, title, body }, i) => (
          <Reveal key={title} delay={i * 0.08} className="px-0 py-8 md:px-7 md:first:pl-0">
            <Icon size={22} className="text-accent" />
            <h3 className="mt-4 text-lg font-medium text-ink">{title}</h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">
              {body}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
