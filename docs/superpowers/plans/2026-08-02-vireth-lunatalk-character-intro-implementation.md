# Vireth LunaTalk Character Intro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new LunaTalk-ready Vireth 5083 character introduction fragment that foregrounds the world and eight starting scenes, uses Ren and Duran as non-author guide anchors, reduces excessive boxing, and links to the production story archive.

**Architecture:** Preserve the existing single-fragment delivery format and create a new dated output instead of overwriting the 2026-08-01 artifact. Add a standard-library Python validator and unit test as the structural contract, then verify the rendered result with Playwright at desktop and mobile viewports. Use existing remote Vireth assets only and keep a usable inline-style fallback if LunaTalk strips the scoped responsive `<style>` block.

**Tech Stack:** HTML fragment, inline CSS plus one scoped responsive `<style>` block, Python 3 `html.parser` and `unittest`, Playwright CLI, existing Vireth Worker/Sites assets, Lucide static icon assets.

## Global Constraints

- Target character is LunaTalk `idx=70170`.
- Preserve the existing 2026-07-15 accident notice and 2026-08-01 update facts.
- Preserve one basic start and seven role starts, exactly eight cards in the existing order.
- Do not generate new images or alter source Vireth assets.
- Use Ren and Duran only as travelers and visual guide anchors, never as document authors or universal event participants.
- Public copy, image alternative text, and generated HTML must not contain `Arcadia` or `아르카디아`.
- Use frames only for the notice, actionable buttons, start cards, and expandable controls.
- Desktop start layout is two columns; mobile layout is horizontal scroll with visible next-card affordance.
- Keep all essential colors explicit so the fragment remains readable inside both light and dark LunaTalk themes.
- Do not modify the 2026-08-01 HTML artifact.
- Do not stage unrelated working-tree changes, `.playwright-cli/`, or temporary screenshots.

---

## File Map

- Create `tests/test_vireth_intro_page.py`: executable contract for the dated HTML output.
- Create `tools/validate_vireth_intro_page.py`: structured HTML parser and validation CLI.
- Create `output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html`: final LunaTalk-ready introduction fragment.
- Use `output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260801.html` as read-only content input.
- Use temporary screenshots under `%TEMP%\vireth-intro-audit-20260802\`; do not add screenshots to Git.

## Task 1: Add the Introduction Contract

**Files:**
- Create: `tests/test_vireth_intro_page.py`
- Create: `tools/validate_vireth_intro_page.py`
- Test target: `output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html`

**Interfaces:**
- Produces: `validate_intro(path: pathlib.Path) -> list[str]`
- Produces: CLI `python tools/validate_vireth_intro_page.py output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html`
- Consumes: semantic attributes defined for Task 2:
  - `data-vireth-intro="20260802"`
  - `data-section`
  - `data-start-card`
  - `data-start-image`
  - `data-ui-frame`
  - `data-cta`

- [ ] **Step 1: Write the failing unit test**

Create `tests/test_vireth_intro_page.py`:

```python
from pathlib import Path
import unittest

from tools.validate_vireth_intro_page import validate_intro


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "output" / "lunatalk_start_scenarios" / (
    "vireth_intro_start_situations_updated_full_20260802.html"
)


class VirethIntroContractTest(unittest.TestCase):
    def test_intro_contract(self) -> None:
        errors = validate_intro(TARGET)
        self.assertEqual([], errors, "\n".join(errors))


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run the test and verify the initial failure**

Run:

```powershell
python -m unittest discover -s tests -p "test_vireth_intro_page.py" -v
```

Expected: `ERROR` with `ModuleNotFoundError` because the validator module does not exist yet.

- [ ] **Step 3: Implement the structured validator**

Create `tools/validate_vireth_intro_page.py` with an `HTMLParser` subclass. It must collect:

