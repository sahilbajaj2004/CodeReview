import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { DEFAULT_MODEL } from "@/lib/models";

/**
 * openrouter.js — server-only provider client. Model metadata lives in
 * lib/models.js (client-safe). This file holds the secret-using bits.
 */

let _provider;
function provider() {
  if (!process.env.OPENROUTER_API_KEY) {
    const err = new Error("OPENROUTER_API_KEY is not set");
    err.code = "NO_KEY";
    throw err;
  }
  if (!_provider) {
    _provider = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
  }
  return _provider;
}

/** Get an AI SDK language model for the given OpenRouter id. */
export function getModel(id) {
  return provider()(id || process.env.OPENROUTER_MODEL || DEFAULT_MODEL);
}
