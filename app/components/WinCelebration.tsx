"use client";

import { useEffect, useState } from "react";
import { Trophy, RotateCcw } from "lucide-react";

export default function WinCelebration({
  winnerName,
  score,
  onNewGame,
  onEndMatch,
}: {
  winnerName: string;
  score: { team1: number; team2: number };
  onNewGame: () => void;
  onEndMatch: () => void;
}) {
  const [confetti, setConfetti] = useState<{ x: number; color: string; delay: number; dur: number; size: number; rect: boolean }[]>([]);

  useEffect(() => {
    const colors = ["#f38ba8", "#a6e3a1", "#89b4fa", "#f9e2af", "#cba6f7", "#fab387", "#34d399"];
    const pieces = Array.from({ length: 90 }, (_, i) => ({
      x: Math.random() * 100,
      color: colors[i % colors.length],
      delay: Math.random() * 2.5,
      dur: 2.5 + Math.random() * 2,
      size: 6 + Math.random() * 8,
      rect: Math.random() > 0.5,
    }));
    setConfetti(pieces);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-6 overflow-hidden">
      {/* Confetti */}
      {confetti.map((p, i) => (
        <div
          key={i}
          className="absolute top-0"
          style={{
            left: `${p.x}%`,
            width: `${p.size}px`,
            height: `${p.rect ? p.size * 0.5 : p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.rect ? "2px" : "50%",
            animation: `confettiFall ${p.dur}s linear ${p.delay}s infinite`,
          }}
        />
      ))}

      <div className="glass rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl relative z-10 anim-pop" style={{ border: "1px solid var(--border)" }}>
        <div className="flex justify-center mb-4 anim-float" style={{ color: "var(--yellow)", filter: "drop-shadow(0 8px 20px rgba(251,191,36,0.5))" }}>
          <Trophy size={72} strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-black mb-2" style={{ color: "var(--text)" }}>{winnerName} Wins!</h2>
        <p className="text-xl font-semibold mb-6" style={{ color: "var(--text-secondary)" }}>
          {score.team1} — {score.team2}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onNewGame}
            className="pressable flex items-center justify-center gap-2 px-6 py-3 text-white font-bold rounded-full shadow-lg"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dim))" }}
          >
            <RotateCcw size={18} /> Next Game
          </button>
          <button
            onClick={onEndMatch}
            className="pressable px-6 py-3 font-medium rounded-full"
            style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
          >
            End Match
          </button>
        </div>
      </div>
    </div>
  );
}
