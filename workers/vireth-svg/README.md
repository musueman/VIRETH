# Vireth Scene Worker

Cloudflare Worker that receives chatbot image-call query strings and returns the matching Vireth / Arcadia 5083 location image.

## Routes

- `/health` - JSON health check.
- `/scene?key=world-overview` - SVG response with scene image and heraldry overlay.
- `/scene.svg?key=world-overview` - alias of `/scene`.
- `/scene.webp?key=world-overview` - direct raster image response for chatbot renderers that block SVG or nested SVG images.
- `/scene.image?key=world-overview` - alias of `/scene.webp`.
- `/scene.json?key=world-overview` - resolved scene metadata.
- `/talk?name=gatekeeper&place=bekkellkar-ravenstone` - dialogue card SVG with scene background, optional right-side character image, and left-side character/place info.
- `/talk.svg?name=gatekeeper&place=bekkellkar-ravenstone` - alias of `/talk`.
- `/talk.json?name=gatekeeper&place=bekkellkar-ravenstone` - resolved dialogue card metadata.
- `/map?region=tiris` - SVG response with compact regional map panel and sorted place legend.
- `/map?place=radbarhal` - regional map SVG with the resolved current place highlighted when it matches a registered map entry.
- `/map.svg?place=radbarhal` - alias of `/map`; `place` can be a registered city/village scene key.
- `/map.webp?region=tiris` - direct regional map image response.
- `/map.image?place=radbarhal` - alias of `/map.webp`.
- `/map.json?place=radbarhal` - resolved regional map metadata.
- `/map.places.json?place=radbarhal` - sorted city/village/base entries for the resolved regional map.

The resolver accepts `key`, `scene`, `place`, `city`, `region`, and Korean aliases `장소`, `도시`, `권역`.
If a requested key is not registered, the default overview image is used.
SVG routes inline raster assets by default because some LunaTalk / Markdown surfaces break nested external images inside SVG. `external=1` is a debug-only light SVG mode and must not be used as the chatbot default until the target renderer is proven to load nested SVG images correctly.
The `/talk` resolver accepts `name`, `speaker`, `character`, `이름`, `화자` for the visible speaker and uses the same place resolver as `/scene`.

## Chatbot Call Examples

SVG wrapper:

```md
![](https://vireth-svg.musueman.workers.dev/scene?key=world-overview)
![](https://vireth-svg.musueman.workers.dev/scene?key=radarhal)
![](https://vireth-svg.musueman.workers.dev/scene?place=radbarhal)
![](https://vireth-svg.musueman.workers.dev/scene?city=yenwokel)
```

Dialogue card above a LunaTalk `name | line` response:

```md
![](https://vireth-svg.musueman.workers.dev/talk?name=gatekeeper&place=bekkellkar-ravenstone&role=gate%20inspector)
Gatekeeper | Papers. Show them before you step through.
```

Korean chatbot form:

```md
![](https://vireth-svg.musueman.workers.dev/talk?이름=검문관&장소=베크켈카르%20%2F%20레이븐스톤&역할=성문%20검문관)
검문관 | 목패. 낡았군. 어디서 받은 거지?
```

If a character image is not registered, `/talk` still returns a background-only card using the resolved scene. Temporary testing can pass `characterUrl=...`; the permanent production path should use a generated character registry instead of long query URLs.

Scene plus regional map for LunaTalk:

```md
![](https://vireth-svg.musueman.workers.dev/scene?장소=베크켈카르%20%2F%20레이븐스톤)
![](https://vireth-svg.musueman.workers.dev/map?장소=베크켈카르%20%2F%20레이븐스톤)
```

Raster endpoint for LunaTalk or other Markdown surfaces that do not render SVG reliably:

```md
![](https://vireth-svg.musueman.workers.dev/scene.webp?place=tiris)
![](https://vireth-svg.musueman.workers.dev/map.webp?region=tiris)
```

Place legend JSON:

```txt
https://vireth-svg.musueman.workers.dev/map.places.json?장소=베크켈카르%20%2F%20레이븐스톤
```

Current place highlighting uses `place`, `city`, `장소`, `도시`, `현재`, `현재장소`, `정본장소명`, or `key`. Region-only calls such as `map?region=tiris` show the legend without a current-place highlight.

## Registered Scenes

The generated registry currently loads 97 city/base scenes, 70 unique village scenes, 20 regional heraldry images, 20 regional maps, and 166 regional map place entries.
Registered city and village scenes can render the matching regional heraldry image at the top-left of the SVG route.
Registered city and village scenes can also resolve `/map?place=...` to the matching regional map through their `realmKey`.
Use `/scene.webp` for the most compatible display path because it returns the scene image itself instead of an SVG wrapper.

## Asset Size Rules

SVG output size is dominated by inlined raster images. Every new or replaced image must be pre-sized before it is pushed to GitHub.

Target image budgets:

- City / base scene image: `1000x700` WebP, quality `74-78`, target `<=120KB`.
- Regional map image: `768x768` WebP, quality `68-72`, target `<=220KB`.
- Heraldry image: WebP, target `<=50KB`.
- Do not push multi-megabyte source renders into the Worker registry path. Keep source-quality renders outside the public router path.

Reference conversion commands:

```powershell
magick input.webp -resize 1000x700^ -gravity center -extent 1000x700 -quality 76 output-scene.webp
magick input.webp -resize 768x768^ -gravity center -extent 768x768 -quality 70 output-map.webp
```

Size check after deploying or changing image URLs:

```powershell
$urls = @(
  @('scene','https://vireth-svg.musueman.workers.dev/scene?key=bekkellkar-ravenstone'),
  @('map','https://vireth-svg.musueman.workers.dev/map?region=tiris&place=bekkellkar-ravenstone&layout=mobile')
)
$result = foreach($u in $urls){
  $resp = Invoke-WebRequest -Uri $u[1] -UseBasicParsing
  $bytes = [Text.Encoding]::UTF8.GetByteCount([string]$resp.Content)
  [pscustomobject]@{Name=$u[0]; KB=[math]::Round($bytes/1kb,1)}
}
$result | Format-Table -AutoSize
```

Current practical targets for default inlined SVG:

- Scene SVG should normally stay under `250KB`.
- Map SVG should normally stay under `500KB`.
- If a map SVG exceeds `700KB`, optimize the regional map image before changing Worker logic.

## Source Rule

This Worker does not decide generation rules. Image generation and review stay outside the Worker. The Worker only maps a scene/location key from the chatbot call to a pre-registered public image URL.
