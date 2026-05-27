"use client";

import { Card, CATEGORY_EMOJI } from "@/lib/cards";

export default function CardHistory({ history }: { history: Card[] }) {
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-md">
      <h3 className="text-sm font-semibold text-gray-400 mb-2 text-center">
        Recent Cards ({history.length})
      </h3>
      <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
        {history.map((card, i) => (
          <div
            key={`${card.id}-${i}`}
            className="flex items-center gap-3 bg-gray-900/60 rounded-lg px-3 py-2 text-sm border border-gray-800/50"
          >
            <span>{CATEGORY_EMOJI[card.category] || "🃏"}</span>
            <span className="font-semibold text-white">{card.name}</span>
            <span className="text-gray-500 text-xs truncate flex-1">{card.effect}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
