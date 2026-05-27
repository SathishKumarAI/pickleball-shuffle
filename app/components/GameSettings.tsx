"use client";

import { useState } from "react";
import { GameConfig, GameType } from "@/lib/game";

export default function GameSettings({
  config,
  onUpdate,
}: {
  config: GameConfig;
  onUpdate: (key: keyof GameConfig, value: boolean | number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full max-w-md">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
      >
        ⚙️ Settings {open ? "▼" : "▶"}
      </button>

      {open && (
        <div className="mt-2 bg-gray-900/80 rounded-xl p-4 border border-gray-700/50 space-y-3">
          {/* Game type */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Game type</span>
            <div className="flex items-center gap-1.5">
              {(["singles", "doubles", "mixed-doubles"] as GameType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onUpdate("gameType", t as unknown as number)}
                  className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                    config.gameType === t
                      ? "bg-green-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {t === "singles" ? "🧍 Singles" : t === "doubles" ? "👥 Doubles" : "🔀 Mixed"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Points to win</span>
            <div className="flex items-center gap-2">
              {[7, 11, 15, 21].map((n) => (
                <button
                  key={n}
                  onClick={() => onUpdate("pointsToWin", n)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    config.pointsToWin === n
                      ? "bg-green-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <Toggle label="Win by 2" value={config.winByTwo} onChange={(v) => onUpdate("winByTwo", v)} />
          <Toggle label="Side-out scoring" value={config.sideOutScoring} onChange={(v) => onUpdate("sideOutScoring", v)} />
          <Toggle label="Confirm before scoring" value={config.confirmScore} onChange={(v) => onUpdate("confirmScore", v)} />
          <Toggle label="Sound effects" value={config.soundEnabled} onChange={(v) => onUpdate("soundEnabled", v)} />
        </div>
      )}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-300">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-colors relative ${value ? "bg-green-600" : "bg-gray-700"}`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            value ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
