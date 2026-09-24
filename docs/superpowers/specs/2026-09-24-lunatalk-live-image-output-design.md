# LunaTalk live image output design

**Date:** 2026-09-24  
**Status:** Approved for implementation

## Problem demonstrated in the live chat

The current chat does not call the reworked image system. Its rendered output
contains only the legacy `/scene?regionId=R003&placeId=L022` card. That card is
an SVG with a text banner and location labels, not a new reworked place image.
No `/place-image`, `/character-image`, or `/talk` image request is present in
the rendered chat.

Two independent causes need to be fixed together:

1. Production has not yet received the Worker routes that serve the reworked
   assets.
2. LunaTalk's character logic and lorebook describe pseudo-URLs and legacy
   `/scene` usage instead of placing literal Markdown image URLs in each reply.

The legacy `/scene` endpoint remains available for map/status features, but it
is not a normal dialogue image endpoint.

## Product contract

Each normal turn has one visual order:

1. A single, uncaptioned place image at the very top.
2. For every speaking character, one character image immediately before that
   character's dialogue.
3. The existing final status panel.

The place image is a bare reworked WebP. It contains no country, region, city,
or place-name caption. SVG is reserved for the later status/location
visualization layer, not for writing captions into the image asset.

Character images use the same resolved place background as the top image. A
normal emotional state is a character-and-background composite. A sexual/action
state is still the same `character-image` category, but is delivered as its
complete action image; it is never a transparent overlay or a second image
type.

## Worker URL contract

### Top place image

`GET /place-image?regionId={R}&placeId={L}&time={DAY|NIGHT}` returns one bare
reworked WebP for a settlement or named facility.

`GET /place-image?regionId={R}&time={DAY|NIGHT}&scope=region` returns one bare
regional WebP when the scene is outside a city or has no named settlement.

`GET /place-image?bg={VBG_KEY}` remains an explicit override for authored
scenes. An explicit `bg` wins over all inferred values.

The first pinned live case is:

`/place-image?regionId=R003&placeId=L022&time=DAY` -> `VBG_GATE_DAY`.

The resolver uses an explicit place override when one is known, then the
existing structured scene/background classification, and finally a regional
`VRA_N###` image. The fallback must be deterministic, so a missing place
classification still produces a reworked image instead of returning the old
captioned `/scene` card.

### Character image

`GET /character-image?id={C}&regionId={R}&placeId={L}&time={DAY|NIGHT}&e={E}`
returns the normal character-plus-resolved-background composite without text.

`GET /character-image?id={C}&regionId={R}&placeId={L}&time={DAY|NIGHT}&ss={S}`
returns the matching complete action image without an overlay. `ss` wins over
`e` when both are supplied.

The compatibility `/talk` route may remain, but new LunaTalk instructions must
use `/character-image`. Neither normal route depends on a hand-authored `VBG`
key in the model response.

## LunaTalk instruction contract

The character logic and the `캐릭터 이미지` lorebook entry must include literal
Markdown image lines, rather than concatenation notation such as
`b+character+&e=E`.

For example, a normal reply at the current test location must emit exactly the
following kind of lines (with current values substituted):

```md
![](https://vireth-svg.musueman.workers.dev/place-image?regionId=R003&placeId=L022&time=DAY)

![](https://vireth-svg.musueman.workers.dev/character-image?id=C012&regionId=R003&placeId=L022&time=DAY&e=n)
```

The same literal URL form is required for every speaker in a multi-character
turn. The logic must forbid `/scene` in ordinary dialogue. `/map` remains
limited to explicit `!장소` map requests.

The character greeting must also be updated: replace the legacy GitHub
`gate-arrival-webtoon.webp` image with the literal `place-image` URL for the
starting location. It must no longer make the first visible place image a
legacy static illustration.

## Implementation and verification sequence

1. Add failing Worker contract tests for location-derived place images,
   `L022 -> VBG_GATE_DAY`, regional fallback, and character images that inherit
   the location-derived background.
2. Implement the resolver and run the full Worker test suite locally.
3. Deploy the Worker, then prove the public `/place-image` endpoint returns an
   image rather than 404.
4. Update LunaTalk character logic, the two character-image lorebook entries,
   and the greeting with the literal Markdown contract above.
5. Create a fresh QA chat (old transcript messages cannot be retroactively
   rewritten) and capture rendered screenshots. The evidence must show the new
   uncaptioned top image, a character image before dialogue, and no `/scene`
   request in ordinary replies.
6. Run the requested long-turn regression only after the short live smoke test
   visibly proves that the image URLs are actually being emitted and rendered.

## Out of scope

- Changing the `!장소` map presentation.
- Burning labels into any of the place or character image assets.
- Creating a separate NSFW output category or transparent character overlay.
