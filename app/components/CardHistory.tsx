"use client";

import { Card } from "@/lib/cards";
import { categoryIcon } from "./icons";

export default function CardHistory({ history }: { history: Card[] }) {
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-sm">
      <div className="text-xs text-center mb-1.5" style={{ color: "var(--text-muted)" }}>
        Recent draws
      </div>
      <div className="stagger flex flex-col gap-1 px-1">
        {history.map((card, i) => {
          const Icon = categoryIcon(card.category);
          return (
            <div
              key={`${card.id}-${i}`}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs"
              style={{ background: "var(--bg-elevated)" }}
            >
              <Icon size={14} style={{ color: "var(--accent)" }} />
              <span className="font-medium shrink-0" style={{ color: "var(--text)" }}>{card.name}</span>
              <span className="truncate flex-1" style={{ color: "var(--text-muted)" }}>{card.effect}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
