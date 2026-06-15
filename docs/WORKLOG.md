# Worklog

## 2026-06-15 15:38 — Frontend gap audit fixes + best-of-3 match screen

**Summary:** Ran a 3-agent frontend audit, then applied four fix batches (accessibility, reduced-motion correctness, design-system consistency, custom typography) plus a new best-of-3 match-complete screen. tsc clean, build green, fonts load.

**Changes:**
- `globals.css` — global `:focus-visible` ring; `--text-muted` contrast bumped (dark `#5c5c63`→`#7e7e87`, light `#a6a6ae`→`#6f6f78`); reduced-motion now kills infinite loops (mesh/float/glow/ring); `.font-display` utility; body font → `var(--font-body)`.
- `layout.tsx` — removed zoom lock (`maximumScale`/`userScalable`, WCAG 1.4.4); added `next/font` **Bricolage Grotesque** (display) + **Hanken Grotesk** (body) as CSS vars.
- `HistoryPanel.tsx` (shared `Sheet`) — `role="dialog"`, `aria-modal`, `aria-label`, Escape-to-close, focus trap + focus-return; fixes 5 panels at once.
- `SettingsSheet.tsx` — refactored onto the shared `Sheet` (was a divergent shell: no glass/X, `z-40`, `vh`); toggles `role="switch"`/`aria-checked`, chips `aria-pressed`.
- `TopBar.tsx`, `CardDisplay.tsx`, `ScoreKeeper.tsx`, `AppMenu.tsx` — aria-labels on icon-only buttons, `aria-expanded`/menu semantics, score-button labels + serving announcement; reduced-motion card-flip timing; display font on scores/card title.
- `WinCelebration.tsx` — confetti skipped under reduced-motion; dialog semantics + autofocus; **match-complete variant**.
- `FeedbackPanel.tsx` — wrapped in `<form>`, email validation, softened false-success copy.
- `FavoritesPanel.tsx` — emoji ☆ → lucide `Star`.
- `manifest.json` — theme/background color `#030712`→`#0e0e11` (match app); added `id`/`scope`/`lang`/`dir`.
- `lib/game.ts` — `GAMES_TO_WIN_MATCH`, `seriesTally`, `matchWinner`, `newMatch`; `page.tsx` wires the match-over screen + 0-cards-flash fix + resume-card press feedback.

**Decisions:** Applied frontend-design craft *within* the existing emerald/glass system rather than a clashing redesign. Chose Bricolage Grotesque + Hanken Grotesk over the overused Inter/Space Grotesk. Best-of-3 is fixed (no new setting) — additive, never surprises single-game players (only fires at 2 games won). Left the dead auth stubs and `logo-mark.svg` orphan untracked (deletion needs explicit OK).

**Follow-ups:**
- [ ] In-game pause (ticket T3) — design approved, not yet built.
- [ ] Feedback → Google Form (T1) may supersede the mailto flow.
- [ ] Optional: make best-of-N a Settings option; tap-target sizes on a few quick-actions still <44px.

## 2026-06-10 — Rename Vercel project + URL to match the brand

**Summary:** Renamed the Vercel project `pickleball-shuffle` → `pickleball-card-games` so the live URL matches the new name.

- Renamed the project (Vercel API), added `pickleball-card-games.vercel.app`, and removed the old `pickleball-shuffle.vercel.app` domain.
- New canonical URL: **https://pickleball-card-games.vercel.app** (HTTP 200); old URL now 404s.
- Updated the live link in `README.md`, `app/README.md`, `app/CLAUDE.md`, and synced `app/.vercel/project.json` (projectId unchanged, so CLI/Git deploys are unaffected).

**Unchanged:** the GitHub repo path (`SathishKumarAI/pickleball-shuffle`) and all localStorage keys — renaming those would break links/data for no benefit.

## 2026-06-09 18:35 — CI gate, project consolidation, legacy cleanup

**Summary:** Consolidated to a single Vercel project, added a CI workflow, and removed the legacy prototypes that caused the deploy mis-detection.

