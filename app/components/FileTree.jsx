"use client";

import { useMemo, useState } from "react";
import {
  File as FileIcon,
  CaretRight,
  CaretDown,
  Folder,
} from "@phosphor-icons/react";

/** Build a nested tree from flat file paths. */
function buildTree(files) {
  const root = { name: "", path: "", type: "dir", children: new Map() };
  for (const f of files) {
    const parts = f.path.split("/");
    let node = root;
    parts.forEach((part, i) => {
      const isFile = i === parts.length - 1;
      if (!node.children.has(part)) {
        node.children.set(part, {
          name: part,
          path: parts.slice(0, i + 1).join("/"),
          type: isFile ? "file" : "dir",
          children: new Map(),
          file: isFile ? f : null,
        });
      }
      node = node.children.get(part);
    });
  }
  return root;
}

/** Dirs first, then files; alpha within each. */
function sortedChildren(node) {
  return [...node.children.values()].sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

function TreeNode({ node, depth, selectedPath, collapsed, toggle, onSelect }) {
  const pad = { paddingLeft: `${depth * 12 + 8}px` };

  if (node.type === "file") {
    const active = node.path === selectedPath;
    return (
      <button
        onClick={() => onSelect?.(node.path)}
        title={node.path}
        style={pad}
        className={`flex w-full items-center gap-1.5 py-1 pr-2 text-left font-mono text-xs transition-colors ${
          active
            ? "bg-surface-2 text-accent"
            : "text-ink-muted hover:bg-surface-2 hover:text-ink"
        }`}
      >
        <FileIcon size={13} className="shrink-0 opacity-60" />
        <span className="truncate">{node.name}</span>
      </button>
    );
  }

  const isOpen = !collapsed.has(node.path);
  return (
    <div>
      <button
        onClick={() => toggle(node.path)}
        style={pad}
        className="flex w-full items-center gap-1 py-1 pr-2 text-left font-mono text-xs text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
      >
        {isOpen ? (
          <CaretDown size={11} className="shrink-0 opacity-70" />
        ) : (
          <CaretRight size={11} className="shrink-0 opacity-70" />
        )}
        <Folder size={13} weight={isOpen ? "fill" : "regular"} className="shrink-0 opacity-70" />
        <span className="truncate">{node.name}</span>
      </button>
      {isOpen &&
        sortedChildren(node).map((child) => (
          <TreeNode
            key={child.path}
            node={child}
            depth={depth + 1}
            selectedPath={selectedPath}
            collapsed={collapsed}
            toggle={toggle}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}

/**
 * FileTree — left pane. Nested, collapsible. Folders open by default.
 */
export default function FileTree({ files = [], selectedPath, onSelect, truncated }) {
  const tree = useMemo(() => buildTree(files), [files]);
  const [collapsed, setCollapsed] = useState(() => new Set());

  function toggle(path) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  }

  if (!files.length) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 text-center">
        <p className="text-xs text-ink-faint">No files</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
        <span className="font-mono text-[11px] text-ink-muted">
          {files.length} {files.length === 1 ? "file" : "files"}
        </span>
        {truncated && (
          <span
            className="font-mono text-[11px] text-sev-med"
            title="The repository is larger than the review cap; only the most relevant files were loaded."
          >
            capped
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto py-1">
        {sortedChildren(tree).map((child) => (
          <TreeNode
            key={child.path}
            node={child}
            depth={0}
            selectedPath={selectedPath}
            collapsed={collapsed}
            toggle={toggle}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