```python
REQUIRED_SECTIONS = [
    "notice",
    "intro",
    "starts",
    "play-flow",
    "commands",
    "updates",
]
ALLOWED_FRAMES = {
    "notice",
    "cta",
    "start-card",
    "details-control",
}
EXPECTED_ARCHIVE_URL = (
    "https://vireth-starting-records.musueman.chatgpt.site/#story-starts"
)
EXPECTED_INTERNAL_START_URL = "#vireth-starts"
```

The parser must collect these values from attributes instead of counting Korean display strings:

```python
self.sections: list[str]
self.start_cards: list[str]
self.start_images: list[str]
self.frames: list[str]
self.ctas: list[str]
self.scripts: int
self.summary_background_urls: list[str]
```

`validate_intro()` must return clear error strings for each failed rule:

```python
if not path.exists():
    return [f"missing output: {path}"]

if parser.sections != REQUIRED_SECTIONS:
    errors.append(f"section order mismatch: {parser.sections}")
if len(parser.start_cards) != 8:
    errors.append(f"expected 8 start cards, found {len(parser.start_cards)}")
if len(parser.start_images) != 8:
    errors.append(f"expected 8 start images, found {len(parser.start_images)}")
if len(set(parser.start_images)) != 8:
    errors.append("start card image URLs must be unique")
if set(parser.frames) - ALLOWED_FRAMES:
    errors.append(f"unsupported framed regions: {sorted(set(parser.frames) - ALLOWED_FRAMES)}")
if EXPECTED_ARCHIVE_URL not in parser.ctas:
    errors.append("missing production story archive CTA")
if EXPECTED_INTERNAL_START_URL not in parser.ctas:
    errors.append("missing internal start-scene CTA")
if "Arcadia" in html or "아르카디아" in html:
    errors.append("deprecated public name found")
if parser.scripts:
    errors.append("script tags are not allowed")
if parser.summary_background_urls:
    errors.append("summary elements must use real img elements, not CSS background URLs")
```

Also validate:

- root marker is exactly `20260802`
- every external CTA has `target="_blank"` and `rel="noopener noreferrer"`
- every start image is an `<img>` with non-empty `alt`
- `START 01` through `START 08` each appear once
- `업데이트가 조금 늦어질 수 있습니다`, `비레스 5083`, `렌과 듀란`, `막혔을 때 이렇게 불러보세요`, and `최근 달라진 점` are present
- no `<section data-section>` has `data-ui-frame`

The CLI must print each error and exit `1`, or print `OK: <path>` and exit `0`.

- [ ] **Step 4: Run the test and confirm that only the missing HTML still fails**

Run:

```powershell
python -m unittest discover -s tests -p "test_vireth_intro_page.py" -v
```

Expected: `FAIL` with `missing output`.

- [ ] **Step 5: Commit the contract**

```powershell
git add -- tests/test_vireth_intro_page.py tools/validate_vireth_intro_page.py
git commit -m "test: add vireth intro page contract"
```

## Task 2: Build the Dated LunaTalk Introduction Fragment

**Files:**
- Create: `output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html`
- Read only: `output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260801.html`

**Interfaces:**
- Consumes: Task 1 semantic attributes and validation rules.
- Produces: a paste-ready single HTML fragment with no JavaScript.
- Produces: stable anchors `#vireth-starts`, `#vireth-commands`, and `#vireth-updates`.

- [ ] **Step 1: Add the root and scoped responsive style**

Use this root:

```html
<div
  id="vireth-intro-20260802"
  data-vireth-intro="20260802"
  style="box-sizing:border-box;max-width:960px;margin:0 auto 30px;background:#0b1117;color:#f8f4e8;border-radius:8px;overflow:hidden;font-family:Arial,'Noto Sans KR',sans-serif;line-height:1.68;text-align:left;"
>
```

The scoped `<style>` must:

- apply `box-sizing:border-box` to descendants
- show `#vireth-start-grid` as a two-column grid above `760px`
- change it to `display:flex; overflow-x:auto; scroll-snap-type:x mandatory` below `759px`
- set mobile cards to `flex:0 0 86%; scroll-snap-align:start`
- preserve visible focus outlines
- keep all rules under `#vireth-intro-20260802`

The inline fallback on `#vireth-start-grid` must be:

