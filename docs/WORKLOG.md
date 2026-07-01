# Worklog

## 2026-07-01 04:30 — Coach / Umpire "Track a match" mode (T11)

**Summary:** Added a coach/umpire match-recording mode on top of the card game.
A home segmented toggle `Play with cards` / `Track a match` (switchable any time —
this answers "can the mode change after selecting?": yes, one tap) leads to an
official-match setup and a proper officiating flow. Engine + client-api unit-tested
(64 tests green), validated live in-browser.

**Changes:**
- `components/OfficialMatchSetup.tsx` (new) — setup: singles/doubles, player/team
  names, event/round label, points-to-win (11/15/21), match length, cards on/off.
- `components/OfficialControls.tsx` (new) — in-match: serving indicator + server
  number, per-team timeout/fault buttons, side-out, one-tap match-sheet download.
- `lib/game.ts` — `officialMode`/`cardsEnabled`/`eventLabel` config, `matchLog`,
  `serverLabel`/`recordTimeout`/`recordFault`/`logCount`, and real two-server doubles
  rotation in `sideOut` (gated by `officialMode`, so casual play is unchanged).
- `lib/client-api.ts` — official fields on `SavedMatch`/`addMatch`; `matchSheet()`
  plain-text export (teams, game-by-game, timeouts/faults, duration).
- `app/page.tsx` — home toggle, `startOfficialMatch`, `downloadMatchSheet`,
  official controls wiring, card UI hidden when cards are off.
- Tests — `lib/game.test.ts` (+rotation, +log), `lib/client-api.test.ts` (new;
  addMatch official fields + matchSheet).
- Docs — README "Coach / Umpire mode" table, ONBOARDING, TICKETS T11 → shipped,
  spec Phase 2 → shipped (with the toggle refinement), app/CLAUDE.md structure.

**Decisions:**
- Top-level choice became a **home segmented toggle**, not a separate screen — makes
  the mode switchable in one tap (the explicit ask) and keeps casual play default.
- Advanced rotation is **gated behind `config.officialMode`** so existing/casual and
  singles behaviour is byte-for-byte unchanged (proven by the casual rotation test).
- Tracked-match **format locks once underway** (rotation math); change at setup/New Match.
- Browser batching note: driving a full 11-point win via scripted synchronous clicks
  hits one React state snapshot (net +1), so the win→history→sheet path was locked with
  unit tests instead; rotation/controls/logging/card-hiding verified live.

**Follow-ups:**
- [ ] Production deploy (both this + v1) — Vercel CLI/login still owner-run via `./deploy-vercel.sh`.

## 2026-07-01 01:20 — Understand & Play v1 (onboarding + self-explaining cards)

**Summary:** Shipped a zero-knowledge-user layer so a first-timer with no pickleball
background can open the app and play immediately — first-run welcome tour, tap-to-define
jargon, per-card "?" explainer, always-shown "What to do", an in-game hint, and a
"Why & how" help tab. Brainstormed → spec'd → built → browser-validated → committed
(`f17cd1e`). Also scoped a Coach/Umpire match-recording mode as planned Phase 2.

**Changes:**
- `components/WelcomeTour.tsx` (new) — 4-slide first-run carousel (what/why, how-to,
  navigation, start), localStorage-gated (`pb-welcome-tour-seen`), replayable from Rules.
- `components/GlossaryText.tsx` (new) — highlights known pickleball terms in card text,
  tap opens a definition popover.
- `lib/glossary.ts` (new) — shared glossary (17 terms + aliases); RulesPanel glossary tab
  now sources from it so tab + in-card defs never drift.
- `lib/cards.ts` — `CATEGORY_INFO` plain-language description per category.
- `components/CardDisplay.tsx` — "?" explainer sheet (what it means / how to play / what
  kind of card), always-shown "What to do" line, GlossaryText on rule + detail.
- `components/RulesPanel.tsx` — new default "Why & how" tab (benefits + navigation) +
  "Replay welcome tour" button.
- `app/page.tsx` — tour + one-time in-game hint wiring (`pb-game-hint-seen`).
- Docs — README "Learn & understand" group; ONBOARDING new-features + fixed stale
  "200"→"1,729"; TICKETS shipped entry + planned coach mode T11; app/CLAUDE.md structure;
  spec `docs/superpowers/specs/2026-06-30-understand-and-play-design.md` (persona journey
  + Phase 2 coach-mode design).

