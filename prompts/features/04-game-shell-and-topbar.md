# Feature - game shell, top bar, settings, scorekeeper

You are a React engineer. Your objective is the in-game UI shell that wires the
scoring engine, card draw, top bar, and settings together.

<context>
  <screens>Landing (mode select + menu) and Game (top bar + scorekeeper + card +
  recent draws). `app/page.tsx` is a client component holding all state.</screens>
  <components>TopBar, ScoreKeeper, CardHistory (last 3 draws), PlayerNames,
  SettingsSheet, WinCelebration.</components>
</context>

## Instructions
1. `ScoreKeeper`: two tappable team tiles (with side-out indicator + serving ring),
   bump animation on score change, optional confirm-before-scoring dialog.
2. `TopBar`: Back, a mode chip (dropdown to switch modes), and a right-aligned
   control group (Settings, theme toggle, ☰ menu). A second row of quick actions:
   game#·timer, Undo, **Reset** (with inline confirm), lock, edit names.
3. `SettingsSheet`: game type, points-to-win, win-by-2, side-out, confirm, sound,
   and a "Reset score" action.
4. `WinCelebration`: confetti + trophy modal with Next Game / End Match.
5. Wire draw, score, undo, reset (clean slate), mode change in `page.tsx`.

## Constraints
- MUST make the top bar overflow-safe: `shrink-0` on edge groups, `min-w-0`+
  `truncate` on the mode chip, `flex-wrap` on the quick-actions row.
- MUST keep the ☰ menu the right-most control; its dropdown uses a SOLID surface.
- MUST NOT let scoring depend on the card - tapping a team tile scores on its own.

## Output format
The listed components + the relevant parts of `page.tsx`. Reason in `<thinking>`
about state ownership first.
