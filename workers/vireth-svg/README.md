# Vireth SVG Worker

Cloudflare Worker for LunaTalk image calls in Arcadia 5083.

The chatbot should use visible names, not internal registry keys:

- `region`: current region or country name shown to the user.
- `place`: current canonical place name shown to the user.
- `name`: the speaker name exactly as printed before `|`.

Internal `key`, `bgType`, and direct asset URLs are supported for debugging and tooling, but should not be the default LunaTalk output.

## Routes

- `/health` - JSON health check.
- `/place?regionId=R003&placeId=L022` - wiki-code lookup for the combined place card.
- `/place?region=티리스&place=레이븐스톤%20성문` - backward-compatible name lookup.
- `/place.json?region=...&place=...` - resolved scene, map, and current-place metadata.
- `/scene?region=티리스&place=레이븐스톤%20성문` - top scene card SVG.
- `/scene.image?place=...` - direct scene WebP.
- `/scene.json?place=...` - resolved scene metadata.
- `/talk?id=C012&regionId=R003&placeId=L022` - wiki-code lookup for a fixed character card.
- `/talk?name=베켈%20오르민&region=티리스&place=레이븐스톤%20성문` - backward-compatible name lookup.
- `/talk.json?name=...&place=...` - resolved dialogue card metadata.
- `/talk-background.json?place=...` - resolved talk background metadata.
- `/talk.characters.json` - registered fixed-character metadata.
- `/talk.npcs.json` - random NPC pool summary.
- `/map?region=티리스&place=레이븐스톤%20성문` - regional map SVG with current place highlight.
- `/map.image?place=...` - direct regional map WebP.
- `/map.json?place=...` - resolved region map metadata.
- `/map.places.json?place=...` - region place list.

SVG routes inline raster assets by default because LunaTalk and Markdown surfaces can break nested external image references inside SVG. `external=1` is debug-only unless the target renderer has been screenshot-verified.

## LunaTalk Output Pattern

~~~md
![](https://vireth-svg.musueman.workers.dev/place?region=티리스&place=레이븐스톤%20성문)

본문 서술...

![](https://vireth-svg.musueman.workers.dev/talk?name=베켈%20오르민&region=티리스&place=레이븐스톤%20성문)
베켈 오르민 | 목패.

베켈 오르민 | 오래됐군. 어디서 받은 거지?

```text
🕰 시간: 5083년 · 수로·정화절 무렵 · 흐린 오후
🧍 상태: 검문 중
💰 소지금: 동전 몇 닢
🎒 소지품: 낡은 통행 목패, 빈 편지 봉투, 작은 칼
🎯 목표: 성문 안 기록원에게 편지의 수신인을 확인하기
```
~~~

Rules:

- `/place` appears once on the first response line.
- `/talk` appears only above each speaker's first line in a single response.
- `/map` is the detailed map and appears only in a `!장소` response.
- Do not output internal image keys in the chat body.
- If a fixed character is missing, `/talk` uses an anonymous hooded adult cutout with normal lower-face anatomy and shadow-hidden eyes.
- Generic cutouts are split into `civilian`, `guard/labor`, `scholar/clerk`, and `merchant/upper` roles, with male and female variants for each role.
- All generic cutouts preserve the same head-to-upper-thigh framing so the waist, belt, hands, and role tools remain visible. Role families use distinct silhouettes and equipment rather than hood color alone.
- `role`, `job`, or `title` selects the role family; Korean role words in the speaker name are also recognized. Unknown roles fall back to `civilian`.
- `gender=male|female` selects the matching variant. Without a gender value, explicit gender words are recognized first, then the speaker name alone selects one consistently across locations.
- An explicit `npcAssetId` remains available for debugging and legacy pinned NPC portraits.

## Background Resolution

Talk background fallback order:

1. Explicit background key or direct URL, for tooling only.
2. Registered place-type background for the current region and place type.
3. Current region city representative image.
4. Current region default image.
5. General archetype background.
6. Scene image fallback.

`bgType` must never select another region's representative image by itself.

## Asset Size Rules

Every public display asset must be optimized before pushing.

- City/base scene image: `1000x700` WebP, quality `74-78`, target `<=120KB`.
- Talk background image: `1000x700` WebP, target usually `<=120KB`.
- Regional map image: `768x768` WebP, quality `68-72`, target `<=220KB`.
- Heraldry image: WebP, target `<=50KB`.
- Do not push source-quality renders into the Worker public registry path.

## Quick Audit

```powershell
$base = 'https://vireth-svg.musueman.workers.dev'
$urls = @(
  "$base/place?region=티리스&place=레이븐스톤%20성문",
  "$base/scene?region=티리스&place=레이븐스톤%20성문",
  "$base/talk?name=베켈%20오르민&region=티리스&place=레이븐스톤%20성문",
  "$base/map?region=티리스&place=레이븐스톤%20성문",
  "$base/talk.json?name=베켈%20오르민&place=베크켈카르(레이븐스톤)%20성문",
  "$base/map.json?place=베크켈카르(레이븐스톤)%20성문"
)
foreach ($url in $urls) {
  $r = Invoke-WebRequest -Uri $url -UseBasicParsing
  [pscustomobject]@{
    Status = $r.StatusCode
    Type = $r.Headers.'Content-Type'
    KB = [math]::Round(([Text.Encoding]::UTF8.GetByteCount([string]$r.Content) / 1KB), 1)
    Url = $url
  }
}
```
