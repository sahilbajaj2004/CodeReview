import { getAccessToken } from "@/lib/auth-token";
import { getUserRepos, GithubError } from "@/lib/github";

// GET /api/repos — list the signed-in user's repos for the RepoPicker.
// Requires a session; 401 otherwise.
export async function GET(request) {
  const token = await getAccessToken(request);
  if (!token) {
    return Response.json({ error: "unauthenticated" }, { status: 401 });
  }

  try {
    const repos = await getUserRepos(token);
    return Response.json({ repos });
  } catch (err) {
    const status = err instanceof GithubError ? err.status : 502;
    return Response.json({ error: err.message }, { status });
  }
}
