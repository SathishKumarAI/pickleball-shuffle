"use client";

import { Card, CATEGORY_COLORS, CATEGORY_EMOJI } from "@/lib/cards";
import { useState } from "react";

export default function CardDisplay({
  card,
  onDraw,
  deckRemaining,
  isFavorite,
  onFavorite,
  onSkip,
}: {
  card: Card | null;
  onDraw: () => void;
  deckRemaining: number;
  isFavorite?: boolean;
  onFavorite?: () => void;
  onSkip?: () => void;
}) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [showFace, setShowFace] = useState(false);

  const handleDraw = () => {
    setIsFlipping(true);
    setShowFace(false);
    setTimeout(() => {
      onDraw();
      setShowFace(true);
      setTimeout(() => setIsFlipping(false), 400);
    }, 200);
  };

  const gradient = card ? CATEGORY_COLORS[card.category] || "from-gray-500 to-gray-700" : "";
  const emoji = card ? CATEGORY_EMOJI[card.category] || "🃏" : "";

  return (
    <div className="flex flex-col items-center gap-5 flex-1 justify-center">
      {/* Card */}
      <div
        className={`relative w-72 h-[22rem] sm:w-80 sm:h-[26rem] cursor-pointer transition-all duration-500 ${
          isFlipping ? "scale-95 opacity-80" : "scale-100 opacity-100"
        }`}
        onClick={handleDraw}
      >
        {!showFace || !card ? (
          /* Back of card */
          <div
            className="w-full h-full rounded-3xl flex flex-col items-center justify-center gap-3 select-none shadow-xl"
            style={{ background: "var(--accent)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="text-6xl">🏓</div>
            <div className="text-2xl font-black text-white tracking-wide">SHUFFLE</div>
            <div className="text-sm text-white/60 mt-1">Tap to draw</div>
            <div className="absolute bottom-5 text-xs text-white/40">
              {deckRemaining} remaining
            </div>
          </div>
        ) : (
          /* Face of card */
          <div className={`w-full h-full rounded-3xl bg-gradient-to-br ${gradient} flex flex-col p-6 select-none shadow-xl`} style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
            <div className="flex justify-between items-start">
              <span className="text-3xl">{emoji}</span>
              <div className="flex items-center gap-2">
                {onFavorite && (
                  <button onClick={(e) => { e.stopPropagation(); onFavorite(); }} className="text-lg hover:scale-110 transition-transform">
                    {isFavorite ? "⭐" : "☆"}
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">{card.name}</h2>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed">{card.effect}</p>
            </div>

            <div className="flex justify-between items-end">
              <span className="text-xs text-white/50 bg-white/10 px-3 py-1 rounded-full">{card.category}</span>
              {onSkip && (
                <button onClick={(e) => { e.stopPropagation(); onSkip(); }} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                  Skip
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Draw button */}
      <button
        onClick={handleDraw}
        className="px-8 py-3.5 text-white text-base font-semibold rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{ background: "var(--accent)" }}
      >
        Draw Card
      </button>
    </div>
  );
}
