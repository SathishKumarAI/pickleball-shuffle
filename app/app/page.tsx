"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, DeckMode, DECK_MODES, getFilteredCards, getDeck, shuffleArray, SKILL_LEVELS, SkillLevel, selectionLabel } from "@/lib/cards";
import { GameSession, GameConfig, createGame, addScore, adjustScore, sideOut, undoLast, resetScore, startNewGame, newMatch, matchWinner, seriesTally, isPaused, pauseGame, resumePlay, elapsedMs, saveGame, loadGame, clearSavedGame, formatTime } from "@/lib/game";
import { playScoreSound, playUndoSound, playCardFlipSound, playWinSound, playResetSound, triggerHaptic } from "@/lib/sounds";
import { addMatch, deckToCards, CustomDeck, listFavoriteIds, toggleFavorite } from "@/lib/client-api";
import { Sun, Moon, Play, Pause, X, Bug, HelpCircle, Sparkles, Sprout, TrendingUp, Flame } from "lucide-react";
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
import { useFocusTrap } from "@/lib/useFocusTrap";

const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/SathishKumarAI/pickleball-shuffle";

const LANDING_MODES: { key: DeckMode; label: string; desc: string }[] = [
  { key: "family", label: "Family", desc: "Fun for all ages" },
  { key: "party", label: "Party", desc: "Laughs & dares" },
  { key: "drill", label: "Drill", desc: "Sharpen skills" },
  { key: "tournament", label: "Tournament", desc: "Competitive" },
  { key: "chaos", label: "Chaos", desc: "All 1,729 cards" },
];

// Skill levels shown first on the menu, for players picking by ability.
const SKILL_ORDER: { key: SkillLevel; Icon: typeof Sprout }[] = [
  { key: "beginner", Icon: Sprout },
  { key: "intermediate", Icon: TrendingUp },
  { key: "advanced", Icon: Flame },
];

const BEGINNER_INTRO_KEY = "pb-beginner-intro-seen";

