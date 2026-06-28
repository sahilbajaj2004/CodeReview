"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Warning, Bug } from "@phosphor-icons/react";

// A fixed, illustrative snippet that mirrors what the tool actually surfaces.
// Hand-tokenized (decorative, not user input) to match the editor's palette.
const K = "text-accent"; // keyword
const S = "text-sev-med"; // string
const F = "text-ink"; // function / ident
const Mu = "text-ink-faint"; // punctuation/muted

const CODE = [
  [{ t: "export async function ", c: K }, { t: "getUser", c: F }, { t: "(id) {", c: Mu }],
  [{ t: "  const q = ", c: Mu }, { t: '"SELECT * FROM users WHERE id = "', c: S }, { t: " + id;", c: Mu }],
  [{ t: "  return db.query(q);", c: Mu }],
  [{ t: "}", c: Mu }],
  [{ t: "" }],
  [{ t: "app.get(", c: Mu }, { t: '"/u"', c: S }, { t: ", (req, res) => {", c: Mu }],
  [{ t: "  res.send(getUser(req.query.id));", c: Mu }],
  [{ t: "});", c: Mu }],
];

const FINDINGS = [
  { sev: "high", sevColor: "var(--sev-high)", cat: "Security", loc: "auth.js:2", title: "SQL injection via string concatenation", Icon: Warning, at: 0.6 },
  { sev: "med", sevColor: "var(--sev-med)", cat: "Quality", loc: "auth.js:7", title: "Unhandled async result sent to client", Icon: Bug, at: 1.5 },
];

export default function ReviewPreview() {
  const reduce = useReducedMotion();
  const codeRef = useRef(null);
  const [h, setH] = useState(0);
  const flagged = 1; // 0-based -> line 2

  // Measure the code area so the scanner sweeps its full height (ResizeObserver
  // callback is async, so this never trips set-state-in-effect).
  useEffect(() => {
    const el = codeRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scan = !reduce && h > 0;

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-lg border border-border bg-surface shadow-[0_24px_70px_-20px_rgba(0,0,0,0.6)]">
      {/* window bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="font-mono text-xs text-ink-muted">auth.js</span>
        <span className="font-mono text-[11px] text-ink-faint">scanning…</span>
      </div>

      {/* code + scanner */}
      <div
        ref={codeRef}
        className="relative overflow-hidden px-2 py-3"
        style={{ background: "#0e1117" }}
      >
        {scan && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 z-10"
            style={{
              height: 60,
              background:
                "linear-gradient(180deg, transparent, color-mix(in oklch, var(--accent) 20%, transparent) 78%, transparent)",
              borderBottom: "1px solid color-mix(in oklch, var(--accent) 70%, transparent)",
            }}
            initial={{ y: -60 }}
            animate={{ y: [-60, h] }}
            transition={{ duration: 1.9, ease: "linear", repeat: Infinity, repeatDelay: 3.4 }}
          />
        )}
        <pre className="relative font-mono text-[12.5px] leading-[1.6]">
          {CODE.map((line, i) => (
            <motion.div
              key={i}
              className="flex"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduce ? 0 : 0.15 + i * 0.05, duration: 0.3 }}
            >
              <span className="w-8 shrink-0 select-none pr-3 text-right text-ink-faint">
                {line[0].t === "" ? "" : i + 1}
              </span>
              <code
                className={`flex-1 rounded-sm px-1 ${i === flagged ? "cr-flagged-line" : ""}`}
                style={i === flagged ? { boxShadow: "inset 2px 0 0 var(--accent)" } : undefined}
              >
                {line.map((tok, j) => (
                  <span key={j} className={tok.c}>
                    {tok.t || " "}
                  </span>
                ))}
              </code>
            </motion.div>
          ))}
        </pre>
      </div>

      {/* findings — revealed in sync with the scanner crossing their line */}
      <div className="divide-y divide-border border-t border-border">
        {FINDINGS.map((f) => (
          <motion.div
            key={f.loc}
            className="flex items-start gap-2.5 px-4 py-3"
            initial={reduce ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduce ? 0 : f.at, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded"
              style={{ background: `color-mix(in oklch, ${f.sevColor} 18%, transparent)` }}
            >
              <f.Icon size={12} style={{ color: f.sevColor }} weight="fill" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] text-ink">{f.title}</p>
              <p className="mt-0.5 font-mono text-[11px] text-ink-faint">
                <span style={{ color: f.sevColor }}>{f.sev}</span> · {f.cat} ·{" "}
                <span className="text-accent">{f.loc}</span>
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
