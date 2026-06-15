# Tickets / Pending Task List

Open work, newest intent first. Closed items move to [`WORKLOG.md`](WORKLOG.md).
Status: 🔴 not started · 🟡 in progress / blocked on input · ✅ done (kept briefly for context).

| # | Status | Ticket | Notes / what's needed |
|---|--------|--------|------------------------|
| T1 | 🟡 | **Feedback → Google Form → Sheet** | Design approved (silent background POST from `FeedbackPanel`, no auth, stays local-first). **Blocked:** need your Google Form ID + the 3 `entry.NNN` field IDs (rating / message / contact). No code can create the Form. |
| T2 | ✅ | **"How to use" button on landing** | Done — "How to use" chip beside the hero title (wraps below on narrow phones), opens `RulesPanel`; in-game/settings untouched. |
| T3 | 🟡 | **In-game pause option** | App is a scorekeeper + card draw with no timer, so "pause" is undefined. Likely a full-screen pause/break overlay that hides the current card and dims the board until resumed. **Blocked:** 1-line spec of desired behavior. |
| T4 | 🔴 | **Delete dead auth stubs** | `app/api/`, `app/login`, `app/signup`, `lib/db.ts`, `lib/auth.ts`, `lib/supabase/`, `components/AuthForm.tsx`, `components/UserMenu.tsx`, nested `app/app/package.json`+lock. Security audit (2026-06-15) confirms all are inert stubs, no vulns. `rm` is deny-listed → delete manually or grant permission. |
| T5 | 🔴 | **Proper multi-size favicon.ico** | Current `favicon.ico` is a single 64×64 PNG wrapped in an ICO (no Pillow/ImageMagick on box). Works in modern browsers; regenerate with a real ICO tool (16/32/48) for legacy. |
| T6 | 🔴 | **Remove orphan `public/icons/logo-mark.svg`** | Unused transparent mark from the logo work (composed poorly, replaced by `app-icon.svg`). `rm` deny-listed → delete manually. |
| T7 | 🔴 | **`vercel dev` on :3001 broken** | Collides with the plain `next dev` on :3000 and won't route (404). Working dev server is **:3000**. For true `vercel dev`, `kill 211370` first, then `vercel dev` from repo root. |

## Recently shipped
- ✅ **Frontend gap fixes (4 batches)** — accessibility (focus-visible, zoom unlock, aria-labels, dialog semantics + Escape/focus-trap on shared Sheet, switch/chip roles, contrast), reduced-motion correctness (card flip, confetti, infinite loops), design-system consistency (SettingsSheet onto shared Sheet, emoji→lucide, manifest color), and custom fonts (Bricolage Grotesque + Hanken Grotesk). See WORKLOG 2026-06-15.
- ✅ **Best-of-3 match-complete screen** — `WinCelebration` now shows a series-winner state ("wins the match", games tally, New Match) when a team reaches 2 games. Engine: `matchWinner`/`seriesTally`/`newMatch` in `lib/game.ts`.
- ✅ **"How to use" chip** on landing (T2).
- ✅ **New pickleball + card logo** — landing hero, favicon, `icon.svg`, PWA icons. Live: https://pickleball-card-games.vercel.app
- ✅ **Security audit** — all untracked auth files are inert stubs; secret file gitignored; **no vulnerabilities** (see T4 for cleanup).

## Newly opened (from the frontend audit)
| # | Status | Ticket | Notes |
|---|--------|--------|-------|
| T8 | 🔴 | Tap targets <44px | A few TopBar quick-actions + card favorite/skip still below the 44px minimum; enlarge hit areas. |
| T9 | 🔴 | Make best-of-N a Settings option | Series length is fixed best-of-3; expose 1/3/5 in SettingsSheet if wanted. |
| T10 | 🔴 | Replace `alert()` in AppMenu import | Native alerts clash with the glass UI; route through an in-app banner. |
