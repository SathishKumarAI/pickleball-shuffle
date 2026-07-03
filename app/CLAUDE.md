# PB Card Deck

Next.js card game + pickleball scorekeeper. 1,729 twist cards across 10 categories, 5 deck modes.
**Local-first: no backend, no login, no database.** All state lives in `localStorage`.

Live: https://pb-card-deck.vercel.app

## Stack
- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind v4
- lucide-react for all icons (no emoji)
- Cards loaded from `public/cards.json`; everything else is client state + localStorage
- Deployed on Vercel - run `vercel --prod` from the **repo root** (not this dir; project rootDirectory is already `app`), or use `../deploy-vercel.sh`

## Commands
```bash
npm run dev      # http://localhost:3000 (binds 0.0.0.0 for phone testing)
npm run build    # production build
npm start        # serve production build
vercel --prod    # deploy - run from REPO ROOT, not app/
```

## Structure
```
app/page.tsx          - the whole game: state, draw, score, resume, panels
components/           - CardDisplay (3D flip + "?" explainer), ScoreKeeper, TopBar,
                        CardHistory, WinCelebration, PlayerNames, SettingsSheet, AppMenu,
                        HistoryPanel, DecksPanel, FeedbackPanel, RulesPanel, icons.tsx,
                        WelcomeTour (first-run onboarding), GlossaryText (tap-to-define),
                        OfficialMatchSetup + OfficialControls (coach/umpire "Track a match"),
                        AchievementsPanel, CardBrowserPanel, FavoritesPanel, TVScore
                        (courtside display), Toast, NetworkStatus (offline indicator)
lib/cards.ts          - card types, deck modes, filtering, shuffle, CATEGORY_INFO
lib/glossary.ts       - shared pickleball glossary (Rules tab + in-card highlighter)
lib/game.ts           - PURE game engine (addScore/sideOut/undo/checkWin) + active-game
                        localStorage; official mode: serverLabel/recordTimeout/recordFault/
                        logCount + two-server doubles rotation (behind config.officialMode)
lib/client-api.ts     - local store: custom decks, match history, export/import;
                        matchSheet() export + official fields on SavedMatch/addMatch
lib/useFocusTrap.ts   - focus-trap hook for dialogs / sheets
lib/shareImage.ts     - render a shareable match / win image
lib/sounds.ts         - Web Audio SFX + haptics
public/cards.json     - 1,729 cards
public/sw.js          - network-first service worker (prod only; dev unregisters it)
```

## Conventions
- Game logic = pure functions in `lib/game.ts`; UI calls them and stores the returned `GameSession`.
- All persistence goes through `lib/client-api.ts` (swap point if a real DB is ever added).
- Theme via CSS vars + `data-theme` on `<html>`; animation utilities live in `globals.css`.
- Mobile-first: `100dvh`, 16px inputs, `touch-action: manipulation`, safe-area insets, responsive `clamp()` card.

## Dead code (inert stubs from an abandoned auth experiment - safe to delete)
`app/api/`, `app/login`, `app/signup`, `lib/db.ts`, `lib/auth.ts`, `lib/supabase/`,
`components/AuthForm.tsx`, `components/UserMenu.tsx`. Also pre-existing orphans
`components/GameSettings.tsx`, `components/DeckModeSelector.tsx`.
