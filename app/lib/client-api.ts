import { GameSession } from "./game";
import { Card } from "./cards";

/*
 * Local-first store — everything lives in localStorage. No accounts, no server.
 * Export/import lets users back up or move their data between devices manually.
 */

const DECKS_KEY = "pb-custom-decks";
const MATCHES_KEY = "pb-match-history";
const FAVORITES_KEY = "pb-favorites";

export interface CustomDeck {
  id: string;
  name: string;
  description: string;
  cards: { name: string; effect: string; category: string }[];
  created_at: number;
}

export interface SavedMatch {
  id: string;
  mode: string;
  team1_name: string;
  team2_name: string;
  score_team1: number;
  score_team2: number;
  winner: number | null;
  game_number: number;
  duration_ms: number;
  results: { team1: number; team2: number }[];
  created_at: number;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ─── Custom decks ─── */
export function listDecks(): CustomDeck[] {
  return read<CustomDeck[]>(DECKS_KEY, []).sort((a, b) => b.created_at - a.created_at);
}
export function saveDeck(deck: { name: string; description: string; cards: CustomDeck["cards"] }): CustomDeck {
  const decks = read<CustomDeck[]>(DECKS_KEY, []);
  const created: CustomDeck = { id: uid(), created_at: Date.now(), ...deck };
  write(DECKS_KEY, [created, ...decks]);
  return created;
}
export function deleteDeck(id: string) {
  write(DECKS_KEY, read<CustomDeck[]>(DECKS_KEY, []).filter((d) => d.id !== id));
}

/* ─── Match history ─── */
export function listMatches(): SavedMatch[] {
  return read<SavedMatch[]>(MATCHES_KEY, []).sort((a, b) => b.created_at - a.created_at);
}
export function addMatch(g: GameSession) {
  const matches = read<SavedMatch[]>(MATCHES_KEY, []);
  const match: SavedMatch = {
    id: uid(),
    mode: g.mode,
    team1_name: g.playerNames.team1,
    team2_name: g.playerNames.team2,
    score_team1: g.score.team1,
    score_team2: g.score.team2,
    winner: g.winner,
    game_number: g.gameNumber,
    duration_ms: Date.now() - g.startTime,
    results: g.gameResults,
    created_at: Date.now(),
  };
  write(MATCHES_KEY, [match, ...matches].slice(0, 200));
}
export function clearMatches() {
  write(MATCHES_KEY, []);
}

/* ─── Favorite cards (persist across games) ─── */
export function listFavoriteIds(): number[] {
  return read<number[]>(FAVORITES_KEY, []);
}
export function toggleFavorite(id: number): number[] {
  const cur = read<number[]>(FAVORITES_KEY, []);
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur];
  write(FAVORITES_KEY, next);
  return next;
}

/* ─── Export / import (backup) ─── */
export function exportData(): string {
  return JSON.stringify(
    { version: 1, decks: listDecks(), matches: listMatches(), favorites: listFavoriteIds() },
    null,
    2
  );
}
export function importData(json: string): { decks: number; matches: number } {
  const data = JSON.parse(json);
  if (Array.isArray(data.decks)) write(DECKS_KEY, data.decks);
  if (Array.isArray(data.matches)) write(MATCHES_KEY, data.matches);
  if (Array.isArray(data.favorites)) write(FAVORITES_KEY, data.favorites);
  return { decks: data.decks?.length ?? 0, matches: data.matches?.length ?? 0 };
}

/* Turn a custom deck's cards into playable Card objects (negative ids avoid clashing). */
export function deckToCards(deck: CustomDeck): Card[] {
  return deck.cards.map((c, i) => ({
    id: -(i + 1),
    category: c.category || "Wacky / Chaos",
    name: c.name,
    effect: c.effect,
    vibe: "",
  }));
}
