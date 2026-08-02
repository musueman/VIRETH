# Task 4 Report: Desktop and Mobile Visual Verification

## Status

DONE

- Isolated worktree: `C:\Users\musue\.codex\worktrees\vireth-intro-task-4`
- Branch: `codex/vireth-intro-task-4`
- Starting commit: `16be790a6663eeb0905f5b2056b79dd07937ce6c`
- Pre-fix visual commit: `9d75d4c6759ec8328fc2d866935e15c42d45aa6b`
- Integrated final visual commit: `b0b46ea1ed721067868807b0deba164a277634e5`
- Integrated commit message: `fix: keep mobile guide anchors visible`

The integrated Task 4 commit contains only:

`output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html`

`.superpowers/sdd/2026-08-02-vireth-lunatalk-character-intro-implementation/task-4-report.md`

## Visual Defect And Fix

The eight start cards are interactive `<details>` controls, but their closed and open states had no explicit visual disclosure cue. The native summary marker was not visible.

The final HTML now:

- renders a 22px Lucide `chevron-down` icon on every start summary;
- rotates the icon 180 degrees when its card is open;
- restricts the full-cover scene-image selector to `img[data-start-image]`, so the icon is not treated as the card background;
- leaves card dimensions, section framing, scene content, and CTA behavior unchanged.

TDD-style browser evidence:

```text
RED: Error: expected 8 explicit disclosure icons, found 0
GREEN: {"count":8,"closed":"none","opened":"matrix(-1, 0, 0, -1, 0, 0)","src":"https://cdn.jsdelivr.net/npm/lucide-static@0.468.0/icons/chevron-down.svg","allLoaded":true}
```

## Screenshot Evidence

Baseline screenshots supplied by the task:

- `C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\desktop-current.png` (`1440x3149`)
- `C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\mobile-current.png` (`390x4408`)

Final first-viewport and full-page captures:

- `C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\desktop-new-first-viewport.png` (`1440x900`)
- `C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\desktop-new.png` (`1440x1940`)
- `C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\mobile-new-first-viewport.png` (`390x844`)
- `C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\mobile-new.png` (`390x1797`)

Baseline/final side-by-side comparisons, with baseline on the left:

- `C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\compare-desktop-first.png`
- `C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\compare-desktop-full.png`
- `C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\compare-mobile-first.png`
- `C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\compare-mobile-full.png`

Focused visual crops and interaction states:

- `C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\desktop-hero.png`
- `C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\mobile-hero.png`
- `C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\mobile-scenes-contact.png`
- `C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\mobile-start01-focus-viewport.png`
- `C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\mobile-start01-focus-card.png`
- `C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\mobile-start01-open-viewport.png`
- `C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\mobile-start01-open-card.png`
- `C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\mobile-start01-open-full.png`
- `C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\mobile-command-open.png`
- `C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\mobile-update-open.png`
- `C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\mobile-controls-open-full.png`

## Visible Findings

- The notice remains first and is materially shorter than the baseline.
- At `1440x900`, the notice, city, VIRETH 5083 brand, Ren, Duran, CTAs, starts heading, and the first start-card row all appear in the first viewport.
- At `390x844`, the notice, brand, full intro copy, CTAs, and starts heading appear in the first viewport.
- The redesign removes the baseline stack of large framed management panels. General sections are full-width bands; only actual controls and start cards are boxed.
- Desktop start cards form exactly two columns, with no third-column or one-column fallback at `1440px`.
- Ren and Duran remain visually distinct at opposite edges. Their names are stated in the intro caption, both crops retain faces and costume silhouettes, and neither overlaps the other or the H1.
- All eight actual start images are nonempty, distinct, correctly cropped, and readable under their local overlays. The contact sheet shows START 01 through START 08 together.
- CTA labels wrap cleanly, and the compass, book, and external-link icons remain readable.
- The new chevrons are visible on every scene card without covering card titles or important image content.
- Mobile cards use horizontal snap with a visible next-card edge. START 01 opens without width shift, clipping, or stretching neighboring cards.
- Command and update details remain compact controls rather than recreating the baseline stack of boxes.
- No text overlap, incoherent clipping, empty image, or page-level horizontal overflow was visible.

## Measured Browser Evidence

Desktop `1440x900`:

```text
page scrollHeight=1940
root scrollWidth/clientWidth=1440/1440
body scrollWidth/clientWidth=1440/1440
grid display=grid
grid columns=436px 436px
cards=8, each closed card=436x134
images=22, loaded=22, failed=0
```

The starts section begins at `y=626.6`; its first row begins at `y=730.7`, so the starts content is present in the first `900px` viewport.

Mobile `390x844`, closed:

