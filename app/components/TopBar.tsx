"use client";

import { GameSession } from "@/lib/game";
import { DeckMode, DECK_MODES } from "@/lib/cards";
import { MODE_ICONS } from "./icons";
import { ArrowLeft, Settings, Sun, Moon, Undo2, Lock, LockOpen, Pencil, ChevronDown, RotateCcw } from "lucide-react";
import { useState } from "react";

export default function TopBar({
  game,
  mode,
  modeLabelOverride,
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
  menuSlot,
}: {
  game: GameSession;
  mode: DeckMode;
  modeLabelOverride?: string | null;
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
  menuSlot?: React.ReactNode;
}) {
  const [showModes, setShowModes] = useState(false);
  const ModeIcon = MODE_ICONS[mode];

  return (
    <div className="w-full sticky top-0 z-30 glass" style={{ borderBottom: "1px solid var(--border)", paddingTop: "env(safe-area-inset-top)" }}>
      {/* Main bar */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 max-w-lg mx-auto">
        <button onClick={onBack} className="pressable shrink-0 flex items-center gap-1 text-sm" style={{ color: "var(--accent)" }}>
          <ArrowLeft size={16} /> Back
        </button>

        <button onClick={() => setShowModes(!showModes)} aria-haspopup="true" aria-expanded={showModes} aria-label="Change deck mode" className="pressable min-w-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "var(--bg-elevated)" }}>
          <ModeIcon size={15} style={{ color: "var(--accent)" }} />
          <span className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
            {modeLabelOverride || DECK_MODES[mode].label}
          </span>
          <ChevronDown size={13} style={{ color: "var(--text-muted)", transform: showModes ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onOpenSettings} className="pressable p-2 rounded-full" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }} aria-label="Settings">
            <Settings size={18} />
          </button>
          <button onClick={onToggleDark} className="pressable p-2 rounded-full" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }} aria-label="Toggle theme">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {menuSlot}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-4 pb-2 max-w-lg mx-auto">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          G{game.gameNumber} · {elapsed}
        </span>
        <span style={{ color: "var(--border)" }}>·</span>
        <button onClick={onUndo} disabled={game.history.length === 0} className="pressable flex items-center gap-1 text-xs disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>
          <Undo2 size={14} /> Undo
        </button>
        <button onClick={onReset} disabled={game.score.team1 === 0 && game.score.team2 === 0} className="pressable flex items-center gap-1 text-xs disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>
          <RotateCcw size={14} /> Reset
        </button>
        <button onClick={onToggleLock} aria-label={game.config.scoreLocked ? "Unlock score" : "Lock score"} aria-pressed={game.config.scoreLocked} className="pressable flex items-center gap-1 text-xs min-h-[32px] px-1" style={{ color: game.config.scoreLocked ? "var(--red)" : "var(--text-secondary)" }}>
          {game.config.scoreLocked ? <Lock size={14} /> : <LockOpen size={14} />}
        </button>
        <button onClick={onEditNames} aria-label="Edit team names" className="pressable flex items-center gap-1 text-xs min-h-[32px] px-1" style={{ color: "var(--text-secondary)" }}>
          <Pencil size={14} />
        </button>
      </div>

      {/* Mode selector dropdown */}
      {showModes && (
        <div className="px-4 pb-3 max-w-lg mx-auto anim-fade-up">
          <div className="flex flex-wrap gap-1.5 justify-center">
            {(Object.keys(DECK_MODES) as DeckMode[]).map((m) => {
              const Icon = MODE_ICONS[m];
              const active = mode === m && !modeLabelOverride;
              return (
                <button
                  key={m}
                  onClick={() => { onModeChange(m); setShowModes(false); }}
                  className="pressable flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: active ? "var(--accent)" : "var(--bg-elevated)",
                    color: active ? "#fff" : "var(--text-secondary)",
                    boxShadow: active ? "0 4px 14px -4px var(--accent-glow)" : "none",
                  }}
                >
                  <Icon size={13} /> {DECK_MODES[m].label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
