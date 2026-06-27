"use client";

import { File as FileIcon } from "@phosphor-icons/react";
import RepoPicker from "@/app/components/RepoPicker";

/**
 * FileTree — left pane. Phase 1: empty state + flat list fallback.
 * Phase 3 replaces the flat list with a real nested, collapsible tree.
 * While empty it hosts the RepoPicker (signed-in users' repos); URL/ZIP
 * inputs land here too in Phase 3.
 */
export default function FileTree({ files = [], selectedPath, onSelect, onPickRepo }) {
  if (!files.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-8 text-center">
        <div className="max-w-[16rem]">
          <p className="text-sm text-ink-muted">No files yet</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-faint">
            Pick one of your repos, paste a public URL, or drop a ZIP.
          </p>
        </div>
        <RepoPicker onPick={onPickRepo} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto py-2">
      {files.map((f) => {
        const active = f.path === selectedPath;
        return (
          <button
            key={f.path}
            onClick={() => onSelect?.(f.path)}
            title={f.path}
            className={`flex items-center gap-2 px-3 py-1.5 text-left font-mono text-xs transition-colors ${
              active
                ? "bg-surface-2 text-accent"
                : "text-ink-muted hover:bg-surface-2 hover:text-ink"
            }`}
          >
            <FileIcon size={14} className="shrink-0 opacity-70" />
            <span className="truncate">{f.path}</span>
          </button>
        );
      })}
    </div>
  );
}
