"use client";

import { useState } from "react";
import {
  ListChecks,
  CaretRight,
  Copy,
  Check,
  Warning,
  ShieldCheck,
} from "@phosphor-icons/react";

const SEV = {
  high: { label: "High", color: "var(--sev-high)", rank: 0 },
  med: { label: "Med", color: "var(--sev-med)", rank: 1 },
  low: { label: "Low", color: "var(--sev-low)", rank: 2 },
};

const CAT_LABEL = {
  security: "Security",
  quality: "Code quality",
  performance: "Performance",
  structure: "Structure",
  suggestion: "Suggestions",
};
const CAT_ORDER = ["security", "quality", "performance", "structure", "suggestion"];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      title="Copy code"
      className="flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-ink-faint transition-colors hover:text-ink"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "copied" : "copy"}
    </button>
  );
}

function FindingCard({ finding, index, onJump }) {
  const [open, setOpen] = useState(false);
  const sev = SEV[finding.severity] || SEV.low;

  return (
    <div
      className="cr-reveal border-b border-border last:border-b-0"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-2 px-3 py-2 text-left transition-colors hover:bg-surface-2"
        aria-expanded={open}
      >
        <span
          className="mt-1 h-2 w-2 shrink-0 rounded-full"
          style={{ background: sev.color }}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm text-ink">{finding.title}</span>
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-ink-faint">
            <span style={{ color: sev.color }}>{sev.label}</span>
            <span aria-hidden>·</span>
            {finding.line ? (
              <span
                role="link"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onJump?.(finding.file, finding.line);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    onJump?.(finding.file, finding.line);
                  }
                }}
                className="truncate text-accent hover:underline"
                title={`Jump to ${finding.file}:${finding.line}`}
              >
                {finding.file}:{finding.line}
              </span>
            ) : (
              <span className="truncate">{finding.file}</span>
            )}
          </span>
        </span>
        <CaretRight
          size={12}
          className={`mt-1 shrink-0 text-ink-faint transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-2 px-3 pb-3 pl-7 text-xs leading-relaxed text-ink-muted">
          <p>{finding.detail}</p>
          {finding.suggestion && (
            <p>
              <span className="font-medium text-ink">Fix: </span>
              {finding.suggestion}
            </p>
          )}
          {finding.codeExample && (
            <div className="rounded border border-border bg-bg">
              <div className="flex items-center justify-between border-b border-border px-2 py-1">
                <span className="font-mono text-[10px] text-ink-faint">example</span>
                <CopyButton text={finding.codeExample} />
              </div>
              <pre className="overflow-x-auto p-2 font-mono text-[11px] text-ink">
                {finding.codeExample}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="border-b border-border px-3 py-2.5">
      <h3 className="mb-1 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
        {title}
      </h3>
      <div className="text-xs leading-relaxed text-ink-muted">{children}</div>
    </div>
  );
}

/**
 * ReviewPanel — right pane. Renders streamed review state.
 * review = { status, reviewedFiles, totalFiles, truncated, doneCount,
 *            findings, summary, structureNotes, perFile, error }
 */
export default function ReviewPanel({ source, review, onJump }) {
  const ready = !!source?.files?.length;
  const status = review?.status ?? "idle";
  const findings = review?.findings ?? [];

  // Group + sort findings for display.
  const byCat = {};
  for (const f of findings) (byCat[f.category] ||= []).push(f);
  for (const k of Object.keys(byCat)) {
    byCat[k].sort((a, b) => (SEV[a.severity]?.rank ?? 9) - (SEV[b.severity]?.rank ?? 9));
  }
  let cardIndex = 0;

  const failed = (review?.perFile ?? []).filter((p) => p.error).length;

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Header */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
        <div className="flex items-center gap-2">
          <ListChecks size={15} className="text-ink-muted" />
          <span className="font-mono text-xs text-ink-muted">Review</span>
        </div>
        {status === "streaming" && (
          <span className="font-mono text-[11px] text-ink-faint">
            {review.doneCount}/{review.reviewedFiles}
          </span>
        )}
      </div>

      {/* Streaming progress bar */}
      {status === "streaming" && (
        <div className="h-0.5 w-full bg-surface-2">
          <div
            className="h-full bg-accent transition-[width] duration-300"
            style={{
              width: `${review.reviewedFiles ? (review.doneCount / review.reviewedFiles) * 100 : 5}%`,
            }}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {/* Idle */}
        {status === "idle" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
            <p className="text-sm text-ink-muted">
              {ready ? "Ready to review" : "No source loaded"}
            </p>
            <p className="max-w-[18rem] text-xs leading-relaxed text-ink-muted">
              {ready
                ? "Pick a model and hit Review to scan quality, security, performance, and structure."
                : "Load a repo or ZIP first."}
            </p>
          </div>
        )}

        {/* Fatal error */}
        {status === "error" && (
          <div className="m-3 flex items-start gap-2 rounded border border-border bg-surface-2 px-3 py-2.5 text-sm text-ink">
            <Warning size={16} className="mt-0.5 shrink-0 text-sev-high" />
            <span>{review.error || "Review failed"}</span>
          </div>
        )}

        {/* Summary */}
        {review?.summary && (
          <Section title={status === "streaming" ? "Summary (pending)" : "Summary"}>
            {review.summary}
          </Section>
        )}

        {/* Structure notes */}
        {review?.structureNotes && (
          <Section title="Structure">{review.structureNotes}</Section>
        )}

        {/* Truncated / failed notices */}
        {(review?.truncated || failed > 0) && (
          <div className="border-b border-border px-3 py-2 font-mono text-[11px] text-ink-faint">
            {review.truncated &&
              `Showing ${review.reviewedFiles} of ${review.totalFiles} files. `}
            {failed > 0 && `${failed} file(s) failed to review.`}
          </div>
        )}

        {/* Findings by category */}
        {findings.length > 0 &&
          CAT_ORDER.filter((c) => byCat[c]?.length).map((cat) => (
            <div key={cat}>
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-3 py-1.5">
                <span className="text-xs font-medium text-ink">{CAT_LABEL[cat]}</span>
                <span className="font-mono text-[11px] text-ink-faint">
                  {byCat[cat].length}
                </span>
              </div>
              {byCat[cat].map((f, i) => (
                <FindingCard
                  key={`${f.file}-${f.line}-${i}`}
                  finding={f}
                  index={cardIndex++}
                  onJump={onJump}
                />
              ))}
            </div>
          ))}

        {/* Clean result */}
        {status === "done" && findings.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
            <ShieldCheck size={28} style={{ color: "var(--ok)" }} />
            <p className="text-sm text-ink">No issues found</p>
            <p className="text-xs text-ink-muted">
              The reviewed files came back clean.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
