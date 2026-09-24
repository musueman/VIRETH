# LunaTalk Live Image Output Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Make each normal LunaTalk response render an uncaptioned reworked place image followed by matching character images before dialogue.

**Architecture:** The Worker resolves a reworked background from an explicit asset, a named place, or a regional fallback. LunaTalk emits literal Markdown image URLs, rather than pseudo-URL fragments or the captioned /scene route.

**Tech Stack:** Cloudflare Workers/TypeScript, Node built-in test runner, Wrangler, LunaTalk web editor, Chrome rendered-screen QA.

**Spec:** docs/superpowers/specs/2026-09-24-lunatalk-live-image-output-design.md

## Global Constraints

- Ordinary dialogue place output is a bare reworked WebP without geographic captions.
- Normal order is one top place image, every speaker image immediately before dialogue, then the existing status panel.
- Normal images are character/background composites. An ss action is one complete image, never an overlay or separate output type.
- /scene is prohibited in ordinary dialogue; /map remains for explicit !장소 only.
- A valid explicit bg overrides location inference.
- The pinned case is R003 + L022 + DAY -> VBG_GATE_DAY.

## Review Focus

- NIGHT resolves VBG_GATE_NIGHT, not a day asset; Task 1 pins it.
- scope=region resolves VRA_N003_DAY even with a stale placeId; Task 1 pins precedence.
- An unknown place in a valid region returns VRA_N###, never /scene or 400; Task 1 pins fallback.
- Explicit bg=VBG_INN_NIGHT overrides R003/L022; Task 1 pins precedence.
- A normal composite references its inferred place asset; Task 1 searches its SVG for VBG_GATE_DAY.webp.

---

### Task 1: Location-derived reworked image resolver

**Files:**
- Modify: workers/vireth-svg/test/character-image-contract.test.mjs
- Modify: workers/vireth-svg/src/index.ts:954-960,1518-1540,1676-1712

**Interfaces:**
- Consumes: regionId, placeId, scope, time, optional bg query values.
- Produces: resolveReworkPlaceImage(url): TalkBackgroundEntry | null.
- Produces: /place-image and /character-image responses that share the selected asset.

- [ ] **Step 1: Write the failing location-contract tests**

Append these cases before editing Worker code:

~~~js
test("resolves L022 without an authored bg key", async () => {
  const response = await fetch(baseUrl + "/place-image?regionId=R003&placeId=L022&time=DAY");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^image\/webp/i);
});

test("uses the L022 night variant", async () => {
  const response = await fetch(baseUrl + "/character-image.json?id=C003&regionId=R003&placeId=L022&time=NIGHT&e=a");
  const body = await response.json();
  assert.equal(body.background.key, "VBG_GATE_NIGHT");
});

test("uses a regional image outside a settlement", async () => {
  const response = await fetch(baseUrl + "/character-image.json?id=C003&regionId=R003&scope=region&time=DAY&e=a");
  const body = await response.json();
  assert.equal(body.background.key, "VRA_N003_DAY");
});

test("keeps an explicit bg ahead of inference", async () => {
  const response = await fetch(baseUrl + "/character-image.json?id=C003&regionId=R003&placeId=L022&time=DAY&bg=VBG_INN_NIGHT&e=a");
  const body = await response.json();
  assert.equal(body.background.key, "VBG_INN_NIGHT");
});

test("uses the inferred asset in the normal composite", async () => {
  const response = await fetch(baseUrl + "/character-image?id=C003&regionId=R003&placeId=L022&time=DAY&e=a&external=1");
  const svg = await response.text();
  assert.equal(response.status, 200);
  assert.match(svg, /place-image-assets\/rework82\/VBG_GATE_DAY\.webp/);
});
~~~

- [ ] **Step 2: Run the test to verify RED**

Run: node --test test/character-image-contract.test.mjs

Expected: the new L022 case fails with 400 / invalid_place_image_key, proving location resolution does not exist yet.

- [ ] **Step 3: Implement the smallest resolver**

Replace the explicit-key-only resolver with this precedence:

~~~ts
const direct = firstQuery(url, ["bg", "background", "placeBg", "placeImage", "bgKey"]);
if (direct) return reworkPlaceImageByKey(direct);

const phase = resolveReworkImagePhase(url);
if (normalizeKey(firstQuery(url, ["scope", "sceneScope"]) ?? "") === "region") {
  return reworkRegionImage(resolveCurrentRegion(url), phase);
}

const place = resolveCurrentPlace(url);
const scene = place ? REWORK_PLACE_SCENE_BY_ID[place.id] : undefined;
if (scene) return reworkPlaceImageByKey(["VBG_", scene, "_", phase].join(""));
return reworkRegionImage(resolveCurrentRegion(url) ?? place?.regionId, phase);
~~~

Add REWORK_PLACE_SCENE_BY_ID = { L022: "GATE" }, resolveReworkImagePhase (case-insensitive DAY/NIGHT, DAY default), and reworkRegionImage converting valid R001 through R020 into VRA_N001 through VRA_N020. Keep existing asset validation. Make resolveTalkBackground call this resolver before legacy selection.

- [ ] **Step 4: Run the focused contract test to verify GREEN**

Run: node --test test/character-image-contract.test.mjs

Expected: all existing and five new cases pass.

- [ ] **Step 5: Type-check and commit**

Run: npm run check

Expected: Wrangler exits 0 with no TypeScript or Worker configuration error.