**Vercel:** relinked the CLI to the `pickleball-shuffle` project and **deleted the redundant `app` project** — one project, one URL (https://pickleball-shuffle.vercel.app), one deploy log.

**CI:** added `.github/workflows/ci.yml` — lint + `tsc --noEmit` + build on push/PR to `main` (Node 24, npm cache). First run: **success**.
- Fixed `react-hooks/static-components` properly via a stable `CategoryIcon` component (was deriving an icon component during render in `CardDisplay`).
- Downgraded `react-hooks/set-state-in-effect` to a warning — loading localStorage into state inside mount/open effects is the SSR-safe pattern (reading during render → hydration mismatch).

**Cleanup:** `git rm`'d `backend/` (FastAPI) and `frontend/` (Vite stub) — unused, and the reason Vercel auto-detected the framework as `fastapi`.

**Verification:** CI success · Vercel deploy READY · live HTTP 200 · GitHub commit status green.

**Note:** CI currently *reports* but does not *block* — Vercel auto-deploys `main` on push. To make it a true gate, enable branch protection on `main` (require the CI check) and work via PRs.

## 2026-06-09 18:16 — Fix failing GitHub→Vercel deploys + meaningful URL

**Summary:** GitHub-triggered Vercel deploys were failing on every push. Root-caused and fixed via project settings; also switched the canonical URL to a meaningful one.

**Root cause:** There are two Vercel projects for this repo. CLI deploys target an `app` project (succeed). The **GitHub-connected `pickleball-shuffle` project** had `rootDirectory: None` (built from the repo root) and framework auto-detected as **`fastapi`** (because of the legacy root `backend/main.py`). So every push tried to build a FastAPI app from the root → **ERROR**.

**Fix (via Vercel API, non-destructive):**
- `PATCH /v9/projects/pickleball-shuffle` → `rootDirectory: "app"`, `framework: "nextjs"`.
- This makes git pushes build the Next.js app in `app/` and deploy successfully.

**Meaningful URL:** the fixed project serves at **https://pickleball-shuffle.vercel.app** (replaces the `app-delta-ten-94` alias). Updated the live link in `README.md`, `app/README.md`, `app/CLAUDE.md`.

**How to avoid in future:** when the app lives in a subdirectory, set the Vercel project's **Root Directory** to that subdir and pin the **Framework Preset** (don't let a sibling `backend/` mislead auto-detection). Ideally keep **one** Vercel project per repo.

**Verification:** pushed to `main` to trigger a build; confirmed the deployment reaches READY and the live URL serves 200 + 200 cards, and the GitHub commit status is green.

## 2026-06-09 17:52 — Icon-overlap fix, readable menu, reset button, skip/favorites, docs

**Summary:** Fixed an icon-overlap bug and several smaller issues surfaced during testing, added a discoverable score Reset and a Favorites view, made skip auto-advance, and documented all findings.

**Fixes (full list in `docs/BUG-LOG.md`):**
- **Icon overlap** — global `svg.lucide { flex-shrink: 0 }`; TopBar `shrink-0`/`min-w-0`/`flex-wrap` guards; card category pill `truncate`. Root cause + prevention rules in `docs/UI-LAYOUT-NOTES.md`.
- **Menu (☰)** — moved to the far right; dropdown switched from translucent `glass` to a solid `var(--bg-card)` surface with `var(--text)` labels (was unreadable in both themes).
- **Card too big** — responsive height `50dvh`→`38dvh`, capped 22rem; back glyph 72→56px.
- **Score reset** — added a TopBar **Reset** quick-action with inline confirm (was buried in Settings).

**Features:**
- **Skip** now auto-advances to the next card (still filters future draws).
- **Favorites** are now persistent (`pb-favorites`) with a **Favorite cards** panel in the menu; included in export/import.

**Files:** `app/globals.css`, `components/TopBar.tsx`, `components/AppMenu.tsx`, `components/CardDisplay.tsx`, `components/FavoritesPanel.tsx` (new), `lib/client-api.ts`, `app/page.tsx`.

**Docs added:** `docs/UI-LAYOUT-NOTES.md` (icon/layout rules), `docs/BUG-LOG.md` (all findings + fixes).

**Clarification (not a bug):** scoring is independent of the card flip — tap a team tile to score; with side-out scoring on, only the serving team scores on tap.

**Verification:** `npm run build` clean.

## 2026-06-09 17:15 — Fix: resumed game lost the current card

**Summary:** Fixed a bug where going Back then resuming (or refreshing mid-game) dropped the visible card and recent-draws list. Also fixed custom-deck resume.

**Root causes:**
1. `currentCard` / recent history were component state only — `resumeGame` reset them to empty, never using the saved `drawnCardIds`.
2. `CardDisplay` always mounted with `flipped=false`, so a restored card showed the back face.
3. Custom games stored mode as `"chaos"` and dropped the custom cards on resume → wrong pool, card not found.

**Changes:**
- `app/page.tsx` — `resumeGame` reconstructs current card + last-3 history from `drawnCardIds` against the game's own pool; restores `customCards`/`customName`; resume banner shows the custom deck name.
- `components/CardDisplay.tsx` — `flipped` initializes to `!!card` so a resumed card shows its face.
- `lib/game.ts` — `GameSession` gains optional `customName`/`customCards` so custom decks survive save/resume.

