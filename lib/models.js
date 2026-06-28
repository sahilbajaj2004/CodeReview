/**
 * models.js — client-safe model metadata (no provider import, no secrets).
 * Both the client ModelPicker and the server route import from here so the
 * id list stays in one place. OpenRouter may rename ids; update them here.
 *
 * Free (`:free`) OpenRouter models only. All listed models support structured
 * output or tool-calling, which generateObject needs. Free models are subject
 * to upstream rate limits under load.
 */

export const MODELS = [
  { id: "qwen/qwen3-next-80b-a3b-instruct:free", label: "Qwen3 Next 80B", provider: "Qwen", note: "Strong, structured" },
  { id: "openai/gpt-oss-120b:free", label: "GPT-OSS 120B", provider: "OpenAI", note: "Proven, reliable" },
  { id: "nvidia/nemotron-3-super-120b-a12b:free", label: "Nemotron 3 Super 120B", provider: "NVIDIA", note: "Large reasoning" },
  { id: "qwen/qwen3-coder:free", label: "Qwen3 Coder", provider: "Qwen", note: "Code-specialized" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B", provider: "Meta", note: "General" },
];

// Client default selection. All free; this one supports structured outputs.
export const DEFAULT_MODEL = "qwen/qwen3-next-80b-a3b-instruct:free";

export function isValidModel(id) {
  return MODELS.some((m) => m.id === id);
}
