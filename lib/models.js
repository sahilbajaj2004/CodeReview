/**
 * models.js — client-safe model metadata (no provider import, no secrets).
 * Both the client ModelPicker and the server route import from here so the
 * id list stays in one place. OpenRouter may rename ids; update them here.
 */

export const MODELS = [
  { id: "anthropic/claude-opus-4-8", label: "Claude Opus 4.8", provider: "Anthropic", note: "Strongest reasoning" },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "Google", note: "Fast & cheap" },
  { id: "openai/gpt-4.1", label: "GPT-4.1", provider: "OpenAI", note: "Balanced" },
  { id: "deepseek/deepseek-chat", label: "DeepSeek Chat", provider: "DeepSeek", note: "Cheap, capable" },
  { id: "openai/gpt-oss-120b:free", label: "GPT-OSS 120B (free)", provider: "OpenAI", note: "No cost" },
];

// Client default. Server may still send any listed id; this is just the
// initial selection. Free model keeps local testing cost-free.
export const DEFAULT_MODEL = "openai/gpt-oss-120b:free";

export function isValidModel(id) {
  return MODELS.some((m) => m.id === id);
}
