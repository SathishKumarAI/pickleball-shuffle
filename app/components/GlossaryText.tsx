"use client";

import { useState, useMemo, Fragment } from "react";
import { GLOSSARY_BY_ALIAS, GlossaryTerm } from "@/lib/glossary";

// Escapes a string for safe use inside a RegExp.
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Builds one big alternation regex of all glossary aliases, longest-first so
// multi-word terms win. Word-boundary anchored, case-insensitive.
const TERM_REGEX = new RegExp(
  `\\b(${GLOSSARY_BY_ALIAS.map((e) => escapeRegExp(e.alias)).join("|")})\\b`,
  "gi",
);

function lookup(match: string): GlossaryTerm | undefined {
  const lower = match.toLowerCase();
  return GLOSSARY_BY_ALIAS.find((e) => e.alias.toLowerCase() === lower)?.term;
}

type Segment = { text: string; term?: GlossaryTerm };

/**
 * Renders a string with known pickleball terms underlined and tappable.
 * Tapping a term opens a small definition popover. Each distinct term is made
 * tappable only on its first occurrence to avoid a wall of underlines.
 * `light` tunes the styling for dark card faces (white text) vs. light sheets.
 */
export default function GlossaryText({
  children,
  onLight = false,
  className,
}: {
  children: string;
  onLight?: boolean;
  className?: string;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const segments = useMemo<Segment[]>(() => {
    const text = children ?? "";
    const out: Segment[] = [];
    const seen = new Set<string>();
    let last = 0;
    // Reset stateful regex between renders.
    TERM_REGEX.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = TERM_REGEX.exec(text)) !== null) {
      const term = lookup(m[0]);
      const key = term?.term ?? m[0].toLowerCase();
      // Only mark the first occurrence of each term.
      if (!term || seen.has(key)) continue;
      seen.add(key);
      if (m.index > last) out.push({ text: text.slice(last, m.index) });
      out.push({ text: m[0], term });
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push({ text: text.slice(last) });
    return out;
  }, [children]);

  // No known terms — render plain to keep DOM light.
  if (!segments.some((s) => s.term)) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (!seg.term) return <Fragment key={i}>{seg.text}</Fragment>;
        const isOpen = openIdx === i;
        return (
          <span key={i} className="relative inline-block">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIdx(isOpen ? null : i);
              }}
              aria-label={`What is ${seg.term.term}?`}
              className="underline decoration-dotted underline-offset-2 font-semibold cursor-help"
              style={{ textDecorationThickness: "1.5px", color: "inherit" }}
            >
              {seg.text}
            </button>
            {isOpen && (
              <>
                {/* scrim to catch the next tap-away without blocking layout */}
                <span
                  className="fixed inset-0 z-[95]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenIdx(null);
                  }}
                />
                <span
                  role="tooltip"
                  onClick={(e) => e.stopPropagation()}
                  className="anim-pop absolute left-1/2 bottom-full z-[96] mb-2 -translate-x-1/2 block w-60 max-w-[75vw] rounded-xl p-3 text-left text-xs leading-relaxed shadow-2xl"
                  style={{
                    background: onLight ? "var(--bg-card)" : "#1f2430",
                    color: onLight ? "var(--text)" : "#f3f4f6",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span className="block font-bold mb-0.5" style={{ color: "var(--accent)" }}>
                    {seg.term.term}
                  </span>
                  {seg.term.def}
                </span>
              </>
            )}
          </span>
        );
      })}
    </span>
  );
}
