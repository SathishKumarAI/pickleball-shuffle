"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, DeckMode, DECK_MODES, getFilteredCards, shuffleArray } from "@/lib/cards";
import { GameSession, GameConfig, createGame, addScore, sideOut, undoLast, resetScore, startNewGame, saveGame, loadGame, clearSavedGame, formatTime } from "@/lib/game";
import { playScoreSound, playUndoSound, playCardFlipSound, playWinSound, playResetSound, triggerHaptic } from "@/lib/sounds";
import { addMatch, deckToCards, CustomDeck, listFavoriteIds, toggleFavorite } from "@/lib/client-api";
import { Sun, Moon, Play, X, Bug } from "lucide-react";
import TopBar from "@/components/TopBar";
import CardDisplay from "@/components/CardDisplay";
import ScoreKeeper from "@/components/ScoreKeeper";
import CardHistory from "@/components/CardHistory";
import WinCelebration from "@/components/WinCelebration";
import PlayerNames from "@/components/PlayerNames";
import SettingsSheet from "@/components/SettingsSheet";
import AppMenu from "@/components/AppMenu";
import HistoryPanel from "@/components/HistoryPanel";
import DecksPanel from "@/components/DecksPanel";
import FavoritesPanel from "@/components/FavoritesPanel";
import FeedbackPanel from "@/components/FeedbackPanel";
import RulesPanel from "@/components/RulesPanel";
import { MODE_ICONS } from "@/components/icons";

const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/SathishKumarAI/pickleball-shuffle";

const LANDING_MODES: { key: DeckMode; label: string; desc: string }[] = [
  { key: "family", label: "Family", desc: "Fun for all ages" },
  { key: "party", label: "Party", desc: "Laughs & dares" },
  { key: "drill", label: "Drill", desc: "Sharpen skills" },
  { key: "tournament", label: "Tournament", desc: "Competitive" },
  { key: "chaos", label: "Chaos", desc: "All 200 cards" },
];

