# Vireth Intro Story Archive Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Use the matched Ren and Duran guide pair in the LunaTalk introduction and deep-link every opening scene to its exact Vireth Story Archive reading flow.

**Architecture:** The LunaTalk introduction remains a self-contained static HTML fragment without scripts. Its validator owns the approved guide asset URLs and ordered story-archive scenario URLs, while the separately deployed archive remains the canonical reader for the 14 documents and 30 illustrations.

**Tech Stack:** Static HTML/CSS, Python `HTMLParser`, `unittest`, in-app browser

## Global Constraints

- Target LunaTalk character idx remains `70170`.
- Keep the existing eight start cards, images, text, commands, accident notice, and update facts unchanged.
- Use `ren-ending-guide.png` and `duran-ending-guide.png` as a matched approved pair.
- Link to Sites version 24 using exact scenario hashes.
- Do not add scripts, meta tags, iframes, or a copy of the story reader.
- Do not modify the story archive's 14 source documents or 30 illustrations.
- Keep all external links on `_blank` with `noopener noreferrer`.

---

### Task 1: Integration Contract

**Files:**
- Modify: `tests/test_vireth_intro_page.py`
- Modify: `tools/validate_vireth_intro_page.py`

**Interfaces:**
- Consumes: `data-cta`, `data-start-card`, guide image `src`, and archive-link `href` attributes from the HTML fragment.
- Produces: validation errors for guide-pair drift, missing scenario links, duplicate scenario links, and wrong link order.

- [ ] **Step 1: Write the failing tests**

Add tests that require the matched guide URLs and the ordered scenario URLs:

```python
EXPECTED_STORY_SCENARIOS = (
    "gate-arrival",
    "gate-watch",
    "mercenary-contract",
    "held-cargo",
    "strange-tracks",
    "market-ledger",
    "ration-line",
    "harbor-dawn",
)
```

The canonical fixture must use one hero CTA for `gate-arrival` and one archive link inside each start card.

- [ ] **Step 2: Run the focused test and verify failure**

Run:

```powershell
python -m unittest discover -s tests -p "test_vireth_intro_page.py" -v
```

Expected: FAIL because the validator still requires the old `#story-starts` URL and the production HTML still uses the old cutouts.

- [ ] **Step 3: Implement validator support**

Teach `IntroParser` to collect guide image roles and per-card archive links. Require the exact guide pair and ordered scenario URLs.

- [ ] **Step 4: Run the test and keep the production contract failure focused**

Run the same command.

Expected: fixture tests pass, while `test_intro_contract` still reports the old production assets and generic archive links.

### Task 2: LunaTalk Fragment Integration

**Files:**
- Modify: `output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html`

**Interfaces:**
- Consumes: approved story-guide image URLs and the eight scenario IDs from Task 1.
- Produces: one LunaTalk-ready fragment with a matched guide pair and direct story-reading links.

- [ ] **Step 1: Replace the guide pair**

Use:

```text
https://vireth-starting-records.musueman.chatgpt.site/assets/story-guides/ren-ending-guide.png
https://vireth-starting-records.musueman.chatgpt.site/assets/story-guides/duran-ending-guide.png
```

- [ ] **Step 2: Update the hero archive CTA**

Point it to:

```text
https://vireth-starting-records.musueman.chatgpt.site/reader?v=24#scenario=gate-arrival
```

- [ ] **Step 3: Update all eight card archive links**

Apply the exact ordered mapping from the design specification.

- [ ] **Step 4: Tune the matched-pair CSS**

Use shared dimensions for both guide images. Preserve text and CTA separation on desktop and the in-flow guide stage on mobile.

- [ ] **Step 5: Run focused tests and URL checks**

Run:

```powershell
python -m unittest discover -s tests -p "test_vireth_intro_page.py" -v
python tools/validate_vireth_intro_page.py output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html --check-urls
```

Expected: both commands exit 0.

### Task 3: Visual And Repository Verification

**Files:**
- Verify: `output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html`
- Verify: Git working tree

**Interfaces:**
- Consumes: the locally served UTF-8 fragment and the production Story Archive.
- Produces: desktop and mobile evidence for the merged journey.

- [ ] **Step 1: Verify desktop**

At `1440x900`, confirm matched guide scale, no copy overlap, visible first start cards, and working `gate-arrival` CTA.

- [ ] **Step 2: Verify mobile**

At `390x844`, confirm both guides fit their dedicated stage, no horizontal page overflow, and readable buttons.

- [ ] **Step 3: Verify all start links**

Check each href contains version 24 and its expected unique scenario hash.

- [ ] **Step 4: Run final checks**

Run:

```powershell
git diff --check
git diff -- tests/test_vireth_intro_page.py tools/validate_vireth_intro_page.py output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html
```

Expected: only the approved integration changes plus design and plan records.

- [ ] **Step 5: Commit and push**

Stage only the integration files, commit them on the current `codex/` branch, and push that branch. Do not apply the HTML inside LunaTalk itself.
