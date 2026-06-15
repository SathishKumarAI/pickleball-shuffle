"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, History, Layers, Star, Download, Upload, MessageSquare, BookOpen } from "lucide-react";
import { exportData, importData } from "@/lib/client-api";

export default function AppMenu({
  onOpenHistory,
  onOpenDecks,
  onOpenFavorites,
  onOpenFeedback,
  onOpenRules,
}: {
  onOpenHistory: () => void;
  onOpenDecks: () => void;
  onOpenFavorites: () => void;
  onOpenFeedback: () => void;
  onOpenRules: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const doExport = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pickleball-card-games-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  const doImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const { decks, matches } = importData(String(reader.result));
        alert(`Imported ${decks} deck(s) and ${matches} match(es).`);
      } catch {
        alert("Could not read that backup file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="pressable p-2 rounded-full"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        aria-label="Menu"
      >
        <Menu size={18} />
      </button>

      {open && (
        <div className="anim-pop absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden z-50 shadow-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <Item icon={<BookOpen size={16} />} label="Rules & help" onClick={() => { setOpen(false); onOpenRules(); }} />
          <Item icon={<History size={16} />} label="Match history" onClick={() => { setOpen(false); onOpenHistory(); }} />
          <Item icon={<Star size={16} />} label="Favorite cards" onClick={() => { setOpen(false); onOpenFavorites(); }} />
          <Item icon={<Layers size={16} />} label="Custom decks" onClick={() => { setOpen(false); onOpenDecks(); }} />
          <div style={{ borderTop: "1px solid var(--border)" }}>
            <Item icon={<Download size={16} />} label="Export backup" onClick={doExport} />
            <Item icon={<Upload size={16} />} label="Import backup" onClick={() => fileRef.current?.click()} />
          </div>
          <div style={{ borderTop: "1px solid var(--border)" }}>
            <Item icon={<MessageSquare size={16} />} label="Send feedback" onClick={() => { setOpen(false); onOpenFeedback(); }} />
          </div>
        </div>
      )}

      <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={doImport} />
    </div>
  );
}

function Item({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--bg-elevated)]"
      style={{ color: "var(--text)" }}
    >
      <span style={{ color: "var(--accent)" }}>{icon}</span>
      {label}
    </button>
  );
}