```css
display:grid;
grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));
gap:12px;
```

If LunaTalk removes the `<style>` block, the page therefore falls back to a usable responsive grid instead of breaking.

- [ ] **Step 2: Add the compact notice and unboxed introduction band**

Add sections in this exact order:

1. `<section data-section="notice">`
2. `<section data-section="intro">`
3. `<section id="vireth-starts" data-section="starts">`
4. `<section data-section="play-flow">`
5. `<section id="vireth-commands" data-section="commands">`
6. `<section id="vireth-updates" data-section="updates">`

Only the inner notice element receives `data-ui-frame="notice"`. The intro section itself has no border, rounded panel, or floating-card background.

Use:

```text
VIRETH 5083
비레스 5083
정해진 답을 고르기보다, 눈앞의 사람과 장소를 따라 직접 움직이는 판타지 여행입니다.
출신과 목표를 다 정하지 않아도 괜찮습니다. 마음에 드는 첫 장면을 골라 말을 걸어보세요.
비레스를 먼저 걷고 있는 여행자, 렌과 듀란
```

Use these verified assets:

```text
https://vireth-starting-records.musueman.chatgpt.site/assets/start-situations/gate-arrival.webp
https://vireth-starting-records.musueman.chatgpt.site/assets/archive-stage/ren-cutout.png
https://vireth-starting-records.musueman.chatgpt.site/assets/archive-stage/duran-cutout.png
```

The city image fills the intro background. Ren and Duran are separate `<img>` elements, placed at the visual edges without covering the H1 or CTAs. Their combined visible area must remain secondary to the city and heading.

- [ ] **Step 3: Add two functional icon CTAs**

Create only these two links:

```html
<a data-cta data-ui-frame="cta" href="#vireth-starts" title="첫 장면 선택으로 이동">
  비레스를 먼저 둘러보기
</a>
<a
  data-cta
  data-ui-frame="cta"
  href="https://vireth-starting-records.musueman.chatgpt.site/#story-starts"
  target="_blank"
  rel="noopener noreferrer"
  title="비레스 5083 이야기 서고에서 이어지는 이야기 읽기"
>
  내 시작과 이어지는 이야기 읽기
</a>
```

Use verified Lucide static assets as `<img alt="">` inside the links:

```text
https://cdn.jsdelivr.net/npm/lucide-static@0.468.0/icons/compass.svg
https://cdn.jsdelivr.net/npm/lucide-static@0.468.0/icons/book-open.svg
https://cdn.jsdelivr.net/npm/lucide-static@0.468.0/icons/external-link.svg
```

Do not add script tags or icon-only buttons.

- [ ] **Step 4: Add all eight start cards**

Each card is a `<details data-start-card="START 0N" data-ui-frame="start-card">`.
Each summary contains a real `<img data-start-image>` and a local left-to-right dark overlay.

Use this exact order and image mapping:

| ID | Title | Image |
|---|---|---|
| START 01 | 성문 앞에서 시작 | `https://vireth-starting-records.musueman.chatgpt.site/assets/start-situations/gate-arrival.webp` |
| START 02 | 비 오는 밤의 성문 근무 | `https://vireth-svg.musueman.workers.dev/scene-assets/city-vistas/ck5083-city-tiris-bekkellkar-ravenstone-imagegen-v1-scene-v2.webp` |
| START 03 | 떠돌이 용병의 첫 계약 | `https://vireth-svg.musueman.workers.dev/talk-background-assets/handoff-20260713/general/b004-guild-inn-tradepost.webp` |
| START 04 | 항구에서 묶인 짐 | `https://vireth-svg.musueman.workers.dev/talk-background-assets/handoff-20260713/general/b008-harbor-lighthouse-coast.webp` |
| START 05 | 사냥꾼의 이상한 발자국 | `https://vireth-svg.musueman.workers.dev/talk-background-assets/handoff-20260713/general/b010-rural-forest-campsite.webp` |
| START 06 | 장터와 납품 장부 | `https://vireth-svg.musueman.workers.dev/talk-background-assets/handoff-20260713/general/b002-market-square-trade-street.webp` |
| START 07 | 피난민 배급 줄 | `https://vireth-svg.musueman.workers.dev/scene-assets/city-vistas/ck5083-city-senhalet-senpukum-imagegen-v1-scene-v2.webp` |
| START 08 | 항만과 선착장의 새벽 | `https://vireth-svg.musueman.workers.dev/scene-assets/city-vistas/ck5083-city-kelnabet-markelmir-imagegen-v1-scene-v2.webp` |

