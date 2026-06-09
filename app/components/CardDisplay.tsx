"use client";

import { Card, CATEGORY_COLORS } from "@/lib/cards";
import { categoryIcon } from "./icons";
import { Shuffle, Star, SkipForward } from "lucide-react";
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
  // If a card is already present on mount (e.g. resuming a game), show its face.
  const [flipped, setFlipped] = useState(!!card);
  const [shine, setShine] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleDraw = () => {
    if (busy) return;
    setBusy(true);
    setShine(false);

    const reveal = () => {
      onDraw();
      requestAnimationFrame(() => {
        setFlipped(true);
        setShine(true);
        setTimeout(() => setShine(false), 900);
        setTimeout(() => setBusy(false), 600);
      });
    };

    if (flipped) {
      setFlipped(false);
      setTimeout(reveal, 320);
    } else {
      reveal();
    }
  };

  const gradient = card ? CATEGORY_COLORS[card.category] || "from-gray-500 to-gray-700" : "";
  const CatIcon = card ? categoryIcon(card.category) : Shuffle;

  return (
    <div className="flex flex-col items-center gap-5 flex-1 justify-center">
      {/* Card — scales with the device viewport so it fits any phone */}
      <div
        className="card-3d cursor-pointer"
        style={{ width: "min(82vw, 20rem)", height: "clamp(17rem, 50dvh, 26rem)" }}
        onClick={handleDraw}
      >
        <div className={`card-3d-inner ${flipped ? "is-flipped" : ""}`}>
          {/* Back of card */}
          <div
            className="card-face w-full h-full rounded-3xl flex flex-col items-center justify-center gap-3 select-none shadow-2xl anim-glow"
            style={{
              background: "linear-gradient(150deg, var(--accent), var(--accent-dim))",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <div className="anim-float text-white" style={{ filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.3))" }}>
              <Shuffle size={72} strokeWidth={1.5} />
            </div>
            <div className="text-2xl font-black text-white tracking-[0.2em]">SHUFFLE</div>
            <div className="text-sm text-white/70 mt-1">Tap to draw</div>
            <div className="absolute bottom-5 text-xs text-white/50 px-3 py-1 rounded-full bg-white/10">
              {deckRemaining} cards left
            </div>
          </div>

          {/* Face of card */}
          <div className={`card-face card-face--back shine ${shine ? "shine-run" : ""} w-full h-full rounded-3xl bg-gradient-to-br ${gradient} flex flex-col p-6 select-none shadow-2xl`} style={{ border: "1px solid rgba(255,255,255,0.2)" }}>
            <div className="flex justify-between items-start">
              <span className="text-white drop-shadow"><CatIcon size={30} strokeWidth={2} /></span>
              {onFavorite && (
                <button onClick={(e) => { e.stopPropagation(); onFavorite(); }} className="text-white transition-transform hover:scale-125 active:scale-90">
                  <Star size={22} fill={isFavorite ? "currentColor" : "none"} />
                </button>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-sm">{card?.name}</h2>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed">{card?.effect}</p>
            </div>

            <div className="flex justify-between items-end">
              <span className="text-xs text-white/70 bg-white/15 px-3 py-1 rounded-full backdrop-blur-sm">{card?.category}</span>
              {onSkip && (
                <button onClick={(e) => { e.stopPropagation(); onSkip(); }} className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors">
                  Skip <SkipForward size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Draw button */}
      <button
        onClick={handleDraw}
        className="pressable flex items-center gap-2 px-9 py-3.5 text-white text-base font-semibold rounded-full shadow-lg anim-glow"
        style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dim))" }}
      >
        <Shuffle size={18} /> {flipped ? "Draw Again" : "Draw Card"}
      </button>
    </div>
  );
}
