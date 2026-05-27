"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, DeckMode, DECK_MODES, getFilteredCards, shuffleArray } from "@/lib/cards";
import { GameSession, GameConfig, createGame, addScore, sideOut, undoLast, resetScore, startNewGame, saveGame, loadGame, clearSavedGame, formatTime } from "@/lib/game";
import { playScoreSound, playUndoSound, playCardFlipSound, playWinSound, playResetSound, triggerHaptic } from "@/lib/sounds";
import CardDisplay from "@/components/CardDisplay";
import ScoreKeeper from "@/components/ScoreKeeper";
import DeckModeSelector from "@/components/DeckModeSelector";
import CardHistory from "@/components/CardHistory";
import WinCelebration from "@/components/WinCelebration";
import PlayerNames from "@/components/PlayerNames";
import GameSettings from "@/components/GameSettings";

export default function Home() {
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [cardHistory, setCardHistory] = useState<Card[]>([]);
  const [game, setGame] = useState<GameSession | null>(null);
  const [elapsed, setElapsed] = useState("0:00");
  const [mode, setMode] = useState<DeckMode>("chaos");
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    fetch("/cards.json")
      .then((r) => r.json())
      .then(setAllCards);
  }, []);

  // Try to resume saved game
  useEffect(() => {
    const saved = loadGame();
    if (saved && allCards.length > 0) {
      setGame(saved);
      setMode(saved.mode as DeckMode);
      const filtered = getFilteredCards(allCards, saved.mode as DeckMode);
      setDeck(shuffleArray(filtered));
    }
  }, [allCards]);

  // Timer
  useEffect(() => {
    if (!game) return;
    const interval = setInterval(() => {
      setElapsed(formatTime(Date.now() - game.startTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [game?.startTime]);

  // Auto-save
  useEffect(() => {
    if (game) saveGame(game);
  }, [game]);

  const startGameHandler = useCallback(
    (selectedMode: DeckMode, names?: { team1: string; team2: string }) => {
      const filtered = getFilteredCards(allCards, selectedMode);
      setDeck(shuffleArray(filtered));
      setCurrentCard(null);
      setCardHistory([]);
      setMode(selectedMode);
      const newGame = createGame(selectedMode, names);
      setGame(newGame);
    },
    [allCards]
  );

  const drawCard = () => {
    if (!game) return;
    let pool = deck;
    if (pool.length === 0) {
      pool = shuffleArray(getFilteredCards(allCards, mode));
    }

    // Skip cards in skip list
    const available = pool.filter((c) => !game.skippedCardIds.includes(c.id));
    const drawFrom = available.length > 0 ? available : pool;

    const [next, ...rest] = drawFrom;
    setDeck(rest.length > 0 ? rest : pool.slice(1));
    setCurrentCard(next);
    setCardHistory((prev) => [next, ...prev].slice(0, 10));

    if (game.config.soundEnabled) {
      playCardFlipSound();
      triggerHaptic("light");
    }

    setGame((g) => g ? { ...g, drawnCardIds: [...g.drawnCardIds, next.id] } : g);
  };

  const handleScore = (team: 1 | 2) => {
    if (!game) return;
    const updated = addScore(game, team);
    setGame(updated);

    if (updated.config.soundEnabled) {
      if (updated.winner) {
        playWinSound();
        triggerHaptic("heavy");
      } else {
        playScoreSound();
        triggerHaptic("light");
      }
    }
  };

  const handleSideOut = () => {
    if (!game) return;
    setGame(sideOut(game));
  };

  const handleUndo = () => {
    if (!game) return;
    setGame(undoLast(game));
    if (game.config.soundEnabled) playUndoSound();
  };

  const handleReset = () => {
    if (!game) return;
    setGame(resetScore(game));
    if (game.config.soundEnabled) playResetSound();
  };

  const handleToggleLock = () => {
    if (!game) return;
    setGame({ ...game, config: { ...game.config, scoreLocked: !game.config.scoreLocked } });
  };

  const handleToggleConfirm = () => {
    if (!game) return;
    setGame({ ...game, config: { ...game.config, confirmScore: !game.config.confirmScore } });
  };

  const handleToggleSideOut = () => {
    if (!game) return;
    setGame({ ...game, config: { ...game.config, sideOutScoring: !game.config.sideOutScoring } });
  };

  const handleConfigUpdate = (key: keyof GameConfig, value: boolean | number) => {
    if (!game) return;
    setGame({ ...game, config: { ...game.config, [key]: value } });
  };

  const handleNewGame = () => {
    if (!game) return;
    setGame(startNewGame(game));
    setCurrentCard(null);
    setCardHistory([]);
    const filtered = getFilteredCards(allCards, mode);
    setDeck(shuffleArray(filtered));
  };

  const handleEndMatch = () => {
    clearSavedGame();
    setGame(null);
    setCurrentCard(null);
    setCardHistory([]);
  };

  const handleModeChange = (newMode: DeckMode) => {
    setMode(newMode);
    const filtered = getFilteredCards(allCards, newMode);
    setDeck(shuffleArray(filtered));
    setCurrentCard(null);
    setCardHistory([]);
  };

  const handlePlayerNames = (names: { team1: string; team2: string }) => {
    if (!game) return;
    setGame({ ...game, playerNames: names });
  };

  const handleFavorite = (cardId: number) => {
    if (!game) return;
    const favs = game.favoriteCardIds.includes(cardId)
      ? game.favoriteCardIds.filter((id) => id !== cardId)
      : [...game.favoriteCardIds, cardId];
    setGame({ ...game, favoriteCardIds: favs });
  };

  const handleSkip = (cardId: number) => {
    if (!game) return;
    const skips = game.skippedCardIds.includes(cardId)
      ? game.skippedCardIds.filter((id) => id !== cardId)
      : [...game.skippedCardIds, cardId];
    setGame({ ...game, skippedCardIds: skips });
  };

  const cardCounts = Object.fromEntries(
    (Object.keys(DECK_MODES) as DeckMode[]).map((m) => [m, getFilteredCards(allCards, m).length])
  ) as Record<DeckMode, number>;

  // Landing page
  if (!game) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-gray-950 text-white" : "bg-white text-gray-900"} flex flex-col items-center justify-center gap-8 p-6`}>
        <div className="text-center">
          <h1 className="text-5xl font-black mb-2">🏓 PICKLEBALL SHUFFLE</h1>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-lg`}>Draw twist cards. Shake up the game.</p>
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
              onClick={() => startGameHandler(key as DeckMode)}
              className={`bg-gradient-to-br ${m.color} rounded-2xl p-6 text-left transition-all hover:scale-105 active:scale-95 shadow-xl border border-white/10`}
            >
              <div className="text-4xl mb-2">{m.emoji}</div>
              <div className="text-xl font-bold text-white">{m.label}</div>
              <div className="text-sm text-white/70">{m.desc}</div>
              <div className="text-xs text-white/40 mt-2">{cardCounts[key as DeckMode] || "..."} cards</div>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-4 py-2 rounded-full ${darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-700"}`}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <p className={`${darkMode ? "text-gray-600" : "text-gray-400"} text-sm text-center max-w-md`}>
          200 cards. 10 categories. 5 deck modes. No login. No install. Just play.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center gap-4 p-4 pt-4">
      {/* Header */}
      <div className="flex items-center gap-4 w-full max-w-md justify-between">
        <button
          onClick={() => { clearSavedGame(); setGame(null); }}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          ← Menu
        </button>
        <h1 className="text-xl font-black">🏓 SHUFFLE</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="text-sm text-gray-500 hover:text-gray-300"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      <DeckModeSelector current={mode} onChange={handleModeChange} cardCounts={cardCounts} />

      <PlayerNames names={game.playerNames} onSave={handlePlayerNames} />

      <ScoreKeeper
        game={game}
        onScore={handleScore}
        onSideOut={handleSideOut}
        onUndo={handleUndo}
        onReset={handleReset}
        onToggleLock={handleToggleLock}
        onToggleConfirm={handleToggleConfirm}
        onToggleSideOut={handleToggleSideOut}
        elapsed={elapsed}
      />

      <GameSettings config={game.config} onUpdate={handleConfigUpdate} />

      <CardDisplay
        card={currentCard}
        onDraw={drawCard}
        deckRemaining={deck.length}
        isFavorite={currentCard ? game.favoriteCardIds.includes(currentCard.id) : false}
        onFavorite={currentCard ? () => handleFavorite(currentCard.id) : undefined}
        onSkip={currentCard ? () => handleSkip(currentCard.id) : undefined}
      />

      <CardHistory history={cardHistory} />

      {/* Win celebration */}
      {game.winner && (
        <WinCelebration
          winnerName={game.winner === 1 ? game.playerNames.team1 : game.playerNames.team2}
          score={game.score}
          onNewGame={handleNewGame}
          onEndMatch={handleEndMatch}
        />
      )}
    </div>
  );
}
