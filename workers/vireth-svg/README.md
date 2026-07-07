# Vireth SVG Worker

Cloudflare Worker that receives chatbot image-call query strings and returns an SVG image wrapper for the matching Vireth / Arcadia 5083 location image.

## Routes

- `/health` - JSON health check.
- `/scene?key=world-overview` - SVG response.
- `/scene.json?key=world-overview` - resolved scene metadata.

The resolver accepts `key`, `scene`, `place`, `city`, `region`, and Korean aliases `장소`, `도시`, `권역`.
If a requested key is not registered, the SVG title is `준비중인 이미지 입니다` and the default overview image is used.

## Chatbot Call Example

```md
![](https://vireth-svg.musueman.workers.dev/scene?key=world-overview)
![](https://vireth-svg.musueman.workers.dev/scene?key=radarhal)
![](https://vireth-svg.musueman.workers.dev/scene?장소=라드아르할)
![](https://vireth-svg.musueman.workers.dev/scene?city=yenwokel)
```

## Registered City Scene Keys

`radarhal`, `marnabmir`, `radbarhal`, `renumga`, `dorkar`, `senpukum`, `hespukum`, `markelmir`, `bekhespukum`, `yenwokel`, `yalbekum`, `silmermar`, `dorsorhal`, `tikmebhal`, `merbelmar`, `silsorsan`, `nimhal`, `silensan`, `narmarkel`, `dunartore`.

## Role

This Worker does not decide generation rules. Image generation and review stay outside the Worker. The Worker only maps a scene/location key from the chatbot call to a pre-registered public image URL, then wraps it as an SVG response suitable for chatbot output.
