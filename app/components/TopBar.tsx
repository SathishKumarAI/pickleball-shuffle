"use client";

import { GameSession, formatTime } from "@/lib/game";
import { DeckMode, DECK_MODES } from "@/lib/cards";
import { useState } from "react";

export default function TopBar({
  game,
  mode,
  elapsed,
  darkMode,
  onBack,
  onToggleDark,
  onModeChange,
  onEditNames,
  onToggleLock,
  onUndo,
  onReset,
  onOpenSettings,
}: {
  game: GameSession;
  mode: DeckMode;
  elapsed: string;
  darkMode: boolean;
  onBack: () => void;
  onToggleDark: () => void;
  onModeChange: (m: DeckMode) => void;
  onEditNames: () => void;
  onToggleLock: () => void;
  onUndo: () => void;
  onReset: () => void;
  onOpenSettings: () => void;
}) {
  const [showModes, setShowModes] = useState(false);

  return (
    <div className="w-full" style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
      {/* Main bar */}
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <button onClick={onBack} className="text-sm" style={{ color: "var(--accent)" }}>
          ← Back
        </button>

        <button onClick={() => setShowModes(!showModes)} className="flex items-center gap-1.5">
          <span>{DECK_MODES[mode].emoji}</span>
          <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            {DECK_MODES[mode].label}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>▾</span>
        </button>

        <div className="flex items-center gap-2">
          <button onClick={onOpenSettings} className="text-sm p-1.5 rounded-lg" style={{ color: "var(--text-secondary)" }}>
            ⚙️
          </button>
          <button onClick={onToggleDark} className="text-sm p-1.5 rounded-lg" style={{ color: "var(--text-secondary)" }}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex items-center justify-center gap-3 px-4 pb-2 max-w-lg mx-auto">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          G{game.gameNumber} · {elapsed}
        </span>
        <span style={{ color: "var(--border)" }}>·</span>
        <button onClick={onUndo} disabled={game.history.length === 0} className="text-xs disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>
          ↩ Undo
        </button>
        <button onClick={onToggleLock} className="text-xs" style={{ color: game.config.scoreLocked ? "var(--red)" : "var(--text-secondary)" }}>
          {game.config.scoreLocked ? "🔒" : "🔓"}
        </button>
        <button onClick={onEditNames} className="text-xs" style={{ color: "var(--text-secondary)" }}>
          ✏️
        </button>
      </div>

      {/* Mode selector dropdown */}
      {showModes && (
        <div className="px-4 pb-3 max-w-lg mx-auto">
          <div className="flex flex-wrap gap-1.5 justify-center">
            {(Object.keys(DECK_MODES) as DeckMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { onModeChange(m); setShowModes(false); }}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: mode === m ? "var(--accent)" : "var(--bg-elevated)",
                  color: mode === m ? "#fff" : "var(--text-secondary)",
                }}
              >
                {DECK_MODES[m].emoji} {DECK_MODES[m].label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
