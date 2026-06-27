/**
 * github.js — GitHub REST helpers (no SDK, plain fetch).
 * Server-only: any token passed in is a per-user OAuth token or the optional
 * shared GITHUB_TOKEN. Never import this into a client component.
 *
 * Content is read via the blobs API (git/blobs/{sha}) using the sha from the
 * tree, which works uniformly for public AND private repos with a token.
 */

import {
  shouldIgnore,
  detectLanguage,
  applyCaps,
  rankForReview,
  CAPS,
} from "@/lib/files";

const API = "https://api.github.com";

export class GithubError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "GithubError";
    this.status = status; // HTTP status to surface to the route
  }
}

/**
 * Parse a GitHub repo reference into { owner, repo, branch }.
 * Accepts:
 *   https://github.com/owner/repo[.git]
 *   https://github.com/owner/repo/tree/<branch>[/subpath]
 *   git@github.com:owner/repo.git
 *   owner/repo
 * branch is null when not specified (caller resolves the default).
 */
export function parseRepoUrl(input) {
  if (!input || typeof input !== "string") {
    throw new GithubError("Empty repository URL", 400);
  }
  let raw = input.trim();

  // ssh form -> normalise to https-like
  raw = raw.replace(/^git@github\.com:/, "https://github.com/");

  let owner, repo, branch = null;

  if (raw.includes("github.com")) {
    let path;
    try {
      path = new URL(raw.startsWith("http") ? raw : `https://${raw}`).pathname;
    } catch {
      throw new GithubError("Invalid repository URL", 400);
    }
    const parts = path.replace(/^\//, "").split("/").filter(Boolean);
    if (parts.length < 2) throw new GithubError("URL must include owner/repo", 400);
    owner = parts[0];
    repo = parts[1].replace(/\.git$/, "");
    if (parts[2] === "tree" && parts[3]) branch = parts[3]; // subpath ignored (v1)
  } else {
    // owner/repo shorthand
    const parts = raw.replace(/\.git$/, "").split("/").filter(Boolean);
    if (parts.length < 2) throw new GithubError("Use owner/repo or a github.com URL", 400);
    owner = parts[0];
    repo = parts[1];
  }

  if (!owner || !repo) throw new GithubError("Could not parse owner/repo", 400);
  return { owner, repo, branch };
}

function ghHeaders(token) {
  const h = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "ai-code-reviewer",
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function ghFetch(path, token) {
  let res;
  try {
    res = await fetch(`${API}${path}`, { headers: ghHeaders(token) });
  } catch {
    throw new GithubError("Could not reach GitHub", 502);
  }

  if (res.ok) return res.json();

  // Map upstream status to a clear, actionable error.
  if (res.status === 404) {
    throw new GithubError(
      token
        ? "Repository not found"
        : "Repository not found (or private). Sign in to access private repos.",
      404
    );
  }
  if (res.status === 401) throw new GithubError("GitHub auth failed (bad token)", 401);
  if (res.status === 403) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    if (remaining === "0") {
      throw new GithubError(
        token
          ? "GitHub rate limit hit. Try again later."
          : "GitHub rate limit hit. Sign in for a higher limit.",
        403
      );
    }
    throw new GithubError("GitHub access forbidden", 403);
  }
  throw new GithubError(`GitHub error (${res.status})`, 502);
}

export async function getDefaultBranch(owner, repo, token) {
  const data = await ghFetch(`/repos/${owner}/${repo}`, token);
  return data.default_branch;
}

/** Whole tree in one call. Returns { entries:[{path,size,sha}], truncated }. */
export async function getTree(owner, repo, branch, token) {
  const data = await ghFetch(
    `/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    token
  );
  const entries = (data.tree || [])
    .filter((n) => n.type === "blob")
    .map((n) => ({ path: n.path, size: n.size ?? 0, sha: n.sha }));
  return { entries, truncated: !!data.truncated };
}

/**
 * List the signed-in user's repos (newest first), public and private.
 * Requires a token. Returns lightweight rows for the RepoPicker.
 */
export async function getUserRepos(token) {
  if (!token) throw new GithubError("Sign in to list your repositories", 401);
  const data = await ghFetch(
    "/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member",
    token
  );
  return (data || []).map((r) => ({
    fullName: r.full_name,
    name: r.name,
    owner: r.owner?.login,
    private: r.private,
    defaultBranch: r.default_branch,
    url: r.html_url,
    updatedAt: r.updated_at,
  }));
}

export async function getBlobContent(owner, repo, sha, token) {
  const data = await ghFetch(`/repos/${owner}/${repo}/git/blobs/${sha}`, token);
  if (data.encoding === "base64") {
    return Buffer.from(data.content, "base64").toString("utf8");
  }
  return data.content ?? "";
}

/** Run async fn over items with bounded concurrency. */
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

/**
 * Orchestrator used by POST /api/repo.
 * Returns { files:[{path,content,language,size}], tree, truncated, meta }.
 */
export async function fetchRepo(url, { token, caps = CAPS } = {}) {
  const { owner, repo, branch: wanted } = parseRepoUrl(url);
  const branch = wanted || (await getDefaultBranch(owner, repo, token));

  const { entries, truncated: treeTruncated } = await getTree(owner, repo, branch, token);

  // Path-level filter, then rank, then apply count/byte caps.
  const candidates = entries
    .filter((e) => !shouldIgnore(e.path))
    .sort(rankForReview);
  const { files: kept, truncated: capTruncated } = applyCaps(candidates, caps);

  // Fetch contents for the kept files only.
  const files = await mapLimit(kept, 6, async (e) => {
    const content = await getBlobContent(owner, repo, e.sha, token);
    return {
      path: e.path,
      content,
      language: detectLanguage(e.path),
      size: e.size,
    };
  });

  return {
    files,
    tree: kept.map((e) => e.path),
    truncated: treeTruncated || capTruncated,
    meta: { owner, repo, branch },
  };
}
