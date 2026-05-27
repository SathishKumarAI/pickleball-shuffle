"use client";

import { Card, CATEGORY_EMOJI } from "@/lib/cards";
import { useState } from "react";

export default function CardHistory({ history }: { history: Card[] }) {
  const [open, setOpen] = useState(false);

  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-xs text-center py-2 transition-colors"
        style={{ color: "var(--text-muted)" }}
      >
        {open ? "Hide" : "Show"} history ({history.length})
      </button>

      {open && (
        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto px-1">
          {history.map((card, i) => (
            <div
              key={`${card.id}-${i}`}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs"
              style={{ background: "var(--bg-elevated)" }}
            >
              <span>{CATEGORY_EMOJI[card.category] || "🃏"}</span>
              <span className="font-medium" style={{ color: "var(--text)" }}>{card.name}</span>
              <span className="truncate flex-1" style={{ color: "var(--text-muted)" }}>{card.effect}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
