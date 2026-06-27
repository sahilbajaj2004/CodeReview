"use client";

import { Code } from "@phosphor-icons/react";

/**
 * CodeViewer — center pane. Phase 1: placeholder.
 * Phase 3 swaps the <pre> for Monaco via dynamic(import, { ssr:false })
 * with a custom dark theme matched to DESIGN.md tokens, line decorations,
 * and scroll-to-line on finding click.
 */
export default function CodeViewer({ file }) {
  if (!file) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <Code size={32} className="text-ink-faint" />
        <p className="text-sm text-ink-muted">Select a file to view its source</p>
        <p className="font-mono text-xs text-ink-faint">
          editor loads here · Monaco · read-only
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="flex h-9 shrink-0 items-center border-b border-border px-3 font-mono text-xs text-ink-muted">
        <span className="truncate">{file.path}</span>
      </div>
      <pre className="flex-1 overflow-auto p-4 font-mono text-[13px] leading-relaxed text-ink">
        {file.content}
      </pre>
    </div>
  );
}
