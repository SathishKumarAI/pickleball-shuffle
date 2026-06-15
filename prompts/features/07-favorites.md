# Feature - favorite cards (persistent)

You are a React engineer. Your objective is to let users star cards and view their
favorites anytime - persisted across games, not just for the current match.

<context>
  <store>client-api.ts, key "pb-favorites" = number[] of card ids.</store>
  <ui>Star toggle on the card face; a "Favorite cards" panel listing favorited
  cards resolved from cards.json.</ui>
</context>

## Instructions
1. Add `listFavoriteIds`, `toggleFavorite(id)` to `client-api.ts` and include
   favorites in export/import.
2. In `page.tsx` hold `favoriteIds` state (load on mount); wire the card star to
   `toggleFavorite` and `isFavorite` to the state.
3. Build `components/FavoritesPanel.tsx`: list favorited cards (icon, name, effect,
   category) with a remove button; empty state explains how to add.
4. Add a "Favorite cards" item to the app menu.

## Constraints
- MUST persist favorites globally (survive game end), NOT on the GameSession.
- MUST resolve favorite ids against the loaded card pool; ignore unresolved ones.
- MUST NOT duplicate ids in the store.

## Output format
`components/FavoritesPanel.tsx`, `client-api.ts` additions, and the `page.tsx`
wiring. Reason in `<thinking>` about per-game vs global storage first.