export default function Home() {
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [cardHistory, setCardHistory] = useState<Card[]>([]);
  const [game, setGame] = useState<GameSession | null>(null);
  const [savedGame, setSavedGame] = useState<GameSession | null>(null);
  const [elapsed, setElapsed] = useState("0:00");
  const [mode, setMode] = useState<string>("chaos");
  const [showBeginnerIntro, setShowBeginnerIntro] = useState(false);
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
  const introRef = useRef<HTMLDivElement>(null);
  const pauseRef = useRef<HTMLDivElement>(null);

  const dismissIntro = useCallback(() => {
    try { localStorage.setItem(BEGINNER_INTRO_KEY, "1"); } catch {}
    setShowBeginnerIntro(false);
  }, []);
  useFocusTrap(introRef, showBeginnerIntro, dismissIntro);
  const paused = !!game && isPaused(game) && !game.winner;
  const resumeFromPause = useCallback(() => {
    setGame((g) => (g && isPaused(g) ? resumePlay(g, Date.now()) : g));
  }, []);
  useFocusTrap(pauseRef, paused, resumeFromPause);

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

  // Offer to resume an unfinished game (don't auto-enter - let the user choose).
  useEffect(() => {
    const saved = loadGame();
    if (saved && !saved.winner) setSavedGame(saved);
  }, [allCards]);

  const resumeGame = useCallback(() => {
    if (!savedGame) return;
    const m = savedGame.mode;
    const custom = savedGame.customCards ?? null;
    setMode(m);
    setCustomCards(custom);
    setCustomName(savedGame.customName ?? null);
    const pool = custom ?? getDeck(allCards, m);
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
    const tick = () => setElapsed(formatTime(elapsedMs(game, Date.now())));
    tick();
    if (game.pausedAt) return; // clock frozen while paused
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [game?.startTime, game?.pausedAt, game?.pausedMs]);

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

  // Keep the screen awake during an active game so it doesn't dim mid-match
  // on a phone propped courtside (backlog F188). Re-acquires after the tab
  // returns to the foreground; released when the game ends or unmounts.
  useEffect(() => {
    if (!game || game.winner) return;
    type WakeLockSentinelLike = { release: () => Promise<void> };
    let sentinel: WakeLockSentinelLike | null = null;
    let cancelled = false;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<WakeLockSentinelLike> } };
    const acquire = async () => {
      try {
        if (nav.wakeLock && document.visibilityState === "visible") {
          sentinel = await nav.wakeLock.request("screen");
          if (cancelled) { sentinel.release().catch(() => {}); sentinel = null; }
        }
      } catch {}
    };
    const onVisible = () => { if (document.visibilityState === "visible") acquire(); };
    acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      sentinel?.release().catch(() => {});
    };
  }, [game]);

  const basePool = useCallback(
    () => customCards ?? getDeck(allCards, mode),
    [customCards, allCards, mode]
  );

  const startGameHandler = useCallback((m: string) => {
    setSavedGame(null);
    setCustomCards(null);
    setCustomName(null);
    setDeck(shuffleArray(getDeck(allCards, m)));
    setCurrentCard(null);
    setCardHistory([]);
    setMode(m);
    setGame(createGame(m));
    // First time into Beginner, show a short how-to-play intro.
    if (m === "beginner") {
      try {
        if (!localStorage.getItem(BEGINNER_INTRO_KEY)) setShowBeginnerIntro(true);
      } catch {}
    }
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

  const handleModeChange = (m: string) => {
    setCustomCards(null);
    setCustomName(null);
    setMode(m);
    setDeck(shuffleArray(getDeck(allCards, m)));
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
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight" style={{ color: "var(--text)" }}>
                Pickleball <span style={{ color: "var(--accent)" }}>Card Games</span>
              </h1>
              <button
                onClick={() => setShowRules(true)}
                className="pressable inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                aria-label="How to use this app"
              >
                <HelpCircle size={15} /> How to use
              </button>
            </div>
            <p className="mt-2 text-base" style={{ color: "var(--text-secondary)" }}>Draw twist cards. Shake up the game.</p>
          </div>

          {/* Resume last game */}
          {savedGame && (
            <div className="anim-pop w-full max-w-sm flex items-center gap-3 p-3 rounded-2xl glass" style={{ border: "1px solid var(--accent)" }}>
              <button onClick={resumeGame} className="pressable flex items-center gap-3 flex-1 min-w-0 text-left rounded-xl">
                <span className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0 text-white" style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dim))" }}>
                  <Play size={20} fill="currentColor" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold" style={{ color: "var(--text)" }}>Resume last game</span>
                  <span className="block text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {savedGame.playerNames.team1} {savedGame.score.team1}-{savedGame.score.team2} {savedGame.playerNames.team2} · {savedGame.customName ?? selectionLabel(savedGame.mode)}
                  </span>
                </span>
              </button>
              <button onClick={discardSaved} className="pressable p-1.5 rounded-full shrink-0" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }} aria-label="Discard saved game">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Skill levels first - the gentle on-ramp for newer players */}
          <div className="w-full max-w-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 px-1">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Pick your level</span>
              <span className="flex-1 h-px" style={{ background: "var(--border)" }} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SKILL_ORDER.map(({ key, Icon }) => {
                const lvl = SKILL_LEVELS[key];
                const count = allCards.length ? getDeck(allCards, key).length : 0;
                return (
                  <button
                    key={key}
                    onClick={() => { triggerHaptic("light"); startGameHandler(key); }}
                    className="group pressable glass flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center"
                    style={{ border: "1px solid var(--border)" }}
                    aria-label={`${lvl.label} - ${lvl.description}`}
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl transition-transform duration-300 group-hover:scale-110"
                          style={{ background: "var(--bg-elevated)", color: "var(--accent)" }}>
                      <Icon size={20} />
                    </span>
                    <span className="text-sm font-semibold leading-tight" style={{ color: "var(--text)" }}>{lvl.label}</span>
                    <span className="text-[11px] leading-tight" style={{ color: "var(--text-muted)" }}>{lvl.description}</span>
                    {allCards.length > 0 && (
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{count} cards</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full max-w-sm flex items-center gap-2 px-1 -mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Or a themed deck</span>
            <span className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

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
                      {desc}{allCards.length ? ` · ${cardCounts[key]} cards` : ""}
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
              Made just for fun - free to play and for personal use only, not for making sales.
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
            <p className="mx-auto mt-3 max-w-md text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }} title="1729 = 1³+12³ = 9³+10³, the Hardy–Ramanujan taxicab number">
              <Sparkles size={11} className="inline align-text-bottom" /> Exactly <strong>1,729</strong> cards - the Ramanujan &ldquo;taxicab&rdquo; number: the smallest number that is a sum of two cubes in two ways (1³ + 12³ = 9³ + 10³).
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
        paused={isPaused(game)}
        onTogglePause={() => setGame(isPaused(game) ? resumePlay(game, Date.now()) : pauseGame(game, Date.now()))}
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

        <ScoreKeeper game={game} onScore={handleScore} onSideOut={() => setGame(sideOut(game))} onAdjust={(team, delta) => { setGame(adjustScore(game, team, delta)); triggerHaptic("light"); }} />

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
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Reset score to 0 - 0?</span>
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

        {/* Screen-reader announcement for the latest draw + score (F144) */}
        <div className="sr-only" role="status" aria-live="polite">
          {currentCard ? `Drew ${currentCard.name}. ${currentCard.effect}` : ""}
          {` Score: ${game.playerNames.team1} ${game.score.team1}, ${game.playerNames.team2} ${game.score.team2}.`}
        </div>

        <CardDisplay
          card={currentCard}
          onDraw={drawCard}
          commentary={game.config.commentaryMode && game.mode !== "beginner"}
          large={game.mode === "beginner"}
          onBack={() => { setSavedGame(game); setGame(null); }}
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

      {isPaused(game) && !game.winner && (
        <div role="dialog" aria-modal="true" aria-label="Game paused" className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
          <div ref={pauseRef} tabIndex={-1} className="glass rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl anim-pop outline-none" style={{ border: "1px solid var(--border)" }}>
            <div className="flex justify-center mb-4 anim-float" style={{ color: "var(--accent)" }}>
              <Pause size={64} strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-3xl font-black mb-1" style={{ color: "var(--text)" }}>Paused</h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>{elapsed} elapsed · scoring is on hold</p>
            <button
              autoFocus
              onClick={() => setGame(resumePlay(game, Date.now()))}
              className="pressable w-full flex items-center justify-center gap-2 px-6 py-3 text-white font-bold rounded-full shadow-lg"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dim))" }}
            >
              <Play size={18} fill="currentColor" /> Resume
            </button>
          </div>
        </div>
      )}

      {game.winner && (
        <WinCelebration
          winnerName={game.winner === 1 ? game.playerNames.team1 : game.playerNames.team2}
          score={game.score}
          matchOver={matchWinner(game) !== null}
          seriesWon={seriesTally(game)}
          onNewGame={() => { setGame(startNewGame(game)); setCurrentCard(null); setCardHistory([]); setDeck(shuffleArray(basePool())); }}
          onNewMatch={() => { setGame(newMatch(game)); setCurrentCard(null); setCardHistory([]); setDeck(shuffleArray(basePool())); }}
          onEndMatch={() => { clearSavedGame(); setSavedGame(null); setGame(null); }}
        />
      )}

      {showBeginnerIntro && (
        <div role="dialog" aria-modal="true" aria-label="How to play" className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
          <div ref={introRef} tabIndex={-1} className="glass rounded-3xl p-7 max-w-sm w-full shadow-2xl anim-pop outline-none" style={{ border: "1px solid var(--accent)" }}>
            <div className="flex justify-center mb-3" style={{ color: "var(--accent)" }}>
              <Sprout size={48} strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-2xl font-black text-center mb-1" style={{ color: "var(--text)" }}>Welcome - here&apos;s how to play</h2>
            <p className="text-sm text-center mb-5" style={{ color: "var(--text-muted)" }}>Beginner mode keeps it simple.</p>
            <ol className="flex flex-col gap-3 mb-6">
              {[
                "Tap the card to draw a twist - a simple rule for the next point.",
                "Play that point under the rule. Read the tip if you're unsure.",
                "Tap a team's score to give them the point. First to 11 (win by 2) wins.",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 text-white" style={{ background: "var(--accent)" }}>{i + 1}</span>
                  <span className="text-sm" style={{ color: "var(--text)" }}>{step}</span>
                </li>
              ))}
            </ol>
            <button
              autoFocus
              onClick={dismissIntro}
              className="pressable w-full px-6 py-3 text-white font-bold rounded-full shadow-lg"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dim))" }}
            >
              Got it - let&apos;s play
            </button>
          </div>
        </div>
      )}

      <HistoryPanel open={showHistory} onClose={() => setShowHistory(false)} />
      <DecksPanel open={showDecks} onClose={() => setShowDecks(false)} onPlay={startCustomDeck} />
      <FavoritesPanel open={showFavorites} onClose={() => setShowFavorites(false)} cards={favoriteCards} onRemove={(id) => setFavoriteIds(toggleFavorite(id))} />
      <FeedbackPanel open={showFeedback} onClose={() => setShowFeedback(false)} />
      <RulesPanel open={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}
