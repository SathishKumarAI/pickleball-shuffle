"use client";

import { GameSession } from "@/lib/game";
import { X } from "lucide-react";

// Big courtside / cast display (backlog F072): huge tappable scores, minimal
// chrome, for a phone or tablet propped at the side of the court.
export default function TVScore({
  game,
  onScore,
  onExit,
}: {
  game: GameSession;
  onScore: (team: 1 | 2) => void;
  onExit: () => void;
}) {
  const locked = game.config.scoreLocked || !!game.winner;

  return (
    <div className="fixed inset-0 z-[85] flex flex-col" style={{ background: "var(--bg)" }}>
      <div className="flex justify-between items-center px-5" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
        <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Game {game.gameNumber}
        </span>
        <button
          onClick={onExit}
          aria-label="Exit big-score view"
          className="pressable p-2 rounded-full"
          style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-2 p-3">
        <TeamSide
          name={game.playerNames.team1}
          score={game.score.team1}
          color="var(--blue)"
          serving={game.servingTeam === 1}
          disabled={locked}
          onClick={() => onScore(1)}
        />
        <TeamSide
          name={game.playerNames.team2}
          score={game.score.team2}
          color="var(--red)"
          serving={game.servingTeam === 2}
          disabled={locked}
          onClick={() => onScore(2)}
        />
      </div>

      <p className="text-center text-xs pb-4" style={{ color: "var(--text-muted)" }}>
        Tap a side to score{game.config.scoreLocked ? " (locked)" : ""}
      </p>
    </div>
  );
}

function TeamSide({ name, score, color, serving, disabled, onClick }: {
  name: string; score: number; color: string; serving: boolean; disabled: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={`Add point to ${name}, currently ${score}${serving ? ", serving" : ""}`}
      className="flex flex-col items-center justify-center gap-3 rounded-3xl active:scale-[0.98] transition-transform disabled:opacity-60"
      style={{
        background: `linear-gradient(160deg, color-mix(in srgb, ${color} 22%, var(--bg-card)), var(--bg-card))`,
        border: serving ? `2px solid ${color}` : "1px solid var(--border)",
      }}
    >
      <span className="font-display font-black leading-none" style={{ fontSize: "clamp(5rem, 30vw, 16rem)", color }}>
        {score}
      </span>
      <span className="text-base sm:text-xl font-semibold px-2 text-center truncate max-w-full" style={{ color: "var(--text)" }}>
        {name}
      </span>
      {serving && (
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>Serving</span>
      )}
    </button>
  );
}
