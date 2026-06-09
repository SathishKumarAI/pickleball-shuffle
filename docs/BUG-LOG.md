# Bug & Findings Log

Issues found during the polish/mobile passes and how each was fixed. Newest first.
For the icon/layout-specific deep dive and prevention rules, see
[`UI-LAYOUT-NOTES.md`](UI-LAYOUT-NOTES.md).

| # | Severity | Symptom | Root cause | Fix |
|---|---|---|---|---|
| 1 | High | App showed **"0 cards"** | Service worker was cache-first and never revalidated; an old/empty `cards.json` was served from cache. | `public/sw.js` → **network-first** with cache fallback, cache bumped to `pb-shuffle-v2`; SW registers **only in production**, dev unregisters it + clears caches; `cards.json` fetched with `cache:"no-store"`. |
| 2 | High | **Resuming a game lost the drawn card** + recent draws | `currentCard`/history were component state (reset on resume); `CardDisplay` always mounted on the card back. | Reconstruct current card + last-3 history from `GameSession.drawnCardIds`; `CardDisplay` inits `flipped = !!card`. |
| 3 | High | Custom-deck game resumed as **Chaos**, card not found | Custom games stored `mode:"chaos"` and dropped the custom cards. | Persist `customName`/`customCards` on `GameSession`; restore on resume; banner shows the deck name. |
| 4 | Med | **Card (shuffle box) too big** | Responsive change used `height: clamp(17rem, 50dvh, 26rem)` → larger than the original 22rem on tall phones. | `width: min(78vw,18rem)`, `height: clamp(15rem,38dvh,22rem)`; back glyph 72→56px. |
| 5 | Med | **Icons overlapping** in tight rows | SVGs default to `flex-shrink:1`; TopBar `justify-between` had no `shrink-0` guards; quick-actions didn't wrap. | Global `svg.lucide{flex-shrink:0}`; `shrink-0` on edge groups, `min-w-0`+`truncate` on the center; `flex-wrap` on quick actions. |
| 6 | Med | **Menu (☰) text unreadable** in both themes | Dropdown used translucent `glass` over busy content. | Solid `var(--bg-card)` surface, `var(--text)` labels, accent icons. Menu also moved to the far right. |
| 7 | Med | **Score reset hard to find / risky** | Only available deep in the Settings sheet, no confirmation. | Added a **Reset** quick-action in the TopBar with an inline "Reset score to 0–0? · Reset/Cancel" confirm (disabled at 0–0). |
| 8 | Low | **Skip felt broken** | Skip worked (excludes card from future draws) but gave no visual feedback — the card stayed on screen. | Skip now **auto-advances** to the next card; skipped ids still filter future draws. |
| 9 | Low | **Favorites couldn't be viewed** and were lost each game | Favorites lived only in `GameSession` (per-game), with no UI to list them. | Persistent favorites store (`pb-favorites`); **Favorite cards** panel in the menu; included in export/import. |
| 10 | Low | Long category name could collide with **Skip** on the card | Pill + button in `justify-between` without `truncate`. | Category pill `truncate min-w-0`; Skip button `shrink-0`. |
| 11 | Med | **Reset wasn't a clean slate** — undo could restore the old score after a reset, and the drawn card stayed | `resetScore` *appended* a reset event (kept the undo stack); the reset handler never cleared the on-screen card/draws. | `resetScore` now clears `history: []`; a single `doReset()` also clears `currentCard` + recent draws. **Saved Match history is deliberately NOT touched** (separate concern, own Clear button). |

## Clarifications (not bugs)

- **Scoring is independent of the card.** Tapping a team's score tile adds a point
  without any card flip. Caveat: with **Side-out scoring** ON (default), only the
  **serving team** scores on tap — tapping the other team triggers a side-out
  (serve switches, no point). Turn off "Side-out scoring" in Settings for
  rally-style scoring where either team can score on tap.
- The score also resets to 0–0 automatically when **starting a game** and on
  **"Next Game"** after a win.

## Known limitations

- Favorites of **custom-deck** cards use negative ids and only resolve while that
  deck is loaded; built-in card favorites persist normally.
- Resume reshuffles a fresh deck (drawn-card de-duplication is not preserved across
  a resume) — by design, low impact.
