# Vireth Scene Worker

Cloudflare Worker that receives chatbot image-call query strings and returns the matching Vireth / Arcadia 5083 location image.

## Routes

- `/health` - JSON health check.
- `/scene?key=world-overview` - SVG response with scene image and heraldry overlay.
- `/scene.svg?key=world-overview` - alias of `/scene`.
- `/scene.webp?key=world-overview` - direct raster image response for chatbot renderers that block SVG or nested SVG images.
- `/scene.image?key=world-overview` - alias of `/scene.webp`.
- `/scene.json?key=world-overview` - resolved scene metadata.

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

Raster endpoint for LunaTalk or other Markdown surfaces that do not render SVG reliably:

```md
![](https://vireth-svg.musueman.workers.dev/scene.webp?place=tiris)
```

## Registered Scenes

The generated registry currently loads 97 city/base scenes, 70 unique village scenes, and 20 regional heraldry images.
Registered city and village scenes can render the matching regional heraldry image at the top-left of the SVG route.
Use `/scene.webp` for the most compatible display path because it returns the scene image itself instead of an SVG wrapper.

## Source Rule

This Worker does not decide generation rules. Image generation and review stay outside the Worker. The Worker only maps a scene/location key from the chatbot call to a pre-registered public image URL.
