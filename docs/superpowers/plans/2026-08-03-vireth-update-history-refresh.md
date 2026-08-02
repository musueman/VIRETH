# Vireth Update History Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the seven existing public milestones while adding the completed 2026-07-31 and 2026-08-01 milestones and strengthening verified facts in the 2026-08-02, 2026-07-27, and 2026-07-15 entries.

**Architecture:** Keep one canonical `UPDATE_HISTORY` tuple in the validator and mirror the same data in the test fixture and LunaTalk-safe HTML fragment. The validator remains the behavioral boundary: it rejects missing dates, changed copy, reordered entries, non-semantic dates, and accidental removal of legacy milestones.

**Tech Stack:** Python 3 `unittest`, `html.parser`, static LunaTalk HTML, in-app Browser verification, Git.

## Global Constraints

- Follow `docs/superpowers/specs/2026-08-03-vireth-update-history-refresh-design.md`.
- Keep the existing order `notice → updates → intro → starts`.
- Keep all existing milestone dates and add only `2026-08-01` and `2026-07-31`.
- The final update history contains exactly nine semantic records.
- Do not modify the accident notice, hero, guide images, eight start cards, commands, links, or image URLs.
- Do not expose `Arcadia` or `아르카디아` in public copy.
- Do not include v11 candidates, reindex work, 2026-08-03 start-role work, or dirty Worker/map changes.
- Do not click LunaTalk Save. Filling the editor for preview may create an autosaved draft.
- Do not stage or revert unrelated dirty-worktree changes.

---

### Task 1: Extend the update-history contract and prove the current page is stale

**Files:**
- Modify: `tests/test_vireth_intro_page.py:99-135`
- Test: `tests/test_vireth_intro_page.py`

**Interfaces:**
- Consumes: the approved nine milestones from the design spec.
- Produces: a test-side `UPDATE_HISTORY: tuple[tuple[str, str, str], ...]` and a regression test that protects all legacy dates and verified counts.

- [ ] **Step 1: Replace the test fixture history with the exact nine-entry contract**

Use this complete tuple:

```python
UPDATE_HISTORY = (
    (
        "2026-08-02",
        "소개페이지와 이야기 서고 연결",
        "소개 화면을 비레스의 풍경과 렌·듀란 안내 이미지 중심으로 개편했습니다. 8개 시작 장면에서 각 상황과 이어지는 기록으로 바로 이동하고, 이야기 서고 안에서도 다른 시작 흐름과 여행 안내로 이어갈 수 있게 했습니다.",
    ),
    (
        "2026-08-01",
        "비레스 5083 이야기 서고 공개",
        "8개 시작 흐름과 연결된 기록 14편을 공개했습니다. 삽화 30장과 글마다 별도로 정리한 초심자 참고 설명 14세트를 함께 제공해 낯선 시간, 화폐, 행정과 생활 맥락을 읽기 쉽게 했습니다.",
    ),
    (
        "2026-07-31",
        "세계관 정본과 지도 기준 정리",
        "비레스의 역사, 현재 갈등, 생산, 생계와 물류 정보를 하나의 최신 기준으로 정리했습니다. 20개 권역과 166개 장소를 기준으로 문장, 좌표, 장소 표식과 출판·웹용 지도를 다시 맞췄습니다.",
    ),
    (
        "2026-07-29",
        "루나톡 대화와 인물 운용 정리",
        "대화카드 배경, 인물 표식, 감정 이미지 호출이 현재 장소와 인물 설정을 안정적으로 따르도록 정리했습니다. 고정 인물과 즉석 인물의 등장 범위를 나누고 역할별 설명을 다듬었습니다.",
    ),
    (
        "2026-07-27",
        "인물 감정 이미지 확장",
        "주요 인물 100명이 대화 장면의 감정과 분위기에 맞게 등장하도록 인물별 8가지, 총 800장의 감정 이미지를 연결했습니다.",
    ),
    (
        "2026-07-15",
        "새로운 시작 장면과 인물 표현 추가",
        "자유 여행자와 용병 계약 시작 장면을 추가했습니다. 장소 식별 기준과 경비, 상인, 민간인, 학자 등 역할별 즉석 인물 이미지를 연결했습니다.",
    ),
    (
        "2026-07-14",
        "장소·대화카드 표현 개선",
        "현재 지역과 장소를 한눈에 확인할 수 있는 장소 카드를 추가했습니다. 모바일에서도 대화카드의 인물 정보와 소속 표식이 읽히도록 조정했습니다.",
    ),
    (
        "2026-07-12",
        "비레스 5083 시작 안내 공개",
        "정해진 선택지 없이 주변 사람과 장소를 따라 움직이는 기본 시작 방식을 소개했습니다. 기본 시작과 역할형 시작을 고를 수 있는 안내를 마련했습니다.",
    ),
    (
        "2026-07-10",
        "지도와 도시 장면 연결",
        "도시·장소 배경을 대화에 불러오는 장면 시스템에 지역 지도를 연결했습니다. 현재 장소 표시를 더해 이동 흐름을 확인할 수 있게 했습니다.",
    ),
)
```