**Verification:** `npm run build` clean; redeployed to https://app-delta-ten-94.vercel.app (HTTP 200).

## 2026-06-09 16:59 — Resume, feedback, mobile hardening, Vercel deploy + docs

**Summary:** Added resume-last-game and an in-app feedback flow, hardened the app for iOS/Android/browser use, calmed the palette to reduce eye strain, deployed to Vercel production, and rewrote the docs with the live link + a deep architecture explanation.

**Live:** https://app-delta-ten-94.vercel.app (HTTP 200, 200 cards verified)

**Changes:**
- `app/page.tsx` — Resume banner on landing (Back now keeps the game instead of clearing); finished matches saved to local history; landing restructured into header + scrollable `<main>` (no overlap on short screens); dynamic `theme-color` meta tracking dark/light; feedback panel wired into both menus.
- `components/FeedbackPanel.tsx` (new) — star rating + message → `mailto` (local backup in `pb-feedback`).
- `components/AppMenu.tsx` — added "Send feedback".
- `components/CardDisplay.tsx` — responsive card via `clamp()`/`dvh` so it fits any phone.
- `components/TopBar.tsx`, `HistoryPanel.tsx` — safe-area insets; sheets use `dvh`.
- `app/globals.css` — softened dark/light palettes (no pure black/white), calmer/slower motion, reduced glow; `100dvh` body, 16px form inputs (no iOS zoom), `touch-action: manipulation`, `overflow-x: hidden`, safe-area helper classes, `hover`-gated lifts.
- `app/layout.tsx` — `theme-color` updated to new bg.
- Docs: `README.md` rewritten (live link, local-first rationale, architecture deep-dive: data flow, scoring engine, localStorage schema, animation, SW strategy, mobile hardening); `CLAUDE.md` updated; this WORKLOG entry.

**Decisions:**
- **Resume UX:** Back no longer discards the match — it returns to the landing with a one-tap Resume banner; only End Match / explicit discard clears. Auto-resume on refresh replaced by explicit choice.
- **Feedback delivery:** local-first app has no backend, so feedback uses `mailto` (+ local copy). Swap to Formspree/serverless later if volume warrants.
- **Eye strain:** moved off pure `#0a0a0b`/`#fafafa`, slowed mesh drift (26s), replaced infinite hard glow with a soft shadow pulse.

**Follow-ups:**
- [ ] Run the dead-file cleanup `rm` (see CLAUDE.md list).
- [ ] Optional: set `NEXT_PUBLIC_FEEDBACK_EMAIL` in Vercel env to override the feedback recipient.

## 2026-06-09 16:45 — Local-first decks/history, lucide icons, SaaS pivot+revert

**Summary:** Explored turning the app into a SaaS (auth + DB), then deliberately reverted to **local-first, no login** after deciding cross-device sync wasn't needed. Added custom decks + match history + export/import in localStorage, replaced all emoji with lucide-react icons, and trimmed in-game history to the last 3 draws.

**Decisions (and why):**
- **No login.** The core loop is local + ephemeral; custom decks & history work fine in localStorage. Login only buys cross-device sync/sharing, which there's no concrete need for yet. Auth would add friction, a DB dependency, cost, and a two-path codebase for little gain. Supabase code can be reintroduced later if a sync/sharing need appears.
- Iterated through SQLite+custom-auth → Supabase Auth → local-first. Each pivot was the user's call; final state is local-first.
- **lucide-react** for icons (consistent, non-emoji) — `MODE_ICONS`/`CATEGORY_ICONS` maps in `components/icons.tsx`.

**Changes:**
- `lib/client-api.ts` — now a localStorage store: custom decks, match history (cap 200), export/import, `deckToCards`.
- `components/AppMenu.tsx` (new) — menu: Match history, Custom decks, Export/Import backup.
- `components/icons.tsx` (new) — lucide icon maps for modes + categories.
- `components/HistoryPanel.tsx`, `DecksPanel.tsx` — read/write the local store (decks CRUD, match list + clear).
- `app/page.tsx` — lucide icons, AppMenu, history/decks panels, custom-deck play, saves finished matches to local history, history shows last 3.
- `TopBar`, `CardDisplay`, `ScoreKeeper`, `WinCelebration`, `CardHistory`, `PlayerNames` — emoji → lucide icons; theme-var styling.
- `package.json` — added `lucide-react`; removed `better-sqlite3`/`@supabase/*`.

