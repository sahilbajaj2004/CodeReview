import { processZip, UploadError } from "@/lib/zip";

const MAX_ZIP_BYTES = 20 * 1024 * 1024; // 20MB compressed upload cap

/**
 * POST /api/upload  (multipart/form-data, field "file")
 * Never needs auth. -> { files, tree, truncated, meta }
 */
export async function POST(request) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || typeof file === "string") {
    return Response.json({ error: "No file uploaded" }, { status: 400 });
  }

  const name = (file.name || "").toLowerCase();
  if (!name.endsWith(".zip") && file.type !== "application/zip") {
    return Response.json({ error: "Upload must be a .zip file" }, { status: 400 });
  }
  if (file.size > MAX_ZIP_BYTES) {
    return Response.json({ error: "ZIP is too large (max 20MB)" }, { status: 413 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await processZip(buffer);
    if (!result.files.length) {
      return Response.json(
        { error: "No reviewable source files found in this ZIP" },
        { status: 422 }
      );
    }
    return Response.json(result);
  } catch (err) {
    const status = err instanceof UploadError ? err.status : 500;
    return Response.json({ error: err.message || "Failed to read ZIP" }, { status });
  }
}