~~~bash
git add workers/vireth-svg/src/index.ts workers/vireth-svg/test/character-image-contract.test.mjs
git commit -m "feat: resolve LunaTalk place images by location"
~~~

### Task 2: Publish and prove the Worker contract

**Files:**
- Modify: no source file expected; deploy workers/vireth-svg at the Task 1 commit.
- Evidence: execution ledger and Task 3 browser screenshots.

**Interfaces:**
- Consumes: Task 1's committed Worker and public/place-image-assets/rework82/.
- Produces: public /place-image and /character-image routes.

- [ ] **Step 1: Record the pre-deploy production failure**

Run:

~~~powershell
(Invoke-WebRequest -Method Head -UseBasicParsing 'https://vireth-svg.musueman.workers.dev/place-image?regionId=R003&placeId=L022&time=DAY').StatusCode
~~~

Expected: 404.

- [ ] **Step 2: Deploy**

Run: npm run deploy

Expected: Wrangler reports a successful vireth-svg deployment and its workers.dev URL.

- [ ] **Step 3: Verify both live forms**

Run:

~~~powershell
$place = Invoke-WebRequest -UseBasicParsing 'https://vireth-svg.musueman.workers.dev/place-image?regionId=R003&placeId=L022&time=DAY'
$character = Invoke-WebRequest -UseBasicParsing 'https://vireth-svg.musueman.workers.dev/character-image?id=C003&regionId=R003&placeId=L022&time=DAY&e=a&external=1'
@($place.StatusCode, $place.Headers['Content-Type'], $character.StatusCode, $character.Content -match 'VBG_GATE_DAY.webp')
~~~

Expected: 200, image/webp, 200, True.

- [ ] **Step 4: Document only a changed public contract**

If README wording must change, add the two literal route examples and commit docs: document LunaTalk image URLs. Otherwise make no source commit.

### Task 3: Wire LunaTalk and prove the rendered result

**Files:**
- Modify in LunaTalk: character 70170 fields charLogic and charGreeting4.
- Modify in LunaTalk: lorebook 396096 entries 캐릭터 이미지 and 캐릭터 이미지 행위 상태.
- Evidence: fresh QA chat plus screenshots and rendered URL inspection.

**Interfaces:**
- Consumes: public Worker routes deployed in Task 2.
- Produces: literal Markdown image lines rendered by LunaTalk.

- [ ] **Step 1: Replace pseudo-URLs with literal normal-state instructions**

In both charLogic and 캐릭터 이미지, save this instruction form:

~~~md
[일반 출력 순서]
1. 응답 최상단에 현재 장소 1장: ![](https://vireth-svg.musueman.workers.dev/place-image?regionId={현재 R코드}&placeId={현재 L코드}&time={DAY 또는 NIGHT})
2. 각 화자의 대사 직전에 1장: ![](https://vireth-svg.musueman.workers.dev/character-image?id={화자 C코드}&regionId={현재 R코드}&placeId={현재 L코드}&time={DAY 또는 NIGHT}&e={감정코드})
3. 모든 대사 뒤 기존 상태창.
도시 밖이거나 장소 코드가 없으면 placeId를 빼고 &scope=region을 붙인다. 대화 일반 출력에 /scene 및 /map을 쓰지 않는다.
~~~

- [ ] **Step 2: Fold action output into character-image**

Replace /talk and overlay wording in 캐릭터 이미지 행위 상태 with:

~~~md
[행위 상태]
행위 상태가 확정된 여성 고정 캐릭터는 일반 감정 이미지를 쓰지 않고 대사 직전에 1장만 출력한다.
![](https://vireth-svg.musueman.workers.dev/character-image?id={화자 C코드}&regionId={현재 R코드}&placeId={현재 L코드}&time={DAY 또는 NIGHT}&ss={01~24})
이 URL은 완성된 단일 이미지다. 투명 오버레이, 추가 NSFW 이미지, 별도 이미지 분류를 만들지 않는다.
~~~

- [ ] **Step 3: Replace the greeting image**

Replace gate-arrival-webtoon.webp in charGreeting4 with:

~~~md
![](https://vireth-svg.musueman.workers.dev/place-image?regionId=R003&placeId=L022&time=DAY)
~~~

Keep greeting text/state content, but remove the legacy image URL.

- [ ] **Step 4: Save and re-open every field**

Save all edited fields; re-open character 70170 and lorebook 396096. Persisted text must contain literal /place-image, /character-image, scope=region, and ss=; normal dialogue instructions must have no /scene.

- [ ] **Step 5: Capture the new greeting**

Create a fresh QA chat with character 70170. Capture its first rendered screen. Verify visually that the top image is the uncaptioned gate asset, not a labeled /scene card or legacy webtoon.

- [ ] **Step 6: Capture a normal reply**

Send one in-world message at R003/L022. Inspect its rendered DOM URLs and capture the screen. The response must contain /place-image?regionId=R003&placeId=L022 and /character-image?id=, no ordinary /scene?, and must visually place the character image before dialogue.

- [ ] **Step 7: Perform the long regression only after the smoke proof**

Continue about 30 turns in the fresh chat. Capture the final screen and inspect rendered URLs. Report every missing top image, character image out of order, legacy /scene URL, or failed image request; AX text alone is not proof.

- [ ] **Step 8: Push verified commits**

After screenshots and live URL checks, push implementation/doc commits on codex/vireth-place-assets-82.