Copy the existing confirmed one-line descriptions and role command examples from the 2026-08-01 file without changing their gameplay meaning. Remove long webtoon content from card bodies. Each expanded body contains only:

- situation context
- one example input
- the applicable start or role command
- one story archive link

- [ ] **Step 5: Add the unboxed play flow and compact command guide**

Render these three steps without individual card backgrounds:

```text
1. 장면을 고릅니다
2. 눈앞의 사람에게 말을 겁니다
3. 장소와 기록을 따라 움직입니다
```

In the command section, show `!힌트`, `!장소`, and `!단서` as plain rows. Place `!인연_인물명`, `!키워드`, and role start/reset commands inside one `<details data-ui-frame="details-control">`.

Keep the existing command meanings. Do not make one framed card per command.

- [ ] **Step 6: Move update history to a collapsed footer control**

Add one `<details data-ui-frame="details-control">` under the `updates` section, with summary `최근 달라진 점`.

Preserve the five 2026-08-01 facts from the current page as a simple list. Remove the decorative image, colored bullets, independent panel border, and `UPDATE NOTE` management heading.

- [ ] **Step 7: Run the contract**

Run:

```powershell
python -m unittest discover -s tests -p "test_vireth_intro_page.py" -v
python tools/validate_vireth_intro_page.py output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html
```

Expected: both commands pass with no validation errors.

- [ ] **Step 8: Commit the functional HTML**

```powershell
git add -- output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html
git commit -m "feat: redesign vireth lunatalk introduction"
```

## Task 3: Verify Remote Assets and Links

**Files:**
- Modify only if a URL fails: `output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html`
- Test: `tools/validate_vireth_intro_page.py`

**Interfaces:**
- Consumes: every `href` and `img src` emitted by Task 2.
- Produces: an audit result proving no empty image or dead CTA.

- [ ] **Step 1: Extract URLs with the validator parser**

Add `collect_remote_urls(path: Path) -> list[str]` to the validator. It must return unique HTTP(S) values from parsed `href` and `src` attributes.

- [ ] **Step 2: Add a URL-check CLI option**

Support this exact command:

```powershell
python tools/validate_vireth_intro_page.py output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html --check-urls
```

Use `urllib.request.Request(url, method="HEAD")`, follow redirects, require status `200` through `399`, and fall back to `GET` when a server rejects `HEAD` with `405`.

- [ ] **Step 3: Run structural and network validation**

Run:

```powershell
python tools/validate_vireth_intro_page.py output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html --check-urls
```

Expected:

- 8 unique start-card images reachable
- Ren, Duran, and gate-arrival assets reachable
- three Lucide icon assets reachable
- story archive CTA reachable
- no failed URL

- [ ] **Step 4: Commit validator URL checking**

```powershell
git add -- tools/validate_vireth_intro_page.py tests/test_vireth_intro_page.py
git commit -m "test: verify vireth intro assets and links"
```

## Task 4: Desktop and Mobile Visual Verification

**Files:**
- Modify after visual comparison: `output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html`
- Read only reference: `output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260801.html`
- Temporary artifacts:
  - `%TEMP%\vireth-intro-audit-20260802\desktop-current.png`
  - `%TEMP%\vireth-intro-audit-20260802\mobile-current.png`
  - `%TEMP%\vireth-intro-audit-20260802\desktop-new.png`
  - `%TEMP%\vireth-intro-audit-20260802\mobile-new.png`

