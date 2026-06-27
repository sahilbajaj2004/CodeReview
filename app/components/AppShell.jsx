"use client";

import { useState } from "react";
import { TreeStructure, Code, ListChecks } from "@phosphor-icons/react";
import { DEFAULT_MODEL } from "@/lib/models";
import TopBar from "@/app/components/TopBar";
import FileTree from "@/app/components/FileTree";
import CodeViewer from "@/app/components/CodeViewer";
import ReviewPanel from "@/app/components/ReviewPanel";
import StartScreen from "@/app/components/StartScreen";

const TABS = [
  { id: "tree", label: "Files", Icon: TreeStructure },
  { id: "code", label: "Code", Icon: Code },
  { id: "review", label: "Review", Icon: ListChecks },
];

const EMPTY_REVIEW = {
  status: "streaming",
  reviewedFiles: 0,
  totalFiles: 0,
  truncated: false,
  doneCount: 0,
  findings: [],
  summary: null,
  structureNotes: null,
  perFile: [],
  error: null,
};

/**
 * AppShell — top-level client layout. Owns source loading, model selection,
 * the streamed review, and which file/line is focused.
 */
export default function AppShell() {
  const [source, setSource] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [highlightLine, setHighlightLine] = useState(null);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [mobileTab, setMobileTab] = useState("code");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [review, setReview] = useState(null);
  const [reviewing, setReviewing] = useState(false);

  const files = source?.files ?? [];
  const hasFiles = files.length > 0;
  const selectedFile = files.find((f) => f.path === selectedPath) ?? null;

  function adoptSource(data) {
    setSource(data);
    setSelectedPath(data.files?.[0]?.path ?? null);
    setHighlightLine(null);
    setReview(null);
    setMobileTab("code");
  }

  async function loadRepoUrl(url) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load repository");
      adoptSource(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleZip(file) {
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to read ZIP");
      adoptSource(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function applyEvent(ev) {
    setReview((r) => {
      const cur = r ?? { ...EMPTY_REVIEW };
      switch (ev.type) {
        case "start":
          return {
            ...cur,
            reviewedFiles: ev.reviewedFiles,
            totalFiles: ev.totalFiles,
            truncated: ev.truncated,
          };
        case "file":
          return {
            ...cur,
            doneCount: cur.doneCount + 1,
            findings: [...cur.findings, ...ev.findings],
            perFile: [
              ...cur.perFile,
              {
                path: ev.path,
                summary: ev.summary,
                findingCount: ev.findings.length,
                error: ev.error,
              },
            ],
          };
        case "summary":
          return { ...cur, summary: ev.summary, structureNotes: ev.structureNotes };
        case "error":
          return { ...cur, status: "error", error: ev.error };
        default:
          return cur;
      }
    });
  }

  async function handleReview() {
    if (!hasFiles || reviewing) return;
    setReviewing(true);
    setReview({ ...EMPTY_REVIEW, totalFiles: files.length });
    setMobileTab("review");
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, files }),
      });
      if (!res.ok || !res.body) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || `Review failed (${res.status})`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (line) {
            try {
              applyEvent(JSON.parse(line));
            } catch {
              /* ignore partial/garbage line */
            }
          }
        }
      }
      setReview((r) => (r?.status === "error" ? r : { ...r, status: "done" }));
    } catch (e) {
      setReview((r) => ({ ...(r ?? EMPTY_REVIEW), status: "error", error: e.message }));
    } finally {
      setReviewing(false);
    }
  }

  function handleJump(file, line) {
    setSelectedPath(file);
    setHighlightLine(line);
    setMobileTab("code");
  }

  function selectFile(p) {
    setSelectedPath(p);
    setHighlightLine(null);
    setMobileTab("code");
  }

  function reset() {
    setSource(null);
    setSelectedPath(null);
    setHighlightLine(null);
    setReview(null);
    setError(null);
  }

  return (
    <div className="flex flex-1 flex-col min-h-[100dvh] bg-bg text-ink">
      <TopBar
        source={source}
        model={model}
        onModelChange={setModel}
        onReview={handleReview}
        reviewing={reviewing}
        canReview={hasFiles}
        onReset={hasFiles ? reset : undefined}
      />

      {!hasFiles ? (
        <StartScreen
          onLoadUrl={loadRepoUrl}
          onDropZip={handleZip}
          loading={loading}
          error={error}
        />
      ) : (
        <>
          <main className="flex flex-1 min-h-0 flex-col lg:flex-row">
            <section
              className={`${
                mobileTab === "tree" ? "flex" : "hidden"
              } lg:flex flex-1 lg:flex-none lg:w-60 min-h-0 flex-col border-b lg:border-b-0 lg:border-r border-border bg-surface`}
              aria-label="File tree"
            >
              <FileTree
                files={files}
                selectedPath={selectedPath}
                onSelect={selectFile}
                truncated={source?.truncated}
              />
            </section>

            <section
              className={`${
                mobileTab === "code" ? "flex" : "hidden"
              } lg:flex flex-1 min-h-0 flex-col bg-bg`}
              aria-label="Code viewer"
            >
              <CodeViewer file={selectedFile} highlightLine={highlightLine} />
            </section>

            <section
              className={`${
                mobileTab === "review" ? "flex" : "hidden"
              } lg:flex flex-1 lg:flex-none lg:w-[340px] min-h-0 flex-col border-t lg:border-t-0 lg:border-l border-border bg-surface`}
              aria-label="Review panel"
            >
              <ReviewPanel source={source} review={review} onJump={handleJump} />
            </section>
          </main>

          <nav
            className="lg:hidden sticky bottom-0 flex border-t border-border bg-surface"
            style={{ zIndex: "var(--z-sticky)" }}
            aria-label="Panel switcher"
          >
            {TABS.map(({ id, label, Icon }) => {
              const active = mobileTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setMobileTab(id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-mono transition-colors ${
                    active ? "text-accent" : "text-ink-faint hover:text-ink-muted"
                  }`}
                >
                  <Icon size={18} weight={active ? "fill" : "regular"} />
                  {label}
                </button>
              );
            })}
          </nav>
        </>
      )}
    </div>
  );
}
