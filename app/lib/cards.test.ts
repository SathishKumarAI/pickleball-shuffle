import { describe, it, expect } from "vitest";
import {
  shuffleArray,
  getFilteredCards,
  DECK_MODES,
  CATEGORIES,
  type Card,
} from "./cards";

const mk = (id: number, category: string): Card => ({
  id,
  category,
  name: `card-${id}`,
  effect: "do thing",
  vibe: "fun",
});

describe("shuffleArray", () => {
  it("preserves length and all elements (is a permutation)", () => {
    const input = Array.from({ length: 50 }, (_, i) => i);
    const out = shuffleArray(input);
    expect(out).toHaveLength(input.length);
    expect([...out].sort((a, b) => a - b)).toEqual(input);
  });

  it("does not mutate the input", () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    shuffleArray(input);
    expect(input).toEqual(copy);
  });

  it("handles empty and single-element arrays", () => {
    expect(shuffleArray([])).toEqual([]);
    expect(shuffleArray([7])).toEqual([7]);
  });
});

describe("getFilteredCards", () => {
  const deck: Card[] = CATEGORIES.map((c, i) => mk(i, c));

  it("returns only cards in the deck mode's categories", () => {
    const drill = getFilteredCards(deck, "drill");
    const cats = new Set(DECK_MODES.drill.categories);
    expect(drill.length).toBe(DECK_MODES.drill.categories.length);
    expect(drill.every((c) => cats.has(c.category))).toBe(true);
  });

  it("chaos mode includes every category", () => {
    const chaos = getFilteredCards(deck, "chaos");
    expect(chaos).toHaveLength(CATEGORIES.length);
  });

  it("returns nothing when no card matches", () => {
    const off = [mk(99, "Not A Real Category")];
    expect(getFilteredCards(off, "family")).toHaveLength(0);
  });
});
