# Feature - PWA + offline

You are a web-platform engineer. Your objective is to make the app installable and
usable offline, without the classic stale-cache pitfalls.

<context>
  <pwa>manifest.json, icons, apple-web-app meta, viewport-fit cover.</pwa>
  <sw>public/sw.js - must serve fresh data online but work offline.</sw>
</context>

## Instructions
1. Add `public/manifest.json` (name, icons 192/512, theme/background, display
   standalone) and link it; add apple-touch-icon + apple-web-app meta in the layout.
2. Write `public/sw.js` as **network-first with cache fallback** (versioned cache,
   e.g. `pb-shuffle-v2`; the `activate` handler deletes old caches).
3. Register the SW **only in production**. In development, actively unregister any
   existing SW and clear caches on load.
4. Fetch `cards.json` with `cache: "no-store"`.

## Constraints
- MUST NOT use a cache-first strategy for data (it caused a "0 cards" stale bug).
- MUST bump the cache name on shape changes so old caches are purged.
- MUST keep the SW out of dev to avoid serving stale local builds.

## Output format
`public/sw.js`, `public/manifest.json`, the layout meta, and the registration code.
Reason in `<thinking>` about the cache strategy trade-offs first.
