"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { GithubLogo, LockSimple, ArrowClockwise } from "@phosphor-icons/react";

/**
 * RepoPicker — lists the signed-in user's repos (public + private).
 * Anonymous users see a sign-in prompt; URL and ZIP paths stay open without it.
 * onPick(repo) hands { fullName, url, defaultBranch, private } upward; Phase 3
 * wires that to POST /api/repo.
 */
export default function RepoPicker({ onPick }) {
  const { status } = useSession();
  const authed = status === "authenticated";
  const [repos, setRepos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load(signal) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/repos", signal ? { signal } : undefined);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed (${res.status})`);
      }
      const { repos } = await res.json();
      setRepos(repos);
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Auto-load once the user is authenticated. The fetch runs inside an async
  // IIFE so state updates happen after the effect frame, not synchronously.
  useEffect(() => {
    if (!authed) return;
    const ctrl = new AbortController();
    (async () => {
      await load(ctrl.signal);
    })();
    return () => ctrl.abort();
  }, [authed]);

  if (!authed) {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => signIn("github")}
          className="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-sm text-ink-muted transition-colors hover:border-border-strong hover:text-ink"
        >
          <GithubLogo size={16} weight="fill" />
          Sign in to load your repos
        </button>
        <p className="text-xs text-ink-muted">Public URL and ZIP work without it.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex w-full flex-col gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-7 w-full animate-pulse rounded bg-surface-2" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-xs text-sev-high">{error}</p>
        <button
          onClick={load}
          className="flex items-center gap-1 rounded border border-border px-2.5 py-1 text-xs text-ink-muted hover:text-ink"
        >
          <ArrowClockwise size={13} /> Retry
        </button>
      </div>
    );
  }

  if (!repos?.length) {
    return <p className="text-xs text-ink-faint">No repositories found.</p>;
  }

  return (
    <div className="flex w-full flex-col">
      <div className="mb-1.5 flex items-center justify-between px-1">
        <span className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
          your repos
        </span>
        <button
          onClick={load}
          title="Refresh"
          className="text-ink-faint transition-colors hover:text-ink-muted"
        >
          <ArrowClockwise size={13} />
        </button>
      </div>
      <ul className="flex max-h-64 w-full flex-col overflow-y-auto">
        {repos.map((r) => (
          <li key={r.fullName}>
            <button
              onClick={() => onPick?.(r)}
              title={r.fullName}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left font-mono text-xs text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              {r.private ? (
                <LockSimple size={12} className="shrink-0 text-sev-med" />
              ) : (
                <GithubLogo size={12} className="shrink-0 opacity-50" />
              )}
              <span className="truncate">{r.fullName}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
