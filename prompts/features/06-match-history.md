# Feature — match history (localStorage)

You are a React engineer. Your objective is to save every finished match locally and
let users browse and clear that history.

<context>
  <store>client-api.ts, key "pb-match-history" (cap 200). Match shape: teams,
  scores, winner, mode, game_number, duration_ms, results[], created_at.</store>
  <trigger>Save exactly once when a game reaches a winner — guard against double
  saves on re-render.</trigger>
</context>

## Instructions
1. Add `listMatches`, `addMatch(session)`, `clearMatches` to `client-api.ts`.
2. In `page.tsx`, save a finished match exactly once (a ref keyed by
   `game.id + ":" + gameNumber` prevents duplicates).
3. Build `components/HistoryPanel.tsx` (reuse a shared bottom-sheet `Sheet`):
   list matches with mode, score, winner, duration, date; add a "Clear" action.
4. Add a "Match history" item to the app menu.

## Constraints
- MUST save each finished game once and only once.
- MUST NOT let a score reset or a new game wipe saved match history.
- MUST cap stored matches and format dates/durations for quick scanning.

## Output format
`components/HistoryPanel.tsx` (+ exported `Sheet`), `client-api.ts` additions, and
the save wiring in `page.tsx`. Reason in `<thinking>` about the dedupe key first.
