"use client";

import { GameSession } from "@/lib/game";
import { CircleDot } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ScoreKeeper({
  game,
  onScore,
  onSideOut,
}: {
  game: GameSession;
  onScore: (team: 1 | 2) => void;
  onSideOut: () => void;
}) {
  const locked = game.config.scoreLocked || !!game.winner;

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm">
      {/* Serving indicator */}
      {game.config.sideOutScoring && (
        <button onClick={onSideOut} className="pressable flex items-center gap-1.5 text-xs px-3 py-1 rounded-full" style={{ background: "var(--bg-elevated)", color: "var(--yellow)", border: "1px solid var(--border)" }}>
          <CircleDot size={13} /> Serving: {game.servingTeam === 1 ? game.playerNames.team1 : game.playerNames.team2}
        </button>
      )}

      {/* Score */}
      <div className="flex items-center gap-6 sm:gap-8">
        <ScoreButton
          score={game.score.team1}
          name={game.playerNames.team1}
          color="var(--blue)"
          serving={game.servingTeam === 1}
          disabled={locked}
          onClick={() => onScore(1)}
        />

        <span className="text-xs font-bold tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>VS</span>

        <ScoreButton
          score={game.score.team2}
          name={game.playerNames.team2}
          color="var(--red)"
          serving={game.servingTeam === 2}
          disabled={locked}
          onClick={() => onScore(2)}
        />
      </div>

      {/* Game progress */}
      {game.gameResults.length > 0 && (
        <div className="flex items-center gap-2 text-xs flex-wrap justify-center" style={{ color: "var(--text-muted)" }}>
          {game.gameResults.map((r, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full" style={{ background: "var(--bg-elevated)" }}>G{i + 1}: {r.team1}-{r.team2}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreButton({ score, name, color, serving, disabled, onClick }: {
  score: number; name: string; color: string; serving: boolean; disabled: boolean; onClick: () => void;
}) {
  const [bump, setBump] = useState(false);
  const prev = useRef(score);

  useEffect(() => {
    if (score !== prev.current) {
      prev.current = score;
      setBump(true);
      const t = setTimeout(() => setBump(false), 420);
      return () => clearTimeout(t);
    }
  }, [score]);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-1.5 transition-all active:scale-90 disabled:opacity-40"
    >
      <div
        className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl font-black text-white ${bump ? "anim-bump" : ""} ${serving ? "anim-ring" : ""}`}
        style={{
          background: `linear-gradient(150deg, ${color}, color-mix(in srgb, ${color} 65%, black))`,
          opacity: disabled ? 0.4 : 1,
          boxShadow: serving
            ? `0 0 0 3px var(--yellow), 0 10px 30px -8px ${color}`
            : `0 10px 30px -10px ${color}`,
        }}
      >
        {score}
      </div>
      <span className="text-xs font-semibold truncate max-w-[88px]" style={{ color: "var(--text-secondary)" }}>
        {name}
      </span>
    </button>
  );
}
