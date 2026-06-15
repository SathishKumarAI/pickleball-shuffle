# Tickets / Pending Task List

Open work, newest intent first. Closed items move to [`WORKLOG.md`](WORKLOG.md).
Status: 🔴 not started · 🟡 in progress / blocked on input · ✅ done (kept briefly for context).

| # | Status | Ticket | Notes / what's needed |
|---|--------|--------|------------------------|
| T1 | 🟡 | **Feedback → Google Form → Sheet** | Design approved (silent background POST from `FeedbackPanel`, no auth, stays local-first). **Blocked:** need your Google Form ID + the 3 `entry.NNN` field IDs (rating / message / contact). No code can create the Form. |
| T2 | 🟡 | **"How to use" button on landing only** | Surface `RulesPanel` directly on the home page (not just the hamburger), in-game/settings untouched. **Blocked:** pick placement — A) pill under the mode grid (recommended), B) footer link, C) text under the subtitle. |
| T3 | 🟡 | **In-game pause option** | App is a scorekeeper + card draw with no timer, so "pause" is undefined. Likely a full-screen pause/break overlay that hides the current card and dims the board until resumed. **Blocked:** 1-line spec of desired behavior. |
| T4 | 🔴 | **Delete dead auth stubs** | `app/api/`, `app/login`, `app/signup`, `lib/db.ts`, `lib/auth.ts`, `lib/supabase/`, `components/AuthForm.tsx`, `components/UserMenu.tsx`, nested `app/app/package.json`+lock. Security audit (2026-06-15) confirms all are inert stubs, no vulns. `rm` is deny-listed → delete manually or grant permission. |
| T5 | 🔴 | **Proper multi-size favicon.ico** | Current `favicon.ico` is a single 64×64 PNG wrapped in an ICO (no Pillow/ImageMagick on box). Works in modern browsers; regenerate with a real ICO tool (16/32/48) for legacy. |
| T6 | 🔴 | **Remove orphan `public/icons/logo-mark.svg`** | Unused transparent mark from the logo work (composed poorly, replaced by `app-icon.svg`). `rm` deny-listed → delete manually. |
| T7 | 🔴 | **`vercel dev` on :3001 broken** | Collides with the plain `next dev` on :3000 and won't route (404). Working dev server is **:3000**. For true `vercel dev`, `kill 211370` first, then `vercel dev` from repo root. |

## Recently shipped
- ✅ **New pickleball + card logo** — landing hero, favicon, `icon.svg`, PWA icons (192/512/apple-touch). Committed `03fa40c`, pushed `main`, deployed prod. Live: https://pickleball-card-games.vercel.app
- ✅ **Security audit** — all untracked auth files are inert stubs; secret file gitignored; **no vulnerabilities** (see T4 for cleanup).
