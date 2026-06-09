# Feature — custom decks (localStorage)

You are a React + TypeScript engineer. Your objective is to let users author, save,
and play their own twist-card decks, persisted locally.

<context>
  <store>lib/client-api.ts owns all persistence. Deck shape:
  { id, name, description, cards: {name,effect,category}[], created_at }.
  Key: "pb-custom-decks".</store>
  <play>Custom cards become playable Cards with NEGATIVE ids (deckToCards) so they
  never collide with the 1–200 built-ins.</play>
</context>

## Instructions
1. Add to `client-api.ts`: `listDecks`, `saveDeck`, `deleteDeck`, `deckToCards`.
2. Build `components/DecksPanel.tsx`: list decks (play/delete), and an editor to
   create a deck (name, description, add cards with name+effect+category select).
3. Add a "Custom decks" item to the app menu; opening a deck starts a game whose
   pool is the deck's cards, with the deck name shown in the top bar.
4. Persist the custom-deck context on the GameSession so it survives resume.

## Constraints
- MUST keep all reads/writes in `client-api.ts` (components never touch localStorage).
- MUST guard against empty decks (can't play a 0-card deck).
- MUST NOT lose a half-written deck on accidental close (keep editor state local).

## Output format
`components/DecksPanel.tsx` + the `client-api.ts` additions + menu wiring.
Reason in `<thinking>` about the id-collision strategy first.
