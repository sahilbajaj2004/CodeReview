# Design

Visual system for the AI Code Reviewer. Register: **product**. Aesthetic: **Dark IDE-pro** (single dark theme). Motion: **restrained** (intensity 3-4). Accessibility: **WCAG AA**.

## Theme

Single dark theme, locked (no light mode in v1). Near-black cool-slate surfaces, off-white ink, one azure interactive accent, an honest 3-step severity ramp. The app chrome is quiet so Monaco and the findings carry the color. Monaco runs a matched custom dark theme (not default `vs-dark`) so the editor and shell share one palette.

## Color (OKLCH)

```css
/* surfaces — cool near-black slate */
--bg:         oklch(0.18 0.018 255);   /* app base, ~#0d1117 */
--surface:    oklch(0.21 0.018 255);   /* panels: tree, review */
--surface-2:  oklch(0.25 0.020 255);   /* raised, hover, inputs */
--border:     oklch(0.31 0.020 255);   /* hairlines, dividers */
--border-strong: oklch(0.40 0.022 255);

/* ink */
--ink:        oklch(0.96 0.004 255);   /* primary text */
--ink-muted:  oklch(0.74 0.010 255);   /* secondary — AA on --bg */
--ink-faint:  oklch(0.60 0.010 255);   /* large/UI only, not body */

/* interactive — single sky-azure accent (impeccable seed hue ~210) */
--accent:       oklch(0.74 0.13 215);  /* links, focus ring, active */
--accent-hover: oklch(0.80 0.13 215);
--accent-ink:   oklch(0.18 0.02 255);  /* text ON accent (dark) */

/* severity ramp (honest, never color-alone) */
--sev-high: oklch(0.64 0.20 25);       /* red */
--sev-med:  oklch(0.80 0.14 75);       /* amber */
--sev-low:  oklch(0.70 0.06 230);      /* muted slate-blue */
--ok:       oklch(0.74 0.15 155);      /* emerald — "no issues" */
```

Contrast: `--ink` and `--ink-muted` both clear 4.5:1 on `--bg`/`--surface`. `--ink-faint` is for large text and non-text UI only. Severity is always paired with a text label + icon, never the dot alone.

## Typography

- **UI / headings:** Geist Sans (already wired via `next/font`, `--font-geist-sans`). Tight tracking on headings (`-0.02em`), no display serif.
- **Code / paths / numbers / metadata:** Geist Mono (`--font-geist-mono`). All file paths, line numbers, counts, severities render mono.
- Scale (UI): 12 / 13 / 14 (body) / 16 / 20 / 24. No giant type — this is a tool, not a landing page. Body line-length capped where prose appears (finding detail) at ~70ch.
- Monaco font: Geist Mono, 13px, ligatures off.

## Shape & Spacing

- **Radius (one scale):** `--r-sm: 4px` (inputs, badges), `--r: 6px` (buttons, cards, dropdowns), `--r-lg: 8px` (modals/dialogs). Severity dots are full-round. No mixed ad-hoc radii.
- **Spacing base 4px:** 4 / 8 / 12 / 16 / 24 / 32. Dense but breathable. Panels use 12-16 internal padding.
- No nested cards. Findings group by `divide-y` + hover tint, not stacked card boxes.

## Layout — 3-pane app shell

```
┌─ top bar (56px): logo · repo/zip status · ModelPicker · Review btn · SignInButton ─┐
├──────────────┬───────────────────────────────────┬───────────────────────────────┤
│ FileTree     │ CodeViewer (Monaco)               │ ReviewPanel                   │
│ left, ~240px │ center, flex-1                    │ right, ~340px                 │
│ --surface    │ --bg                              │ --surface                     │
└──────────────┴───────────────────────────────────┴───────────────────────────────┘
```

- `min-h-[100dvh]`, never `h-screen`. Panes are independent scroll regions.
- Resizable left/right panes (stretch); fixed widths acceptable v1.
- Mobile (<768px): collapse to stacked single-column with a tab/segmented switch (Tree | Code | Review). Tree and review become drawers.

## Components

- **Top bar:** flat, `--surface` with bottom `--border`. Logo (wordmark, mono). Right cluster: ModelPicker (dropdown), Review button (accent primary), SignInButton (ghost → avatar).
- **Buttons:** primary = `--accent` bg + `--accent-ink`; ghost = transparent + `--border` on hover; `:active` → `scale-[0.98]`. Focus ring = 2px `--accent` offset.
- **FileTree:** mono labels, folder disclosure, selected row = `--surface-2` + left accent text (not a thick side-stripe). Truncation with title.
- **CodeViewer:** Monaco, custom dark theme matched to palette, read-only, line numbers, decoration/glyph on flagged lines, scrolls/reveals to a line on finding click.
- **ReviewPanel:** category sections (Quality / Security / Performance / Structure / Suggestions). Each finding: severity badge (dot + label text), title, file:line (mono, clickable), collapsible detail + suggestion, copyable fenced code example. Summary + structure notes at top.
- **Dropdowns/menus:** native `<dialog>`/popover or `position: fixed` to escape pane `overflow`. No clipped absolute menus.
- **States:** empty (clear how to start: URL / my-repos / ZIP), loading (skeletons shaped like tree + panel, not spinners), streaming (per-file progress), truncated ("showing N of M files"), errors (rate-limit 403 → suggest sign-in/token; bad URL; missing key 401).

## Motion (intensity 3-4)

- Transitions 150-220ms, ease-out (`cubic-bezier(0.16,1,0.3,1)`). Animate transform/opacity only.
- Finding reveals: subtle stagger (~50ms) as a category renders/streams in. Not a uniform whole-page reflex.
- Line jump: Monaco smooth-reveal + brief glyph highlight pulse on the target line.
- Hover micro-states on tree rows, buttons, findings.
- `prefers-reduced-motion: reduce` → all reveals become instant, line jump is immediate, pulse removed. Non-optional.

## Z-index scale

```
--z-dropdown: 100;
--z-sticky:   200;
--z-backdrop: 300;
--z-modal:    400;
--z-toast:    500;
--z-tooltip:  600;
```

## Bans (project-specific, on top of impeccable global bans)

No light mode in v1 (theme locked). No emoji in UI. No mascot/chatbot chrome. No giant hero type. No nested cards. No thick colored side-stripe borders on findings. No gradient text. Severity never color-alone.