**Interfaces:**
- Consumes: final HTML from Task 2 and baseline screenshots already captured.
- Produces: visually reviewed desktop and mobile screenshots.

- [ ] **Step 1: Copy the new fragment to the temporary ASCII preview path**

```powershell
Copy-Item -LiteralPath `
  'output\lunatalk_start_scenarios\vireth_intro_start_situations_updated_full_20260802.html' `
  -Destination "$env:TEMP\vireth-intro-audit-20260802\index-new.html" `
  -Force
```

Serve that temporary directory on port `8802`:

```powershell
Start-Process -FilePath 'C:\Python314\python.exe' `
  -ArgumentList '-m','http.server','8802','--bind','127.0.0.1' `
  -WorkingDirectory "$env:TEMP\vireth-intro-audit-20260802" `
  -WindowStyle Hidden
```

- [ ] **Step 2: Capture the desktop result**

Use Playwright CLI:

```powershell
playwright-cli open "http://127.0.0.1:8802/index-new.html"
playwright-cli resize 1440 900
playwright-cli screenshot --full-page --filename "$env:TEMP\vireth-intro-audit-20260802\desktop-new.png"
```

Compare `desktop-current.png` and `desktop-new.png` together. Verify:

- the notice remains first but is shorter
- `비레스 5083`, the city, Ren, Duran, and part of the starts section appear in the first viewport
- no general section is rendered as a floating card
- the start scene layout has exactly two columns
- the two CTAs read as controls and have visible icons
- text does not cover Ren, Duran, or critical city features

- [ ] **Step 3: Capture the mobile result**

```powershell
playwright-cli resize 390 844
playwright-cli screenshot --full-page --filename "$env:TEMP\vireth-intro-audit-20260802\mobile-new.png"
```

Compare `mobile-current.png` and `mobile-new.png` together. Verify:

- the first viewport includes the brand or a visible start-card edge after the notice
- headings and CTA labels wrap without clipping
- Ren and Duran do not overlap each other or the H1
- the start list scrolls horizontally and shows part of the next card
- card width and height remain stable when details open
- the commands and update history do not recreate the previous long stack of boxes

- [ ] **Step 4: Inspect interactions and accessibility**

Use a fresh Playwright snapshot, then:

- focus and open START 01
- open the command details
- open the update details
- verify both CTA destinations
- inspect console errors
- verify there is no horizontal overflow outside the intentional start-card scroller

- [ ] **Step 5: Fix visible issues and rerun all checks**

After each visual fix, rerun:

```powershell
python -m unittest discover -s tests -p "test_vireth_intro_page.py" -v
python tools/validate_vireth_intro_page.py output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html --check-urls
```

Recapture both viewport screenshots after the last fix.

- [ ] **Step 6: Commit final visual adjustments**

```powershell
git add -- output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html
git commit -m "fix: polish vireth intro responsive layout"
```

## Task 5: Final Handoff

**Files:**
- Final artifact: `output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html`
- Final validator: `tools/validate_vireth_intro_page.py`
- Final test: `tests/test_vireth_intro_page.py`

**Interfaces:**
- Produces: local clickable preview and a complete paste-ready HTML fragment.
- Does not perform authenticated LunaTalk mutation without a user-selected authenticated browser session.

- [ ] **Step 1: Run clean final verification**

Run:

```powershell
python -m unittest discover -s tests -p "test_vireth_intro_page.py" -v
python tools/validate_vireth_intro_page.py output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html --check-urls
git diff --check
git status --short
```

Confirm unrelated pre-existing changes remain untouched and no temporary artifacts are staged.

- [ ] **Step 2: Keep the verified local preview open**

Open the final localhost preview in the approved Playwright browser and report the clickable local preview URL in Codex Desktop.

- [ ] **Step 3: Report the delivery**

Report:

- final HTML absolute path
- test and URL-check results
- desktop and mobile visual findings
- commit SHAs created by the implementation
- authenticated LunaTalk application status
- any remaining risk that LunaTalk may sanitize the scoped responsive `<style>` block; note that the inline fallback remains usable
