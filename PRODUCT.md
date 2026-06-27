# Product

## Register

product

## Users

Developers and engineers evaluating a codebase they did not necessarily write. Context: they paste a public GitHub repo URL, pick one of their own repos after signing in with GitHub, or drop a ZIP. They want a fast, credible read on code quality, security, performance, and structure without setting up a CI pipeline or installing anything. Single-session, no account required for the public/ZIP paths.

## Product Purpose

An AI code reviewer. Pull source from GitHub or a ZIP, browse it in a real editor with a file tree, and run a model-selectable AI review (Claude / Gemini / GPT / DeepSeek via OpenRouter) across code quality, security, performance, structure, and concrete fixes with code examples. Findings cite file and line and jump the editor to the flagged line. Success = a reviewer trusts the findings enough to act on them, and the tool feels as fast and serious as the IDE it resembles.

## Brand Personality

Voice: precise, senior-engineer, no fluff. Three words: **sharp, credible, fast.** The interface should feel like a professional engineering tool a staff engineer would keep open — calm and dense, not loud. Findings read like a careful reviewer, not a marketing bot. No false confidence: uncertainty is stated, severity is honest.

## Anti-references

- Generic AI-SaaS landing slop: purple gradients, three equal feature cards, hero-metric template, glassmorphism-on-everything.
- Heavy enterprise dashboards (Jira-dense, nested cards, toolbar overload).
- Toy/playful "AI assistant" chrome with mascots, emoji, rounded-bubble chat. This is a tool, not a chatbot.
- Anything that looks slower than the editor it embeds.

## Design Principles

- **Editor-first.** The code and the findings are the product. Chrome stays out of the way; Monaco is the center of gravity.
- **Honest severity.** Color and ranking reflect real risk. No alarmist red everywhere, no everything-is-fine green.
- **Cite or it didn't happen.** Every finding points at a file and line and can jump there. No vague advice.
- **Fast over fancy.** Restrained motion that aids orientation (finding reveals, line jumps), never theatrics. Perceived speed is a feature.
- **Progressive, no wall.** Public URL and ZIP work with zero login; sign-in only unlocks private/my-repos. Never block the core path behind auth.

## Accessibility & Inclusion

WCAG AA: body text contrast >=4.5:1, large/UI >=3:1. Full `prefers-reduced-motion` fallbacks (reveals collapse to instant/crossfade). Keyboard navigation across file tree, editor, and review panel. Severity never encoded by color alone — pair with label/icon text.
