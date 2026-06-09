# Feature — card data model + deck modes

You are a TypeScript engineer. Your objective is to define the card data model,
the 200-card dataset, the 10 categories, and the 5 themed deck modes with filtering.

<context>
  <categories>Shot Restriction, Body & Movement, Wild Card / Swap, Penalty,
  Bonus / Reward, Social & Party, Strategy / Skill, Wacky / Chaos,
  Court / Environment, Meta & Game-Flow (20 cards each = 200).</categories>
  <deck_modes>family, party, drill, tournament, chaos — each is a subset of
  categories. chaos = all.</deck_modes>
  <card_shape>{ id:number, category:string, name:string, effect:string, vibe:string }</card_shape>
</context>

## Instructions
1. In `lib/cards.ts` define `Card`, the `CATEGORIES` tuple, `DeckMode` type, and a
   `DECK_MODES` record mapping each mode → `{ label, description, categories[] }`.
2. Add `getFilteredCards(cards, mode)` and a Fisher–Yates `shuffleArray<T>()`.
3. In `components/icons.tsx` map each mode and category to a lucide icon
   (`MODE_ICONS`, `CATEGORY_ICONS`, `categoryIcon()`).
4. Author `public/cards.json` with 200 cards (20 per category), each with a punchy
   `name` and a concrete `effect` a player can act on.

## Constraints
- MUST keep card ids 1–200 unique and positive (custom decks will use negatives).
- MUST keep `cards.json` static and served from `public/`.
- MUST NOT hardcode card text in components — always read from `cards.json`.

## Output format
`lib/cards.ts`, `components/icons.tsx`, and a representative slice of `cards.json`
(plus a script or clear instructions to generate the full 200). Reason in
`<thinking>` about category balance first.
