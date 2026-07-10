# Vireth Scene Worker

Cloudflare Worker that receives chatbot image-call query strings and returns the matching Vireth / Arcadia 5083 location image.

## Routes

- `/health` - JSON health check.
- `/scene?key=world-overview` - SVG response with scene image and heraldry overlay.
- `/scene.svg?key=world-overview` - alias of `/scene`.
- `/scene.webp?key=world-overview` - direct raster image response for chatbot renderers that block SVG or nested SVG images.
- `/scene.image?key=world-overview` - alias of `/scene.webp`.
- `/scene.json?key=world-overview` - resolved scene metadata.
- `/map?region=tiris` - SVG response with compact regional map panel and sorted place legend.
- `/map?place=radbarhal` - regional map SVG with the resolved current place highlighted when it matches a registered map entry.
- `/map.svg?place=radbarhal` - alias of `/map`; `place` can be a registered city/village scene key.
- `/map.webp?region=tiris` - direct regional map image response.
- `/map.image?place=radbarhal` - alias of `/map.webp`.
- `/map.json?place=radbarhal` - resolved regional map metadata.
- `/map.places.json?place=radbarhal` - sorted city/village/base entries for the resolved regional map.

The resolver accepts `key`, `scene`, `place`, `city`, `region`, and Korean aliases `장소`, `도시`, `권역`.
If a requested key is not registered, the default overview image is used.

## Chatbot Call Examples

SVG wrapper:

```md
![](https://vireth-svg.musueman.workers.dev/scene?key=world-overview)
![](https://vireth-svg.musueman.workers.dev/scene?key=radarhal)
![](https://vireth-svg.musueman.workers.dev/scene?place=radbarhal)
![](https://vireth-svg.musueman.workers.dev/scene?city=yenwokel)
```

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

## Source Rule

This Worker does not decide generation rules. Image generation and review stay outside the Worker. The Worker only maps a scene/location key from the chatbot call to a pre-registered public image URL.
