# Bug-fix prompts — every issue we hit (with the fix)

Each section is a standalone prompt. Persona for all: **a senior engineer doing
root-cause debugging — fix the cause, not the symptom, and add a guard so it can't
recur.** Output for all: the minimal diff + a one-line note on the guard. Reason in
`<thinking>` first. Cross-ref: `docs/BUG-LOG.md`, `docs/UI-LAYOUT-NOTES.md`.

---

## 1. "0 cards" — stale service worker
<context>The SW was cache-first and never revalidated; an old/empty `cards.json`
was served from cache. Dev showed zero cards.</context>
Fix: make `sw.js` **network-first with cache fallback**, bump the cache name, delete
old caches on `activate`, register the SW **only in production** (dev unregisters it
and clears caches), and fetch `cards.json` with `cache:"no-store"`.
MUST NOT reintroduce a cache-first data strategy.

---

## 2. Resume lost the drawn card
<context>`currentCard`/recent draws were component state, reset on resume; the
card always mounted on its back face.</context>
Fix: reconstruct current card + last-3 history from `GameSession.drawnCardIds`;
`CardDisplay` inits `flipped = !!card`. MUST also handle page refresh mid-game.

---

## 3. Custom-deck game resumed as Chaos
<context>Custom games stored `mode:"chaos"` and dropped the custom cards.</context>
Fix: persist `customName`/`customCards` on the GameSession; restore them on resume;
show the deck name in the banner/top bar. MUST resolve the restored card from the
custom pool, not the built-in cards.

---

## 4. Card (shuffle box) too big
<context>A responsive change used `height: clamp(17rem, 50dvh, 26rem)` — bigger than
the original on tall phones.</context>
Fix: `width: min(78vw,18rem)`, `height: clamp(15rem,38dvh,22rem)`; scale the back
glyph down. MUST verify it's not larger than the previous design on a tall phone.

---

## 5. Icons overlapping in tight rows
<context>SVG icons default to `flex-shrink:1` and compress; the top bar used
`justify-between` with no guards; the quick-actions row didn't wrap.</context>
Fix: global `svg.lucide { flex-shrink: 0 }`; `shrink-0` on edge groups, `min-w-0`+
`truncate` on the flexible middle, `flex-wrap` on variable-count toolbars.
MUST verify at 320px and with the longest label.

---

## 6. Menu (☰) text unreadable in both themes
<context>The dropdown used translucent `glass` over busy content.</context>
Fix: solid `var(--bg-card)` surface, `var(--text)` labels, accent icons; move the
menu to the far right. MUST reserve `glass` for sheets that have a dark scrim.

---

## 7. Score reset wasn't a clean slate
<context>`resetScore` appended a reset event (kept the undo stack), so Undo could
restore the old score; the drawn card stayed on screen.</context>
Fix: `resetScore` clears `history: []`; a single `doReset()` also clears the current
card + recent draws. MUST NOT touch saved Match history (separate concern).

---

## 8. Skip felt broken (no feedback)
<context>Skip excluded the card from future draws but left it on screen.</context>
Fix: skip now auto-advances to the next card while still recording the skip.
MUST keep the skipped id filtering future draws.
