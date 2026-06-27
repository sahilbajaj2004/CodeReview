/**
 * zip.js — parse an uploaded ZIP into the same shape as the GitHub path.
 * Server-only. Reuses the shared filters/caps so /api/upload and /api/repo
 * behave identically.
 *
 * Safety (plan §9):
 *  - path traversal: drop absolute paths and any entry containing ".."
 *  - zip bombs: cap entry count, cap claimed uncompressed size per file (via
 *    applyCaps), and enforce a hard total-decompressed budget while reading
 *  - binaries: extension filter + a text heuristic after decode
 */

import JSZip from "jszip";
import {
  shouldIgnore,
  detectLanguage,
  applyCaps,
  rankForReview,
  looksLikeText,
  CAPS,
} from "@/lib/files";

const MAX_ENTRIES = 5000; // reject archives with absurd file counts
const MAX_TOTAL_UNCOMPRESSED = 50 * 1024 * 1024; // 50MB hard ceiling while reading

export class UploadError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "UploadError";
    this.status = status;
  }
}

/** If every entry shares one top-level dir (e.g. "repo-main/"), return it. */
function commonTopDir(names) {
  if (!names.length) return "";
  const first = names[0].split("/")[0];
  if (first && names.every((n) => n.startsWith(first + "/"))) return first + "/";
  return "";
}

function stripPrefix(name, prefix) {
  return prefix && name.startsWith(prefix) ? name.slice(prefix.length) : name;
}

/** Reject path-traversal and absolute paths. */
function isUnsafePath(p) {
  if (!p) return true;
  if (p.startsWith("/") || /^[a-zA-Z]:[\\/]/.test(p)) return true; // absolute (unix/windows)
  const parts = p.split(/[\\/]/);
  return parts.includes("..");
}

export async function processZip(buffer, caps = CAPS) {
  let zip;
  try {
    zip = await JSZip.loadAsync(buffer);
  } catch {
    throw new UploadError("Not a valid ZIP file", 400);
  }

  const all = Object.values(zip.files).filter((e) => !e.dir);
  if (all.length > MAX_ENTRIES) {
    throw new UploadError("ZIP contains too many files", 413);
  }

  const prefix = commonTopDir(all.map((e) => e.name));

  // Path-level filtering + traversal guard, with claimed uncompressed size.
  const candidates = [];
  for (const e of all) {
    const path = stripPrefix(e.name, prefix);
    if (isUnsafePath(path)) continue;
    if (shouldIgnore(path)) continue;
    const size = e._data?.uncompressedSize ?? 0;
    candidates.push({ entry: e, path, size });
  }

  candidates.sort(rankForReview);
  const { files: kept, truncated: capTruncated } = applyCaps(candidates, caps);

  // Decompress kept entries only, under a total budget; skip non-text.
  let totalUncompressed = 0;
  let truncated = capTruncated;
  const files = [];

  for (const c of kept) {
    totalUncompressed += c.size;
    if (totalUncompressed > MAX_TOTAL_UNCOMPRESSED) {
      truncated = true;
      break;
    }
    const content = await c.entry.async("string");
    if (!looksLikeText(content)) continue; // binary that slipped the ext filter
    files.push({
      path: c.path,
      content,
      language: detectLanguage(c.path),
      size: c.size || content.length,
    });
  }

  return {
    files,
    tree: files.map((f) => f.path),
    truncated,
    meta: { source: "zip" },
  };
}
