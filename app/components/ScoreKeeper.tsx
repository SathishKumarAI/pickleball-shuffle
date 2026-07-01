"use client";

import { GameSession, pointStatus, outcomeMessage } from "@/lib/game";
import { speak } from "@/lib/sounds";
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
  const isDoubles = game.config.gameType !== "singles";

  // Consequence narration: on every state change, describe what happened in
  // plain words ("Point Eagles 4-2" / "Side out - Hawks serve") and, if the
  // user opted in, speak it aloud. This is what makes "tap who won" legible to
  // beginners who don't know side-out scoring.
  const prevGame = useRef(game);
  const [outcome, setOutcome] = useState("");
  useEffect(() => {
    const msg = outcomeMessage(prevGame.current, game);
    prevGame.current = game;
    if (!msg) return;
    setOutcome(msg);
    if (game.config.announceScore) speak(msg);
    const t = setTimeout(() => setOutcome(""), 3200);
    return () => clearTimeout(t);
  }, [game]);
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

      {/* Consequence narration - what the last tap did, in plain words */}
      {outcome && !game.winner && (
        <div
          className="anim-pop text-sm font-bold px-4 py-1.5 rounded-full"
          role="status"
          aria-live="polite"
          style={{ background: "var(--bg-elevated)", color: "var(--accent)", border: "1px solid var(--accent)" }}
        >
          {outcome}
        </div>
      )}

      {/* Serving indicator */}
      {game.config.sideOutScoring && (
        <button onClick={onSideOut} aria-label="Side out - switch serving team" aria-live="polite" className="pressable flex items-center gap-1.5 text-xs px-3 py-1 rounded-full" style={{ background: "var(--bg-elevated)", color: "var(--yellow)", border: "1px solid var(--border)" }}>
          <CircleDot size={13} /> Serving: {game.servingTeam === 1 ? game.playerNames.team1 : game.playerNames.team2}
          {isDoubles ? ` · server ${game.serverNumber}` : ""}
        </button>
      )}

      {/* Beginner-first prompt: ask who won, not "add a point" */}
      {!game.winner && (
        <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
          Who won the rally? Tap their score.
        </p>
      )}

      {/* Score. In official mode the divider reads as the NET (court-side framing
          like the Referee app) so a coach taps "the side that won". */}
      <div className="flex items-center gap-6 sm:gap-8">
        <ScoreButton
          score={game.score.team1}
          name={game.playerNames.team1}
          color="var(--blue)"
          serving={game.servingTeam === 1}
          serverNumber={game.serverNumber}
          doubles={isDoubles}
          disabled={locked}
          onClick={() => onScore(1)}
        />

        {game.config.officialMode ? (
          <span className="flex flex-col items-center gap-1" aria-hidden>
            <span className="w-px h-16" style={{ background: "repeating-linear-gradient(var(--text-muted) 0 4px, transparent 4px 8px)" }} />
            <span className="text-[10px] font-bold tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>NET</span>
          </span>
        ) : (
          <span className="text-xs font-bold tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>VS</span>
        )}

        <ScoreButton
          score={game.score.team2}
          name={game.playerNames.team2}
          color="var(--red)"
          serving={game.servingTeam === 2}
          serverNumber={game.serverNumber}
          doubles={isDoubles}
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

function ScoreButton({ score, name, color, serving, serverNumber, doubles, disabled, onClick }: {
  score: number; name: string; color: string; serving: boolean; serverNumber: 1 | 2; doubles: boolean; disabled: boolean; onClick: () => void;
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

  const serveDesc = serving ? `, serving${doubles ? `, server ${serverNumber}` : ""}` : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={`${name} won the rally - tap to record. ${name} currently ${score}${serveDesc}`}
      className="flex flex-col items-center gap-1.5 transition-all active:scale-90 disabled:opacity-40"
    >
      {/* Serve badge: ball on the serving team + server 1/2 dots (doubles). The
          two-server rule made visible instead of explained (Side Out pattern). */}
      <span className="flex items-center gap-1 h-4" aria-hidden>
        {serving && <CircleDot size={13} style={{ color: "var(--yellow)" }} />}
        {serving && doubles && (
          <span className="flex items-center gap-1">
            {[1, 2].map((n) => (
              <span
                key={n}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: n <= serverNumber ? "var(--yellow)" : "var(--border)" }}
              />
            ))}
          </span>
        )}
      </span>
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
