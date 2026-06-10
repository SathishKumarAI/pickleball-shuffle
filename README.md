#  Pickleball Card Games

**Draw twist cards mid-match. Shake up the game.**

A free, **mobile-first, local-first** web app: 200 pickleball twist cards across 10 categories, fused with a real pickleball scorekeeper. Tap to draw a card, play the next point under that twist, and keep score — all on your phone, no login, no signal required after first load.

### ▶︎ Live app: **https://pickleball-shuffle.vercel.app**

---

## Why local-first

This app deliberately has **no backend and no login** — a design decision, not a gap.

| Concern | Why local-first wins here |
|---|---|
| **Friction** | Players open the link mid-game; a signup wall loses them. |
| **Latency** | Drawing and scoring feel instant — no network in the hot path. |
| **Offline** | Courts have bad signal; a static site + service worker keeps working. |
| **Privacy & cost** | Your data never leaves the device; no DB, no auth, no per-user billing. |

Tradeoff: no cross-device sync. Custom decks and history live in `localStorage`, with a manual **Export / Import** backup to move data between devices.

## Highlights

- **200 cards**, 10 categories, **5 deck modes** (Family → Chaos), plus **custom decks** you build yourself.
- **Real scorekeeper** — side-out scoring, win-by-2, serving indicator, undo, best-of-3.
- **Resume last game** — leave and a one-tap banner brings the match back, card and score intact.
- **Match history** + **export/import backup**, all local.
- **In-app feedback**, **dark/light**, sound + haptics, and a clean **lucide** icon set (no emoji).
- **Mobile-tuned** — `100dvh`, safe-area insets, no iOS input zoom, responsive card sizing, installable PWA.

## Repository layout

```
pickleball-shuffle/
├── app/            # ← the application (Next.js 16 + TypeScript + Tailwind)
│   ├── app/        #   routes, layout, global styles
│   ├── components/ #   CardDisplay, ScoreKeeper, TopBar, panels, icons…
│   ├── lib/        #   cards, pure game engine, local store, sounds
│   └── public/     #   cards.json, manifest, service worker
├── docs/           # WORKLOG and project docs
├── backend/        # legacy FastAPI prototype (unused by the live app)
├── frontend/       # legacy Vite stub (unused)
└── *.sh            # dev / prod / deploy helper scripts
```

> The live app is entirely in **`app/`**. The `backend/` and `frontend/` directories are early prototypes kept for reference and are not part of the deployed product. See **[`app/README.md`](app/README.md)** for the full architecture deep-dive.

## Quick start

```bash
cd app
npm install
npm run dev          # http://localhost:3000  (binds 0.0.0.0 for phone testing)
```

Build & serve production:

```bash
npm run build
npm start
```

## Deploy

```bash
cd app && vercel --prod      # or: ./deploy-vercel.sh from the repo root
```

Current production alias: **https://pickleball-shuffle.vercel.app**

## Documentation

- **[`app/README.md`](app/README.md)** — full feature list + architecture deep-dive (data flow, scoring engine, localStorage schema, animation, service-worker strategy, mobile hardening).
- **[`docs/BUG-LOG.md`](docs/BUG-LOG.md)** — issues found and how each was fixed.
- **[`docs/UI-LAYOUT-NOTES.md`](docs/UI-LAYOUT-NOTES.md)** — icon-overlap root cause + rules to avoid layout bugs.
- **[`docs/WORKLOG.md`](docs/WORKLOG.md)** — dated change log.

## License

MIT

## References & credits

The standards, rules, and tools this project is built on:

**Game rules**
- [USA Pickleball — Official Rulebook](https://usapickleball.org/what-is-pickleball/official-rules/) — the scoring model (side-out serving, games to 11, win-by-2) follows the official rules.
- [USA Pickleball — How to Play](https://usapickleball.org/what-is-pickleball/how-to-play/) — terminology and gameplay basics.

**Framework & libraries**
- [Next.js](https://nextjs.org/docs) — App Router framework.
- [React](https://react.dev) — UI library.
- [Tailwind CSS](https://tailwindcss.com/docs) — styling.
- [Lucide](https://lucide.dev) — icon set.

**Platform**
- [Vercel](https://vercel.com/docs) — hosting & CI/CD.
- [MDN Web Docs](https://developer.mozilla.org) — `localStorage`, Service Worker, and PWA references used for the offline + mobile work.

> The 200 twist cards are original content curated for this app; the rules above
> only informed the scorekeeper, not the card ideas.
