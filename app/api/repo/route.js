import { getAccessToken } from "@/lib/auth-token";
import { fetchRepo, GithubError } from "@/lib/github";
import { RepoRequestSchema } from "@/lib/schema";

/**
 * POST /api/repo  { url }
 * Token-aware: signed-in users use their OAuth token (private repos work);
 * anonymous users hit GitHub unauthenticated (public repos, lower rate limit).
 * -> { files, tree, truncated, meta }
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = RepoRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message || "Invalid request" },
      { status: 400 }
    );
  }

  const token = await getAccessToken(request); // null when anonymous

  try {
    const result = await fetchRepo(parsed.data.url, { token });
    if (!result.files.length) {
      return Response.json(
        { error: "No reviewable source files found in this repository" },
        { status: 422 }
      );
    }
    return Response.json(result);
  } catch (err) {
    const status = err instanceof GithubError ? err.status : 500;
    return Response.json({ error: err.message || "Failed to load repository" }, { status });
  }
}
