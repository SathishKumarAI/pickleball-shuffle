"use client";

import { Star, X } from "lucide-react";
import { Card } from "@/lib/cards";
import { categoryIcon } from "./icons";
import { Sheet } from "./HistoryPanel";

export default function FavoritesPanel({
  open,
  onClose,
  cards,
  onRemove,
}: {
  open: boolean;
  onClose: () => void;
  cards: Card[];
  onRemove: (id: number) => void;
}) {
  if (!open) return null;

  return (
    <Sheet title="Favorite cards" icon={<Star size={18} />} onClose={onClose}>
      {cards.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
          No favorites yet. Tap the ☆ on a card while playing to save it here.
        </p>
      ) : (
        <div className="stagger flex flex-col gap-2">
          {cards.map((card) => {
            const Icon = categoryIcon(card.category);
            return (
              <div key={card.id} className="flex items-start gap-3 rounded-xl p-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <Icon size={18} style={{ color: "var(--accent)", marginTop: 2 }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>{card.name}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{card.effect}</div>
                  <div className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>{card.category}</div>
                </div>
                <button onClick={() => onRemove(card.id)} className="pressable shrink-0 p-1.5 rounded-full" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }} aria-label="Remove favorite">
                  <X size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Sheet>
  );
}
