"use client";

import { Sparkle } from "@phosphor-icons/react";
import SignInButton from "@/app/components/SignInButton";

/**
 * TopBar — logo · repo/zip status · ModelPicker · Review · SignIn.
 * Phase 1: structure + placeholders. ModelPicker (Phase 8) and
 * SignInButton (Phase 2A) get extracted into their own files later.
 */
export default function TopBar({ source }) {
  const status = source?.meta
    ? `${source.meta.owner}/${source.meta.repo}`
    : source?.files?.length
      ? `${source.files.length} files`
      : "no source loaded";

  return (
    <header
      className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4"
      style={{ zIndex: "var(--z-sticky)" }}
    >
      {/* Wordmark */}
      <div className="flex items-center gap-2">
        <Sparkle size={18} weight="fill" className="text-accent" />
        <span className="font-mono text-sm font-semibold tracking-tight">
          code<span className="text-accent">/</span>review
        </span>
      </div>

      {/* Repo / zip status */}
      <span
        className="ml-1 truncate font-mono text-xs text-ink-faint"
        title={status}
      >
        {status}
      </span>

      <div className="flex-1" />

      {/* ModelPicker placeholder — Phase 8 */}
      <span className="hidden rounded border border-border px-2.5 py-1.5 font-mono text-xs text-ink-muted sm:inline">
        model: —
      </span>

      {/* Review button */}
      <button
        disabled
        className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink transition-[transform,background] hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Review
      </button>

      <SignInButton />
    </header>
  );
}
