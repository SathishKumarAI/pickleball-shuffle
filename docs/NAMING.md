# Product Naming

**Chosen name: `Paddol`** (app) + **`Paddol Deck`** (the 1,729-card deck) — 2026-07-02

Two-tier brand: the product is **Paddol** (a coined word that echoes "paddle" without
literally describing it); the card deck inside it is **Paddol Deck**. The sport stays in
the tagline/description for SEO — "Paddol - Pickleball Cards" — never in the brand mark itself.

> ⚠️ **Working branding, NOT a legal clearance.** See [Clearance status](#clearance-status--homework)
> for what's verified and what's still on you before any commercial/public launch.

---

## Naming journey — how we got to Paddol

The decision took four passes. Each pass killed the previous favorite for a concrete reason,
which is *why* we landed on a coined word rather than a clever pickleball pun.

### Pass 1 — descriptive pickleball names
Brainstormed ~50 names in five themes: dink-based (Dinkr, Dinkly…), card/deck/shuffle
(DinkDeck, DeckDink…), court/kitchen slang (KitchenPlay, StackUp…), rally/game-flow
(Rally, SideOut, ThirdShot…), and playful/made-up (Picklr, Volli, Poppl…).
First pick: **ThirdShot** — named after the *third shot drop*, pickleball's signature shot.
Premium feel, insider credibility.

### Pass 2 — combine two favorites
Asked for a **ThirdShot + DinkDeck** combination. Chose a *sub-brand* structure:
app = ThirdShot, the card deck = DinkDeck. Applied it to the app.

### Pass 3 — legal reality check (the pivot)
Trademark research blew up both names:
- **"ThirdShot"** — "Third Shot Drop" is a *registered* pickleball paddle/apparel brand, and
  "Third Shot Sports" also exists. Worse, "third shot" is a **descriptive** term → a weak,
  hard-to-register mark even without the incumbents.
- **"DinkDeck"** — "Dink Decks" by Picklepedia is *already* a digital pickleball card product
  (same category, near-identical name = textbook likelihood of confusion). "Dink" is heavily
  claimed across the sport.

Conclusion: every clever pickleball pun sits on top of someone else's mark. The strongest,
cheapest-to-defend trademark is an **invented/arbitrary word** that doesn't describe the sport.
Keep the pickleball tie in the tagline (SEO), out of the brand.

### Pass 4 — coined-name search + clearance pass
Generated ~16 invented words and ran a web + app-store + Crunchbase conflict pass on each.
Most short coined names were already taken (Volli → games venue, Popl → registered NFC brand,
Zylo → registered SaaS, Dabble → App Store word game, Plynk → Fidelity, Voleo → FINRA broker…).
Survivors with no obvious conflict: **Paddol, Plyngo, Kribble, Zibbl** (+ weaker Wompl/Jindl/Vurl).

**Picked `Paddol`** — the only survivor that still whispers the sport ("paddle") while being a
coined, defensible, arbitrary-ish mark. Best trade-off of marketable + low-risk. The deck
became **Paddol Deck** (dropping the legally-tainted "DinkDeck").

**One honest caveat on Paddol:** because it sounds like "paddle"/"padel," it isn't *purely*
arbitrary — there's mild descriptiveness + a whiff of confusion with paddle-sport apps
(Playtomic, PaddleTrac, Padel Mates). Still dramatically cleaner than ThirdShot/DinkDeck, but
not zero-risk. That's what the clearance homework below is for.

---

## Clearance status — homework

Researched 2026-07-02 via web/RDAP/DNS. **This is not legal advice and not a formal clearance search.**

### What we checked

| Check | Result |
|-------|--------|
| Existing app named "Paddol" (App Store / Play / web) | None found ✅ |
| Company / obvious USPTO mark "Paddol" | None found in web results ✅ (not a substitute for a TESS search) |
| Sound-alike / descriptiveness | 🟡 "Paddol" ≈ "paddle"/"padel"; paddle-sport apps exist. Mild confusion/descriptiveness risk. |
| `paddol.com` | 🔴 **Registered** (resolves in DNS) — not available |
| `paddol.app` | 🟢 No DNS record — likely available |
| `paddol.io` / `paddol.gg` | 🟢 Likely available (no registry hit) |

### Still on you before launch (the real homework)

- [ ] **USPTO TESS search** ([tmsearch.uspto.gov](https://tmsearch.uspto.gov)) for `Paddol` + sound-alikes
      (Paddle, Padel, Paddol, Padol) in **classes 9 (software), 28 (games), 41 (entertainment)**.
- [ ] **Secure a domain** — `paddol.com` is taken, so grab `paddol.app` / `paddol.io` / `getpaddol.com`.
- [ ] **Grab social handles** — @paddol on IG / X / TikTok / YouTube.
- [ ] **Attorney flat-fee clearance** (~$300–600) before spending money or filing.
- [ ] **File the trademark** once cleared (class 9 and/or 41). Use ™ now, ® only after registration.
- [ ] **Rename live URL** — `pickleball-card-games.vercel.app` → new Vercel domain (kept old to not
      break the live link + installed PWAs).
- [ ] **(optional) rename repo dir** `pickleball-shuffle/` → cosmetic only, breaks local paths.

---

## Where the name lives (source of truth)

App branding (all say `Paddol` / `Paddol Deck`):

| File | Field |
|------|-------|
| `app/public/manifest.json` | `name`, `short_name` |
| `app/app/layout.tsx` | `TITLE`, metadata title + template, `appleWebApp.title`, OG/Twitter |
| `app/app/(info)/{about,privacy,terms}/page.tsx` | body + metadata copy (About also names **Paddol Deck**) |
| `app/components/FeedbackPanel.tsx` | email subject + signature |
| `app/lib/shareImage.ts` | share-image watermark + share title |
| `app/app/icon.svg`, `app/app/page.tsx`, `app/public/icons/{app-icon,logo-mark}.svg` | `aria-label` / logo `alt` |
| `scripts/generate_cards.py`, `docs/data/cards.json` | deck `title` metadata ("Paddol - The 1729 Deck") |

Docs / meta (workspace-wide rename applied 2026-07-02): `README.md`, `app/README.md`,
`app/CLAUDE.md`, `CONTRIBUTING.md`, `docs/{index,ONBOARDING,BACKLOG}.md`,
`prompts/{00-scaffold,README}.md`, and `../dotfiles/docs/features/FEATURES.md`.

---

## Legal & trademark (why the earlier names died)

Researched 2026-07-02 (web/USPTO search — **not legal advice, not a clearance search**).

| Name | Risk | Conflicts |
|------|------|-----------|
| **ThirdShot** | High | "Third Shot Drop" (*registered* TM, pickleball paddles/apparel); "Third Shot Sports". Plus "third shot" is **descriptive** → weak/refusable. |
| **DinkDeck** | Highest | "Dink Decks" (Picklepedia) = digital pickleball flashcards, **same category**. "Deal and Dink" on-court card game. "Dink" heavily claimed (Dink Technologies owns PICKLEHEADS). |
| ThirdShot + DinkDeck combo | Highest | inherits both conflicts |
| **Paddol** | Low–moderate | no direct conflict found; only mild "paddle"/"padel" sound-alike risk |

**Climate:** pickleball naming is litigious (National Pickleball League suits Oct 2025; NCAA v. NCPA).
The base mark **"PICKLE-BALL"** (Reg. 0999043, 1974) is itself under cancellation.

---

## Ideas considered (archive)

Kept for future rebrands / sub-brands.

### Full list by theme
- **Dink-based**: Dinkr, Dinkly, Dinko, Dinkit, Dinkster, GoDink, JustDink, DinkUp, DinkPro
- **Card / deck / shuffle**: DinkDeck, DeckDink, ShuffleDink, CardCourt, DeckPlay, ShuffleUp, CutTheDeck, WildCard Pickle, DrawPlay
- **Court / kitchen slang**: KitchenPlay, TheKitchen, Kitchenr, NVZ, CourtSide, BaselineUp, StackUp, Poach, ErneApp
- **Rally / game flow**: Rally, Rallyr, RallyUp, GameStack, NextServe, SideOut, ThirdShot, DropShot
- **Playful / made-up**: Picklr, Picklit, Pickly, Pikl, Volli, Voll, Paddld, Paddlr, Smashr, Poppl
- **Two-word**: Pickle Shuffle, Pickle Stack, Court Cards, Dink Deck, Rally Cards, Kitchen Cards, Paddle Play, Game Shuffle

### Coined-name clearance pass (2026-07-02)
Web + app-store + Crunchbase only — **not a USPTO clearance search**.

- **Rejected (existing brand/TM/app, often same class):** Volli (Volli Entertainment — games),
  Popl (registered, NFC cards), Zylo (registered, SaaS), Dabble (App Store word game), Plynk
  (Fidelity), Quibl, Voleo (FINRA broker app), Skwibl, Yonzo (game), Nuvoli, Froodl, Klynk.
- **No conflict found:** **Paddol** (chosen), Plyngo, Kribble, Zibbl, Wompl, Jindl, Vurl.

### Sources
- Third Shot Drop — https://www.thirdshotdrop.com/
- Third Shot Sports — https://www.thirdshotsports.com/
- Dink Decks (Picklepedia) — https://picklepedia.org/dinkdecks/
- Deal and Dink — https://www.dealanddink.com/
- USPTO trademark search — https://tmsearch.uspto.gov/
- Pickleball trademark climate — https://secureyourtrademark.com/blog/national-pickleball-league-trademark-lawsuit/
- Paddle-sport apps (sound-alike context) — Playtomic, PaddleTrac, Padel Mates (App Store)
