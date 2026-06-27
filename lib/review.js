import { generateObject } from "ai";
import { getModel } from "@/lib/openrouter";
import {
  SYSTEM_PROMPT,
  buildFileReviewPrompt,
  buildRepoSummaryPrompt,
} from "@/lib/prompts";
import { PerFileReviewSchema, RepoSummarySchema } from "@/lib/schema";

/**
 * review.js — streaming map-reduce review orchestrator (server-only).
 *  MAP:    review each file independently (bounded concurrency), emitting a
 *          "file" event as each completes -> per-file progress in the UI.
 *  REDUCE: synthesize a repo-level summary + structure notes from the per-file
 *          summaries (no full source -> small call).
 */

const MAX_REVIEW_FILES = 15; // bound cost/time; source already caps at 40
const CONCURRENCY = 2; // gentle on free-tier rate limits

/** Review one file -> { path, findings, summary }. Throws on model error. */
export async function reviewOneFile(modelId, file, categories) {
  const { object } = await generateObject({
    model: getModel(modelId),
    schema: PerFileReviewSchema,
    system: SYSTEM_PROMPT,
    prompt: buildFileReviewPrompt({ file, categories }),
  });
  const findings = object.findings.map((f) => ({ ...f, file: file.path }));
  return { path: file.path, findings, summary: object.summary };
}

/**
 * Run the full review, calling emit(event) as work completes. Events:
 *   { type: "start",   reviewedFiles, totalFiles, truncated }
 *   { type: "file",    path, findings, summary, error }       (one per file)
 *   { type: "summary", summary, structureNotes }              (final)
 */
export async function reviewFilesStream({ modelId, files, categories, emit }) {
  const target = files.slice(0, MAX_REVIEW_FILES);
  const truncated = files.length > target.length;
  emit({
    type: "start",
    reviewedFiles: target.length,
    totalFiles: files.length,
    truncated,
  });

  const summaries = [];
  let idx = 0;
  async function worker() {
    while (idx < target.length) {
      const file = target[idx++];
      let res;
      try {
        res = await reviewOneFile(modelId, file, categories);
      } catch (e) {
        res = {
          path: file.path,
          findings: [],
          summary: `Review failed: ${e?.message || "model error"}`,
          error: true,
        };
      }
      summaries.push({ path: res.path, summary: res.summary });
      emit({
        type: "file",
        path: res.path,
        findings: res.findings,
        summary: res.summary,
        error: !!res.error,
      });
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, target.length) }, worker)
  );

  // REDUCE — skip the extra call when there's only one file.
  let summary;
  let structureNotes = null;
  if (target.length === 1) {
    summary = summaries[0].summary;
  } else {
    try {
      const { object } = await generateObject({
        model: getModel(modelId),
        schema: RepoSummarySchema,
        system: SYSTEM_PROMPT,
        prompt: buildRepoSummaryPrompt({ files: target, fileSummaries: summaries }),
      });
      summary = object.summary;
      structureNotes = object.structureNotes;
    } catch {
      summary = "Repo-level summary unavailable.";
    }
  }
  emit({ type: "summary", summary, structureNotes });
}
