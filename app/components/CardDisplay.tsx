"use client";

import { Card, CATEGORY_COLORS, RARITY_STYLE } from "@/lib/cards";
import { CategoryIcon } from "./icons";
import { Shuffle, Star, SkipForward, ArrowLeft } from "lucide-react";
import { useState } from "react";

// Intensity 1 (chill) .. 5 (chaos) shown as a small dot meter (backlog F522).
const INTENSITY_LABEL = ["", "Chill", "Light", "Spicy", "Intense", "Chaos"];
function IntensityDots({ value }: { value: number }) {
  const n = Math.max(1, Math.min(5, value));
  return (
    <span
      className="flex items-center gap-1.5"
      role="img"
      aria-label={`Intensity ${n} of 5${INTENSITY_LABEL[n] ? `, ${INTENSITY_LABEL[n]}` : ""}`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider text-white/55">
        {INTENSITY_LABEL[n]}
      </span>
      <span className="flex items-center gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: i <= n ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.28)" }}
          />
        ))}
      </span>
    </span>
  );
}

export default function CardDisplay({
  card,
  onDraw,
  deckRemaining,
  isFavorite,
  onFavorite,
  onSkip,
  onBack,
  commentary = false,
  large = false,
}: {
  card: Card | null;
  onDraw: () => void;
  deckRemaining: number;
  isFavorite?: boolean;
  onFavorite?: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  commentary?: boolean;
  large?: boolean;
}) {
  // If a card is already present on mount (e.g. resuming a game), show its face.
  const [flipped, setFlipped] = useState(!!card);
  const [shine, setShine] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleDraw = () => {
    if (busy) return;
    // Reduced motion: skip the flip-out delay and the shine sweep so the new
    // card appears immediately instead of leaving the user staring at a frozen
    // (non-animating) card for ~320ms.
    const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setBusy(true);
    setShine(false);

    const reveal = () => {
      onDraw();
      requestAnimationFrame(() => {
        setFlipped(true);
        if (!reduceMotion) {
          setShine(true);
          setTimeout(() => setShine(false), 900);
        }
        setTimeout(() => setBusy(false), reduceMotion ? 50 : 600);
      });
    };

    if (flipped) {
      setFlipped(false);
      setTimeout(reveal, reduceMotion ? 0 : 320);
    } else {
      reveal();
    }
  };

  const gradient = card ? CATEGORY_COLORS[card.category] || "from-gray-500 to-gray-700" : "";

  return (
    <div className="flex flex-col items-center gap-5 flex-1 justify-center">
      {/* Card - scales with the device viewport but stays compact */}
      <div
        className="card-3d cursor-pointer"
        style={{ width: "min(90vw, 22rem)", height: "clamp(17rem, 46dvh, 28rem)" }}
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
              <Shuffle size={56} strokeWidth={1.5} />
            </div>
            <div className="text-2xl font-black text-white tracking-[0.2em]">SHUFFLE</div>
            <div className="text-sm text-white/70 mt-1">Tap to draw</div>
            <div className="absolute bottom-5 text-xs text-white/50 px-3 py-1 rounded-full bg-white/10">
              {deckRemaining} cards left
            </div>
          </div>

          {/* Face of card */}
          <div className={`card-face card-face--back shine ${shine ? "shine-run" : ""} w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br ${gradient} flex flex-col p-5 select-none shadow-2xl`} style={{ border: "1px solid rgba(255,255,255,0.2)" }}>
            <div className="flex justify-between items-start">
              <span className="flex items-center gap-2 min-w-0">
                <span className="text-white drop-shadow shrink-0">{card && <CategoryIcon category={card.category} size={30} strokeWidth={2} />}</span>
                {card?.rarity && (
                  <span
                    className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: "rgba(0,0,0,0.28)", color: RARITY_STYLE[card.rarity].color, border: `1px solid ${RARITY_STYLE[card.rarity].color}` }}
                  >
                    {RARITY_STYLE[card.rarity].label}
                  </span>
                )}
              </span>
              {onFavorite && (
                <button onClick={(e) => { e.stopPropagation(); onFavorite(); }} aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"} aria-pressed={isFavorite} className="flex items-center justify-center text-white transition-transform hover:scale-125 active:scale-90 p-2.5 -m-2.5">
                  <Star size={22} fill={isFavorite ? "currentColor" : "none"} />
                </button>
              )}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar w-full flex flex-col items-center justify-center gap-2 text-center px-1 py-2">
              <h2 className={`font-display ${large ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"} font-black text-white leading-tight drop-shadow-sm break-words`}>{card?.name}</h2>
              <p className={`${large ? "text-base sm:text-lg font-medium" : commentary ? "text-xs sm:text-sm" : "text-sm sm:text-base"} leading-snug text-white drop-shadow-sm`}>
                {commentary && card?.commentary ? card.commentary : card?.effect}
              </p>
              {card?.detail && (
                <p className={`${large ? "text-sm" : "text-[11px] sm:text-xs"} leading-snug text-white/80 max-w-[18rem]`}>{card.detail}</p>
              )}
              {typeof card?.intensity === "number" && (
                <IntensityDots value={card.intensity} />
              )}
              {card?.callout && (
                <p className="text-[11px] font-bold italic text-white/70">&ldquo;{card.callout}&rdquo;</p>
              )}
            </div>

            <div className="flex justify-between items-end gap-2">
              <span className="text-xs text-white/70 bg-white/15 px-3 py-1 rounded-full backdrop-blur-sm truncate min-w-0">{card?.category}</span>
              {onSkip && (
                <button onClick={(e) => { e.stopPropagation(); onSkip(); }} aria-label="Skip this card" className="shrink-0 flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors p-2.5 -m-2.5">
                  Skip <SkipForward size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Draw + Back row */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <button
          onClick={handleDraw}
          className="pressable flex items-center gap-2 px-9 py-3.5 text-white text-base font-semibold rounded-full shadow-lg anim-glow"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dim))" }}
        >
          <Shuffle size={18} /> {flipped ? "Draw Again" : "Draw Card"}
        </button>
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back to home"
            className="pressable flex items-center gap-1.5 px-5 py-3.5 text-sm font-semibold rounded-full"
            style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}
      </div>
    </div>
  );
}
