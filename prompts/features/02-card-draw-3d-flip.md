# Feature - draw + 3D flip card

You are a front-end engineer with strong CSS animation skills. Your objective is a
tappable card that flips in 3D to reveal a drawn twist card, with favorite/skip.

<context>
  <component>components/CardDisplay.tsx - props: card|null, onDraw, deckRemaining,
  isFavorite, onFavorite, onSkip.</component>
  <visual>Back face = branded "SHUFFLE / tap to draw" + remaining count. Front face =
  category icon, name, effect, category pill, favorite star, skip.</visual>
</context>

## Instructions
1. Implement a real 3D flip: `perspective` wrapper, `transform-style: preserve-3d`
   inner, `rotateY(180deg)` on flip, `backface-visibility: hidden` on both faces.
2. On draw: flip to back, swap the card on the next animation frame
   (`requestAnimationFrame`), then flip to face - so the next card is never visible
   through the flip. Add a one-shot shine sweep on reveal.
3. Initialize `flipped = !!card` so a pre-set card (resume) shows its face on mount.
4. Make the card **responsive**: `width: min(78vw, 18rem)`,
   `height: clamp(15rem, 38dvh, 22rem)` so it fits any phone without overflow.
5. Favorite = star toggle; Skip = exclude card and auto-advance to the next draw.

## Constraints
- MUST size with `clamp()`/`dvh` (never fixed heights that overflow small phones).
- MUST give every lucide icon room (`shrink-0`) and truncate the category pill.
- MUST NOT block rapid taps into a broken state (guard with a `busy` flag).

## Output format
`components/CardDisplay.tsx` + the CSS utilities it needs. Reason in `<thinking>`
about the flip timing first.
