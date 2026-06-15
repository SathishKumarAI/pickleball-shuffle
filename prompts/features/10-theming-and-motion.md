# Feature - theming + motion system

You are a design-minded front-end engineer. Your objective is the dark/light theme
system and a small, reusable animation toolkit that feels polished but calm.

<context>
  <theming>CSS variables under `[data-theme]`; toggled by setting the attribute on
  <html>. The browser `theme-color` meta must track the active theme.</theming>
  <motion>Utility classes in globals.css; everything degrades under
  prefers-reduced-motion.</motion>
</context>

## Instructions
1. Define dark + light token sets (soft off-black/off-white - no pure #000/#fff).
2. Build animation utilities: `anim-fade-up`, `anim-pop`, `anim-float`, `anim-bump`
   (score), `anim-glow` (soft, not harsh), `anim-ring` (serving), `.stagger`,
   `.shine`, `.pressable` (hover lift gated behind `@media (hover:hover)`).
3. Add a subtle animated mesh-gradient backdrop (`.mesh-bg`) that drifts slowly.
4. Toggle theme in `page.tsx`; update the `theme-color` meta on change.

## Constraints
- MUST keep contrast readable in BOTH themes (test text on glass/elevated).
- MUST keep motion subtle - slow drifts, soft glows; avoid constant harsh pulsing.
- MUST collapse all animation under `prefers-reduced-motion: reduce`.

## Output format
The `globals.css` token + animation system and the `page.tsx` theme effect. Reason
in `<thinking>` about eye-strain trade-offs first.