```text
page scrollHeight=1797
root scrollWidth/clientWidth=390/390
body scrollWidth/clientWidth=390/390
grid clientWidth=342
grid scrollWidth=2437
grid overflow-x=auto
grid scroll-snap-type=x mandatory
card width=294.1 (86% of the 342px scroller)
closed card height=134
next-card visible edge=35.9px
images=22, loaded=22
```

Mobile START 01 open:

```text
START 01 width=294.1
START 01 expanded height=489.7
START 02..08 width=294.1 and height=134
focused summary outline=rgb(101, 225, 213) solid 3px
focused summary outline-offset=-4px
open icon transform=matrix(-1, 0, 0, -1, 0, 0)
root/body horizontal width remains 390/390
```

The selected details card expands only to reveal its body. Its width and all neighboring card dimensions remain stable; the selected body is fully visible with no clipping.

Hero overlap checks:

```text
desktop Ren=160x280, Duran=160x280
mobile Ren=89.8x157.1, Duran=89.8x157.1
Ren/Duran overlap=false
Ren/H1 overlap=false
Duran/H1 overlap=false
Ren natural size=640x1120
Duran natural size=640x1120
city natural size=1600x700
```

Representative computed contrast ratios:

```text
root body=17.25:1
notice body=13.67:1
starts lead=11.51:1
start-card body=11.05:1
command row=12.18:1
details summary=14.13:1
```

## Interaction And URL Checks

- Keyboard `Tab` x3 focused START 01 after the two CTAs.
- START 01 opened with `Enter`; the inset focus outline remained continuous and the disclosure icon rotated.
- Command details and update details both opened and rendered without overlap or clipping.
- Internal CTA result:

```text
url=http://127.0.0.1:8802/index-new.html#vireth-starts
hash=#vireth-starts
scrollY=714
targetTop=-0.4
```

- External CTA opened a new tab and reached:

```text
title=비레스 5083 이야기 서고
url=https://vireth-starting-records.musueman.chatgpt.site/reader#scenario=gate-arrival
```

- Final Playwright console:

```text
Total messages: 0 (Errors: 0, Warnings: 0)
```

## Commands And Outputs

Preview server:

```text
C:\Python314\python.exe -m http.server 8802 --bind 127.0.0.1
HTTP_STATUS=200
```

Final unit contract:

```powershell
python -m unittest discover -s tests -p "test_vireth_intro_page.py" -v
```

```text
Ran 13 tests in 0.027s
OK
```

Final structural and live URL validator:

```powershell
python tools/validate_vireth_intro_page.py output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html --check-urls
```

```text
OK: 15 unique remote URLs reachable
OK: output\lunatalk_start_scenarios\vireth_intro_start_situations_updated_full_20260802.html
```

Whitespace and commit-scope verification:

```text
git diff --check
exit=0

git diff-tree --no-commit-id --name-only -r HEAD
output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html

git status --short
<no output>
```

## Self-Review

- Compared baseline and final first-viewport and full-page screenshots together.
- Inspected the final hero crops at both exact viewport sizes.
- Inspected all eight scene summaries together and START 01 in focused and open states.
- Verified desktop column count and mobile snap geometry from computed browser dimensions.
- Verified image natural dimensions, rendered dimensions, loading state, and unique URL reachability.
- Verified Ren/Duran/H1 intersections programmatically and visually.
- Verified representative text contrast from computed foreground/background colors.
- Verified internal and external CTA behavior through actual clicks.
- Verified command and update disclosures in their open states.
- Verified final console output and both root/body horizontal overflow surfaces.
- Re-ran the complete contract and live validator after the HTML edit.
- Confirmed the commit contains only the requested HTML.

## Concerns

None.

## Blocking Review Fix: Mobile Guide Anchors

The earlier mobile conclusion is superseded by this section. The initial `390x844`
layout placed the guide cutouts behind the CTA stack. A Playwright reproduction
confirmed that Ren's face intersected both CTAs, Duran's face intersected the
first CTA, and both upper-body anchor regions intersected both CTAs.

The mobile hero now has three independent vertical zones:

1. Introductory title, copy, and guide caption.
2. A dedicated Ren and Duran guide stage.
3. A two-column CTA row.

The desktop layout continues to use the established left and right guide anchors.
No image assets were added or replaced.

### Fresh Screenshots

All screenshots were captured with terminal Playwright CLI against the local HTTP
preview:

```text
C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\mobile-task4-fix-v2-first-390x844.png
C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\mobile-task4-fix-v2-full-390x844.png
C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\desktop-task4-fix-v2-first-1440x1000.png
C:\Users\musue\AppData\Local\Temp\vireth-intro-audit-20260802\desktop-task4-fix-v2-full-1440x1000.png
```

