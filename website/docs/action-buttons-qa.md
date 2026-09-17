# Shared action buttons QA — 2026-09-17

## Scope

Apply the approved hero CTA treatment to content navigation, learn-more links,
back links, region-map actions and map destination links. Keep header controls,
music controls, close buttons, map markers and filters unchanged.

## Browser checks

- Before the change, region-map buttons, destination links and place-directory
  labels did not have the inset border. After the change, all three report a
  1px inset border and retain their respective navy, ivory and white palettes.
- Keyboard focus on a region-map action and the hero CTA activates the inset
  border. The settled hero focus state has opacity 1 and translateY(-2px).
- At 390px, the newcomer link is 224px wide, 54px high, with 18px horizontal
  padding and a 14px gap. Client and scroll widths both equal 222px; no clipping.
- At 1280px, hero CTAs are 232px wide and 54px high with 24px horizontal
  padding. The mobile-only large-map opener remains display:none.
- No document horizontal overflow at either tested width. Mobile map destination
  text stays on one line. Music/menu control pseudo-elements remain unchanged.
- Screenshots reviewed for mobile hero layout and desktop focused hero CTA.
- Fine-pointer hover uses the same visual state as keyboard focus plus a passing
  sheen; reduced-motion CSS disables transforms/transitions and the sheen.
  Physical-device and direct mouse-hover execution were not part of this check.

## Automated checks

- Vitest source suite: 20 files, 120 tests passed.
- Vite production build with `/VIRETH/` base: passed.
- Pages/Sites packaging tests: 8 passed.
- A read-only CSS/cascade review found no important regressions; its mobile
  newcomer-link clipping concern was checked using the dimensions above.

## Profile-card contrast regression — 2026-09-17

The profile card's old hover/focus rule forced all `a` elements to nearly black
with `!important`, overriding the new dark CTA palette. Restrict the card's
light-surface text override to paragraphs/headings; the CTA owns its colors.

Reproduce by focusing `이 사람 알아보기` inside `.person-profile-band` (the
same conflicting declaration was used by pointer hover). Read computed color
and background after the transition; calculate sRGB relative luminance and
require contrast >= 4.5. On the original published CSS this check failed at
1.515:1 (#161616 on #173b49). With the fix the identical browser check passes
at 10.174:1 (#f4ecdd on #173b49). Screenshot confirms the SVG arrow also
inherits the readable ivory foreground while the card body remains dark.
