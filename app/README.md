# Pickleball Shuffle

Draw twist cards mid-match. Shake up the game.

A free, mobile-first web app with 200 pickleball twist cards across 10 categories. Tap to draw, read the rule, play under that twist for the next point.

## Features

- **200 Cards** across 10 categories (Shot Restriction, Body & Movement, Wild Card, Penalty, Bonus, Social, Strategy, Wacky, Court, Meta)
- **5 Deck Modes** — Family, Party, Drill, Tournament, Chaos
- **Built-in Scorekeeper** — tap to score for each team
- **Card History** — last 10 drawn cards visible
- **Card Flip Animation** — satisfying draw experience
- **Mobile-First** — designed for phones at the court
- **No Login** — open the link, play immediately
- **Offline-Friendly** — works once loaded (static site)

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Deploy to Vercel (Free)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com), sign in with GitHub
3. Import this repo → Deploy
4. Get a live URL like `pickleball-shuffle.vercel.app`

## Tech Stack

- **Next.js 16** — React framework with static export
- **TypeScript** — type-safe card data and game logic
- **Tailwind CSS** — mobile-first responsive design
- **No backend** — all 200 cards loaded from `public/cards.json`

## Card Categories

| Category | Cards | Description |
|----------|-------|-------------|
| Shot Restriction | 20 | Limits what shots you can hit |
| Body & Movement | 20 | Physical challenges and restrictions |
| Wild Card / Swap | 20 | Partner swaps, paddle trades, side switches |
| Penalty | 20 | Bad luck draws — lose a serve, sit out |
| Bonus / Reward | 20 | Free points, double serves, advantages |
| Social & Party | 20 | Selfies, compliments, trash talk |
| Strategy / Skill | 20 | Erne bounties, ATP bonuses, coach's choice |
| Wacky / Chaos | 20 | Pirate voice, animal sounds, blindfolds |
| Court / Environment | 20 | Shrunken courts, giant kitchens, zone rules |
| Meta & Game-Flow | 20 | Draw two, skip draws, reverse scoring |

## Deck Modes

| Mode | Description | Card Count |
|------|-------------|------------|
| Family | Fun for all ages | 80 |
| Party | Laughs, dares & drinks | 100 |
| Drill | Sharpen your game | 60 |
| Tournament | Competitive twists | 60 |
| Chaos | All 200 cards, anything goes | 200 |

## Project Structure

```
app/
├── app/
│   ├── page.tsx              # Main game page (mode select + draw + score)
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles (dark theme)
├── components/
│   ├── CardDisplay.tsx       # Card with flip animation
│   ├── ScoreKeeper.tsx       # Team 1 vs Team 2 scoring
│   ├── DeckModeSelector.tsx  # Mode switcher pills
│   └── CardHistory.tsx       # Last 10 drawn cards
├── lib/
│   └── cards.ts              # Types, deck modes, filtering, shuffle
├── public/
│   └── cards.json            # All 200 cards data
└── CLAUDE.md                 # AI coding context
```

## License

MIT
