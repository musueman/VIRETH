# Footer music / stacked homepage map — 2026-09-16

## Scope

- Three user-supplied MP3 originals, unchanged hashes, titles from embedded metadata.
- Persistent footer player: initial audible autoplay attempt, manual play/pause, native track selection, previous/next, desktop gain control, three-track loop, actual analyser bars. If browser policy blocks autoplay, the first page click/tap or Enter/Space retries; explicit pause disables retries.
- At the existing <=1000px stacked-map breakpoint: native country selector above the map; normal-flow card 20px below it; deliberate activation scrolls the card under the fixed header. No mobile portal or dismissal geometry. Wider overlapping layouts retain the original portal behavior.
- Compact mobile footer is 57 CSS px including border, plus any platform bottom safe-area inset. Footer navigation/branding is absent from the layout; original smaller sprites protrude above it.

## Verified

- Test-first: five new checks failed on the previous implementation (missing player and wrong stacked-map placement), then passed.
- Portable suite: 20 files / 118 tests passed. Production Pages build and six packaging/URL tests passed.
- Browser widths: 360 and 390 mobile, 1024 tablet landscape and 1440 desktop. No horizontal overflow in measured views. Mobile footer 57px; desktop/tablet footer 85px. Desktop player and navigation had 20px separation at 1440.
- Mobile dropdown and direct map marker selection both select Tiris and scroll the inline card to ~94px, below the 78px header. Gap between map and slot is 20px. Scrolling keeps it in normal document flow. At 1024 the card remains fixed and portaled to body.
- Actual MP3 decoding/playback: readyState=4, advancing currentTime, paused=false, and differing analyser bar scales. All three tracks played through next controls, then wrapped to the first. Pause stops playback and resets bars. Music continued from the homepage to a country detail route without resetting time.
- Browser regression discovered duplicate audio-src application aborting play on next-track. Fixed by updating the native audio source once in the selection handler; next-track playback then advanced normally.
- Read-only review found hidden mobile error text from legacy footer CSS and missing volume in 1001–1200 range. Both corrected. An intentionally unavailable local test asset produced a visible role=status recovery message with computed display:block on a 390px viewport; the asset was restored afterward and all original hashes rechecked.

## Limits

- Responsive browser checks are not physical Android/iOS device tests. Native platform background-audio/interruption behavior may differ.
- The local/private canon-provenance audit is not part of the portable checkout; the same exclusion as the GitHub workflow was used. All included portable tests passed.

## Autoplay follow-up — 2026-09-16

- User requested first-entry automatic playback, superseding the initial manual-only design.
- Test-first coverage includes initial attempt, policy rejection without a false error, first-interaction retry, pause persistence, route persistence, playlist wrap and native playback across track advance while Web Audio is policy-suspended.
- Local browser policy rejected initial audible playback; first page click started the real MP3 (currentTime advanced past 33 seconds, analyser bars varied). After explicit pause, another page click kept audio paused. At 390px, the player play button started playback once without conflicting with the page-level fallback.
- The analyser is attached only when safe for autoplay, or unlocked from a user gesture. No browser policy overrides or muted-playback workaround are used. Physical iOS/Android and unrestricted first-entry autoplay were not verified on devices.
