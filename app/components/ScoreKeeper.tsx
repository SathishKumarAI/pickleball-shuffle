"use client";

import { GameSession } from "@/lib/game";

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
    <div className="flex flex-col items-center gap-2 w-full max-w-sm">
      {/* Serving indicator */}
      {game.config.sideOutScoring && (
        <button onClick={onSideOut} className="text-xs px-3 py-1 rounded-full transition-all" style={{ background: "var(--bg-elevated)", color: "var(--yellow)", border: "1px solid var(--border)" }}>
          Serving: {game.servingTeam === 1 ? game.playerNames.team1 : game.playerNames.team2}
        </button>
      )}

      {/* Score */}
      <div className="flex items-center gap-8">
        <ScoreButton
          score={game.score.team1}
          name={game.playerNames.team1}
          color="var(--blue)"
          serving={game.servingTeam === 1}
          disabled={locked}
          onClick={() => onScore(1)}
        />

        <div className="flex flex-col items-center">
          <span className="text-xs font-medium tracking-widest" style={{ color: "var(--text-muted)" }}>VS</span>
        </div>

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
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
          {game.gameResults.map((r, i) => (
            <span key={i}>G{i + 1}: {r.team1}-{r.team2}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreButton({ score, name, color, serving, disabled, onClick }: {
  score: number; name: string; color: string; serving: boolean; disabled: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-1 transition-all active:scale-95 disabled:opacity-40"
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black text-white transition-all"
        style={{
          background: color,
          opacity: disabled ? 0.4 : 1,
          boxShadow: serving ? `0 0 0 3px var(--yellow)` : "none",
        }}
      >
        {score}
      </div>
      <span className="text-xs font-medium truncate max-w-[80px]" style={{ color: "var(--text-secondary)" }}>
        {name}
      </span>
    </button>
  );
}
