"use client";

import { CaretDown } from "@phosphor-icons/react";
import { MODELS } from "@/lib/models";

/**
 * ModelPicker — choose the OpenRouter model. Styled native <select> for
 * robustness (no clipping inside panes, keyboard + a11y for free).
 */
export default function ModelPicker({ value, onChange, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        aria-label="Review model"
        className="appearance-none rounded border border-border bg-surface-2 py-1.5 pl-2.5 pr-7 font-mono text-xs text-ink-muted transition-colors hover:border-border-strong focus:border-accent focus:outline-none disabled:opacity-40"
      >
        {MODELS.map((m) => (
          <option key={m.id} value={m.id} className="bg-surface text-ink">
            {m.label}
          </option>
        ))}
      </select>
      <CaretDown
        size={12}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint"
      />
    </div>
  );
}
