"use client";

import { GameSession, serverLabel, logCount } from "@/lib/game";
import { Timer, Flag, Download, RefreshCw } from "lucide-react";

// In-match officiating controls for coach/umpire "Track a match" mode: who's
// serving (with server number in doubles), per-team timeout + fault buttons,
// a side-out button, and a one-tap match-sheet download. Pure UI - all state
// changes go through the passed handlers (which call the pure game engine).
export default function OfficialControls({
  game,
  onTimeout,
  onFault,
  onSideOut,
  onDownload,
}: {
  game: GameSession;
  onTimeout: (team: 1 | 2) => void;
  onFault: (team: 1 | 2) => void;
  onSideOut: () => void;
  onDownload: () => void;
}) {
  const label = serverLabel(game);
  const servingName = game.servingTeam === 1 ? game.playerNames.team1 : game.playerNames.team2;
  const otherName = game.servingTeam === 1 ? game.playerNames.team2 : game.playerNames.team1;
  // In doubles, the first server losing the rally hands off to the SAME team's
  // second server; only the second server's loss is a true side-out. Label the
  // button for whichever happens next so a coach/umpire records it correctly.
  const isDoubles = game.config.gameType !== "singles";
  const toSecondServer = isDoubles && game.serverNumber === 1;
  const serveBtnText = toSecondServer ? "Server 1 lost — 2nd server serves" : `Side out — ${otherName} serves`;

  return (
    <div className="w-full max-w-sm flex flex-col gap-2.5">
      <div
        className="flex items-center justify-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full self-center"
        role="status"
        aria-live="polite"
        style={{ background: "var(--bg-elevated)", color: "var(--accent)", border: "1px solid var(--border)" }}
      >
        Serving: {servingName}{label ? ` · ${label}` : ""}
      </div>

      <button
        onClick={onSideOut}
        aria-label={serveBtnText}
        className="pressable flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-center"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text)" }}
      >
        <RefreshCw size={15} className="shrink-0" /> {serveBtnText}
      </button>
      <p className="text-[11px] text-center -mt-1" style={{ color: "var(--text-muted)" }}>
        {game.config.sideOutScoring
          ? "Tap a team's score only when the SERVING side wins the rally. If the serving side loses, use the button above."
          : "Rally scoring: tap whichever team won the rally to add their point."}
      </p>

      <div className="grid grid-cols-2 gap-2">
        {([1, 2] as const).map((team) => (
          <div key={team} className="glass rounded-xl p-2.5 flex flex-col gap-2" style={{ border: "1px solid var(--border)" }}>
            <span className="text-xs font-bold truncate" style={{ color: "var(--text)" }}>
              {team === 1 ? game.playerNames.team1 : game.playerNames.team2}
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onTimeout(team)}
                className="pressable flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[11px] font-semibold"
                style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
                aria-label={`Record timeout for ${team === 1 ? game.playerNames.team1 : game.playerNames.team2}`}
              >
                <Timer size={15} /> TO {logCount(game, "timeout", team)}
              </button>
              <button
                onClick={() => onFault(team)}
                className="pressable flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[11px] font-semibold"
                style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
                aria-label={`Record fault for ${team === 1 ? game.playerNames.team1 : game.playerNames.team2}`}
              >
                <Flag size={15} /> Fault {logCount(game, "fault", team)}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onDownload}
        className="pressable flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
      >
        <Download size={15} /> Download match sheet
      </button>
    </div>
  );
}
