"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, DeckMode, getFilteredCards, shuffleArray } from "@/lib/cards";
import CardDisplay from "@/components/CardDisplay";
import ScoreKeeper from "@/components/ScoreKeeper";
import DeckModeSelector from "@/components/DeckModeSelector";
import CardHistory from "@/components/CardHistory";

export default function Home() {
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [history, setHistory] = useState<Card[]>([]);
  const [mode, setMode] = useState<DeckMode>("chaos");
  const [score, setScore] = useState({ team1: 0, team2: 0 });
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    fetch("/cards.json")
      .then((r) => r.json())
      .then((data) => setAllCards(data));
  }, []);

  const startGame = useCallback(
    (selectedMode: DeckMode) => {
      const filtered = getFilteredCards(allCards, selectedMode);
      setDeck(shuffleArray(filtered));
      setCurrentCard(null);
      setHistory([]);
      setScore({ team1: 0, team2: 0 });
      setMode(selectedMode);
      setGameStarted(true);
    },
    [allCards]
  );

  const drawCard = () => {
    if (deck.length === 0) {
      const filtered = getFilteredCards(allCards, mode);
      const reshuffled = shuffleArray(filtered);
      setDeck(reshuffled.slice(1));
      setCurrentCard(reshuffled[0]);
      setHistory((prev) => [reshuffled[0], ...prev].slice(0, 10));
      return;
    }
    const [next, ...rest] = deck;
    setDeck(rest);
    setCurrentCard(next);
    setHistory((prev) => [next, ...prev].slice(0, 10));
  };

  const handleScore = (team: 1 | 2) => {
    setScore((prev) => ({
      ...prev,
      [team === 1 ? "team1" : "team2"]: prev[team === 1 ? "team1" : "team2"] + 1,
    }));
  };

  const handleUndo = (team: 1 | 2) => {
    setScore((prev) => {
      const key = team === 1 ? "team1" : "team2";
      return { ...prev, [key]: Math.max(0, prev[key] - 1) };
    });
  };

  const handleResetScore = () => {
    setScore({ team1: 0, team2: 0 });
  };

  const handleModeChange = (newMode: DeckMode) => {
    startGame(newMode);
  };

  const cardCounts = Object.fromEntries(
    (["family", "party", "drill", "tournament", "chaos"] as DeckMode[]).map((m) => [
      m,
      getFilteredCards(allCards, m).length,
    ])
  ) as Record<DeckMode, number>;

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-8 p-6">
        <div className="text-center">
          <h1 className="text-5xl font-black mb-2">🏓 PICKLEBALL SHUFFLE</h1>
          <p className="text-gray-400 text-lg">Draw twist cards. Shake up the game.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl w-full">
          {(Object.entries({
            family: { emoji: "👨‍👩‍👧‍👦", label: "Family", desc: "Fun for all ages", color: "from-blue-600 to-blue-800" },
            party: { emoji: "🎉", label: "Party", desc: "Laughs, dares & drinks", color: "from-pink-600 to-rose-800" },
            drill: { emoji: "🎯", label: "Drill", desc: "Sharpen your game", color: "from-orange-600 to-amber-800" },
            tournament: { emoji: "🏆", label: "Tournament", desc: "Competitive twists", color: "from-yellow-600 to-yellow-800" },
            chaos: { emoji: "🌀", label: "Chaos", desc: "All 200 cards. Anything goes.", color: "from-purple-600 to-violet-800" },
          }) as [string, { emoji: string; label: string; desc: string; color: string }][]).map(([key, m]) => (
            <button
              key={key}
              onClick={() => startGame(key as DeckMode)}
              className={`bg-gradient-to-br ${m.color} rounded-2xl p-6 text-left transition-all hover:scale-105 active:scale-95 shadow-xl border border-white/10`}
            >
              <div className="text-4xl mb-2">{m.emoji}</div>
              <div className="text-xl font-bold">{m.label}</div>
              <div className="text-sm text-white/70">{m.desc}</div>
              <div className="text-xs text-white/40 mt-2">
                {cardCounts[key as DeckMode] || "..."} cards
              </div>
            </button>
          ))}
        </div>

        <p className="text-gray-600 text-sm text-center max-w-md">
          200 cards across 10 categories. Pick a deck mode and start shuffling.
          No login. No install. Just play.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center gap-6 p-4 pt-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setGameStarted(false)}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-black">🏓 SHUFFLE</h1>
      </div>

      <DeckModeSelector current={mode} onChange={handleModeChange} cardCounts={cardCounts} />

      <ScoreKeeper score={score} onScore={handleScore} onUndo={handleUndo} onReset={handleResetScore} />

      <CardDisplay card={currentCard} onDraw={drawCard} deckRemaining={deck.length} />

      <CardHistory history={history} />
    </div>
  );
}
