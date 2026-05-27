"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, DeckMode, DECK_MODES, getFilteredCards, shuffleArray } from "@/lib/cards";
import { GameSession, GameConfig, createGame, addScore, sideOut, undoLast, resetScore, startNewGame, saveGame, loadGame, clearSavedGame, formatTime } from "@/lib/game";
import { playScoreSound, playUndoSound, playCardFlipSound, playWinSound, playResetSound, triggerHaptic } from "@/lib/sounds";
import TopBar from "@/components/TopBar";
import CardDisplay from "@/components/CardDisplay";
import ScoreKeeper from "@/components/ScoreKeeper";
import CardHistory from "@/components/CardHistory";
import WinCelebration from "@/components/WinCelebration";
import PlayerNames from "@/components/PlayerNames";
import SettingsSheet from "@/components/SettingsSheet";

export default function Home() {
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [cardHistory, setCardHistory] = useState<Card[]>([]);
  const [game, setGame] = useState<GameSession | null>(null);
  const [elapsed, setElapsed] = useState("0:00");
  const [mode, setMode] = useState<DeckMode>("chaos");
  const [darkMode, setDarkMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showNameEditor, setShowNameEditor] = useState(false);
  const [confirmTeam, setConfirmTeam] = useState<1 | 2 | null>(null);

  useEffect(() => {
    fetch("/cards.json").then((r) => r.json()).then(setAllCards);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  useEffect(() => {
    const saved = loadGame();
    if (saved && allCards.length > 0) {
      setGame(saved);
      setMode(saved.mode as DeckMode);
      setDeck(shuffleArray(getFilteredCards(allCards, saved.mode as DeckMode)));
    }
  }, [allCards]);

  useEffect(() => {
    if (!game) return;
    const i = setInterval(() => setElapsed(formatTime(Date.now() - game.startTime)), 1000);
    return () => clearInterval(i);
  }, [game?.startTime]);

  useEffect(() => { if (game) saveGame(game); }, [game]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const startGameHandler = useCallback((m: DeckMode, names?: { team1: string; team2: string }) => {
    const filtered = getFilteredCards(allCards, m);
    setDeck(shuffleArray(filtered));
    setCurrentCard(null);
    setCardHistory([]);
    setMode(m);
    setGame(createGame(m, names));
  }, [allCards]);

  const drawCard = () => {
    if (!game) return;
    let pool = deck.length > 0 ? deck : shuffleArray(getFilteredCards(allCards, mode));
    const available = pool.filter((c) => !game.skippedCardIds.includes(c.id));
    const drawFrom = available.length > 0 ? available : pool;
    const [next, ...rest] = drawFrom;
    setDeck(rest.length > 0 ? rest : pool.slice(1));
    setCurrentCard(next);
    setCardHistory((prev) => [next, ...prev].slice(0, 10));
    if (game.config.soundEnabled) { playCardFlipSound(); triggerHaptic("light"); }
    setGame((g) => g ? { ...g, drawnCardIds: [...g.drawnCardIds, next.id] } : g);
  };

  const handleScore = (team: 1 | 2) => {
    if (!game) return;
    if (game.config.confirmScore) { setConfirmTeam(team); return; }
    applyScore(team);
  };

  const applyScore = (team: 1 | 2) => {
    if (!game) return;
    const updated = addScore(game, team);
    setGame(updated);
    if (updated.config.soundEnabled) {
      if (updated.winner) { playWinSound(); triggerHaptic("heavy"); }
      else { playScoreSound(); triggerHaptic("light"); }
    }
    setConfirmTeam(null);
  };

  const handleModeChange = (m: DeckMode) => {
    setMode(m);
    setDeck(shuffleArray(getFilteredCards(allCards, m)));
    setCurrentCard(null);
    setCardHistory([]);
  };

  const handleConfigUpdate = (key: keyof GameConfig, value: boolean | number | string) => {
    if (!game) return;
    setGame({ ...game, config: { ...game.config, [key]: value } as GameConfig });
  };

  const cardCounts = Object.fromEntries(
    (Object.keys(DECK_MODES) as DeckMode[]).map((m) => [m, getFilteredCards(allCards, m).length])
  ) as Record<DeckMode, number>;

  /* ─── Landing Page ─── */
  if (!game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-10 p-6" style={{ background: "var(--bg)" }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🏓</div>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: "var(--text)" }}>Pickleball Shuffle</h1>
          <p className="mt-2 text-base" style={{ color: "var(--text-secondary)" }}>Draw twist cards. Shake up the game.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-sm">
          {(Object.entries({
            family: { emoji: "👨‍👩‍👧‍👦", label: "Family", desc: "Fun for all ages" },
            party: { emoji: "🎉", label: "Party", desc: "Laughs & dares" },
            drill: { emoji: "🎯", label: "Drill", desc: "Sharpen skills" },
            tournament: { emoji: "🏆", label: "Tournament", desc: "Competitive" },
            chaos: { emoji: "🌀", label: "Chaos", desc: "All 200 cards" },
          }) as [string, { emoji: string; label: string; desc: string }][]).map(([key, m]) => (
            <button
              key={key}
              onClick={() => startGameHandler(key as DeckMode)}
              className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <span className="text-3xl">{m.emoji}</span>
              <div>
                <div className="text-base font-semibold" style={{ color: "var(--text)" }}>{m.label}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {m.desc} · {cardCounts[key as DeckMode]} cards
                </div>
              </div>
            </button>
          ))}
        </div>

        <button onClick={() => setDarkMode(!darkMode)} className="text-xs px-4 py-2 rounded-full" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>
    );
  }

  /* ─── Game Screen ─── */
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <TopBar
        game={game}
        mode={mode}
        elapsed={elapsed}
        darkMode={darkMode}
        onBack={() => { clearSavedGame(); setGame(null); }}
        onToggleDark={() => setDarkMode(!darkMode)}
        onModeChange={handleModeChange}
        onEditNames={() => setShowNameEditor(!showNameEditor)}
        onToggleLock={() => setGame({ ...game, config: { ...game.config, scoreLocked: !game.config.scoreLocked } })}
        onUndo={() => { setGame(undoLast(game)); if (game.config.soundEnabled) playUndoSound(); }}
        onReset={() => setShowSettings(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      <div className="flex-1 flex flex-col items-center gap-4 p-4 max-w-lg mx-auto w-full">
        {/* Name editor */}
        {showNameEditor && (
          <PlayerNames
            names={game.playerNames}
            onSave={(names) => { setGame({ ...game, playerNames: names }); setShowNameEditor(false); }}
          />
        )}

        {/* Score */}
        <ScoreKeeper game={game} onScore={handleScore} onSideOut={() => setGame(sideOut(game))} />

        {/* Confirm dialog */}
        {confirmTeam && (
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              +1 {confirmTeam === 1 ? game.playerNames.team1 : game.playerNames.team2}?
            </span>
            <button onClick={() => applyScore(confirmTeam)} className="px-4 py-1.5 rounded-full text-xs font-medium text-white" style={{ background: "var(--accent)" }}>Yes</button>
            <button onClick={() => setConfirmTeam(null)} className="px-4 py-1.5 rounded-full text-xs font-medium" style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}>No</button>
          </div>
        )}

        {/* Card */}
        <CardDisplay
          card={currentCard}
          onDraw={drawCard}
          deckRemaining={deck.length}
          isFavorite={currentCard ? game.favoriteCardIds.includes(currentCard.id) : false}
          onFavorite={currentCard ? () => {
            const favs = game.favoriteCardIds.includes(currentCard.id)
              ? game.favoriteCardIds.filter((id) => id !== currentCard.id)
              : [...game.favoriteCardIds, currentCard.id];
            setGame({ ...game, favoriteCardIds: favs });
          } : undefined}
          onSkip={currentCard ? () => {
            setGame({ ...game, skippedCardIds: [...game.skippedCardIds, currentCard.id] });
          } : undefined}
        />

        {/* History */}
        <CardHistory history={cardHistory} />
      </div>

      {/* Settings sheet */}
      <SettingsSheet
        config={game.config}
        open={showSettings}
        onClose={() => setShowSettings(false)}
        onUpdate={handleConfigUpdate}
        onReset={() => { setGame(resetScore(game)); if (game.config.soundEnabled) playResetSound(); setShowSettings(false); }}
      />

      {/* Win */}
      {game.winner && (
        <WinCelebration
          winnerName={game.winner === 1 ? game.playerNames.team1 : game.playerNames.team2}
          score={game.score}
          onNewGame={() => { setGame(startNewGame(game)); setCurrentCard(null); setCardHistory([]); setDeck(shuffleArray(getFilteredCards(allCards, mode))); }}
          onEndMatch={() => { clearSavedGame(); setGame(null); }}
        />
      )}
    </div>
  );
}
