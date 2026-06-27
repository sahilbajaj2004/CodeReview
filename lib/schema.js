import { z } from "zod";

/**
 * schema.js — zod schemas for API I/O. Extended in Phase 5 with the
 * structured review-output schema.
 */

// File = { path, content, language, size }
export const FileSchema = z.object({
  path: z.string(),
  content: z.string(),
  language: z.string(),
  size: z.number(),
});

// POST /api/repo request body.
export const RepoRequestSchema = z.object({
  url: z.string().trim().min(1, "Enter a repository URL"),
});

// ---- Review (Phase 5) ----

export const CATEGORY_KEYS = [
  "quality",
  "security",
  "performance",
  "structure",
  "suggestion",
];

export const SEVERITIES = ["low", "med", "high"];

// One finding from the model. Optional fields are nullable (not absent) so the
// JSON schema stays concrete for providers that dislike optional keys.
export const FindingSchema = z.object({
  category: z.enum(CATEGORY_KEYS),
  severity: z.enum(SEVERITIES),
  file: z.string(),
  line: z.number().int().positive().nullable(),
  title: z.string(),
  detail: z.string(),
  suggestion: z.string(),
  codeExample: z.string().nullable(),
});

// Full structured review for one request (one or more files).
export const ReviewResultSchema = z.object({
  findings: z.array(FindingSchema),
  summary: z.string(),
  structureNotes: z.string().nullable(),
});

// Map step: one file's review (no structureNotes — that's repo-level).
export const PerFileReviewSchema = z.object({
  findings: z.array(FindingSchema),
  summary: z.string(),
});

// Reduce step: repo-level synthesis.
export const RepoSummarySchema = z.object({
  summary: z.string(),
  structureNotes: z.string().nullable(),
});

// POST /api/review request body.
export const ReviewRequestSchema = z.object({
  model: z.string().min(1, "Pick a model"),
  files: z.array(FileSchema).min(1, "No files to review"),
  categories: z.array(z.enum(CATEGORY_KEYS)).optional(),
});
