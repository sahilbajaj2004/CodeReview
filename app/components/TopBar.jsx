"use client";

import { Sparkle, X, CircleNotch } from "@phosphor-icons/react";
import SignInButton from "@/app/components/SignInButton";
import ModelPicker from "@/app/components/ModelPicker";

/**
 * TopBar — logo · source status · ModelPicker · Review · SignIn.
 * onReset (present once a source is loaded) clears back to the StartScreen.
 */
export default function TopBar({
  source,
  model,
  onModelChange,
  onReview,
  reviewing,
  canReview,
  onReset,
}) {
  const fileCount = source?.files?.length ?? 0;
  const status = source?.meta?.owner
    ? `${source.meta.owner}/${source.meta.repo}${
        source.meta.branch ? `@${source.meta.branch}` : ""
      }`
    : source?.meta?.source === "zip"
      ? `zip · ${fileCount} files`
      : fileCount
        ? `${fileCount} files`
        : "no source loaded";

  return (
    <header
      className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4"
      style={{ zIndex: "var(--z-sticky)" }}
    >
      <div className="flex items-center gap-2">
        <Sparkle size={18} weight="fill" className="text-accent" />
        <span className="font-mono text-sm font-semibold tracking-tight">
          code<span className="text-accent">/</span>review
        </span>
      </div>

      <span className="ml-1 truncate font-mono text-xs text-ink-faint" title={status}>
        {status}
      </span>
      {onReset && (
        <button
          onClick={onReset}
          title="Load a different source"
          aria-label="Load a different source"
          className="rounded p-1 text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <X size={13} />
        </button>
      )}

      <div className="flex-1" />

      <div className="hidden sm:block">
        <ModelPicker value={model} onChange={onModelChange} disabled={reviewing} />
      </div>

      <button
        onClick={onReview}
        disabled={!canReview || reviewing}
        className="flex items-center gap-1.5 rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink transition-[transform,background] hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {reviewing && <CircleNotch size={14} className="animate-spin" />}
        {reviewing ? "Reviewing…" : "Review"}
      </button>

      <SignInButton />
    </header>
  );
}
