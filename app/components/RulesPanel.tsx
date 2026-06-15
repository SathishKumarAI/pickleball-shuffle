"use client";

import { useState } from "react";
import { BookOpen, Trophy, Layers, Smartphone, HelpCircle, ChevronDown } from "lucide-react";
import { Sheet } from "./HistoryPanel";

type Section = { q: string; a: string };

const HOW_TO_PLAY: Section[] = [
  {
    q: "The basics",
    a: "Play pickleball as usual. Games go to 11 points, win by 2 (you can change this in Settings). Use the on-screen scorekeeper to track each team - tap a team to add a point, and use Side out when the serve changes.",
  },
  {
    q: "Drawing twist cards",
    a: "Between rallies, tap the card to draw a random twist - a shot restriction, a dare, a drill, or a wild swap. The current rule applies to the next rally (or as the card says). Draw a new card whenever you want a fresh twist.",
  },
  {
    q: "Deck modes",
    a: "Family = clean fun for all ages. Party = laughs, dares & drinks. Drill = skill-sharpening restrictions. Tournament = competitive twists. Chaos = all 1,729 cards, anything goes. Pick a mode on the home screen.",
  },
  {
    q: "Winning",
    a: "First team to reach the points target (default 11) by 2 clear points wins. A win celebration pops up - start a new game to keep the match going, or end the match to save it to history.",
  },
];

const USING_APP: Section[] = [
  {
    q: "Scorekeeper",
    a: "Tap a team's side to add a point. Use Side out when serve passes over, Undo to take back the last action, and Reset to set the score back to 0-0 (your match history is kept). The lock button stops accidental taps.",
  },
  {
    q: "Custom decks & favorites",
    a: "Open the menu to build your own deck of cards, or star cards you love so you can find them again under Favorite cards.",
  },
  {
    q: "Match history & backup",
    a: "Finished matches are saved automatically under Match history. Everything lives on your device - use Export backup to save a file, and Import backup to restore it on another device.",
  },
  {
    q: "Install on your phone",
    a: "It's a PWA: open the site in your phone browser and 'Add to Home Screen'. It then works offline like a normal app.",
  },
];

const FAQ: Section[] = [
  {
    q: "Is this app free?",
    a: "Yes - it's made just for fun and personal use only. Not for making sales.",
  },
  {
    q: "Where is my data stored?",
    a: "Entirely on your own device (local storage). There's no account, no server, and no database - nothing is uploaded.",
  },
  {
    q: "How do I request a feature or report a bug?",
    a: "Use Send feedback in the menu, or open an issue on GitHub. Feature requests and feedback are always welcome.",
  },
  {
    q: "Can I change the points to win?",
    a: "Yes - open Settings during a game to adjust points to win and the win-by-two rule.",
  },
];

const TABS = [
  { key: "play", label: "How to play", icon: Trophy, sections: HOW_TO_PLAY },
  { key: "app", label: "Using the app", icon: Smartphone, sections: USING_APP },
  { key: "faq", label: "FAQ", icon: HelpCircle, sections: FAQ },
] as const;

export default function RulesPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("play");
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!open) return null;

  const active = TABS.find((t) => t.key === tab)!;

  return (
    <Sheet title="Rules & help" icon={<BookOpen size={18} />} onClose={onClose}>
      {/* Tabs */}
      <div className="flex items-center gap-1.5 mb-4 p-1 rounded-full" style={{ background: "var(--bg-elevated)" }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setExpanded(null); }}
            className="pressable flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-full text-xs font-semibold transition-colors"
            style={
              tab === key
                ? { background: "var(--accent)", color: "#fff" }
                : { color: "var(--text-secondary)" }
            }
          >
            <Icon size={14} /> <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {/* Accordion of cards */}
      <div className="stagger flex flex-col gap-2">
        {active.sections.map((s) => {
          const isOpen = expanded === s.q;
          return (
            <div
              key={s.q}
              className="rounded-xl overflow-hidden"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : s.q)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{s.q}</span>
                <ChevronDown
                  size={16}
                  className="shrink-0 transition-transform duration-200"
                  style={{ color: "var(--text-muted)", transform: isOpen ? "rotate(180deg)" : "none" }}
                />
              </button>
              {isOpen && (
                <p className="anim-fade-up px-4 pb-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {s.a}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
        <Layers size={12} /> 1,729 twist cards · 10 categories · 5 modes
      </p>
    </Sheet>
  );
}
