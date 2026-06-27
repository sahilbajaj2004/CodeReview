"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { GithubLogo, SignOut } from "@phosphor-icons/react";

/**
 * Sign in with GitHub / signed-in avatar + sign out.
 * Always visible, always optional — login only unlocks the my-repos path.
 */
export default function SignInButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-8 w-20 animate-pulse rounded bg-surface-2" aria-hidden />;
  }

  if (session?.user) {
    const label = session.user.login || session.user.name || "account";
    return (
      <div className="flex items-center gap-2">
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt=""
            width={24}
            height={24}
            className="rounded-full border border-border"
          />
        ) : null}
        <span className="hidden font-mono text-xs text-ink-muted sm:inline">
          {label}
        </span>
        <button
          onClick={() => signOut()}
          title="Sign out"
          aria-label="Sign out"
          className="flex items-center gap-1 rounded border border-border px-2 py-1.5 text-ink-muted transition-colors hover:border-border-strong hover:text-ink"
        >
          <SignOut size={15} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("github")}
      className="flex items-center gap-1.5 rounded border border-border px-2.5 py-1.5 text-sm text-ink-muted transition-colors hover:border-border-strong hover:text-ink"
    >
      <GithubLogo size={16} weight="fill" />
      <span className="hidden sm:inline">Sign in</span>
    </button>
  );
}
