# UI Layout Notes - icon overlap, boxes, and how to avoid it

This documents the icon-overlap / unreadable-menu issues found during the mobile
polish pass, the fixes applied, and **rules to avoid reintroducing them.**

## Issues found

| # | Symptom | Root cause |
|---|---|---|
| 1 | Icons visually overlapping / squished in tight rows | SVG icons default to `flex-shrink: 1`. In a cramped flex row they compress horizontally and collide with neighbours. |
| 2 | TopBar controls overlapping on narrow phones | The main bar used `justify-between` with **no `shrink-0` guards** - three groups squeezed into each other. Adding the Reset button overflowed the quick-actions row (no `flex-wrap`). |
| 3 | "Triple-line" (☰) menu text unreadable in both themes | The dropdown used a translucent `glass` background floating directly over the busy card/mesh - text washed out. |
| 4 | Long category name colliding with "Skip" on the card | A fixed pill + button in `justify-between` with no `truncate`/`min-w-0`. |

## Fixes applied

- **Global icon guard** (the key fix) in `app/globals.css`:
  ```css
  /* lucide-react renders <svg class="lucide …"> */
  svg.lucide { flex-shrink: 0; }
  ```
  This alone prevents icon compression app-wide.
- **TopBar** (`components/TopBar.tsx`): side groups get `shrink-0`, the center mode
  chip gets `min-w-0` + `truncate` (so it shrinks instead of overlapping), and the
  quick-actions row uses `flex-wrap` so it wraps instead of overflowing.
- **AppMenu dropdown** (`components/AppMenu.tsx`): solid `var(--bg-card)` background
  (not translucent), labels use `var(--text)` (full contrast), icons accent-coloured.
  The ☰ menu is now the right-most control in both the landing header and the TopBar.
- **CardDisplay** (`components/CardDisplay.tsx`): category pill `truncate min-w-0`,
  Skip button `shrink-0`.

## Rules to avoid this in future

1. **Never let an icon shrink.** Any inline icon should be `shrink-0` (the global
   `svg.lucide` rule covers lucide; add `shrink-0` for other SVGs/images).
2. **A flex row needs one flexible child and the rest fixed.** Give the growable
   text `min-w-0` + `truncate`; give icon/button groups `shrink-0`. Without
   `min-w-0`, a flex child refuses to shrink below its content and forces overflow.
3. **`justify-between` does not prevent overlap.** When content exceeds the width,
   items overflow/clip. Always pair it with `shrink-0` on the edges and `min-w-0`
   on the middle.
4. **Rows that can grow in count must `flex-wrap`** (toolbars, chip lists) - don't
   assume a fixed number of buttons.
5. **Floating menus/popovers use a SOLID surface**, never translucent `glass`, when
   they sit directly over busy content. Reserve `glass` for sheets that have a dark
   scrim behind them.
6. **Test at 320px width** (smallest common phone) and with the longest possible
   label (e.g. "Court / Environment", a long custom-deck name).
7. **Fixed-size "boxes"** (score tiles, icon buttons) must be `shrink-0` so they keep
   their dimensions and don't distort.

## Quick audit checklist (run when adding any icon/toolbar)

- [ ] Every icon is `shrink-0` (or is lucide → covered globally).
- [ ] The one growable element has `min-w-0` + `truncate`.
- [ ] Edge groups in a `justify-between` row are `shrink-0`.
- [ ] Variable-count rows have `flex-wrap`.
- [ ] Popovers over content use a solid background + `var(--text)` labels.
- [ ] Looks correct at 320px and with the longest label.

<!-- new-tab-links: open every link in a new tab on the GitHub Pages site -->
<script>document.querySelectorAll('a[href]').forEach(function(a){a.target="_blank";a.rel="noopener noreferrer";});</script>