**Decisions:**
- Extracted the glossary to a shared module (single source for the Rules tab and the
  in-card highlighter) instead of duplicating term lists.
- Made the "?" the primary explainer; tap-to-define stays inline — they complement.
- Coach/Umpire mode kept as **pending** (per owner) — documented + task-broken (#7–#10),
  not built in v1. Chosen shape: top-level choice screen after the tour, scorekeeper +
  optional cards, singles/doubles + server rotation + side-switch + timeouts/faults,
  saves to Match history + exportable match sheet.
- Caught during browser validation: WelcomeTour was first placed in the game-screen
  return, never the home (early) return — moved into `if (!game)` branch; verified the
  tour, hint, explainer, and tap-to-define all render live at 390px.

**Follow-ups:**
- [ ] Production deploy — Vercel CLI not installed + no saved auth (interactive `vercel login`).
      Owner to run `./deploy-vercel.sh` (installs CLI, logs in, `vercel --prod` from repo root).
- [ ] Build Coach/Umpire mode (tasks #7–#10 / ticket T11).

## 2026-06-24 — feature shortlist build-out + continuous deploys

**Summary:** Built and shipped the full approved feature shortlist on branch
`feat/wave1-prod-hardening` (now pushed), deploying to production after each wave.
81 backlog items done total.

**Shipped this session:**
- Browse/search all 1,729 cards + rarity-distribution chart (F549/F048/F050)
- Share/import custom decks by code + clone (F042/F043/F040)
- Shareable match-result PNG via canvas + Web Share (F092)
- Daily challenge: date-seeded deck-of-the-day, no backend (F018)
- Switch-sides reminder (F062), replay how-to from Settings (F139)
- Dark/light/auto theme, persisted + follows system (F201/F159)
- Pickleball glossary tab in Rules & help (F138)
- Big-score TV/courtside display mode (F072)
- Achievements/badges from local stat counters (F121)
- Resume multiple in-progress games (keyed store + migration) (F085)
- Earlier in the run: manual score correction, SR announcements, wake-lock,
  delete-all-data, focus-trap, toasts, dependabot/gitleaks/audit/runbook,
  axe/RTL tests, game/match-point banner.

**Decisions / notes:**
- Prod deployed directly from the local branch via `vercel --prod` after each
  wave (smoke-checked); branch also pushed to origin for a PR + CI.
- Verified key flows live in the browser (Chrome DevTools MCP), incl. the
  multi-game resume refactor end-to-end.

**Follow-ups:**
- [ ] Open the PR for `feat/wave1-prod-hardening` (branch pushed; CI runs on it).
- [ ] Remaining P0s are blocked/parked: Sentry (DSN), accounts/roster/backend,
      Playwright E2E, doubles server-1/2 (needs a rules decision).

## 2026-06-23 — 557-feature backlog + autonomous prod/UX/onboarding build loop

**Summary:** Built a 557-item prioritized feature backlog across all categories, two
reusable prompts, then ran an autonomous build loop shipping verified P0 items on
branch `feat/wave1-prod-hardening`: security headers + SEO, vitest harness (44
tests), offline/SW-update banner, privacy/terms/about pages, focus rings, richer
card content (commentary + detail + intensity meter), and Beginner/Intermediate/
Advanced skill levels with a beginner how-to-play intro and bigger, mobile-readable
card text. All verified live in the browser (Chrome DevTools MCP), incl. mobile width.

**Changes:**
- `docs/BACKLOG.md` — 550 features (A gameplay · B UX/a11y · C infra/quality · D growth · E card content), P0/P1/P2 + S/M/L + status + build-order waves; 23 marked done.
- `prompts/feature-backlog-and-loop.md`, `prompts/feature-prompt-template.md` — reusable prompts for backlog generation + per-feature work.
- `app/next.config.ts` — security headers + baseline CSP on every route (F327/F328).
- `app/app/layout.tsx` — metadataBase, OpenGraph/Twitter, canonical (F482/F492/F493); mounts NetworkStatus.
- `app/app/robots.ts`, `app/app/sitemap.ts` — SEO routes (F483).
- `app/vitest.config.ts` + `lib/game.test.ts`, `lib/cards.test.ts`, `lib/cards-data.test.ts` — vitest harness, 38 tests; wired `npm test` into CI (F251/F253/F268/F541/F542).
- `app/components/NetworkStatus.tsx` — offline banner + SW update prompt (F228/F345).
- `app/app/(info)/` privacy/terms/about pages + AppMenu link (F243-F246).
- `app/app/globals.css` — keyboard focus rings (F142) + info-page prose styles.
- `scripts/generate_cards.py` + regenerated `cards.json` ×3 — real commentator voice on originals (no more effect dupes), new `detail` description + intensity meter per card (F501-F504); `lib/cards.ts` Card gains `detail`; `CardDisplay.tsx` shows detail + intensity dots (F521/F522).

**Decisions:**
- Hybrid local-first chosen, but **no account/login built yet** (per user) and the dead auth/supabase stubs left **parked** (app/CLAUDE.md flags them dead).
- Refocused the loop on hardening the **existing** card-game + scorekeeper rather than building the new roster/rotation product implied by some P0 backlog items.
- Every iteration verified: lint + tsc + tests + build, and key UI confirmed live in the browser via Chrome DevTools MCP (dev server on :3001).

**Follow-ups:**
- [ ] Branch `feat/wave1-prod-hardening` not pushed / no PR yet (awaiting user).
- [ ] Remaining P0s needing decisions: error tracking DSN (F291), GDPR specifics, doubles server-1/2 rotation (F063, behavior-changing).
- [ ] Continue loop: onboarding (F126/F131), more a11y (F143/F144/F150/F232), perf (F310).

## 2026-06-15 16:55 - Docs overhaul: full README, CONTRIBUTING, in-app discovery

**Summary:** Documented every feature for end users and contributors, added a contribution guide + a tasteful star/issues ask, and surfaced the new features in-app.

**Changes:**
- `README.md` - new grouped **Features** section (Cards & decks, Playing & scoring, Your data, Feel & accessibility), a **Contributing** section, expanded **Documentation** links, and an "Enjoying it?" footer (value-first, low-pressure star + issues ask). Repo-layout tree updated (`scripts/`, `docs/data/`).
- `CONTRIBUTING.md` (new) - dev setup, CI gates, PR guidelines, how to add cards via the generator, local-first ground rules.
- `app/README.md` + `docs/ONBOARDING.md` - "What's new" callouts.
- `RulesPanel` - new FAQ entries (Pause a game, Card text styles, Card rarity & the 1,729 deck) so new players discover the toggle/pause/rarity in-app.

**Decisions:** Star ask placed only at the README bottom, framed as optional with a discoverability reason (per the project owner's guidance) - no nagging, value first. Docs split by audience: README = players, ONBOARDING/CONTRIBUTING = contributors, app/README = architecture, docs/data = raw dataset.

## 2026-06-15 16:30 - Grow deck to 1729 cards with commentator voice + metadata

**Summary:** Expanded the deck from 200 to exactly **1,729** unique cards (the Ramanujan taxicab number), each in playful sports-commentator voice with rich metadata, and surfaced that metadata in the app.

**Changes:**
- `scripts/generate_cards.py` - deterministic generator: keeps the original 200 (now `rarity: signature`), appends 1,529 combinatorial twist cards in commentator voice, round-robin across 10 categories. Uniqueness enforced like a primary key on `name` (asserts unique ids + names, exactly 1729).
- Card schema enriched: `callout`, `intensity` (1-5), `rarity` (signature/common/uncommon/rare/legendary), `tags`. `lib/cards.ts` adds the `Rarity` type + `RARITY_STYLE`.
- `CardDisplay` shows a **rarity badge** + the **commentator callout** on the card face (replay/collect appeal).
- `docs/data/cards.json` (new): full documented dataset - `{ meta: { why_1729, philosophy, schema, categories, rarities, intensity_distribution }, cards: [...] }`.
- Easter-egg mark on the landing footer explaining why 1729 (taxicab number, 1³+12³ = 9³+10³). Copy updated 200 -> 1,729 in `manifest`, `layout`, `page.tsx`, `RulesPanel`, READMEs, `CLAUDE.md`.

**Decisions:** Commentator voice (rotating hooks/stingers) makes reading a card half the fun; rarity gives a collect-them-all pull; intensity/tags set up future themed/tunable modes. Original 200 kept verbatim. `cards.json` grew 39K -> 687K (fine for a one-time fetch).

**Verification:** generator asserts pass (1729 unique ids+names); tsc clean; build green; `/cards.json` serves 1729; landing shows the mark.

## 2026-06-15 16:05 - In-game pause (T3) + new-tab doc links + dash normalize

**Summary:** Shipped the in-game pause feature, normalized long dashes to hyphens repo-wide, and made the GitHub Pages landing links open in a new tab.

**Changes:**
- T3 pause: `lib/game.ts` adds `pausedAt`/`pausedMs` to `GameSession` + `pauseGame`/`resumePlay`/`isPaused`/`elapsedMs`; `page.tsx` freezes the elapsed clock via `elapsedMs`, adds a full-screen "Paused" overlay (blocks scoring/drawing, autofocus Resume); `TopBar` gets a Pause/Resume quick-action. Pause persists in `GameSession` so a break survives reload; `startNewGame`/`newMatch` reset it.
- Dashes: replaced all em/en dashes with `-` across source + docs (255 occurrences, 38 files).
- Links: `docs/index.md` converted to explicit `target="_blank"` HTML anchors; new-tab script kept on the docs pages. (README on github.com can't be forced - GitHub sanitizes `target`/scripts; only the Pages site + the Vercel app obey it.)

**Verification:** tsc clean, build green (14 routes).

## 2026-06-15 15:45 - Close audit tickets T8/T9/T10

**Summary:** Completed the three follow-up tickets opened by the frontend audit.

**Changes:**
- T8 - tap targets ≥44px: TopBar Undo/Reset/lock/edit, and enlarged card favorite/skip hit areas.
- T9 - match length is now configurable: `GameConfig.bestOf` (1/3/5) + "Match length" chips in `SettingsSheet`; `matchWinner` derives the target via new `gamesToWinMatch(config)` (back-compat `?? 3`).
- T10 - `AppMenu` import success/error now show a glass in-app toast (`role="status"`, auto-dismiss) instead of native `alert()`.

**Verification:** tsc clean, build green (14 routes).

## 2026-06-15 15:38 - Frontend gap audit fixes + best-of-3 match screen

**Summary:** Ran a 3-agent frontend audit, then applied four fix batches (accessibility, reduced-motion correctness, design-system consistency, custom typography) plus a new best-of-3 match-complete screen. tsc clean, build green, fonts load.

**Changes:**
- `globals.css` - global `:focus-visible` ring; `--text-muted` contrast bumped (dark `#5c5c63`→`#7e7e87`, light `#a6a6ae`→`#6f6f78`); reduced-motion now kills infinite loops (mesh/float/glow/ring); `.font-display` utility; body font → `var(--font-body)`.
- `layout.tsx` - removed zoom lock (`maximumScale`/`userScalable`, WCAG 1.4.4); added `next/font` **Bricolage Grotesque** (display) + **Hanken Grotesk** (body) as CSS vars.
- `HistoryPanel.tsx` (shared `Sheet`) - `role="dialog"`, `aria-modal`, `aria-label`, Escape-to-close, focus trap + focus-return; fixes 5 panels at once.
- `SettingsSheet.tsx` - refactored onto the shared `Sheet` (was a divergent shell: no glass/X, `z-40`, `vh`); toggles `role="switch"`/`aria-checked`, chips `aria-pressed`.
- `TopBar.tsx`, `CardDisplay.tsx`, `ScoreKeeper.tsx`, `AppMenu.tsx` - aria-labels on icon-only buttons, `aria-expanded`/menu semantics, score-button labels + serving announcement; reduced-motion card-flip timing; display font on scores/card title.
- `WinCelebration.tsx` - confetti skipped under reduced-motion; dialog semantics + autofocus; **match-complete variant**.
- `FeedbackPanel.tsx` - wrapped in `<form>`, email validation, softened false-success copy.
- `FavoritesPanel.tsx` - emoji ☆ → lucide `Star`.
- `manifest.json` - theme/background color `#030712`→`#0e0e11` (match app); added `id`/`scope`/`lang`/`dir`.
- `lib/game.ts` - `GAMES_TO_WIN_MATCH`, `seriesTally`, `matchWinner`, `newMatch`; `page.tsx` wires the match-over screen + 0-cards-flash fix + resume-card press feedback.

**Decisions:** Applied frontend-design craft *within* the existing emerald/glass system rather than a clashing redesign. Chose Bricolage Grotesque + Hanken Grotesk over the overused Inter/Space Grotesk. Best-of-3 is fixed (no new setting) - additive, never surprises single-game players (only fires at 2 games won). Left the dead auth stubs and `logo-mark.svg` orphan untracked (deletion needs explicit OK).

**Follow-ups:**
- [ ] In-game pause (ticket T3) - design approved, not yet built.
- [ ] Feedback → Google Form (T1) may supersede the mailto flow.
- [ ] Optional: make best-of-N a Settings option; tap-target sizes on a few quick-actions still <44px.

## 2026-06-10 - Rename Vercel project + URL to match the brand

**Summary:** Renamed the Vercel project `pickleball-shuffle` → `pickleball-card-games` so the live URL matches the new name.

- Renamed the project (Vercel API), added `pickleball-card-games.vercel.app`, and removed the old `pickleball-shuffle.vercel.app` domain.
- New canonical URL: **https://pickleball-card-games.vercel.app** (HTTP 200); old URL now 404s.
- Updated the live link in `README.md`, `app/README.md`, `app/CLAUDE.md`, and synced `app/.vercel/project.json` (projectId unchanged, so CLI/Git deploys are unaffected).

**Unchanged:** the GitHub repo path (`SathishKumarAI/pickleball-shuffle`) and all localStorage keys - renaming those would break links/data for no benefit.

## 2026-06-09 18:35 - CI gate, project consolidation, legacy cleanup

**Summary:** Consolidated to a single Vercel project, added a CI workflow, and removed the legacy prototypes that caused the deploy mis-detection.

**Vercel:** relinked the CLI to the `pickleball-shuffle` project and **deleted the redundant `app` project** - one project, one URL (https://pickleball-shuffle.vercel.app), one deploy log.

**CI:** added `.github/workflows/ci.yml` - lint + `tsc --noEmit` + build on push/PR to `main` (Node 24, npm cache). First run: **success**.
- Fixed `react-hooks/static-components` properly via a stable `CategoryIcon` component (was deriving an icon component during render in `CardDisplay`).
- Downgraded `react-hooks/set-state-in-effect` to a warning - loading localStorage into state inside mount/open effects is the SSR-safe pattern (reading during render → hydration mismatch).

**Cleanup:** `git rm`'d `backend/` (FastAPI) and `frontend/` (Vite stub) - unused, and the reason Vercel auto-detected the framework as `fastapi`.

**Verification:** CI success · Vercel deploy READY · live HTTP 200 · GitHub commit status green.

**Note:** CI currently *reports* but does not *block* - Vercel auto-deploys `main` on push. To make it a true gate, enable branch protection on `main` (require the CI check) and work via PRs.

## 2026-06-09 18:16 - Fix failing GitHub→Vercel deploys + meaningful URL

**Summary:** GitHub-triggered Vercel deploys were failing on every push. Root-caused and fixed via project settings; also switched the canonical URL to a meaningful one.

**Root cause:** There are two Vercel projects for this repo. CLI deploys target an `app` project (succeed). The **GitHub-connected `pickleball-shuffle` project** had `rootDirectory: None` (built from the repo root) and framework auto-detected as **`fastapi`** (because of the legacy root `backend/main.py`). So every push tried to build a FastAPI app from the root → **ERROR**.

**Fix (via Vercel API, non-destructive):**
- `PATCH /v9/projects/pickleball-shuffle` → `rootDirectory: "app"`, `framework: "nextjs"`.
- This makes git pushes build the Next.js app in `app/` and deploy successfully.

**Meaningful URL:** the fixed project serves at **https://pickleball-shuffle.vercel.app** (replaces the `app-delta-ten-94` alias). Updated the live link in `README.md`, `app/README.md`, `app/CLAUDE.md`.

**How to avoid in future:** when the app lives in a subdirectory, set the Vercel project's **Root Directory** to that subdir and pin the **Framework Preset** (don't let a sibling `backend/` mislead auto-detection). Ideally keep **one** Vercel project per repo.

**Verification:** pushed to `main` to trigger a build; confirmed the deployment reaches READY and the live URL serves 200 + 200 cards, and the GitHub commit status is green.

## 2026-06-09 17:52 - Icon-overlap fix, readable menu, reset button, skip/favorites, docs

**Summary:** Fixed an icon-overlap bug and several smaller issues surfaced during testing, added a discoverable score Reset and a Favorites view, made skip auto-advance, and documented all findings.

**Fixes (full list in `docs/BUG-LOG.md`):**
- **Icon overlap** - global `svg.lucide { flex-shrink: 0 }`; TopBar `shrink-0`/`min-w-0`/`flex-wrap` guards; card category pill `truncate`. Root cause + prevention rules in `docs/UI-LAYOUT-NOTES.md`.
- **Menu (☰)** - moved to the far right; dropdown switched from translucent `glass` to a solid `var(--bg-card)` surface with `var(--text)` labels (was unreadable in both themes).
- **Card too big** - responsive height `50dvh`→`38dvh`, capped 22rem; back glyph 72→56px.
- **Score reset** - added a TopBar **Reset** quick-action with inline confirm (was buried in Settings).

**Features:**
- **Skip** now auto-advances to the next card (still filters future draws).
- **Favorites** are now persistent (`pb-favorites`) with a **Favorite cards** panel in the menu; included in export/import.

**Files:** `app/globals.css`, `components/TopBar.tsx`, `components/AppMenu.tsx`, `components/CardDisplay.tsx`, `components/FavoritesPanel.tsx` (new), `lib/client-api.ts`, `app/page.tsx`.

**Docs added:** `docs/UI-LAYOUT-NOTES.md` (icon/layout rules), `docs/BUG-LOG.md` (all findings + fixes).

**Clarification (not a bug):** scoring is independent of the card flip - tap a team tile to score; with side-out scoring on, only the serving team scores on tap.

**Verification:** `npm run build` clean.

## 2026-06-09 17:15 - Fix: resumed game lost the current card

**Summary:** Fixed a bug where going Back then resuming (or refreshing mid-game) dropped the visible card and recent-draws list. Also fixed custom-deck resume.

**Root causes:**
1. `currentCard` / recent history were component state only - `resumeGame` reset them to empty, never using the saved `drawnCardIds`.
2. `CardDisplay` always mounted with `flipped=false`, so a restored card showed the back face.
3. Custom games stored mode as `"chaos"` and dropped the custom cards on resume → wrong pool, card not found.

**Changes:**
- `app/page.tsx` - `resumeGame` reconstructs current card + last-3 history from `drawnCardIds` against the game's own pool; restores `customCards`/`customName`; resume banner shows the custom deck name.
- `components/CardDisplay.tsx` - `flipped` initializes to `!!card` so a resumed card shows its face.
- `lib/game.ts` - `GameSession` gains optional `customName`/`customCards` so custom decks survive save/resume.

**Verification:** `npm run build` clean; redeployed to https://app-delta-ten-94.vercel.app (HTTP 200).

## 2026-06-09 16:59 - Resume, feedback, mobile hardening, Vercel deploy + docs

**Summary:** Added resume-last-game and an in-app feedback flow, hardened the app for iOS/Android/browser use, calmed the palette to reduce eye strain, deployed to Vercel production, and rewrote the docs with the live link + a deep architecture explanation.

**Live:** https://app-delta-ten-94.vercel.app (HTTP 200, 200 cards verified)

**Changes:**
- `app/page.tsx` - Resume banner on landing (Back now keeps the game instead of clearing); finished matches saved to local history; landing restructured into header + scrollable `<main>` (no overlap on short screens); dynamic `theme-color` meta tracking dark/light; feedback panel wired into both menus.
- `components/FeedbackPanel.tsx` (new) - star rating + message → `mailto` (local backup in `pb-feedback`).
- `components/AppMenu.tsx` - added "Send feedback".
- `components/CardDisplay.tsx` - responsive card via `clamp()`/`dvh` so it fits any phone.
- `components/TopBar.tsx`, `HistoryPanel.tsx` - safe-area insets; sheets use `dvh`.
- `app/globals.css` - softened dark/light palettes (no pure black/white), calmer/slower motion, reduced glow; `100dvh` body, 16px form inputs (no iOS zoom), `touch-action: manipulation`, `overflow-x: hidden`, safe-area helper classes, `hover`-gated lifts.
- `app/layout.tsx` - `theme-color` updated to new bg.
- Docs: `README.md` rewritten (live link, local-first rationale, architecture deep-dive: data flow, scoring engine, localStorage schema, animation, SW strategy, mobile hardening); `CLAUDE.md` updated; this WORKLOG entry.

**Decisions:**
- **Resume UX:** Back no longer discards the match - it returns to the landing with a one-tap Resume banner; only End Match / explicit discard clears. Auto-resume on refresh replaced by explicit choice.
- **Feedback delivery:** local-first app has no backend, so feedback uses `mailto` (+ local copy). Swap to Formspree/serverless later if volume warrants.
- **Eye strain:** moved off pure `#0a0a0b`/`#fafafa`, slowed mesh drift (26s), replaced infinite hard glow with a soft shadow pulse.

**Follow-ups:**
- [ ] Run the dead-file cleanup `rm` (see CLAUDE.md list).
- [ ] Optional: set `NEXT_PUBLIC_FEEDBACK_EMAIL` in Vercel env to override the feedback recipient.

## 2026-06-09 16:45 - Local-first decks/history, lucide icons, SaaS pivot+revert

**Summary:** Explored turning the app into a SaaS (auth + DB), then deliberately reverted to **local-first, no login** after deciding cross-device sync wasn't needed. Added custom decks + match history + export/import in localStorage, replaced all emoji with lucide-react icons, and trimmed in-game history to the last 3 draws.

**Decisions (and why):**
- **No login.** The core loop is local + ephemeral; custom decks & history work fine in localStorage. Login only buys cross-device sync/sharing, which there's no concrete need for yet. Auth would add friction, a DB dependency, cost, and a two-path codebase for little gain. Supabase code can be reintroduced later if a sync/sharing need appears.
- Iterated through SQLite+custom-auth → Supabase Auth → local-first. Each pivot was the user's call; final state is local-first.
- **lucide-react** for icons (consistent, non-emoji) - `MODE_ICONS`/`CATEGORY_ICONS` maps in `components/icons.tsx`.

**Changes:**
- `lib/client-api.ts` - now a localStorage store: custom decks, match history (cap 200), export/import, `deckToCards`.
- `components/AppMenu.tsx` (new) - menu: Match history, Custom decks, Export/Import backup.
- `components/icons.tsx` (new) - lucide icon maps for modes + categories.
- `components/HistoryPanel.tsx`, `DecksPanel.tsx` - read/write the local store (decks CRUD, match list + clear).
- `app/page.tsx` - lucide icons, AppMenu, history/decks panels, custom-deck play, saves finished matches to local history, history shows last 3.
- `TopBar`, `CardDisplay`, `ScoreKeeper`, `WinCelebration`, `CardHistory`, `PlayerNames` - emoji → lucide icons; theme-var styling.
- `package.json` - added `lucide-react`; removed `better-sqlite3`/`@supabase/*`.

**Dead code (neutralized to keep build green; `rm` is deny-listed - delete manually):**
- `app/api/` (auth/games/settings/decks), `app/login`, `app/signup`
- `lib/db.ts`, `lib/auth.ts`, `lib/supabase/`, `components/AuthForm.tsx`, `components/UserMenu.tsx`
- Pre-existing orphans: `components/GameSettings.tsx`, `components/DeckModeSelector.tsx`
- Unused `AUTH_SECRET` line in `.env.local`

**Verification:** `npm run build` clean (13 routes); dev server serves `/` and `/cards.json` at HTTP 200.

**Follow-ups:**
- [ ] Run the cleanup `rm` for the dead files listed above.
- [ ] Manual QA: create a custom deck → play it; finish a match → check history; export/import a backup.

## 2026-06-09 16:16 - Interactive & stylish UI pass

**Summary:** Reworked the web UI to feel alive - animated mesh backdrop, true 3D card flips, spring micro-interactions, and a richer win celebration - while keeping the existing dark/light theming.

**Changes:**
- `app/globals.css` - added mesh-gradient backdrop (`.mesh-bg`), a keyframe library (`floatY`, `fadeUp`, `popIn`, `scoreBump`, `pulseGlow`, `shimmer`, `confettiFall`, `ringPulse`) exposed as `anim-*` utilities, 3D-flip primitives, `.glass` glassmorphism, `.shine` sweep, `.pressable` spring affordance, staggered-entrance helper, custom scrollbar, and a `prefers-reduced-motion` guard.
- `app/page.tsx` - landing page: floating glowing logo, accent title, glass mode tiles that stagger in with hover emoji scale/rotate + sliding arrow; mesh backdrop on both landing and game screens; confirm dialog pops in.
- `components/CardDisplay.tsx` - replaced fake scale-swap with a real perspective flip; pulsing-glow back face, shine sweep on reveal, "Draw Again ↻" label.
- `components/ScoreKeeper.tsx` - score tiles bump on change, serving team gets a pulsing ring, gradient fills with colored drop shadows.
- `components/WinCelebration.tsx` - proper falling confetti (dots + ribbons) replacing the bounce, glass pop-in modal, themed buttons.
- `components/TopBar.tsx` - sticky glass bar, pill mode toggle with rotating chevron, animated dropdown with selected-state glow.
- `components/CardHistory.tsx` - staggered entry animation.

**Decisions:** Drove most of the styling/motion through CSS utility classes (theme-var aware) rather than a motion library, to avoid new deps and keep the static-site build. Added a reduced-motion guard so animations degrade gracefully. Verified with `npm run build` (clean) and a running dev server (HTTP 200).

**Follow-ups:**
- [ ] Visually QA on a real phone (haptics, 3D flip, confetti perf).
- [ ] Consider applying the same glass/pressable styling to `SettingsSheet`, `GameSettings`, and `PlayerNames` for full consistency.

## 2026-06-15 15:10 - New logo, security audit, prod deploy

**Summary:** Replaced the "PB" text tile with a real brand mark (tilted playing card overlapping a holed pickleball on the emerald gradient), ran a security audit on the untracked auth experiment (clean), and shipped the logo to production. Opened a tickets list for the remaining requests.

**Changes:**
- `app/icon.svg` (new) - full-tile master mark; Next App Router serves it as the SVG favicon.
- `public/icons/app-icon.svg` (new) - same mark for the landing `<img>`.
- `app/page.tsx` - landing hero swaps the gradient `PB` span for `<img src="/icons/app-icon.svg">` (keeps rounded-3xl + float + glow).
- `favicon.ico`, `public/icons/{icon-192,icon-512,apple-touch-icon}.png` - regenerated from the SVG via `rsvg-convert`; `favicon.ico` rebuilt as a 64×64 PNG-in-ICO with stdlib `struct` (no Pillow/ImageMagick available).
- `docs/TICKETS.md` (new) - pending task list; linked from `docs/index.md`.

**Security audit (untracked auth experiment):** Every file is an inert stub - auth/api routes return HTTP 410, `lib/*` are `export {}`, `AuthForm`/`UserMenu` render `null`, login/signup `redirect("/")`. `.vercel/.env.production.local` is gitignored and uncommitted. **No vulnerabilities; no patch needed** - only the dead-code deletion (T4).

**Verification:** `npm run build` clean (14 routes, `/icon.svg` emitted); local `:3000` serves the new logo + favicon at HTTP 200; production verified - `app-icon.svg`/`icon.svg` return 200 and the landing references the new mark. Deployed `03fa40c` → prod READY (https://pickleball-card-games.vercel.app).

**Follow-ups:** see [`TICKETS.md`](TICKETS.md) - feedback→Form (T1), how-to-use button (T2), in-game pause (T3), dead-stub deletion (T4).

<!-- new-tab-links: open every link in a new tab on the GitHub Pages site -->
<script>document.querySelectorAll('a[href]').forEach(function(a){a.target="_blank";a.rel="noopener noreferrer";});</script>
