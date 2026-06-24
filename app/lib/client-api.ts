import { GameSession } from "./game";
import { Card, CATEGORIES } from "./cards";

/*
 * Local-first store - everything lives in localStorage. No accounts, no server.
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

// Lifetime win/loss per team name, most wins first (backlog F111). No accounts,
// so records are keyed by the names players type in.
export function playerRecords(): { name: string; wins: number; played: number }[] {
  const map = new Map<string, { wins: number; played: number }>();
  for (const g of listMatches()) {
    for (const [name, won] of [
      [g.team1_name, g.winner === 1],
      [g.team2_name, g.winner === 2],
    ] as const) {
      if (!name?.trim()) continue;
      const r = map.get(name) ?? { wins: 0, played: 0 };
      r.played += 1;
      if (won) r.wins += 1;
      map.set(name, r);
    }
  }
  return [...map.entries()]
    .map(([name, r]) => ({ name, ...r }))
    .sort((a, b) => b.wins - a.wins || b.played - a.played);
}

// Match history as CSV for spreadsheets/backup (backlog F116).
export function matchesToCsv(): string {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = ["date", "mode", "team1", "score1", "team2", "score2", "winner", "games", "minutes"];
  const rows = listMatches().map((g) => [
    new Date(g.created_at).toISOString(),
    g.mode,
    g.team1_name,
    g.score_team1,
    g.team2_name,
    g.score_team2,
    g.winner === 1 ? g.team1_name : g.winner === 2 ? g.team2_name : "",
    g.results.length || g.game_number,
    Math.round(g.duration_ms / 60000),
  ]);
  return [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
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

/* ─── Deck share codes (backlog F042 / F043) ─── */
// Encode a deck to a compact URL-safe base64 code, importable on another device.
export function encodeDeck(d: { name: string; description: string; cards: CustomDeck["cards"] }): string {
  const payload = { n: d.name, d: d.description, c: d.cards.map((c) => ({ n: c.name, e: c.effect, k: c.category })) };
  const json = JSON.stringify(payload);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeDeck(code: string): { name: string; description: string; cards: CustomDeck["cards"] } | null {
  try {
    const b64 = code.trim().replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(b64)));
    const p = JSON.parse(json);
    if (!p || !Array.isArray(p.c)) return null;
    const cats = new Set<string>(CATEGORIES);
    const cards = p.c
      .filter((x: { n?: string; e?: string }) => x && x.n && x.e)
      .map((x: { n: string; e: string; k?: string }) => ({
        name: String(x.n).slice(0, 80),
        effect: String(x.e).slice(0, 300),
        category: cats.has(String(x.k)) ? String(x.k) : CATEGORIES[0],
      }));
    if (cards.length === 0) return null;
    return {
      name: String(p.n || "Imported deck").slice(0, 60),
      description: String(p.d || "").slice(0, 120),
      cards,
    };
  } catch {
    return null;
  }
}

// Decode + save a shared deck. Returns the saved deck, or null if the code is bad.
export function importDeckCode(code: string): CustomDeck | null {
  const d = decodeDeck(code);
  if (!d) return null;
  return saveDeck(d);
}

/* Turn a custom deck's cards into playable Card objects (negative ids avoid clashing). */
// Wipe every local trace of the user's data (backlog F342). Local-first means
// there's nothing on a server to delete - clearing these keys is a full erase.
export function clearAllData() {
  try {
    [DECKS_KEY, MATCHES_KEY, FAVORITES_KEY, "pickleball-shuffle-game", "pb-beginner-intro-seen"].forEach((k) =>
      localStorage.removeItem(k),
    );
  } catch {}
}

export function deckToCards(deck: CustomDeck): Card[] {
  return deck.cards.map((c, i) => ({
    id: -(i + 1),
    category: c.category || "Wacky / Chaos",
    name: c.name,
    effect: c.effect,
    vibe: "",
  }));
}
