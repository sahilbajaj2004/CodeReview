# Code Reviewer

**Live:** [bajajcodereview.vercel.app](https://bajajcodereview.vercel.app)

AI code review for any repository. Paste a public GitHub URL, sign in to pick one of your own repos (public or private), or drop a ZIP. Browse the source in a real editor and run a senior-engineer AI review across **code quality, security, performance, and structure**, with findings that cite the exact file and line and jump the editor to them.

Built with Next.js 16 (App Router), the Vercel AI SDK, OpenRouter (model-selectable), Monaco, and Auth.js v5.

---

## Screenshots

> Add screenshots here: the start screen, a loaded repo with the 3-pane shell, and a streamed review with findings.
>
> `docs/start.png` · `docs/shell.png` · `docs/review.png`

---

## Features

- **Three ways in** — paste a public repo URL, pick from your repos after signing in with GitHub (public **and** private), or upload a `.zip`. The URL and ZIP paths never require login.
- **Real editor** — Monaco with a custom dark theme, file tree, and read-only syntax highlighting.
- **Structured AI review** — findings are typed `{ category, severity, file, line, title, detail, suggestion, codeExample }`, validated with zod, grouped by category with severity badges.
- **Cited and clickable** — every finding points at a file and line; click to reveal and highlight it in the editor.
- **Streaming, per-file progress** — results stream in over NDJSON as each file is reviewed (map), followed by a repo-level summary and structure notes (reduce).
- **Model-selectable** — choose among free OpenRouter models (Qwen3, GPT-OSS, Nemotron, Llama), all structured-output capable.
- **Safe by design** — file/size caps, ZIP traversal + zip-bomb guards, and secrets that never leave the server.

---

## Stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16.2.9 (App Router, React 19) |
| Styling | Tailwind CSS v4, OKLCH tokens, single dark theme |
| Editor | `@monaco-editor/react` (lazy, `ssr: false`) |
| AI | Vercel AI SDK v7 + `@openrouter/ai-sdk-provider`, `generateObject` + zod |
| Auth | Auth.js v5 (`next-auth@beta`), GitHub OAuth |
| Source | GitHub REST API (plain `fetch`), `jszip` for uploads |
| Validation | zod v4 |

---

## How it works

```text
GitHub URL ─┐
My repos  ──┼─► /api/repo  ──► lib/github (tree + blob fetch, filter, cap) ─┐
ZIP       ──┴─► /api/upload ─► lib/zip   (parse, guard, filter, cap)       ├─► { files, tree, truncated, meta }
                                                                            │
Review ────────► /api/review (NDJSON stream) ─► lib/review (map-reduce) ────┘
                   map:    review each file      reduce: repo summary + structure
                   emits:  start → file… → summary
```

- **Loading** filters out `node_modules`, lockfiles, binaries, and minified files, ranks source ahead of config/docs, then caps to 40 files / 400KB so a large repo never blows the token budget.
- **Review** runs each file through the model independently (bounded concurrency, oversized files truncated), then a final pass synthesizes the repo-level summary and architecture notes. Per-file failures are isolated, not fatal.

---

## Getting started

### Prerequisites

- Node.js 20+
- An [OpenRouter API key](https://openrouter.ai/keys)
- A GitHub OAuth App (only needed for the "my repos" / private-repo path)

### 1. Install

```bash
npm install
```

### 2. Create a GitHub OAuth App

[github.com/settings/developers](https://github.com/settings/developers) → **New OAuth App**

- **Homepage URL:** `http://localhost:3000`
- **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`

Copy the Client ID and generate a Client Secret.

### 3. Environment variables

Create `.env.local` (already gitignored):

| Variable | Required | Notes |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | yes | From openrouter.ai/keys |
| `OPENROUTER_MODEL` | optional | Default model id if the picker isn't changed (e.g. `openai/gpt-oss-120b:free`) |
| `AUTH_SECRET` | yes | Generate with `npx auth secret` |
| `AUTH_GITHUB_ID` | for login | OAuth App Client ID |
| `AUTH_GITHUB_SECRET` | for login | OAuth App Client Secret |

The app is fully usable for **public URLs and ZIPs without any GitHub credentials**; the GitHub vars only unlock the my-repos / private path. Anonymous GitHub requests use the unauthenticated rate limit (60/hr); signing in raises it to 5,000/hr per user.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Models

**Free OpenRouter models only.** Ids live in one place (`lib/models.js`) so they're easy to update if OpenRouter renames them. Each one supports structured output or tool-calling (required by `generateObject`):

- `qwen/qwen3-next-80b-a3b-instruct:free` — Qwen3 Next 80B, strong and structured (default)
- `openai/gpt-oss-120b:free` — GPT-OSS 120B, proven reliable
- `nvidia/nemotron-3-super-120b-a12b:free` — Nemotron 3 Super 120B, large reasoning
- `qwen/qwen3-coder:free` — Qwen3 Coder, code-specialized
- `meta-llama/llama-3.3-70b-instruct:free` — Llama 3.3 70B, general

> Free models are subject to upstream rate limits and can throttle under bursts of concurrent calls. The map step uses bounded concurrency to stay gentle, and per-file failures are isolated so one rate-limited file never sinks the whole review.

---

## Project structure

```text
app/
  layout.jsx              metadata, fonts, SessionProvider
  page.jsx                renders AppShell
  globals.css             OKLCH tokens, z-scale, motion, reduced-motion
  providers.jsx           SessionProvider (client)
  api/
    repo/route.js         POST  fetch a GitHub repo
    upload/route.js       POST  parse an uploaded ZIP
    review/route.js       POST  stream the AI review (NDJSON)
    repos/route.js        GET   list the signed-in user's repos
    auth/[...nextauth]/route.js   Auth.js handlers
  components/
    AppShell · TopBar · StartScreen · RepoInput · RepoPicker
    FileTree · CodeViewer · ReviewPanel · ModelPicker · SignInButton
lib/
  github.js   parseRepoUrl, getTree, getBlobContent, fetchRepo, getUserRepos
  zip.js      processZip (guards: traversal, zip-bomb, binary, prefix-strip)
  files.js    ignore globs, caps, language detection, ranking
  review.js   reviewFilesStream (map-reduce orchestrator)
  prompts.js  system prompt + per-file / repo prompt builders
  schema.js   zod schemas (files + review I/O)
  models.js   client-safe model list
  openrouter.js  server-only provider client
auth.js       Auth.js v5 config (GitHub provider, token in JWT only)
```

---

## Security

- **Secrets are server-only.** `OPENROUTER_API_KEY` and the GitHub OAuth access token are used exclusively in route handlers. The access token is stored only in the encrypted Auth.js JWT and read server-side via `getToken`; it is **never** placed on the session object or sent to the browser.
- **ZIP safety.** Uploads are guarded against path traversal (absolute / `..` paths dropped), zip bombs (entry-count and uncompressed-size budgets), and binaries. Paths are display-only and never written to disk.
- **Caps everywhere.** File count, per-file size, and total bytes are bounded on both the GitHub and ZIP paths.

---

## Deploy (Vercel)

Deployed at **[bajajcodereview.vercel.app](https://bajajcodereview.vercel.app)**.

```bash
vercel
```

Then:

1. Add the production env vars (`vercel env add` or the dashboard): `OPENROUTER_API_KEY`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`.
2. Add a **second callback URL** to your GitHub OAuth App: `https://<your-domain>/api/auth/callback/github`.
3. Set `AUTH_URL` to your production URL so OAuth redirects resolve correctly.

`next build` must pass before deploy; it does.

---

## Limitations (v1)

No accounts beyond GitHub OAuth, no persisted review history, single repo at a time, no diff/PR-only mode, no model-vs-model comparison. These are deliberate scope cuts for a single-session tool.

---

## Author

**Sahil Bajaj** — [sahilbajaj0941@gmail.com](mailto:sahilbajaj0941@gmail.com)

## License

MIT
