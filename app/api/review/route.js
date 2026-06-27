import { isValidModel } from "@/lib/models";
import { reviewFilesStream } from "@/lib/review";
import { ReviewRequestSchema } from "@/lib/schema";

// Long model calls; allow up to the platform max.
export const maxDuration = 300;

/**
 * POST /api/review  { model, files, categories? }
 * Streams newline-delimited JSON (NDJSON) events as the map-reduce runs:
 *   { type: "start", reviewedFiles, totalFiles, truncated }
 *   { type: "file", path, findings, summary, error }   (one per file, as done)
 *   { type: "summary", summary, structureNotes }       (final)
 *   { type: "error", error }                           (fatal)
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = ReviewRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message || "Invalid request" },
      { status: 400 }
    );
  }

  const { model, files, categories } = parsed.data;
  if (!isValidModel(model)) {
    return Response.json({ error: "Unknown model" }, { status: 400 });
  }
  if (!process.env.OPENROUTER_API_KEY) {
    return Response.json(
      { error: "Server is missing OPENROUTER_API_KEY" },
      { status: 401 }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (obj) =>
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      try {
        await reviewFilesStream({ modelId: model, files, categories, emit });
      } catch (err) {
        emit({ type: "error", error: err?.message || "Model provider error" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
    },
  });
}
