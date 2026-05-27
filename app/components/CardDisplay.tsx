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
      setTimeout(() => setIsFlipping(false), 300);
    }, 300);
  };

  const gradient = card ? CATEGORY_COLORS[card.category] || "from-gray-500 to-gray-700" : "from-green-600 to-emerald-800";
  const emoji = card ? CATEGORY_EMOJI[card.category] || "🃏" : "";

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`relative w-72 sm:w-80 h-[26rem] sm:h-[28rem] cursor-pointer transition-transform duration-500 ${
          isFlipping ? "scale-90" : "scale-100"
        }`}
        onClick={handleDraw}
      >
        {!showFace || !card ? (
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-green-600 to-emerald-800 border-4 border-green-400/30 shadow-2xl flex flex-col items-center justify-center gap-4 select-none">
            <div className="text-7xl">🏓</div>
            <div className="text-3xl font-black text-white tracking-wider">SHUFFLE</div>
            <div className="text-sm text-green-200/80 mt-2">Tap to draw</div>
            <div className="absolute bottom-4 text-xs text-green-300/60">
              {deckRemaining} cards remaining
            </div>
          </div>
        ) : (
          <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${gradient} border-4 border-white/20 shadow-2xl flex flex-col p-5 select-none`}>
            <div className="flex justify-between items-start">
              <span className="text-4xl">{emoji}</span>
              <div className="flex items-center gap-2">
                {onFavorite && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onFavorite(); }}
                    className="text-lg hover:scale-125 transition-transform"
                  >
                    {isFavorite ? "⭐" : "☆"}
                  </button>
                )}
                <span className="text-xs font-mono text-white/50">#{card.id}</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">{card.name}</h2>
              <p className="text-base sm:text-lg text-white/90 leading-relaxed px-2">{card.effect}</p>
            </div>

            <div className="flex justify-between items-end">
              <span className="text-xs text-white/60 bg-white/10 px-3 py-1 rounded-full">
                {card.category}
              </span>
              <div className="flex items-center gap-2">
                {onSkip && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onSkip(); }}
                    className="text-xs text-white/40 hover:text-white/80 transition-colors bg-white/10 px-2 py-0.5 rounded-full"
                  >
                    Skip future
                  </button>
                )}
                <span className="text-xs text-white/40">{card.vibe}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleDraw}
        className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white text-lg font-bold rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
      >
        🎴 Draw Card
      </button>
    </div>
  );
}
