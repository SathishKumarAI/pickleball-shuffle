# Pickleball Shuffle

Next.js card game web app. 200 pickleball twist cards across 10 categories, 5 deck modes.

## Stack
- Next.js 16 + TypeScript + Tailwind CSS
- Static site (no backend needed) — cards loaded from public/cards.json
- Deployable to Vercel or self-hosted

## Commands
```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve production build
```

## Structure
```
app/page.tsx          — main game (mode select + card draw + score)
components/           — CardDisplay, ScoreKeeper, DeckModeSelector, CardHistory
lib/cards.ts          — card types, deck modes, filtering, shuffle
public/cards.json     — 200 cards data
```
