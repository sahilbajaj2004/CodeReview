"use client";

import { Sparkle, Warning, CircleNotch } from "@phosphor-icons/react";
import RepoInput from "@/app/components/RepoInput";
import RepoPicker from "@/app/components/RepoPicker";

/**
 * StartScreen — full-width empty state shown until a source is loaded.
 * Three ways in: paste a public URL, drop a ZIP, or pick one of your repos.
 * Never blocks the URL/ZIP paths behind auth.
 */
export default function StartScreen({ onLoadUrl, onDropZip, loading, error }) {
  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Sparkle size={28} weight="fill" className="mb-3 text-accent" />
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Review any codebase
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
            Pull a repo or ZIP, then run an AI review across quality, security,
            performance, and structure with cited fixes.
          </p>
        </div>

        <RepoInput onSubmitUrl={onLoadUrl} onDropZip={onDropZip} loading={loading} />

        {loading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-ink-muted">
            <CircleNotch size={16} className="animate-spin" />
            Loading source…
          </div>
        )}

        {error && !loading && (
          <div
            className="mt-4 flex items-start gap-2 rounded border border-border bg-surface-2 px-3 py-2.5 text-sm text-ink"
            role="alert"
          >
            <Warning size={16} className="mt-0.5 shrink-0 text-sev-high" />
            <span>{error}</span>
          </div>
        )}

        <div className="my-6 flex items-center gap-3 text-ink-faint">
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-[11px]">or pick one of yours</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="flex justify-center">
          <RepoPicker onPick={(repo) => onLoadUrl?.(repo.url)} />
        </div>
      </div>
    </div>
  );
}
