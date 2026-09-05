# Vireth Dual Scene Prompt System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Apply superpowers:test-driven-development for every production-code change and superpowers:verification-before-completion before any completion claim.

**Goal:** Build one locked 25-scene registry, compile it into Danbooru-only and Danbooru-plus-minimal-relation prompt systems, publish both canonical templates, and submit the 50-character kiss scene in both systems without duplicating an existing run.

**Architecture:** A single CommonJS module owns the character-manifest hash check, scene registry, tag ordering, validation, and both compilers. The queue runner consumes only compiled kiss entries, writes separate records and output prefixes for each system, and refuses submission when the live Comfy queue or any target run path is occupied. Canonical JSON/JSONL artifacts are derived from the tested module and copied to the Vireth source-of-truth folder.

**Tech Stack:** Node.js CommonJS, built-in `assert`, `crypto`, `fs`, `path`, ComfyUI HTTP API on `127.0.0.1:8189`, PowerShell for live verification.

---

## Task 1: Lock the common registry and character manifest

**Files:**
- Create: `D:\OneDrive\Documents\nsfw 이미지 프롬생성\scripts\test_vireth_dual_scene_prompt_system_v42_20260905.js`
- Create: `D:\OneDrive\Documents\nsfw 이미지 프롬생성\scripts\lib\vireth_dual_scene_prompt_system_v42.js`

1. Write tests that require the exact character-manifest SHA-256, 50 unique character codes, seven ordered feature slots, 25 unique scene IDs, the two mating-press reuse slots, and `01_base_foreplay_kiss` as a generated `male_pov`/no-genital/no-censor scene.
2. Run `node scripts/test_vireth_dual_scene_prompt_system_v42_20260905.js` and confirm RED because the module is absent.
3. Implement the minimum manifest loader, hash guard, constants, and 25-scene registry needed for GREEN.
4. Re-run the test and confirm PASS.

## Task 2: Implement and validate both compilers

**Files:**
- Modify: `D:\OneDrive\Documents\nsfw 이미지 프롬생성\scripts\test_vireth_dual_scene_prompt_system_v42_20260905.js`
- Modify: `D:\OneDrive\Documents\nsfw 이미지 프롬생성\scripts\lib\vireth_dual_scene_prompt_system_v42.js`

1. Add failing tests for deterministic feature ordering, exact tag deduplication, male viewpoint tags, genital/censor classification, climax expression rules, forbidden male descriptors, hybrid relation count, and the requirement that dual outputs differ only by permitted relation text.
2. Confirm RED from missing compiler exports or contract failures.
3. Implement `compileScene`, `compileAllCharacters`, and contract validators with a compact negative anatomy set and no inherited legacy prompt chain.
4. Confirm GREEN for all 25 registry contracts and both 50-character kiss matrices.

## Task 3: Build a duplicate-safe dual kiss queue runner

**Files:**
- Create: `D:\OneDrive\Documents\nsfw 이미지 프롬생성\scripts\test_queue_vireth_scene01_kiss_dual_v42_20260905.js`
- Create: `D:\OneDrive\Documents\nsfw 이미지 프롬생성\scripts\queue_vireth_scene01_kiss_dual_v42_20260905.js`

1. Write tests for 100 total submissions split into 50 Danbooru and 50 hybrid entries, 1280×1280 graph dimensions, distinct output prefixes, no genital/censor/male-appearance tags, unchanged feature tags, unique IDs, and preflight conflict reporting.
2. Confirm RED because the queue runner is absent.
3. Implement the queue runner by reusing only the known-good Comfy graph loader/graph mapping, injecting the new compiled prompts, and writing manifests, JSONL records, payloads, and submission summaries separately per system.
4. Add `--dry-run` and `--submit` modes; default to dry-run, require an empty live queue, and refuse existing record/workflow/output roots.
5. Confirm GREEN and run `node scripts/queue_vireth_scene01_kiss_dual_v42_20260905.js --dry-run`.

## Task 4: Publish the canonical templates

**Files:**
- Create: `D:\OneDrive\444_비레스\00_최신본\12_NSFW\00_정본_템플릿\VIRETH_NSFW_DUAL_SCENE_TEMPLATE_v42_20260905\scene_registry.json`
- Create: `D:\OneDrive\444_비레스\00_최신본\12_NSFW\00_정본_템플릿\VIRETH_NSFW_DUAL_SCENE_TEMPLATE_v42_20260905\danbooru_template_manifest.json`
- Create: `D:\OneDrive\444_비레스\00_최신본\12_NSFW\00_정본_템플릿\VIRETH_NSFW_DUAL_SCENE_TEMPLATE_v42_20260905\hybrid_template_manifest.json`
- Create: `D:\OneDrive\444_비레스\00_최신본\12_NSFW\00_정본_템플릿\VIRETH_NSFW_DUAL_SCENE_TEMPLATE_v42_20260905\01_kiss_50x2_prompt_review.jsonl`
- Create: `D:\OneDrive\444_비레스\00_최신본\12_NSFW\00_정본_템플릿\VIRETH_NSFW_DUAL_SCENE_TEMPLATE_v42_20260905\README.md`

1. Add a failing test that invokes a publisher function into a temporary directory and verifies all five artifacts, their declared manifest hash, 25 scenes, and 100 kiss rows.
2. Confirm RED because publishing is absent.
3. Implement the deterministic publisher and run it against the canonical target directory using `apply_patch` for the initial files and the tested publisher for mechanical JSON regeneration.
4. Parse every JSON/JSONL artifact and compare exported prompts against the compiler output.

## Task 5: Submit and verify the kiss run

**Files:**
- Create at runtime: `D:\OneDrive\Documents\nsfw 이미지 프롬생성\comfy_generation_records\Vires_Scene01_Kiss_Dual_v42_20260905\...`
- Create at runtime: `D:\OneDrive\Documents\nsfw 이미지 프롬생성\workflows\Vires_Scene01_Kiss_Dual_v42_20260905\...`
- Create at runtime: `S:\du\o\Anima\Vires_Scene01_Kiss_Danbooru_v42_20260905\...`
- Create at runtime: `S:\du\o\Anima\Vires_Scene01_Kiss_Hybrid_v42_20260905\...`

1. Recheck `http://127.0.0.1:8189/queue`, all three target roots, and existing PNG/record counts.
2. Run `node scripts/queue_vireth_scene01_kiss_dual_v42_20260905.js --submit` exactly once.
3. Record `submitted_count`, 100 unique prompt IDs, running, pending, expected count, records path, and both output roots.
4. Do not wait silently for the long GPU queue. If it remains active, report `blocked_waiting_for_comfy_queue`; otherwise verify PNG count=100, record count=100, running=0, pending=0.

## Task 6: Final regression and handoff

**Files:**
- Modify: `D:\OneDrive\Documents\nsfw 이미지 프롬생성\common_asset_generation_tree\chatroom_coordination\SHARED_UPDATE_LOG.md`

1. Append one concise decision/evidence entry describing v42 scope, canonical character hash, dual compiler relationship, kiss submission evidence, and any remaining visual-review status.
2. Run the two new test scripts, dry-run validation, JSON/JSONL parse checks, SHA-256 check, and exact git diff review.
3. Invoke superpowers:verification-before-completion and report structural submission separately from visual acceptance.
