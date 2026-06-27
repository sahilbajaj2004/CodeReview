"use client";

import { useRef, useState } from "react";
import { GithubLogo, UploadSimple, FileZip } from "@phosphor-icons/react";

/**
 * RepoInput — public repo URL field + ZIP dropzone.
 * onSubmitUrl(url) and onDropZip(file) are handled by AppShell.
 */
export default function RepoInput({ onSubmitUrl, onDropZip, loading }) {
  const [url, setUrl] = useState("");
  const [drag, setDrag] = useState(false);
  const fileRef = useRef(null);

  function submit(e) {
    e.preventDefault();
    const u = url.trim();
    if (u && !loading) onSubmitUrl?.(u);
  }

  function handleFiles(list) {
    const file = list?.[0];
    if (file && !loading) onDropZip?.(file);
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={submit} className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded border border-border bg-surface-2 px-2.5 focus-within:border-accent">
          <GithubLogo size={16} className="shrink-0 text-ink-faint" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="github.com/owner/repo"
            spellCheck={false}
            autoComplete="off"
            aria-label="GitHub repository URL"
            className="w-full bg-transparent py-2 font-mono text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="shrink-0 rounded bg-accent px-4 py-2 text-sm font-medium text-accent-ink transition-[transform,background] hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Load
        </button>
      </form>

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-1.5 rounded border border-dashed px-4 py-6 text-center transition-colors ${
          drag
            ? "border-accent bg-surface-2"
            : "border-border hover:border-border-strong hover:bg-surface-2"
        }`}
      >
        {drag ? (
          <FileZip size={22} className="text-accent" />
        ) : (
          <UploadSimple size={22} className="text-ink-faint" />
        )}
        <span className="text-xs text-ink-muted">
          Drop a <span className="font-mono">.zip</span> or click to upload
        </span>
        <input
          ref={fileRef}
          type="file"
          accept=".zip,application/zip"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </button>
    </div>
  );
}
