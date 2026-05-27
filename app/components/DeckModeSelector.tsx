"use client";

import { DeckMode, DECK_MODES } from "@/lib/cards";

export default function DeckModeSelector({
  current,
  onChange,
  cardCounts,
}: {
  current: DeckMode;
  onChange: (mode: DeckMode) => void;
  cardCounts: Record<DeckMode, number>;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {(Object.keys(DECK_MODES) as DeckMode[]).map((mode) => {
        const m = DECK_MODES[mode];
        const isActive = current === mode;
        return (
          <button
            key={mode}
            onClick={() => onChange(mode)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              isActive
                ? "bg-green-600 text-white shadow-lg scale-105"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <span className="mr-1">{m.emoji}</span>
            {m.label}
            <span className="ml-1 text-xs opacity-60">({cardCounts[mode]})</span>
          </button>
        );
      })}
    </div>
  );
}