- [ ] **Step 2: Add a regression test for preservation and verified counts**

Add:

```python
def test_update_history_preserves_legacy_dates_and_verified_counts(self) -> None:
    html = canonical_fixture()
    dates = tuple(date for date, _, _ in UPDATE_HISTORY)

    self.assertEqual(
        dates,
        (
            "2026-08-02",
            "2026-08-01",
            "2026-07-31",
            "2026-07-29",
            "2026-07-27",
            "2026-07-15",
            "2026-07-14",
            "2026-07-12",
            "2026-07-10",
        ),
    )
    for fact in ("8개", "14편", "30장", "14세트", "20개 권역", "166개 장소", "100명", "800장"):
        self.assertIn(fact, html)
```

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```powershell
python -m unittest `
  tests.test_vireth_intro_page.VirethIntroContractTest.test_canonical_fixture_satisfies_full_contract `
  tests.test_vireth_intro_page.VirethIntroContractTest.test_intro_contract `
  tests.test_vireth_intro_page.VirethIntroContractTest.test_update_history_preserves_legacy_dates_and_verified_counts -v
```

Expected: the preservation/count test passes, while the canonical fixture and real-page contract tests fail because the validator and target HTML still expect seven entries.

### Task 2: Update the validator without weakening existing checks

**Files:**
- Modify: `tools/validate_vireth_intro_page.py:103-139`
- Test: `tests/test_vireth_intro_page.py`

**Interfaces:**
- Consumes: Task 1's exact `UPDATE_HISTORY` tuple.
- Produces: validator errors for any date-order, semantic-time, title, body, count, or legacy-history regression.

- [ ] **Step 1: Replace the validator `UPDATE_HISTORY` tuple**

Copy the exact complete tuple from Task 1 into `tools/validate_vireth_intro_page.py`. Do not add a second source file or relax the existing exact-title/body validation.

- [ ] **Step 2: Run fixture validation and verify the contract turns GREEN**

Run:

```powershell
python -m unittest `
  tests.test_vireth_intro_page.VirethIntroContractTest.test_canonical_fixture_satisfies_full_contract `
  tests.test_vireth_intro_page.VirethIntroContractTest.test_update_history_preserves_legacy_dates_and_verified_counts -v
```

Expected: both tests pass.

- [ ] **Step 3: Run the real-page contract and verify it remains RED**

Run:

```powershell
python -m unittest tests.test_vireth_intro_page.VirethIntroContractTest.test_intro_contract -v
```

Expected: failure reporting the old seven-entry date order and missing approved update-history facts.

### Task 3: Apply the nine-entry history to the LunaTalk-safe HTML

**Files:**
- Modify: `output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html:17-65`
- Test: `tests/test_vireth_intro_page.py`

**Interfaces:**
- Consumes: the validator's nine-entry contract.
- Produces: nine `<li data-update-date>` records with matching `<time datetime>`.

- [ ] **Step 1: Update the 2026-08-02, 2026-07-27, and 2026-07-15 descriptions**

Use the exact bodies from Task 1. Preserve each existing `<li>`, `<time>`, `<strong>`, and `<p>` inline style.

- [ ] **Step 2: Insert the 2026-08-01 record after 2026-08-02**

Use:

```html
<li data-update-date="2026-08-01" style="box-sizing: border-box; position: relative; display: grid; grid-template-columns: 104px minmax(0, 1fr); gap: 16px; margin: 0; padding: 0 0 22px 20px; border-left: 1px solid #40535e;">
  <time datetime="2026-08-01" style="box-sizing: border-box; color: #dfc37f; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1.55; white-space: nowrap;">2026. 08. 01.</time>
  <div style="box-sizing: border-box;">
    <strong style="box-sizing: border-box; display: block; margin-bottom: 4px; color: #fff0c8; font-size: 15px; line-height: 1.55;">비레스 5083 이야기 서고 공개</strong>
    <p style="box-sizing: border-box; margin-top: 0; margin: 0; color: #cbd7dc; line-height: 1.75;">8개 시작 흐름과 연결된 기록 14편을 공개했습니다. 삽화 30장과 글마다 별도로 정리한 초심자 참고 설명 14세트를 함께 제공해 낯선 시간, 화폐, 행정과 생활 맥락을 읽기 쉽게 했습니다.</p>
  </div>
