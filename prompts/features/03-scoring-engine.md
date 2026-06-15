# Feature - pickleball scoring engine

You are a TypeScript engineer who values pure, testable functions. Your objective is
the game state model and a set of **pure** transition functions for pickleball scoring.

<context>
  <session>GameSession holds: score{team1,team2}, servingTeam, serverNumber,
  history[] (undo stack of ScoreEvent), gameNumber, gamesWon, gameResults,
  winner, startTime, playerNames, config, drawnCardIds, skippedCardIds.</session>
  <config>pointsToWin (7/11/15/21), winByTwo, sideOutScoring, confirmScore,
  scoreLocked, soundEnabled, gameType.</config>
</context>

## Instructions
1. In `lib/game.ts` define the types + `DEFAULT_CONFIG` + `createGame(mode, names?)`.
2. Implement pure transitions, each taking a `GameSession` and returning a NEW one:
   `addScore`, `sideOut`, `undoLast`, `resetScore`, `startNewGame`, `checkWin`.
3. `addScore`: if `sideOutScoring` and the scoring team isn't serving → `sideOut`
   (no point). Else append a timestamped event and recompute the winner.
4. `resetScore`: zero the score, reset serving, and **clear the undo stack**
   (`history: []`) - a reset is a clean slate, not an undoable event.
5. Add `saveGame/loadGame/clearSavedGame` (localStorage active game) + `formatTime`.

## Constraints
- MUST keep all transitions pure and immutable (no mutation, no side effects).
- MUST enforce win-by-2 when enabled and respect `scoreLocked`/`winner`.
- MUST NOT touch saved Match history from `resetScore` (different concern).

## Output format
`lib/game.ts` as paste-ready code, plus 3-5 example assertions showing the rules.
Reason in `<thinking>` about the side-out edge cases first.