**Dead code (neutralized to keep build green; `rm` is deny-listed — delete manually):**
- `app/api/` (auth/games/settings/decks), `app/login`, `app/signup`
- `lib/db.ts`, `lib/auth.ts`, `lib/supabase/`, `components/AuthForm.tsx`, `components/UserMenu.tsx`
- Pre-existing orphans: `components/GameSettings.tsx`, `components/DeckModeSelector.tsx`
- Unused `AUTH_SECRET` line in `.env.local`

**Verification:** `npm run build` clean (13 routes); dev server serves `/` and `/cards.json` at HTTP 200.

**Follow-ups:**
- [ ] Run the cleanup `rm` for the dead files listed above.
- [ ] Manual QA: create a custom deck → play it; finish a match → check history; export/import a backup.

## 2026-06-09 16:16 — Interactive & stylish UI pass

**Summary:** Reworked the web UI to feel alive — animated mesh backdrop, true 3D card flips, spring micro-interactions, and a richer win celebration — while keeping the existing dark/light theming.

**Changes:**
- `app/globals.css` — added mesh-gradient backdrop (`.mesh-bg`), a keyframe library (`floatY`, `fadeUp`, `popIn`, `scoreBump`, `pulseGlow`, `shimmer`, `confettiFall`, `ringPulse`) exposed as `anim-*` utilities, 3D-flip primitives, `.glass` glassmorphism, `.shine` sweep, `.pressable` spring affordance, staggered-entrance helper, custom scrollbar, and a `prefers-reduced-motion` guard.
- `app/page.tsx` — landing page: floating glowing logo, accent title, glass mode tiles that stagger in with hover emoji scale/rotate + sliding arrow; mesh backdrop on both landing and game screens; confirm dialog pops in.
- `components/CardDisplay.tsx` — replaced fake scale-swap with a real perspective flip; pulsing-glow back face, shine sweep on reveal, "Draw Again ↻" label.
- `components/ScoreKeeper.tsx` — score tiles bump on change, serving team gets a pulsing ring, gradient fills with colored drop shadows.
- `components/WinCelebration.tsx` — proper falling confetti (dots + ribbons) replacing the bounce, glass pop-in modal, themed buttons.
- `components/TopBar.tsx` — sticky glass bar, pill mode toggle with rotating chevron, animated dropdown with selected-state glow.
- `components/CardHistory.tsx` — staggered entry animation.

**Decisions:** Drove most of the styling/motion through CSS utility classes (theme-var aware) rather than a motion library, to avoid new deps and keep the static-site build. Added a reduced-motion guard so animations degrade gracefully. Verified with `npm run build` (clean) and a running dev server (HTTP 200).

**Follow-ups:**
- [ ] Visually QA on a real phone (haptics, 3D flip, confetti perf).
- [ ] Consider applying the same glass/pressable styling to `SettingsSheet`, `GameSettings`, and `PlayerNames` for full consistency.

## 2026-06-15 15:10 — New logo, security audit, prod deploy

**Summary:** Replaced the "PB" text tile with a real brand mark (tilted playing card overlapping a holed pickleball on the emerald gradient), ran a security audit on the untracked auth experiment (clean), and shipped the logo to production. Opened a tickets list for the remaining requests.

**Changes:**
- `app/icon.svg` (new) — full-tile master mark; Next App Router serves it as the SVG favicon.
- `public/icons/app-icon.svg` (new) — same mark for the landing `<img>`.
- `app/page.tsx` — landing hero swaps the gradient `PB` span for `<img src="/icons/app-icon.svg">` (keeps rounded-3xl + float + glow).
- `favicon.ico`, `public/icons/{icon-192,icon-512,apple-touch-icon}.png` — regenerated from the SVG via `rsvg-convert`; `favicon.ico` rebuilt as a 64×64 PNG-in-ICO with stdlib `struct` (no Pillow/ImageMagick available).
- `docs/TICKETS.md` (new) — pending task list; linked from `docs/index.md`.

**Security audit (untracked auth experiment):** Every file is an inert stub — auth/api routes return HTTP 410, `lib/*` are `export {}`, `AuthForm`/`UserMenu` render `null`, login/signup `redirect("/")`. `.vercel/.env.production.local` is gitignored and uncommitted. **No vulnerabilities; no patch needed** — only the dead-code deletion (T4).

**Verification:** `npm run build` clean (14 routes, `/icon.svg` emitted); local `:3000` serves the new logo + favicon at HTTP 200; production verified — `app-icon.svg`/`icon.svg` return 200 and the landing references the new mark. Deployed `03fa40c` → prod READY (https://pickleball-card-games.vercel.app).

**Follow-ups:** see [`TICKETS.md`](TICKETS.md) — feedback→Form (T1), how-to-use button (T2), in-game pause (T3), dead-stub deletion (T4).
