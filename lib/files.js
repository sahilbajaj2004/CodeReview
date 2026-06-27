/**
 * files.js — shared filtering, caps, and language detection.
 * Used by both /api/repo (GitHub) and /api/upload (ZIP) so the two paths
 * return the same shape and obey the same limits.
 *
 * File = { path: string, content: string, language: string, size: number }
 */

// Per-file and aggregate caps (token + rate-limit safety, see plan §4/§9).
export const CAPS = {
  maxFileBytes: 100 * 1024, // skip individual files larger than ~100KB
  maxFiles: 40, // keep at most this many files for review
  maxTotalBytes: 400 * 1024, // ...and at most this many bytes total
};

// Directory segments that are never worth reviewing.
const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".nuxt",
  ".svelte-kit",
  "dist",
  "build",
  "out",
  "coverage",
  ".turbo",
  ".cache",
  "vendor",
  "venv",
  ".venv",
  "__pycache__",
  ".idea",
  ".vscode",
  "target", // rust/java build output
  "bin",
  "obj",
]);

// Exact filenames to drop (lockfiles, noise).
const IGNORE_FILES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "npm-shrinkwrap.json",
  "bun.lockb",
  "composer.lock",
  "poetry.lock",
  "pipfile.lock",
  "cargo.lock",
  "gemfile.lock",
  "go.sum",
  ".ds_store",
]);

// Binary / asset / compiled extensions — not source, skip outright.
const BINARY_EXT = new Set([
  // images
  "png", "jpg", "jpeg", "gif", "webp", "avif", "bmp", "tiff", "ico", "icns",
  // vector/asset (text but noise for review)
  "svg",
  // fonts
  "woff", "woff2", "ttf", "otf", "eot",
  // media
  "mp4", "webm", "mov", "avi", "mkv", "mp3", "wav", "ogg", "flac",
  // archives
  "zip", "tar", "gz", "tgz", "bz2", "rar", "7z", "xz",
  // docs / binary office
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
  // compiled / binary
  "exe", "dll", "so", "dylib", "o", "a", "class", "jar", "pyc", "pyo",
  "wasm", "bin", "dat", "db", "sqlite", "sqlite3", "parquet",
  // misc
  "lock", "map", "min",
]);

// Extension -> Monaco language id.
const LANG_BY_EXT = {
  js: "javascript", jsx: "javascript", mjs: "javascript", cjs: "javascript",
  ts: "typescript", tsx: "typescript", mts: "typescript", cts: "typescript",
  py: "python", rb: "ruby", go: "go", rs: "rust", java: "java", kt: "kotlin",
  kts: "kotlin", c: "c", h: "c", cpp: "cpp", cc: "cpp", cxx: "cpp", hpp: "cpp",
  hh: "cpp", cs: "csharp", php: "php", swift: "swift", scala: "scala",
  sh: "shell", bash: "shell", zsh: "shell", fish: "shell", ps1: "powershell",
  yml: "yaml", yaml: "yaml", json: "json", jsonc: "json", json5: "json",
  md: "markdown", mdx: "markdown", html: "html", htm: "html", css: "css",
  scss: "scss", sass: "scss", less: "less", sql: "sql", xml: "xml",
  toml: "ini", ini: "ini", graphql: "graphql", gql: "graphql",
  proto: "protobuf", vue: "html", svelte: "html", astro: "html",
  dart: "dart", lua: "lua", r: "r", pl: "perl", ex: "elixir", exs: "elixir",
  erl: "erlang", clj: "clojure", hs: "haskell", elm: "elm", tf: "hcl",
};

export function getExtension(path) {
  const name = path.split("/").pop() || "";
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
}

export function detectLanguage(path) {
  const name = (path.split("/").pop() || "").toLowerCase();
  if (name === "dockerfile" || name.startsWith("dockerfile.")) return "dockerfile";
  if (name === "makefile") return "makefile";
  if (name === ".gitignore" || name === ".dockerignore") return "ignore";
  return LANG_BY_EXT[getExtension(path)] || "plaintext";
}

/**
 * Should this path be excluded before we even fetch its contents?
 * Pure path test — no size/content knowledge needed.
 */
export function shouldIgnore(path) {
  const clean = path.replace(/^\.?\//, "");
  const segments = clean.split("/");
  const name = (segments[segments.length - 1] || "").toLowerCase();

  if (segments.some((s) => IGNORE_DIRS.has(s))) return true;
  if (IGNORE_FILES.has(name)) return true;
  if (/\.min\.(js|css)$/.test(name)) return true; // minified
  if (BINARY_EXT.has(getExtension(path))) return true;
  return false;
}

/**
 * Apply file-count + byte caps to an already-filtered, sorted list.
 * Returns { files, truncated } where truncated is true if anything was cut.
 * Each input item must have at least { path, size }.
 */
export function applyCaps(items, caps = CAPS) {
  const kept = [];
  let total = 0;
  let truncated = false;

  for (const item of items) {
    if (item.size > caps.maxFileBytes) {
      truncated = true;
      continue;
    }
    if (kept.length >= caps.maxFiles || total + item.size > caps.maxTotalBytes) {
      truncated = true;
      break;
    }
    kept.push(item);
    total += item.size;
  }

  return { files: kept, truncated };
}

/**
 * Heuristic: does this string look like text (not binary)? Used for the ZIP
 * path where we can't trust extensions alone. Checks for NUL bytes and a high
 * ratio of control characters in a sample.
 */
export function looksLikeText(str) {
  if (!str) return true;
  const sample = str.slice(0, 4000);
  if (sample.includes("\u0000")) return false;
  let control = 0;
  for (let i = 0; i < sample.length; i++) {
    const c = sample.charCodeAt(i);
    if (c < 9 || (c > 13 && c < 32)) control++;
  }
  return control / sample.length < 0.1;
}

/**
 * Rank files so the cap keeps the most review-worthy ones first:
 * source code before config/docs, shallower paths before deep ones.
 */
export function rankForReview(a, b) {
  const score = (p) => {
    const lang = detectLanguage(p);
    if (["markdown", "ignore", "plaintext"].includes(lang)) return 2;
    if (["json", "yaml", "ini"].includes(lang)) return 1;
    return 0; // real source code
  };
  const sa = score(a.path);
  const sb = score(b.path);
  if (sa !== sb) return sa - sb;
  const da = a.path.split("/").length;
  const db = b.path.split("/").length;
  if (da !== db) return da - db;
  return a.path.localeCompare(b.path);
}
