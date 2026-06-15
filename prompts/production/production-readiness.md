# Production-readiness prompts

Take the working local-first app to production quality. Each section is a standalone
prompt; run them in order. Persona for all: **a staff engineer shipping a real
product.** Output: the files/config + a short "how to verify" note. Reason in
`<thinking>` first. MUST NOT add a backend/login unless a prompt explicitly says so.

---

## 1. Automated tests
Objective: confidence in the game logic and critical flows.
Instructions: add Vitest unit tests for `lib/game.ts` (every transition + win/side-out
edge cases) and `lib/client-api.ts` (decks/history/favorites/export-import round-trip).
Add Playwright e2e for: start game → draw → score → win; resume; create+play a custom
deck. MUST keep `lib/game.ts` pure so it's testable without a DOM. Output: test files
+ scripts + how to run.

---

## 2. CI/CD
Objective: every push is built, linted, typechecked, tested, and preview-deployed.
Instructions: GitHub Actions workflow (lint → typecheck → unit → build → e2e) and
Vercel preview deployments per PR with production promotion on merge to `main`.
Keep `VERCEL_TOKEN`/org/project as CI secrets (never in the repo). Output: workflow
YAML + Vercel project settings notes.

---

## 3. Error handling + monitoring
Objective: nothing fails silently in production.
Instructions: add a React error boundary with a friendly fallback; wrap all
localStorage access in try/catch (already centralized in `client-api.ts`); add a
privacy-respecting error reporter (e.g. Sentry) gated behind an env flag, scrubbing
PII. MUST degrade gracefully when storage is unavailable (private mode). Output:
boundary component + reporter setup.

---

## 4. Accessibility audit
Objective: usable with a keyboard and a screen reader, AA contrast.
Instructions: audit focus order, visible focus rings, `aria-label`s on icon buttons,
dialog/sheet focus trapping + Escape-to-close, and color contrast in both themes.
Add an automated axe check to e2e. MUST hit WCAG AA contrast in dark AND light.
Output: the component fixes + the axe test.

---

## 5. Performance + Core Web Vitals
Objective: instant on a mid-range phone.
Instructions: measure with Lighthouse; ensure the card list/sheets don't re-render
needlessly (memoize where it matters); preload `cards.json`; verify the mesh/animations
are GPU-cheap; keep bundle lean (no heavy deps). MUST keep LCP/INP green on a throttled
mobile profile. Output: the measured before/after + the changes.

---

## 6. Analytics (privacy-first)
Objective: learn what's used without harming the local-first promise.
Instructions: add optional, cookieless, anonymous analytics (e.g. Plausible/Umami)
behind an env flag and a visible opt-out; track only aggregate events (game started,
mode chosen, deck created) - never card content or PII. MUST keep it off by default in
dev and disclose it in a short privacy note. Output: the analytics wrapper + privacy note.

---

## 7. SEO + share
Objective: a clean first impression when the link is shared.
Instructions: add `metadata` (title/description), Open Graph + Twitter cards, a static
OG image, and `robots`/`sitemap`. MUST keep it a single-page experience. Output: the
metadata + OG image plan.
