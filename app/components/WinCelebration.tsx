"use client";

import { useEffect, useState } from "react";

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
  const [confetti, setConfetti] = useState<{ x: number; y: number; color: string; delay: number }[]>([]);

  useEffect(() => {
    const pieces = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * -50,
      color: ["#f38ba8", "#a6e3a1", "#89b4fa", "#f9e2af", "#cba6f7", "#fab387"][Math.floor(Math.random() * 6)],
      delay: Math.random() * 2,
    }));
    setConfetti(pieces);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      {/* Confetti */}
      {confetti.map((p, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-bounce"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: "3s",
          }}
        />
      ))}

      <div className="bg-gray-900 rounded-3xl p-8 text-center max-w-sm w-full border border-gray-700 shadow-2xl relative z-10">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-black text-white mb-2">{winnerName} Wins!</h2>
        <p className="text-xl text-gray-400 mb-6">
          {score.team1} — {score.team2}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onNewGame}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-full transition-all hover:scale-105"
          >
            🔄 Next Game
          </button>
          <button
            onClick={onEndMatch}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-full transition-all"
          >
            End Match
          </button>
        </div>
      </div>
    </div>
  );
}
