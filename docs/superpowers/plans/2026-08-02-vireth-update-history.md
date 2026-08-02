# Vireth Update History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat recent-changes list with a validated, accessible, date-grouped update history.

**Architecture:** Keep the existing static LunaTalk-compatible HTML and its native `details` disclosure. Extend the existing Python contract validator so the public copy, date order, semantic markup, and timeline count remain deterministic.

**Tech Stack:** Static HTML/CSS, Python `unittest`, `html.parser`, local HTTP preview.

## Global Constraints

- Preserve the existing hero, eight start cards, story archive links, commands, notice, and all approved assets.
- Use the exact seven milestones and copy approved in `docs/superpowers/specs/2026-08-02-vireth-update-history-design.md`.
- Do not add JavaScript, iframe, nested cards, or a new dependency.
- Do not stage or revert unrelated working-tree changes.

---

### Task 1: Add the update-history contract

**Files:**
- Modify: `tests/test_vireth_intro_page.py`
- Modify: `tools/validate_vireth_intro_page.py`

**Interfaces:**
- Consumes: the static intro HTML file.
- Produces: `UPDATE_HISTORY`, parser update records, and deterministic validation errors for title, count, order, semantics, and copy.

- [ ] **Step 1: Write the failing test**

Add seven `UPDATE_HISTORY` records and render them in `canonical_fixture()`. Add assertions that reject the old summary, wrong order, a missing heading, and mismatched `time[datetime]`.

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
python -m unittest tests.test_vireth_intro_page -v
```

Expected: FAIL because the current validator does not enforce the new timeline contract and the production HTML still uses the old list.

- [ ] **Step 3: Write minimal validator implementation**

Teach `IntroParser` to collect:

```python
update_records: list[tuple[str, str]]
```

where each tuple is `(data-update-date, time_datetime)`. Validate exactly seven records, newest-first date order, matching date attributes, and every approved heading/body fact.

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
python -m unittest tests.test_vireth_intro_page -v
```

Expected: all tests pass after the validator and fixture agree.

### Task 2: Implement and verify the public timeline

**Files:**
- Modify: `output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html`

**Interfaces:**
- Consumes: the validator contract from Task 1.
- Produces: an accessible `ol.vireth-update-timeline` with seven `li[data-update-date]` entries.

- [ ] **Step 1: Run the production validator before implementation**

Run:

```powershell
python tools/validate_vireth_intro_page.py output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html
```

Expected: FAIL because the public HTML still contains `최근 달라진 점`.

- [ ] **Step 2: Replace the list and styles**

Use this semantic shape for each milestone:

```html
<li data-update-date="2026-08-02">
  <time datetime="2026-08-02">2026. 08. 02.</time>
  <div>
    <strong>소개페이지와 이야기 서고 연결</strong>
    <p>...</p>
  </div>
</li>
```

Replace `.vireth-update-list` rules with timeline rules that use one vertical divider, a small marker, and responsive text wrapping.

- [ ] **Step 3: Run complete automated verification**

Run:

```powershell
python -m unittest tests.test_vireth_intro_page -v
python tools/validate_vireth_intro_page.py output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html --check-urls
```

Expected: all tests pass and every remote URL validates.

- [ ] **Step 4: Inspect desktop and mobile rendering**

Open the existing local preview, expand `업데이트 내역`, and inspect desktop plus a 390 x 844 mobile viewport. Confirm seven milestones, readable contrast, no overlap, no clipping, and no horizontal overflow.

- [ ] **Step 5: Review and commit only scoped files**

Review:

```powershell
git diff --check
git diff -- docs/superpowers/specs/2026-08-02-vireth-update-history-design.md docs/superpowers/plans/2026-08-02-vireth-update-history.md tests/test_vireth_intro_page.py tools/validate_vireth_intro_page.py output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html
```

Stage only the five listed files, commit, and push the current branch.
