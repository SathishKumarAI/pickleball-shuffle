"use client";

import { useState } from "react";
import { GameSession } from "@/lib/game";

export default function ScoreKeeper({
  game,
  onScore,
  onSideOut,
  onUndo,
  onReset,
  onToggleLock,
  onToggleConfirm,
  onToggleSideOut,
  elapsed,
}: {
  game: GameSession;
  onScore: (team: 1 | 2) => void;
  onSideOut: () => void;
  onUndo: () => void;
  onReset: () => void;
  onToggleLock: () => void;
  onToggleConfirm: () => void;
  onToggleSideOut: () => void;
  elapsed: string;
}) {
  const [showReset, setShowReset] = useState(false);
  const [confirmTeam, setConfirmTeam] = useState<1 | 2 | null>(null);

  const handleScoreTap = (team: 1 | 2) => {
    if (game.config.scoreLocked || game.winner) return;
    if (game.config.confirmScore) {
      setConfirmTeam(team);
    } else {
      onScore(team);
    }
  };

  const confirmScoreAction = () => {
    if (confirmTeam) {
      onScore(confirmTeam);
      setConfirmTeam(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-md">
      {/* Timer + Game Info */}
      <div className="flex items-center justify-between w-full text-xs text-gray-500 px-2">
        <span>Game {game.gameNumber} | {elapsed}</span>
        <span>
          {game.config.sideOutScoring ? "Side-out" : "Rally"} scoring | First to {game.config.pointsToWin}
        </span>
      </div>

      {/* Best-of-3 tracker */}
      {game.gameNumber > 1 && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{game.playerNames.team1}: {game.gamesWon.team1}W</span>
          <span>|</span>
          <span>{game.playerNames.team2}: {game.gamesWon.team2}W</span>
          {game.gameResults.map((r, i) => (
            <span key={i} className="text-gray-600">G{i + 1}: {r.team1}-{r.team2}</span>
          ))}
        </div>
      )}

      {/* Serving indicator */}
      {game.config.sideOutScoring && (
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onSideOut}
            className="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-full border border-yellow-600/30 hover:bg-yellow-600/30 transition-colors"
          >
            🏐 Serving: {game.servingTeam === 1 ? game.playerNames.team1 : game.playerNames.team2} (S{game.serverNumber}) — tap to switch
          </button>
        </div>
      )}

      {/* Score buttons */}
      <div className="flex items-center gap-4 bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 relative">
        {game.config.scoreLocked && (
          <div className="absolute inset-0 bg-gray-900/60 rounded-2xl flex items-center justify-center z-10">
            <span className="text-2xl">🔒</span>
          </div>
        )}

        {/* Team 1 */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => handleScoreTap(1)}
            className={`flex flex-col items-center gap-1 px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 ${
              game.servingTeam === 1
                ? "bg-blue-600 hover:bg-blue-500 ring-2 ring-yellow-400"
                : "bg-blue-600/70 hover:bg-blue-500/70"
            }`}
          >
            <span className="text-3xl font-black text-white">{game.score.team1}</span>
            <span className="text-xs text-blue-200 truncate max-w-[80px]">{game.playerNames.team1}</span>
          </button>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="text-gray-500 font-bold text-lg">vs</div>
        </div>

        {/* Team 2 */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => handleScoreTap(2)}
            className={`flex flex-col items-center gap-1 px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 ${
              game.servingTeam === 2
                ? "bg-red-600 hover:bg-red-500 ring-2 ring-yellow-400"
                : "bg-red-600/70 hover:bg-red-500/70"
            }`}
          >
            <span className="text-3xl font-black text-white">{game.score.team2}</span>
            <span className="text-xs text-red-200 truncate max-w-[80px]">{game.playerNames.team2}</span>
          </button>
        </div>
      </div>

      {/* Confirm dialog */}
      {confirmTeam && (
        <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-4 py-2 border border-gray-600">
          <span className="text-sm text-gray-300">
            +1 for {confirmTeam === 1 ? game.playerNames.team1 : game.playerNames.team2}?
          </span>
          <button onClick={confirmScoreAction} className="px-3 py-1 bg-green-600 text-white text-xs rounded-full hover:bg-green-500">Yes</button>
          <button onClick={() => setConfirmTeam(null)} className="px-3 py-1 bg-gray-600 text-gray-300 text-xs rounded-full hover:bg-gray-500">No</button>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 text-xs">
        <button
          onClick={onUndo}
          disabled={game.history.length === 0}
          className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ↩ Undo
        </button>

        <button
          onClick={onToggleLock}
          className={`px-3 py-1.5 rounded-full transition-colors ${
            game.config.scoreLocked
              ? "bg-red-800 text-red-300 hover:bg-red-700"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          {game.config.scoreLocked ? "🔒 Locked" : "🔓 Lock"}
        </button>

        <button
          onClick={onToggleConfirm}
          className={`px-3 py-1.5 rounded-full transition-colors ${
            game.config.confirmScore
              ? "bg-yellow-800 text-yellow-300"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          {game.config.confirmScore ? "✓ Confirm On" : "Confirm Off"}
        </button>

        {!showReset ? (
          <button
            onClick={() => setShowReset(true)}
            className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded-full hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button onClick={() => { onReset(); setShowReset(false); }} className="px-2 py-1 bg-red-600 text-white rounded-full text-xs">Yes</button>
            <button onClick={() => setShowReset(false)} className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">No</button>
          </div>
        )}
      </div>

      {/* Audit log toggle */}
      <AuditLog history={game.history} names={game.playerNames} />
    </div>
  );
}

function AuditLog({ history, names }: { history: { team: 1 | 2; type: string; scoreAfter: { team1: number; team2: number }; timestamp: number }[]; names: { team1: string; team2: string } }) {
  const [open, setOpen] = useState(false);

  if (history.length === 0) return null;

  return (
    <div className="w-full">
      <button onClick={() => setOpen(!open)} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
        {open ? "▼" : "▶"} Score log ({history.length} events)
      </button>
      {open && (
        <div className="mt-1 max-h-32 overflow-y-auto bg-gray-900/50 rounded-lg p-2 text-xs space-y-0.5">
          {[...history].reverse().map((e, i) => {
            const time = new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
            const teamName = e.team === 1 ? names.team1 : names.team2;
            return (
              <div key={i} className="flex justify-between text-gray-500">
                <span>
                  {e.type === "reset" ? "🔄 Reset" : e.type === "undo" ? `↩ Undo ${teamName}` : `+1 ${teamName}`}
                </span>
                <span>{e.scoreAfter.team1}-{e.scoreAfter.team2} • {time}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
