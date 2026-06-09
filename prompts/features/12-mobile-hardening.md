# Feature — mobile / browser hardening

You are a mobile-web specialist. Your objective is to make the app feel native on
iOS and Android browsers and PWAs — the primary use case is a phone at a court.

<context>
  <targets>iOS Safari, Android Chrome, installed PWA. Small phones down to 320px.</targets>
</context>

## Instructions
1. Use `100dvh` (not `100vh`) for full-height layouts so the URL bar never clips.
2. Force `font-size: 16px` on inputs/textareas/selects (prevents iOS focus zoom).
3. Add `touch-action: manipulation` to interactive elements (kills 300ms delay +
   double-tap zoom).
4. Apply safe-area insets (`env(safe-area-inset-*)`) to header, sticky top bar, and
   bottom sheets.
5. Add `overflow-x: hidden` and ensure all sizes use responsive `clamp()`/`vw`.
6. Layout with a header + scrollable `<main>` (no absolute-positioned controls that
   overlap on short screens).

## Constraints
- MUST verify nothing overlaps or side-scrolls at 320px width.
- MUST keep tap targets ≥ ~40px and gate hover effects behind `@media (hover:hover)`.
- MUST NOT rely on `vh` for anything full-height.

## Output format
The `globals.css` rules + layout changes. Reason in `<thinking>` about the riskiest
viewport (short, notched phone) first.
