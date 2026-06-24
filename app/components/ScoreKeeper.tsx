"use client";

import { GameSession, pointStatus } from "@/lib/game";
import { CircleDot, Minus, Flame, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ScoreKeeper({
  game,
  onScore,
  onSideOut,
  onAdjust,
}: {
  game: GameSession;
  onScore: (team: 1 | 2) => void;
  onSideOut: () => void;
  onAdjust?: (team: 1 | 2, delta: number) => void;
}) {
  const locked = game.config.scoreLocked || !!game.winner;
  const point = pointStatus(game);
  // Side switch at the game midpoint (e.g. first to 6 in an 11-point game) - F062.
  const half = Math.ceil(game.config.pointsToWin / 2);
  const switchSides = !game.winner && (
    (game.score.team1 === half && game.score.team2 < half) ||
    (game.score.team2 === half && game.score.team1 < half)
  );

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm">
      {/* Switch-sides reminder (F062) */}
      {switchSides && (
        <div
          className="anim-pop flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
          role="status"
          aria-live="polite"
          style={{ background: "var(--bg-elevated)", color: "var(--blue)", border: "1px solid var(--blue)" }}
        >
          <RefreshCw size={13} /> Switch sides
        </div>
      )}

      {/* Game / match point banner (F077) */}
      {point && (
        <div
          className="anim-pop flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
          role="status"
          aria-live="polite"
          style={{ background: "var(--bg-elevated)", color: point.match ? "var(--red)" : "var(--yellow)", border: `1px solid ${point.match ? "var(--red)" : "var(--yellow)"}` }}
        >
          <Flame size={13} />
          {point.match ? "Match point" : "Game point"}: {point.team === 1 ? game.playerNames.team1 : game.playerNames.team2}
        </div>
      )}

      {/* Serving indicator */}
      {game.config.sideOutScoring && (
        <button onClick={onSideOut} aria-label="Side out - switch serving team" aria-live="polite" className="pressable flex items-center gap-1.5 text-xs px-3 py-1 rounded-full" style={{ background: "var(--bg-elevated)", color: "var(--yellow)", border: "1px solid var(--border)" }}>
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

      {/* Manual score correction - subtle -1 per team (F065) */}
      {onAdjust && !game.config.scoreLocked && (game.score.team1 > 0 || game.score.team2 > 0) && (
        <div className="flex items-center justify-center gap-6 sm:gap-8 -mt-1">
          <CorrectButton name={game.playerNames.team1} disabled={game.score.team1 === 0} onClick={() => onAdjust(1, -1)} />
          <span className="w-6" />
          <CorrectButton name={game.playerNames.team2} disabled={game.score.team2 === 0} onClick={() => onAdjust(2, -1)} />
        </div>
      )}

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

function CorrectButton({ name, disabled, onClick }: { name: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={`Subtract a point from ${name}`}
      className="pressable flex items-center justify-center min-w-[44px] min-h-[44px] disabled:opacity-25"
    >
      <span
        className="flex items-center justify-center w-7 h-7 rounded-full"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
      >
        <Minus size={13} />
      </span>
    </button>
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
      aria-label={`Add point to ${name}, currently ${score}${serving ? ", serving" : ""}`}
      className="flex flex-col items-center gap-1.5 transition-all active:scale-90 disabled:opacity-40"
    >
      <div
        className={`font-display relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl font-black text-white ${bump ? "anim-bump" : ""} ${serving ? "anim-ring" : ""}`}
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
