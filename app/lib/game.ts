export interface ScoreEvent {
  team: 1 | 2;
  type: "score" | "undo" | "reset";
  scoreBefore: { team1: number; team2: number };
  scoreAfter: { team1: number; team2: number };
  timestamp: number;
}

export type GameType = "singles" | "doubles" | "mixed-doubles";

export interface GameConfig {
  pointsToWin: number;
  winByTwo: boolean;
  sideOutScoring: boolean;
  confirmScore: boolean;
  scoreLocked: boolean;
  soundEnabled: boolean;
  gameType: GameType;
}

import { Card } from "./cards";

export interface GameSession {
  id: string;
  mode: string;
  /* Custom-deck context (only set when playing a user deck), so resume restores it. */
  customName?: string | null;
  customCards?: Card[] | null;
  score: { team1: number; team2: number };
  servingTeam: 1 | 2;
  serverNumber: 1 | 2;
  history: ScoreEvent[];
  gameNumber: number;
  gamesWon: { team1: number; team2: number };
  gameResults: { team1: number; team2: number }[];
  winner: 1 | 2 | null;
  startTime: number;
  playerNames: { team1: string; team2: string };
  config: GameConfig;
  cardIds: number[];
  drawnCardIds: number[];
  favoriteCardIds: number[];
  skippedCardIds: number[];
}

export const DEFAULT_CONFIG: GameConfig = {
  pointsToWin: 11,
  winByTwo: true,
  sideOutScoring: true,
  confirmScore: false,
  scoreLocked: false,
  soundEnabled: true,
  gameType: "doubles",
};

export function createGame(mode: string, names?: { team1: string; team2: string }): GameSession {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    mode,
    score: { team1: 0, team2: 0 },
    servingTeam: 1,
    serverNumber: 1,
    history: [],
    gameNumber: 1,
    gamesWon: { team1: 0, team2: 0 },
    gameResults: [],
    winner: null,
    startTime: Date.now(),
    playerNames: names || { team1: "Team 1", team2: "Team 2" },
    config: { ...DEFAULT_CONFIG },
    cardIds: [],
    drawnCardIds: [],
    favoriteCardIds: [],
    skippedCardIds: [],
  };
}

export function addScore(game: GameSession, team: 1 | 2): GameSession {
  if (game.config.scoreLocked || game.winner) return game;

  if (game.config.sideOutScoring && team !== game.servingTeam) {
    return sideOut(game);
  }

  const key = team === 1 ? "team1" : "team2";
  const scoreBefore = { ...game.score };
  const scoreAfter = { ...game.score, [key]: game.score[key] + 1 };

  const event: ScoreEvent = { team, type: "score", scoreBefore, scoreAfter, timestamp: Date.now() };

  const winner = checkWin(scoreAfter, game.config);

  return {
    ...game,
    score: scoreAfter,
    history: [...game.history, event],
    winner,
  };
}

export function sideOut(game: GameSession): GameSession {
  const newServingTeam: 1 | 2 = game.servingTeam === 1 ? 2 : 1;
  const newServerNumber: 1 | 2 = game.serverNumber === 1 ? 2 : 1;

  return {
    ...game,
    servingTeam: newServingTeam,
    serverNumber: newServerNumber === 2 ? 1 : newServerNumber,
  };
}

export function undoLast(game: GameSession): GameSession {
  if (game.history.length === 0) return game;

  const lastEvent = game.history[game.history.length - 1];

  return {
    ...game,
    score: lastEvent.scoreBefore,
    history: game.history.slice(0, -1),
    winner: null,
  };
}

export function resetScore(game: GameSession): GameSession {
  const event: ScoreEvent = {
    team: 1,
    type: "reset",
    scoreBefore: { ...game.score },
    scoreAfter: { team1: 0, team2: 0 },
    timestamp: Date.now(),
  };

  return {
    ...game,
    score: { team1: 0, team2: 0 },
    servingTeam: 1,
    serverNumber: 1,
    history: [...game.history, event],
    winner: null,
  };
}

export function startNewGame(game: GameSession): GameSession {
  const results = [...game.gameResults, { ...game.score }];
  const gamesWon = { ...game.gamesWon };
  if (game.winner === 1) gamesWon.team1++;
  if (game.winner === 2) gamesWon.team2++;

  return {
    ...game,
    score: { team1: 0, team2: 0 },
    servingTeam: game.servingTeam === 1 ? 2 : 1,
    serverNumber: 1,
    history: [],
    gameNumber: game.gameNumber + 1,
    gamesWon,
    gameResults: results,
    winner: null,
    startTime: Date.now(),
  };
}

export function checkWin(score: { team1: number; team2: number }, config: GameConfig): 1 | 2 | null {
  const { pointsToWin, winByTwo } = config;
  if (score.team1 >= pointsToWin) {
    if (!winByTwo || score.team1 - score.team2 >= 2) return 1;
  }
  if (score.team2 >= pointsToWin) {
    if (!winByTwo || score.team2 - score.team1 >= 2) return 2;
  }
  return null;
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const STORAGE_KEY = "pickleball-shuffle-game";

export function saveGame(game: GameSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
  } catch {}
}

export function loadGame(): GameSession | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function clearSavedGame() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
