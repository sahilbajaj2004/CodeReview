"use client";

import { useState } from "react";
import { TreeStructure, Code, ListChecks } from "@phosphor-icons/react";
import TopBar from "@/app/components/TopBar";
import FileTree from "@/app/components/FileTree";
import CodeViewer from "@/app/components/CodeViewer";
import ReviewPanel from "@/app/components/ReviewPanel";

const TABS = [
  { id: "tree", label: "Files", Icon: TreeStructure },
  { id: "code", label: "Code", Icon: Code },
  { id: "review", label: "Review", Icon: ListChecks },
];

/**
 * AppShell — top-level client layout that owns cross-pane state.
 * Phase 1: 3-pane scaffold with placeholders. Later phases fill:
 *   source  = { files, tree, meta, truncated } from /api/repo|upload
 *   review  = streamed findings from /api/review
 */
export default function AppShell() {
  const [source, setSource] = useState(null); // repo/zip result
  const [selectedPath, setSelectedPath] = useState(null);
  const [model, setModel] = useState(null);
  const [mobileTab, setMobileTab] = useState("code");

  const files = source?.files ?? [];
  const selectedFile = files.find((f) => f.path === selectedPath) ?? null;

  // Phase 2A: RepoPicker selection. Phase 3 wires this to POST /api/repo.
  function handlePickRepo(repo) {
    setSource({ meta: { owner: repo.owner, repo: repo.name, branch: repo.defaultBranch }, files: [] });
  }

  return (
    <div className="flex flex-1 flex-col min-h-[100dvh] bg-bg text-ink">
      <TopBar source={source} model={model} onModelChange={setModel} />

      {/* Desktop: 3-pane. Mobile: single pane via tabs. */}
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
            onPickRepo={handlePickRepo}
            onSelect={(p) => {
              setSelectedPath(p);
              setMobileTab("code");
            }}
          />
        </section>

        <section
          className={`${
            mobileTab === "code" ? "flex" : "hidden"
          } lg:flex flex-1 min-h-0 flex-col bg-bg`}
          aria-label="Code viewer"
        >
          <CodeViewer file={selectedFile} />
        </section>

        <section
          className={`${
            mobileTab === "review" ? "flex" : "hidden"
          } lg:flex flex-1 lg:flex-none lg:w-[340px] min-h-0 flex-col border-t lg:border-t-0 lg:border-l border-border bg-surface`}
          aria-label="Review panel"
        >
          <ReviewPanel source={source} onJumpToLine={() => setMobileTab("code")} />
        </section>
      </main>

      {/* Mobile segmented tab bar */}
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
    </div>
  );
}