export default function Home() {
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [cardHistory, setCardHistory] = useState<Card[]>([]);
  const [game, setGame] = useState<GameSession | null>(null);
  const [savedGame, setSavedGame] = useState<GameSession | null>(null);
  const [elapsed, setElapsed] = useState("0:00");
  const [mode, setMode] = useState<DeckMode>("chaos");
  const [customCards, setCustomCards] = useState<Card[] | null>(null);
  const [customName, setCustomName] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showNameEditor, setShowNameEditor] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDecks, setShowDecks] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [confirmTeam, setConfirmTeam] = useState<1 | 2 | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const savedMatchRef = useRef<string | null>(null);

  useEffect(() => {
    fetch("/cards.json", { cache: "no-store" }).then((r) => r.json()).then(setAllCards);
    setFavoriteIds(listFavoriteIds());
    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      } else {
        navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
        if ("caches" in window) caches.keys().then((ks) => ks.forEach((k) => caches.delete(k)));
      }
    }
  }, []);

  // Offer to resume an unfinished game (don't auto-enter — let the user choose).
  useEffect(() => {
    const saved = loadGame();
    if (saved && !saved.winner) setSavedGame(saved);
  }, [allCards]);

  const resumeGame = useCallback(() => {
    if (!savedGame) return;
    const m = savedGame.mode as DeckMode;
    const custom = savedGame.customCards ?? null;
    setMode(m);
    setCustomCards(custom);
    setCustomName(savedGame.customName ?? null);
    const pool = custom ?? getFilteredCards(allCards, m);
    setDeck(shuffleArray(pool));
    // Restore the last drawn card + recent history from the saved game's own pool.
    const byId = new Map(pool.map((c) => [c.id, c] as const));
    const drawn = savedGame.drawnCardIds;
    setCurrentCard(drawn.length ? byId.get(drawn[drawn.length - 1]) ?? null : null);
    setCardHistory(
      drawn.slice(-3).reverse().map((id) => byId.get(id)).filter(Boolean) as Card[]
    );
    setGame(savedGame);
    setSavedGame(null);
  }, [savedGame, allCards]);

  const discardSaved = useCallback(() => {
    clearSavedGame();
    setSavedGame(null);
  }, []);

  useEffect(() => {
    if (!game) return;
    const i = setInterval(() => setElapsed(formatTime(Date.now() - game.startTime)), 1000);
    return () => clearInterval(i);
  }, [game?.startTime]);

  useEffect(() => { if (game) saveGame(game); }, [game]);

  // Persist a finished match to local history exactly once.
  useEffect(() => {
    if (game?.winner && savedMatchRef.current !== game.id + ":" + game.gameNumber) {
      savedMatchRef.current = game.id + ":" + game.gameNumber;
      addMatch(game);
    }
  }, [game?.winner, game?.gameNumber, game?.id]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", darkMode ? "#0e0e11" : "#f4f4f6");
  }, [darkMode]);

  const basePool = useCallback(
    () => customCards ?? getFilteredCards(allCards, mode),
    [customCards, allCards, mode]
  );

  const startGameHandler = useCallback((m: DeckMode) => {
    setSavedGame(null);
    setCustomCards(null);
    setCustomName(null);
    setDeck(shuffleArray(getFilteredCards(allCards, m)));
    setCurrentCard(null);
    setCardHistory([]);
    setMode(m);
    setGame(createGame(m));
  }, [allCards]);

  const startCustomDeck = useCallback((d: CustomDeck) => {
    setSavedGame(null);
    const cards = deckToCards(d);
    setCustomCards(cards);
    setCustomName(d.name);
    setMode("chaos");
    setDeck(shuffleArray(cards));
    setCurrentCard(null);
    setCardHistory([]);
    setShowDecks(false);
    const g = createGame("chaos");
    g.customName = d.name;
    g.customCards = cards;
    setGame(g);
    triggerHaptic("light");
  }, []);

  const drawCard = () => {
    if (!game) return;
    const pool = deck.length > 0 ? deck : shuffleArray(basePool());
    const available = pool.filter((c) => !game.skippedCardIds.includes(c.id));
    const drawFrom = available.length > 0 ? available : pool;
    const [next, ...rest] = drawFrom;
    setDeck(rest.length > 0 ? rest : pool.slice(1));
    setCurrentCard(next);
    setCardHistory((prev) => [next, ...prev].slice(0, 3));
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
    setCustomCards(null);
    setCustomName(null);
    setMode(m);
    setDeck(shuffleArray(getFilteredCards(allCards, m)));
    setCurrentCard(null);
    setCardHistory([]);
  };

  const handleConfigUpdate = (key: keyof GameConfig, value: boolean | number | string) => {
    if (!game) return;
    setGame({ ...game, config: { ...game.config, [key]: value } as GameConfig });
  };

  // Reset = clean slate for THIS game (score, undo stack, on-screen card/draws).
  // Saved Match history is intentionally left untouched.
  const doReset = () => {
    if (!game) return;
    setGame(resetScore(game));
    setCurrentCard(null);
    setCardHistory([]);
    if (game.config.soundEnabled) playResetSound();
  };

  const cardCounts = Object.fromEntries(
    (Object.keys(DECK_MODES) as DeckMode[]).map((m) => [m, getFilteredCards(allCards, m).length])
  ) as Record<DeckMode, number>;

  const favoriteCards = favoriteIds
    .map((id) => allCards.find((c) => c.id === id) ?? customCards?.find((c) => c.id === id))
    .filter(Boolean) as Card[];

  /* ─── Landing Page ─── */
  if (!game) {
    return (
      <>
        <div className="mesh-bg flex flex-col" style={{ background: "var(--bg)", minHeight: "100dvh" }}>
          {/* Header (no overlap with content) */}
          <header className="safe-top safe-x flex items-center justify-end gap-2 pb-2">
            <button onClick={() => setDarkMode(!darkMode)} className="pressable p-2 rounded-full" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }} aria-label="Toggle theme">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <AppMenu onOpenHistory={() => setShowHistory(true)} onOpenDecks={() => setShowDecks(true)} onOpenFavorites={() => setShowFavorites(true)} onOpenFeedback={() => setShowFeedback(true)} onOpenRules={() => setShowRules(true)} />
          </header>

          <main className="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-8 safe-bottom">
          <div className="text-center anim-fade-up">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/app-icon.svg"
              alt="Pickleball Card Games"
              width={80}
              height={80}
              className="inline-block w-20 h-20 rounded-3xl mb-4 anim-float"
              style={{ boxShadow: "0 12px 34px -8px var(--accent-glow)" }}
            />
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: "var(--text)" }}>
              Pickleball <span style={{ color: "var(--accent)" }}>Card Games</span>
            </h1>
            <p className="mt-2 text-base" style={{ color: "var(--text-secondary)" }}>Draw twist cards. Shake up the game.</p>
          </div>

          {/* Resume last game */}
          {savedGame && (
            <div className="anim-pop w-full max-w-sm flex items-center gap-3 p-3 rounded-2xl glass" style={{ border: "1px solid var(--accent)" }}>
              <button onClick={resumeGame} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                <span className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0 text-white" style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dim))" }}>
                  <Play size={20} fill="currentColor" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold" style={{ color: "var(--text)" }}>Resume last game</span>
                  <span className="block text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {savedGame.playerNames.team1} {savedGame.score.team1}–{savedGame.score.team2} {savedGame.playerNames.team2} · {savedGame.customName ?? DECK_MODES[savedGame.mode as DeckMode]?.label ?? savedGame.mode}
                  </span>
                </span>
              </button>
              <button onClick={discardSaved} className="pressable p-1.5 rounded-full shrink-0" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }} aria-label="Discard saved game">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="stagger grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-sm">
            {LANDING_MODES.map(({ key, label, desc }) => {
              const Icon = MODE_ICONS[key];
              return (
                <button
                  key={key}
                  onClick={() => { triggerHaptic("light"); startGameHandler(key); }}
                  className="group pressable glass flex items-center gap-4 p-4 rounded-2xl text-left"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <span className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-110"
                        style={{ background: "var(--bg-elevated)", color: "var(--accent)" }}>
                    <Icon size={22} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-base font-semibold transition-colors group-hover:text-[var(--accent)]" style={{ color: "var(--text)" }}>{label}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {desc} · {cardCounts[key]} cards
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          </main>

          {/* About / community note */}
          <footer className="safe-x safe-bottom px-6 pb-6 text-center">
            <p className="mx-auto max-w-md text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Made just for fun — free to play and for personal use only, not for making sales.
              Got an idea or hit a bug? Feel free to{" "}
              <a
                href={`${GITHUB_URL}/issues/new`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--accent)" }}
              >
                <Bug size={12} /> request a feature or raise an issue
              </a>{" "}
              on GitHub.
            </p>
          </footer>
        </div>

        <HistoryPanel open={showHistory} onClose={() => setShowHistory(false)} />
        <DecksPanel open={showDecks} onClose={() => setShowDecks(false)} onPlay={startCustomDeck} />
        <FavoritesPanel open={showFavorites} onClose={() => setShowFavorites(false)} cards={favoriteCards} onRemove={(id) => setFavoriteIds(toggleFavorite(id))} />
        <FeedbackPanel open={showFeedback} onClose={() => setShowFeedback(false)} />
        <RulesPanel open={showRules} onClose={() => setShowRules(false)} />
      </>
    );
  }

  /* ─── Game Screen ─── */
  return (
    <div className="mesh-bg flex flex-col" style={{ background: "var(--bg)", minHeight: "100dvh" }}>
      <TopBar
        game={game}
        mode={mode}
        modeLabelOverride={customName}
        elapsed={elapsed}
        darkMode={darkMode}
        onBack={() => { setSavedGame(game); setGame(null); }}
        onToggleDark={() => setDarkMode(!darkMode)}
        onModeChange={handleModeChange}
        onEditNames={() => setShowNameEditor(!showNameEditor)}
        onToggleLock={() => setGame({ ...game, config: { ...game.config, scoreLocked: !game.config.scoreLocked } })}
        onUndo={() => { setGame(undoLast(game)); if (game.config.soundEnabled) playUndoSound(); }}
        onReset={() => setConfirmReset(true)}
        onOpenSettings={() => setShowSettings(true)}
        menuSlot={<AppMenu onOpenHistory={() => setShowHistory(true)} onOpenDecks={() => setShowDecks(true)} onOpenFavorites={() => setShowFavorites(true)} onOpenFeedback={() => setShowFeedback(true)} onOpenRules={() => setShowRules(true)} />}
      />

      <div className="flex-1 flex flex-col items-center gap-4 p-4 max-w-lg mx-auto w-full">
        {showNameEditor && (
          <PlayerNames
            names={game.playerNames}
            onSave={(names) => { setGame({ ...game, playerNames: names }); setShowNameEditor(false); }}
          />
        )}

        <ScoreKeeper game={game} onScore={handleScore} onSideOut={() => setGame(sideOut(game))} />

        {confirmTeam && (
          <div className="anim-pop glass flex items-center gap-3 p-3 rounded-xl" style={{ border: "1px solid var(--border)" }}>
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              +1 {confirmTeam === 1 ? game.playerNames.team1 : game.playerNames.team2}?
            </span>
            <button onClick={() => applyScore(confirmTeam)} className="pressable px-4 py-1.5 rounded-full text-xs font-medium text-white" style={{ background: "var(--accent)" }}>Yes</button>
            <button onClick={() => setConfirmTeam(null)} className="pressable px-4 py-1.5 rounded-full text-xs font-medium" style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}>No</button>
          </div>
        )}

        {/* Confirm reset */}
        {confirmReset && (
          <div className="anim-pop glass flex items-center gap-3 p-3 rounded-xl" style={{ border: "1px solid var(--border)" }}>
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Reset score to 0 – 0?</span>
            <button
              onClick={() => { doReset(); setConfirmReset(false); }}
              className="pressable px-4 py-1.5 rounded-full text-xs font-medium text-white"
              style={{ background: "var(--red)" }}
            >
              Reset
            </button>
            <button onClick={() => setConfirmReset(false)} className="pressable px-4 py-1.5 rounded-full text-xs font-medium" style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}>Cancel</button>
          </div>
        )}

        <CardDisplay
          card={currentCard}
          onDraw={drawCard}
          deckRemaining={deck.length}
          isFavorite={currentCard ? favoriteIds.includes(currentCard.id) : false}
          onFavorite={currentCard ? () => setFavoriteIds(toggleFavorite(currentCard.id)) : undefined}
          onSkip={currentCard ? () => {
            setGame({ ...game, skippedCardIds: [...game.skippedCardIds, currentCard.id] });
            drawCard();
          } : undefined}
        />

        <CardHistory history={cardHistory} />
      </div>

      <SettingsSheet
        config={game.config}
        open={showSettings}
        onClose={() => setShowSettings(false)}
        onUpdate={handleConfigUpdate}
        onReset={() => { doReset(); setShowSettings(false); }}
      />

      {game.winner && (
        <WinCelebration
          winnerName={game.winner === 1 ? game.playerNames.team1 : game.playerNames.team2}
          score={game.score}
          onNewGame={() => { setGame(startNewGame(game)); setCurrentCard(null); setCardHistory([]); setDeck(shuffleArray(basePool())); }}
          onEndMatch={() => { clearSavedGame(); setSavedGame(null); setGame(null); }}
        />
      )}

      <HistoryPanel open={showHistory} onClose={() => setShowHistory(false)} />
      <DecksPanel open={showDecks} onClose={() => setShowDecks(false)} onPlay={startCustomDeck} />
      <FavoritesPanel open={showFavorites} onClose={() => setShowFavorites(false)} cards={favoriteCards} onRemove={(id) => setFavoriteIds(toggleFavorite(id))} />
      <FeedbackPanel open={showFeedback} onClose={() => setShowFeedback(false)} />
      <RulesPanel open={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}