Direct screenshot inspection confirmed:

- Mobile: Ren's face, hair, scarf, torso, and belt remain visible.
- Mobile: Duran's face, hair, cloak, torso, belt, and arms remain visible.
- Mobile: neither character is covered by the H1, explanatory paragraphs,
  guide caption, or CTAs.
- Mobile: both CTA labels and icons remain readable without clipping.
- Mobile: `어디에서 시작할까요?` and its lead text remain visible in the first
  `390x844` viewport.
- Desktop: the city background, guide anchors, centered copy, CTAs, and two-column
  start-card layout retain their previous composition.
- Full-page captures show no blank images, unintended overlap, or horizontal page
  overflow.

### Mobile Geometry: 390x844

Face regions are measured from the visible source-art proportions: Ren
`x=22%-96%, y=8%-36%`; Duran `x=30%-82%, y=2%-23%`. Upper-body anchor regions
use Ren `x=10%-100%, y=0%-70%` and Duran `x=8%-92%, y=0%-65%`.

```text
intro           x=8.0   y=243.6 w=374.0 h=487.5 bottom=731.1
H1              x=26.0  y=291.8 w=338.0 h=37.8
copy paragraph1 x=26.0  y=339.5 w=338.0 h=50.4
copy paragraph2 x=26.0  y=397.9 w=338.0 h=50.4
guide caption   x=26.0  y=463.3 w=338.0 h=21.8

Ren image       x=77.0  y=493.1 w=81.1  h=142.0
Ren face        x=94.8  y=504.5 w=60.0  h=39.8
Ren anchor      x=85.1  y=493.1 w=73.0  h=99.4

Duran image     x=231.9 y=493.1 w=81.1  h=142.0
Duran face      x=256.2 y=495.9 w=42.2  h=29.8
Duran anchor    x=238.4 y=493.1 w=68.1  h=92.3

CTA 1           x=26.0  y=647.1 w=149.3 h=64.0
CTA 2           x=183.3 y=647.1 w=180.7 h=64.0
start heading   x=24.0  y=758.1 w=342.0 h=28.6
```

Programmatic intersection results:

```text
Ren face vs H1/copy1/copy2/caption/CTA1/CTA2:
false false false false false false
Duran face vs H1/copy1/copy2/caption/CTA1/CTA2:
false false false false false false
Ren upper-body anchor vs H1/copy1/copy2/caption/CTA1/CTA2:
false false false false false false
Duran upper-body anchor vs H1/copy1/copy2/caption/CTA1/CTA2:
false false false false false false
Ren vs Duran:
false
start heading visible:
true
```

### Desktop Geometry: 1440x1000

```text
intro           x=240.0  y=196.6 w=960.0 h=430.0 bottom=626.6
H1              x=414.0  y=324.2 w=612.0 h=37.8
copy paragraph1 x=414.0  y=372.0 w=612.0 h=25.2
copy paragraph2 x=414.0  y=405.1 w=612.0 h=25.2
guide caption   x=414.0  y=445.3 w=612.0 h=21.8

Ren image       x=250.0  y=346.6 w=160.0 h=280.0
Ren face        x=285.2  y=369.0 w=118.4 h=78.4
Ren anchor      x=266.0  y=346.6 w=144.0 h=196.0

Duran image     x=1030.0 y=346.6 w=160.0 h=280.0
Duran face      x=1078.0 y=352.2 w=83.2  h=58.8
Duran anchor    x=1042.8 y=346.6 w=134.4 h=182.0

CTA 1           x=486.2  y=487.2 w=192.6 h=44.0
CTA 2           x=688.8  y=487.2 w=265.0 h=44.0
start heading   x=278.0  y=653.6 w=884.0 h=28.6
```

Every face and upper-body anchor intersection against the H1, both explanatory
paragraphs, guide caption, and both CTAs is `false`. Ren and Duran do not
intersect each other, and the start heading is visible in the first viewport.

### Fresh Verification

```powershell
python -m unittest discover -s tests -p "test_vireth_intro_page.py" -v
```

```text
Ran 13 tests in 0.021s
OK
```

```powershell
python tools/validate_vireth_intro_page.py output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html --check-urls
```

```text
OK: 15 unique remote URLs reachable
OK: output\lunatalk_start_scenarios\vireth_intro_start_situations_updated_full_20260802.html
```

Final mobile browser health check:

```text
console messages=0, errors=0, warnings=0
images total=22, loaded=22, failed=0
document root scrollWidth/clientWidth=390/390
body scrollWidth/clientWidth=390/390
start heading visible=true
```

### Final Concern Status

The blocking mobile guide-anchor finding is resolved in the fresh screenshots and
geometry above. No remaining Task 4 concern was observed.
