"use client";

import dynamic from "next/dynamic";
import { useRef, useEffect } from "react";
import { Code } from "@phosphor-icons/react";

// Monaco is client-only and heavy — load it lazily, never on the server.
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center font-mono text-xs text-ink-faint">
        loading editor…
      </div>
    ),
  }
);

// Editor chrome matched to DESIGN.md tokens (Monaco needs hex, not OKLCH).
const EDITOR_BG = "#0e1117";

function defineTheme(monaco) {
  monaco.editor.defineTheme("code-review-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": EDITOR_BG,
      "editorGutter.background": EDITOR_BG,
      "editorLineNumber.foreground": "#4b5566",
      "editorLineNumber.activeForeground": "#aab3c0",
      "editor.lineHighlightBackground": "#161b22",
      "editor.lineHighlightBorder": "#00000000",
      "editor.selectionBackground": "#2a3a55",
      "editorIndentGuide.background1": "#1f2733",
      "editorWidget.background": "#161b22",
      "scrollbarSlider.background": "#3a4452aa",
    },
  });
}

/**
 * CodeViewer — center pane. Monaco, read-only, custom dark theme.
 * highlightLine: when set (a finding was clicked), reveal + flag that line.
 */
export default function CodeViewer({ file, highlightLine }) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef(null);

  function reveal(line) {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco || !line) return;
    editor.revealLineInCenter(line);
    editor.setPosition({ lineNumber: line, column: 1 });
    const collection = decorationsRef.current;
    const decoration = {
      range: new monaco.Range(line, 1, line, 1),
      options: {
        isWholeLine: true,
        className: "cr-flagged-line",
        linesDecorationsClassName: "cr-flagged-gutter",
      },
    };
    if (collection) collection.set([decoration]);
  }

  function onMount(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;
    decorationsRef.current = editor.createDecorationsCollection([]);
    if (highlightLine) reveal(highlightLine);
  }

  // Re-reveal when the target line changes or the file switches.
  useEffect(() => {
    if (highlightLine) reveal(highlightLine);
  }, [highlightLine, file?.path]);

  if (!file) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <Code size={32} className="text-ink-faint" />
        <p className="text-sm text-ink-muted">Select a file to view its source</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0" style={{ background: EDITOR_BG }}>
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
        <span className="truncate font-mono text-xs text-ink-muted">{file.path}</span>
        <span className="ml-2 shrink-0 font-mono text-[11px] text-ink-faint">
          {file.language}
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <MonacoEditor
          theme="code-review-dark"
          beforeMount={defineTheme}
          onMount={onMount}
          language={file.language === "plaintext" ? undefined : file.language}
          path={file.path}
          value={file.content}
          options={{
            readOnly: true,
            domReadOnly: true,
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            renderLineHighlight: "line",
            smoothScrolling: true,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
          }}
        />
      </div>
    </div>
  );
}
