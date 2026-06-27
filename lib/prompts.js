/**
 * prompts.js — system prompt + per-file review prompt builder.
 * Content is line-numbered so the model can cite exact lines.
 */

export const CATEGORIES = [
  { key: "quality", label: "Code quality", hint: "readability, naming, dead code, error handling, tests, maintainability" },
  { key: "security", label: "Security", hint: "injection, secrets, auth, unsafe input, path traversal, SSRF, XSS" },
  { key: "performance", label: "Performance", hint: "hot paths, N+1, needless allocation, blocking I/O, big-O" },
  { key: "structure", label: "Structure", hint: "module boundaries, coupling, responsibilities, file organization" },
  { key: "suggestion", label: "Suggestions", hint: "concrete improvements with example code" },
];

export const SYSTEM_PROMPT = `You are a senior staff engineer performing a rigorous, honest code review.

Rules:
- Be specific. Cite the file and the exact line number for every finding.
- Prefer concrete fixes over generic advice. When you suggest a change, include a short corrected code snippet in codeExample.
- No false positives. If you are unsure a problem is real, either omit it or lower its severity. It is better to report fewer, high-confidence findings than many speculative ones.
- Severity: "high" = security hole / data loss / crash / correctness bug. "med" = real bug or notable smell. "low" = minor / stylistic.
- category must be one of: quality, security, performance, structure, suggestion.
- line must be the 1-based line number in the provided (line-numbered) source, or null if it genuinely applies to the whole file.
- summary: 1-3 sentences on the overall health of what you reviewed.
- structureNotes: brief notes on architecture / organization, or null if not applicable.
- Output ONLY the structured object. Do not invent issues to fill space — an empty findings array is a valid, good result for clean code.`;

/** Prefix each line with a right-aligned 1-based number for citation. */
export function lineNumber(content) {
  const lines = content.split("\n");
  const width = String(lines.length).length;
  return lines
    .map((l, i) => `${String(i + 1).padStart(width)} | ${l}`)
    .join("\n");
}

// Per-file truncation to keep a single call inside the context window.
const MAX_LINES = 500;
const MAX_CHARS = 18000;

/** Truncate oversized files; returns { text, truncated }. */
export function truncateForPrompt(content) {
  let text = content;
  let truncated = false;
  const lines = text.split("\n");
  if (lines.length > MAX_LINES) {
    text = lines.slice(0, MAX_LINES).join("\n");
    truncated = true;
  }
  if (text.length > MAX_CHARS) {
    text = text.slice(0, MAX_CHARS);
    truncated = true;
  }
  return { text, truncated };
}

function categoryBlock(categories) {
  const active = CATEGORIES.filter(
    (c) => !categories || categories.includes(c.key)
  );
  return active.map((c) => `- ${c.key} (${c.label}): ${c.hint}`).join("\n");
}

/** Build the user prompt to review a single file. */
export function buildFileReviewPrompt({ file, categories }) {
  const { text, truncated } = truncateForPrompt(file.content);
  return `Review this file across these categories:
${categoryBlock(categories)}

File: ${file.path}
Language: ${file.language}${truncated ? "\n(Note: file truncated for length — review what is shown.)" : ""}

Source (line-numbered):
\`\`\`
${lineNumber(text)}
\`\`\`

For every finding set "file" to exactly "${file.path}". Provide a one-sentence "summary" of this file's health.`;
}

/**
 * Reduce step: synthesize a repo-level summary + structure notes from the file
 * list and the per-file summaries (no full source — keeps the call small).
 */
export function buildRepoSummaryPrompt({ files, fileSummaries }) {
  const tree = files.map((f) => `- ${f.path} (${f.language})`).join("\n");
  const perFile = fileSummaries
    .map((s) => `- ${s.path}: ${s.summary}`)
    .join("\n");
  return `Here is a repository's reviewed files and a one-line health summary of each.

Files:
${tree}

Per-file summaries:
${perFile}

Write an overall "summary" (2-4 sentences) of the codebase's health, and "structureNotes" on its architecture, module boundaries, and organization (or null if there isn't enough signal).`;
}
