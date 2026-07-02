"use client";

import { useState } from "react";
import { BookOpen, Trophy, Layers, Smartphone, HelpCircle, ChevronDown, Languages, Compass } from "lucide-react";
import { Sheet } from "./HistoryPanel";
import { GLOSSARY as GLOSSARY_TERMS } from "@/lib/glossary";

type Section = { q: string; a: string };

// Why use this app + how to get around it — the first thing a newcomer needs.
const WHY_NAV: Section[] = [
  {
    q: "Why use this app?",
    a: "It turns any pickleball game into a party. Between points you draw a 'twist' card - a fun mini-rule for the next rally - while the app keeps score for you. No signup, no cost, works offline on the court, and your data stays on your phone.",
  },
  {
    q: "Do I need to know pickleball?",
    a: "No. Pick a mode, tap the card, and read what it says. Underlined words on a card explain a term when you tap them, and the ? button on any card gives a plain-language 'what this means / how to play it'.",
  },
  {
    q: "Getting around: the card screen",
    a: "Tap the big card (or Draw) to draw a twist. The ? on a card explains it in plain words; the star saves a favourite; Skip swaps for a different card; Back returns home. Tap a team's score to give them the point.",
  },
  {
    q: "Getting around: the menu",
    a: "The menu (top-right) holds My decks (build your own), Match history, Favourite cards, Achievements, Card browser, Rules & help, and Send feedback. Settings (gear) changes points-to-win, sound, theme and Commentator voice.",
  },
  {
    q: "What are deck modes?",
    a: "A deck mode is just a themed set of cards. Family = clean fun, Party = dares & laughs, Drill = skill practice, Tournament = competitive, Chaos = everything. Pick one on the home screen to match your crowd.",
  },
];

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
    q: "Doubles serving (side-out scoring)",
    a: "In traditional scoring only the SERVING team can score. Each doubles team has two servers: if the serving side loses a rally on server 1, their 2nd server serves next (same team); if they lose on server 2, it's a side-out and serve passes to the other team. In Track-a-match you just press 'Won' or 'Lost' for the serving side - no need to tap the other team; the app moves the server for you. Prefer every-point-counts? Pick 'Rally' scoring when you start a Track-a-match game.",
  },
  {
    q: "Winning",
    a: "First team to reach the points target (default 11) by 2 clear points wins the game. Set Match length in Settings (single game, best of 3, or best of 5) - when a team takes the series, a match-complete screen celebrates the winner. Otherwise start the next game to keep going.",
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
    q: "Pause a game",
    a: "Hit Pause in the top bar to freeze the match clock and put scoring on hold - a Paused screen covers the board until you tap Resume. The pause even survives closing the app.",
  },
  {
    q: "Card text styles",
    a: "Cards show concise rules by default. Prefer flavour? Turn on 'Commentator voice' in Settings to read every card in hyped-up courtside-caller style. Switch any time - your choice sticks.",
  },
  {
    q: "Card rarity & the 1,729 deck",
    a: "The deck holds exactly 1,729 unique cards (the Ramanujan 'taxicab' number). Each card shows a rarity badge - most draws are Common, but a Legendary (Golden Zone, Overtime, big multipliers) is a moment. Collect the wild ones!",
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

// Beginner-friendly glossary of pickleball terms - sourced from the shared
// lib/glossary.ts so the Rules tab and the in-card highlighter never drift.
const GLOSSARY: Section[] = GLOSSARY_TERMS.map((t) => ({ q: t.term, a: t.def }));

const TABS = [
  { key: "why", label: "Why & how", icon: Compass, sections: WHY_NAV },
  { key: "play", label: "How to play", icon: Trophy, sections: HOW_TO_PLAY },
  { key: "app", label: "Using the app", icon: Smartphone, sections: USING_APP },
  { key: "terms", label: "Glossary", icon: Languages, sections: GLOSSARY },
  { key: "faq", label: "FAQ", icon: HelpCircle, sections: FAQ },
] as const;

export default function RulesPanel({ open, onClose, onReplayTour }: { open: boolean; onClose: () => void; onReplayTour?: () => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("why");
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

      {onReplayTour && (
        <button
          onClick={onReplayTour}
          className="pressable mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold"
          style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
        >
          <Compass size={15} /> Replay welcome tour
        </button>
      )}

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
        <Layers size={12} /> 1,729 twist cards · 10 categories · 5 modes
      </p>
    </Sheet>
  );
}
