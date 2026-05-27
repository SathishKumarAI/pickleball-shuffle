"use client";

import { GameConfig, GameType } from "@/lib/game";

export default function SettingsSheet({
  config,
  open,
  onClose,
  onUpdate,
  onReset,
}: {
  config: GameConfig;
  open: boolean;
  onClose: () => void;
  onUpdate: (key: keyof GameConfig, value: boolean | number | string) => void;
  onReset: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)" }} />
      <div
        className="absolute bottom-0 left-0 right-0 rounded-t-3xl p-6 pb-10 max-h-[70vh] overflow-y-auto"
        style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: "var(--border)" }} />

        <h2 className="text-lg font-semibold mb-5" style={{ color: "var(--text)" }}>Settings</h2>

        {/* Game type */}
        <SettingRow label="Game type">
          <div className="flex gap-1.5">
            {(["singles", "doubles", "mixed-doubles"] as GameType[]).map((t) => (
              <Chip key={t} active={config.gameType === t} onClick={() => onUpdate("gameType", t)}>
                {t === "singles" ? "Singles" : t === "doubles" ? "Doubles" : "Mixed"}
              </Chip>
            ))}
          </div>
        </SettingRow>

        {/* Points to win */}
        <SettingRow label="Points to win">
          <div className="flex gap-1.5">
            {[7, 11, 15, 21].map((n) => (
              <Chip key={n} active={config.pointsToWin === n} onClick={() => onUpdate("pointsToWin", n)}>
                {n}
              </Chip>
            ))}
          </div>
        </SettingRow>

        <Toggle label="Win by 2" value={config.winByTwo} onChange={(v) => onUpdate("winByTwo", v)} />
        <Toggle label="Side-out scoring" value={config.sideOutScoring} onChange={(v) => onUpdate("sideOutScoring", v)} />
        <Toggle label="Confirm before scoring" value={config.confirmScore} onChange={(v) => onUpdate("confirmScore", v)} />
        <Toggle label="Sound effects" value={config.soundEnabled} onChange={(v) => onUpdate("soundEnabled", v)} />

        <div className="mt-6 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <button onClick={onReset} className="w-full py-3 rounded-xl text-sm font-medium" style={{ background: "var(--bg-elevated)", color: "var(--red)" }}>
            Reset Score to 0 – 0
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--border)" }}>
      <span className="text-sm" style={{ color: "var(--text)" }}>{label}</span>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--border)" }}>
      <span className="text-sm" style={{ color: "var(--text)" }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        className="w-11 h-6 rounded-full transition-colors relative"
        style={{ background: value ? "var(--accent)" : "var(--bg-elevated)" }}
      >
        <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform" style={{ transform: value ? "translateX(22px)" : "translateX(2px)" }} />
      </button>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-full text-xs font-medium transition-all"
      style={{
        background: active ? "var(--accent)" : "var(--bg-elevated)",
        color: active ? "#fff" : "var(--text-secondary)",
      }}
    >
      {children}
    </button>
  );
}