</li>
```

- [ ] **Step 3: Insert the 2026-07-31 record before 2026-07-29**

Use:

```html
<li data-update-date="2026-07-31" style="box-sizing: border-box; position: relative; display: grid; grid-template-columns: 104px minmax(0, 1fr); gap: 16px; margin: 0; padding: 0 0 22px 20px; border-left: 1px solid #40535e;">
  <time datetime="2026-07-31" style="box-sizing: border-box; color: #dfc37f; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1.55; white-space: nowrap;">2026. 07. 31.</time>
  <div style="box-sizing: border-box;">
    <strong style="box-sizing: border-box; display: block; margin-bottom: 4px; color: #fff0c8; font-size: 15px; line-height: 1.55;">세계관 정본과 지도 기준 정리</strong>
    <p style="box-sizing: border-box; margin-top: 0; margin: 0; color: #cbd7dc; line-height: 1.75;">비레스의 역사, 현재 갈등, 생산, 생계와 물류 정보를 하나의 최신 기준으로 정리했습니다. 20개 권역과 166개 장소를 기준으로 문장, 좌표, 장소 표식과 출판·웹용 지도를 다시 맞췄습니다.</p>
  </div>
</li>
```

- [ ] **Step 4: Run the complete local verification**

Run:

```powershell
python -m py_compile tools\validate_vireth_intro_page.py tests\test_vireth_intro_page.py
python -m unittest tests.test_vireth_intro_page -v
python tools\validate_vireth_intro_page.py `
  output\lunatalk_start_scenarios\vireth_intro_start_situations_updated_full_20260802.html `
  --check-urls
git diff --check -- `
  tests/test_vireth_intro_page.py `
  tools/validate_vireth_intro_page.py `
  output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html
```

Expected: all unit tests pass, 22 unique remote URLs are reachable, the validator reports `OK`, and `git diff --check` exits `0`.

- [ ] **Step 5: Commit the green implementation**

```powershell
git add -- `
  tests/test_vireth_intro_page.py `
  tools/validate_vireth_intro_page.py `
  output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html
git commit -m "feat: refresh Vireth update history"
```

### Task 4: Verify local and actual LunaTalk previews

**Files:**
- Read: `output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html`
- Live editor: `https://lunatalk.chat/character/edit?idx=70170`

**Interfaces:**
- Consumes: the committed HTML fragment.
- Produces: desktop/mobile geometry evidence and a LunaTalk autosaved preview draft without a final Save action.

- [ ] **Step 1: Open or reload the local preview**

Use:

```text
http://127.0.0.1:8802/output/lunatalk_start_scenarios/vireth_intro_start_situations_updated_full_20260802.html
```

Expand `업데이트 내역` and confirm all nine dates are visible in descending order.

- [ ] **Step 2: Verify desktop and 390 × 844 mobile layouts**

For each viewport, check:

```text
root clientWidth == root scrollWidth
update record count == 9
each data-update-date == nested time[datetime]
no raw CSS text
no broken Hangul
no overlapping date/title/body text
```

Reset the temporary mobile viewport before continuing.

- [ ] **Step 3: Fill the LunaTalk detailed-description editor and click Preview**

Read the UTF-8 HTML file, fill only the character detailed-description field, and click `미리보기`. Do not click Save.

- [ ] **Step 4: Verify LunaTalk's sanitized preview**

Confirm:

```text
section tag count == 0
#vireth-updates exists
update record count == 9
hero city image position == absolute
Ren/Duran image position == absolute
start card count == 8
root clientWidth == root scrollWidth
```

Keep the editor tab as a handoff and report that LunaTalk may have created an autosaved draft.

- [ ] **Step 5: Resolve any visual regression before pushing**

If either viewport or the sanitized preview fails, edit only the three scoped implementation files, rerun Task 3 Step 4, repeat Task 4 Steps 1-4, and create a focused fix commit. Do not continue to Task 5 until the browser checks pass.

### Task 5: Push and verify repository state

**Files:**
- No new source files.

**Interfaces:**
- Consumes: the green implementation commit.
- Produces: a remote branch whose SHA matches local `HEAD`.

- [ ] **Step 1: Push the current branch**

```powershell
git push origin codex/vireth-worker-scene-assets
```

- [ ] **Step 2: Re-run post-commit verification**

```powershell
python -m unittest tests.test_vireth_intro_page -v
python tools\validate_vireth_intro_page.py `
  output\lunatalk_start_scenarios\vireth_intro_start_situations_updated_full_20260802.html `
  --check-urls
git rev-parse HEAD
git ls-remote origin refs/heads/codex/vireth-worker-scene-assets
```

Expected: tests and URL checks pass, and the remote branch SHA exactly matches local `HEAD`.
