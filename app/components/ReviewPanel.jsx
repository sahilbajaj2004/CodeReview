"use client";

import { ListChecks } from "@phosphor-icons/react";

const CATEGORIES = [
  "Code quality",
  "Security",
  "Performance",
  "Structure",
  "Suggestions",
];

/**
 * ReviewPanel — right pane. Phase 1: idle/empty state.
 * Phase 7 renders streamed findings grouped by category, with severity
 * badges, collapsible detail + suggestion, copyable code, and click-to-jump.
 */
export default function ReviewPanel({ source }) {
  const ready = !!source?.files?.length;

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-3">
        <ListChecks size={15} className="text-ink-muted" />
        <span className="font-mono text-xs text-ink-muted">Review</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-ink-muted">
          {ready ? "Ready to review" : "No review yet"}
        </p>
        <p className="max-w-[18rem] text-xs leading-relaxed text-ink-faint">
          {ready
            ? "Pick a model and hit Review to scan this source across:"
            : "Load source, pick a model, then run a review across:"}
        </p>
        <ul className="flex flex-col gap-1 font-mono text-xs text-ink-faint">
          {CATEGORIES.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
