# Feature - resume an in-progress game

You are a React engineer. Your objective is to let players leave a match and resume
it later with the score AND the last drawn card intact.

<context>
  <state>The active GameSession is saved to localStorage on every change. The
  drawn card + recent draws are reconstructable from `drawnCardIds`.</state>
  <flow>Back returns to the landing WITHOUT discarding the game; a Resume banner
  offers one-tap continue. End Match / explicit discard clears it.</flow>
</context>

## Instructions
1. On mount, load any saved unfinished game into `savedGame` state (don't auto-enter).
2. Render a Resume banner on the landing: team names, score, mode/deck name, with a
   discard (✕) control.
3. `resumeGame`: restore mode + deck pool (custom or filtered), then **reconstruct
   the current card and last-3 history from `drawnCardIds`** against that pool.
4. Make Back keep the game (`setSavedGame(game); setGame(null)`); starting a new
   game or discarding clears the saved one.

## Constraints
- MUST persist custom-deck context so a custom game resumes into the right pool.
- MUST show the restored card's FACE (CardDisplay inits `flipped = !!card`).
- MUST NOT auto-resume silently - give the user an explicit choice.

## Output format
The `page.tsx` changes (state, effects, resume/discard handlers, banner) and any
`CardDisplay` tweak. Reason in `<thinking>` about reconstructing card state first.
