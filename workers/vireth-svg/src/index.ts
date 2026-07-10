import { GENERATED_SCENES } from "./generated-scenes";
import { GENERATED_REGION_MAPS } from "./generated-region-maps";
import { GENERATED_REGION_MAP_PLACES } from "./generated-region-map-places";

type SceneEntry = {
  key: string;
  aliases: string[];
  title: string;
  kind: "city" | "village" | "facility" | "overview";
  imageUrl: string;
  caption: string;
  realmKey?: string;
  realmName?: string;
  heraldryName?: string;
  heraldryUrl?: string;
};

type RegionMapEntry = {
  key: string;
  aliases: string[];
  title: string;
  imageUrl: string;
  sourceFile: string;
  reviewFile: string;
};

type RegionMapPlaceEntry = {
  regionKey: string;
  regionName: string;
  outputOrder: number;
  title: string;
  aliases: string[];
  kind: string;
  icon: string;
  gridX: number;
  gridY: number;
  pixelX: number;
  pixelY: number;
  mapXPct: number;
  mapYPct: number;
  order: number;
};

const ASSET_BASE =
  "https://raw.githubusercontent.com/musueman/VIRETH/4ea459a80dede9062523c5540427acbaa103e2ae/etc/arcadia5083-scene-router";
const CURRENT_SCENE_ASSET_REF = "bed5811995c024c95aad40857cf1183536c995ee";

const SCENES: SceneEntry[] = [
  ...(GENERATED_SCENES as SceneEntry[]),
  {
    key: "world-overview",
    aliases: ["overview", "arcadia5083", "아르카디아", "비레스", "세계", "세계총람"],
    title: "5083년 세계 총람",
    kind: "overview",
    imageUrl:
      "https://raw.githubusercontent.com/musueman/VIRETH/6e78b7fc4d4d5bfb4aec3c06891c2a7650c38bf8/etc/arcadia5083-chatbot-start/ck5083-world-overview-life-zones-v1.png",
    caption: "아르카디아권 5083년의 자연 조건, 정치 압력, 생활권, 지식층을 한 장에 묶은 총람이다."
  },
  {
    key: "culture-zones",
    aliases: ["regions", "culture", "국가", "권역", "문화권", "대권역"],
    title: "5083년 대권역·국가·문화권",
    kind: "overview",
    imageUrl:
      "https://raw.githubusercontent.com/musueman/VIRETH/6e78b7fc4d4d5bfb4aec3c06891c2a7650c38bf8/etc/arcadia5083-chatbot-start/ck5083-regions-nations-culture-zones-v1.png",
    caption: "국가 경계가 아니라 대권역 소속과 문화권 연결을 읽는 관계도다."
  },
  {
    key: "place-network",
    aliases: ["places", "city-network", "장소", "도시", "시설", "장소기능망"],
    title: "5083년 도시·장소 기능망",
    kind: "overview",
    imageUrl:
      "https://raw.githubusercontent.com/musueman/VIRETH/6e78b7fc4d4d5bfb4aec3c06891c2a7650c38bf8/etc/arcadia5083-chatbot-start/ck5083-cities-places-function-network-v1.png",
    caption: "장소를 권력, 기록, 물류, 생존 기능이 드러나는 생활 접점으로 읽는 백과형 도식이다."
  },
  {
    key: "radarhal",
    aliases: ["leonia-radarhal", "라드아르할", "레오니아", "레오니아 라드아르할", "왕도"],
    title: "라드아르할",
    kind: "city",
    imageUrl: assetUrl("city-vistas/ck5083-city-leonia-radarhal-imagegen-v1-scene-v1.webp"),
    caption: "레오니아의 중심도시. 왕도, 관청, 성문, 시장, 대규모 성벽이 드러난다."
  },
  {
    key: "marnabmir",
    aliases: ["norghard-marnabmir", "마르나브미르", "노르가르드", "북방 군항"],
    title: "마르나브미르",
    kind: "city",
    imageUrl: assetUrl("city-vistas/ck5083-city-norghard-marnabmir-imagegen-v1-scene-v1.webp"),
    caption: "노르가르드의 북방 군항. 조선 시설, 방파제, 해안 방어 기능이 보인다."
  },
  {
    key: "radbarhal",
    aliases: ["tiris-radbarhal", "라드바르할", "티리스", "기록 법정 도시"],
    title: "라드바르할",
    kind: "city",
    imageUrl: assetUrl("city-vistas/ck5083-city-tiris-radbarhal-imagegen-v1-scene-v1.webp"),
    caption: "티리스의 중심도시. 기록, 법정, 신전, 길드권 분위기가 읽힌다."
  },
  {
    key: "renumga",
    aliases: ["linrenet-renumga", "레눔가", "린레네트", "수로 도시"],
    title: "레눔가",
    kind: "city",
    imageUrl: assetUrl("city-vistas/ck5083-city-linrenet-renumga-imagegen-v1-scene-v1.webp"),
    caption: "린레네트의 대표도시. 기록, 극장, 공방, 문서고와 수로형 구조가 보인다."
  },
  {
    key: "dorkar",
    aliases: ["bekdoret-dorkar", "도르카르", "벡도레트", "요새 관문도시"],
    title: "도르카르",
    kind: "city",
    imageUrl: assetUrl("city-vistas/ck5083-city-bekdoret-dorkar-imagegen-v1-scene-v1.webp"),
    caption: "벡도레트의 대표도시. 내성, 성문, 병영, 검문 시설이 뚜렷하다."
  },
  {
    key: "senpukum",
    aliases: ["senhalet-senpukum", "센푸쿰", "센할레트", "공동 창고", "농경 정착지"],
    title: "센푸쿰",
    kind: "city",
    imageUrl: assetUrl("city-vistas/ck5083-city-senhalet-senpukum-imagegen-v1-scene-v1.webp"),
    caption: "센할레트의 대표 정착지. 공동 창고, 수문, 종자 보관, 농경 배후지가 드러난다."
  },
  {
    key: "hespukum",
    aliases: ["hesferet-hespukum", "헤스푸쿰", "헤스페레트", "고개 시장"],
    title: "헤스푸쿰",
    kind: "city",
    imageUrl: assetUrl("city-vistas/ck5083-city-hesferet-hespukum-imagegen-v1-scene-v1.webp"),
    caption: "헤스페레트의 대표도시. 고개 시장, 창고, 감시 초소, 산악 통행권이 보인다."
  },
  {
    key: "markelmir",
    aliases: ["kelnabet-markelmir", "마르켈미르", "켈나베트", "자유항"],
    title: "마르켈미르",
    kind: "city",
    imageUrl: assetUrl("city-vistas/ck5083-city-kelnabet-markelmir-imagegen-v1-scene-v1.webp"),
    caption: "켈나베트의 대표도시. 해도 창고, 선박 검문, 자유항과 조선 시설이 보인다."
  },
  {
    key: "bekhespukum",
    aliases: ["hesbeket-bekhespukum", "베크헤스푸쿰", "헤스베케트", "혹한 통행도시"],
    title: "베크헤스푸쿰",
    kind: "city",
    imageUrl: assetUrl("city-vistas/ck5083-city-hesbeket-bekhespukum-imagegen-v1-scene-v1.webp"),
    caption: "헤스베케트의 대표도시. 혹한 통행, 공동주거, 비상 창고, 생존형 공공시설이 보인다."
  },
  {
    key: "yenwokel",
    aliases: ["yenmebet-yenwokel", "옌워켈", "옌메베트", "산악 표식도시", "고공길"],
    title: "옌워켈",
    kind: "city",
    imageUrl: assetUrl("city-vistas/ck5083-city-yenmebet-yenwokel-imagegen-v1-scene-v1.webp"),
    caption: "옌메베트의 중심도시. 고공길, 기상 경고, 장비 점검이 드러난다."
  },
  {
    key: "yalbekum",
    aliases: ["nimnaret-yalbekum", "얄베크움", "님나레트", "봉인 창고", "제한 학술권"],
    title: "얄베크움",
    kind: "city",
    imageUrl: assetUrl("city-vistas/ck5083-city-nimnaret-yalbekum-imagegen-v1-scene-v1.webp"),
    caption: "님나레트의 중심도시. 감찰, 외부자 대기, 봉인 창고, 제한 학술권이 드러난다."
  },
  {
    key: "silmermar",
    aliases: ["silnimet-silmermar", "실메르마르", "실니메트", "습지 수로"],
    title: "실메르마르",
    kind: "city",
    imageUrl: assetUrl("city-vistas/ck5083-city-silnimet-silmermar-imagegen-v1-scene-v1.webp"),
    caption: "실니메트의 대표도시. 습지 수로, 강하 교역, 약초와 저지 생업권이 보인다."
  },
  {
    key: "dorsorhal",
    aliases: ["ardolet-dorsorhal", "도르소르할", "아르도레트", "고산 경로"],
    title: "도르소르할",
    kind: "city",
    imageUrl: assetUrl("city-vistas/ck5083-city-ardolet-dorsorhal-imagegen-v1-scene-v1.webp"),
    caption: "아르도레트의 대표도시. 산악 관측, 수도원, 약초권, 고산 경로가 보인다."
  },
  {
    key: "tikmebhal",
    aliases: ["garmebet-tikmebhal", "틱메브할", "가르메베트", "계절 야영", "유목 거점"],
    title: "틱메브할",
    kind: "city",
    imageUrl: assetUrl("city-vistas/ck5083-city-garmebet-tikmebhal-imagegen-v1-scene-v1.webp"),
    caption: "가르메베트의 대표 거점. 계절 야영, 가축 교역, 저장권이 드러난다."
  },
  {
    key: "merbelmar",
    aliases: ["merhalet-merbelmar", "메르벨마르", "메르할레트", "강하 항구"],
    title: "메르벨마르",
    kind: "city",
    imageUrl: assetUrl("city-vistas/ck5083-city-merhalet-merbelmar-imagegen-v1-scene-v1.webp"),
    caption: "메르할레트의 강하 항구. 항만, 상단, 창고 거리, 하구 수로가 보인다."
  },
  {
    key: "silsorsan",
    aliases: ["silhalet-silsorsan", "실소르산", "실할레트", "성림 중심지"],
    title: "실소르산",
    kind: "city",
    imageUrl: assetUrl("city-vistas/ck5083-city-silhalet-silsorsan-imagegen-v1-scene-v1.webp"),
    caption: "실할레트의 성림 중심지. 성림 의례, 숲 감시, 채집 허가, 왕실 정원권이 보인다."
  },
  {
    key: "nimhal",
    aliases: ["nimsolet-nimhal", "님할", "님소레트", "학당 도시"],
    title: "님할",
    kind: "city",
    imageUrl: assetUrl("city-vistas/ck5083-city-nimsolet-nimhal-imagegen-v1-scene-v1.webp"),
    caption: "님소레트의 중심도시. 학당, 후원청, 종교 강의, 공개 시험장 기능이 보인다."
  },
  {
    key: "silensan",
    aliases: ["sylvania-silensan", "실렌산", "실바니아", "전승지", "탐사 거점"],
    title: "실렌산",
    kind: "city",
    imageUrl: assetUrl("city-vistas/ck5083-city-sylvania-silensan-imagegen-v1-scene-v1.webp"),
    caption: "실바니아의 전승지. 숲 전승, 탐사 거점, 안개길, 사본 열람지 성격이 보인다."
  },
  {
    key: "narmarkel",
    aliases: ["dragonspire-narmarkel", "나르마르켈", "드래곤스파이어", "화산 항만"],
    title: "나르마르켈",
    kind: "city",
    imageUrl: assetUrl("city-vistas/ck5083-city-dragonspire-narmarkel-imagegen-v1-scene-v1.webp"),
    caption: "드래곤스파이어의 기준 항만. 화산 항로, 피난 표식, 현무암 항만, 화산 위험권이 보인다."
  },
  {
    key: "dunartore",
    aliases: ["fenrir-eye-dunartore", "둔아르토르", "펜리르의 눈", "등대 표식지", "외해 관측"],
    title: "둔아르토르",
    kind: "city",
    imageUrl: assetUrl("city-vistas/ck5083-city-fenrir-eye-dunartore-imagegen-v1-scene-v1.webp"),
    caption: "펜리르의 눈 표식지. 등대, 외해 관측, 구조 신호, 금기 해안권이 보인다."
  }
];

const REGION_MAPS = GENERATED_REGION_MAPS as RegionMapEntry[];
const REGION_MAP_PLACES = GENERATED_REGION_MAP_PLACES as RegionMapPlaceEntry[];
const MAP_PLACE_QUERY_NAMES = [
  "current",
  "currentPlace",
  "place",
  "city",
  "장소",
  "도시",
  "현재",
  "현재장소",
  "정본장소명",
  "key"
];

const TEXT_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=300"
};

const SVG_HEADERS = {
  "Content-Type": "image/svg+xml; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=300"
};

const IMAGE_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=300"
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method !== "GET" && request.method !== "HEAD") {
      return json({ error: "method_not_allowed" }, 405);
    }

    if (url.pathname === "/" || url.pathname === "/health") {
      return json({
        ok: true,
        service: env.SERVICE_NAME,
        routes: [
          "/scene?key=world-overview",
          "/scene.json?key=world-overview",
          "/map?region=tiris",
          "/map.json?region=tiris",
          "/map.places.json?region=tiris"
        ]
      });
    }

    if (url.pathname === "/scene.json") {
      const scene = resolveScene(url, env);
      return json(scene);
    }

    if (url.pathname === "/map.json") {
      return json(resolveRegionMap(url, env) ?? pendingRegionMap(url));
    }

    if (url.pathname === "/map.places.json") {
      const map = resolveRegionMap(url, env);
      if (!map) {
        return json(
          {
            ok: false,
            error: "region_map_not_found",
            query: firstQuery(url, ["key", "map", "region", "realm", "place", "city"])
          },
          404
        );
      }
      const places = regionMapPlaces(map.key);
      const currentPlace = resolveCurrentMapPlace(url, map, env);
      return json({
        ok: true,
        region: { key: map.key, title: map.title },
        currentPlace,
        count: places.length,
        sort: "top-to-bottom, then right-to-left",
        places: places.map((place) => ({
          ...place,
          current: isSameMapPlace(place, currentPlace)
        }))
      });
    }

    if (url.pathname === "/scene.webp" || url.pathname === "/scene.image") {
      const scene = resolveScene(url, env);
      return image(scene.imageUrl, request.method);
    }

    if (url.pathname === "/heraldry.webp" || url.pathname === "/heraldry.image") {
      const scene = resolveScene(url, env);
      if (!scene.heraldryUrl) {
        return new Response(renderNotFoundSvg(), { status: 404, headers: SVG_HEADERS });
      }
      return image(scene.heraldryUrl, request.method);
    }

    if (url.pathname === "/map.webp" || url.pathname === "/map.image") {
      const map = resolveRegionMap(url, env);
      if (!map) {
        return new Response(renderPendingMapSvg(pendingRegionMap(url).title), {
          status: 404,
          headers: SVG_HEADERS
        });
      }
      return image(map.imageUrl, request.method);
    }

    if (url.pathname === "/scene" || url.pathname === "/scene.svg") {
      const scene = resolveScene(url, env);
      return new Response(await renderSceneSvg(scene, url.origin), { headers: SVG_HEADERS });
    }

    if (url.pathname === "/map" || url.pathname === "/map.svg") {
      const map = resolveRegionMap(url, env);
      if (!map) {
        return new Response(renderPendingMapSvg(pendingRegionMap(url).title), {
          headers: SVG_HEADERS
        });
      }
      return new Response(await renderRegionMapSvg(map, url.origin, url, env), { headers: SVG_HEADERS });
    }

    return new Response(renderNotFoundSvg(), { status: 404, headers: SVG_HEADERS });
  }
} satisfies ExportedHandler<Env>;

function resolveScene(url: URL, env: Env): SceneEntry {
  const queryValue =
    firstQuery(url, ["key", "scene", "place", "city", "region", "장소", "도시", "권역"]) ??
    "world-overview";
  return resolveSceneByValue(queryValue, env);
}

function resolveSceneByValue(queryValue: string, env: Env): SceneEntry {
  const normalized = normalizeKey(queryValue);

  const direct = SCENES.find((scene) => normalizeKey(scene.key) === normalized);
  if (direct) {
    return direct;
  }

  const titled = SCENES.find((scene) => normalizeKey(scene.title) === normalized);
  if (titled) {
    return titled;
  }

  const aliasMatches = SCENES.filter((scene) =>
    scene.aliases.some((alias) => normalizeKey(alias) === normalized)
  );
  if (aliasMatches.length === 1) {
    return aliasMatches[0];
  }

  return {
    key: normalized || "pending",
    aliases: [],
    title: "준비중인 이미지 입니다",
    kind: "overview",
    imageUrl: env.DEFAULT_IMAGE_URL,
    caption: queryValue
      ? `${queryValue}에 연결된 도시·마을 전경 이미지는 아직 등록되지 않았다.`
      : "아직 이 장소키에 연결된 도시·마을 전경 이미지가 없다."
  };
}

function resolveRegionMap(url: URL, env: Env): RegionMapEntry | null {
  const queryValue = firstQuery(url, [
    "key",
    "map",
    "region",
    "realm",
    "place",
    "city",
    "장소",
    "도시",
    "권역",
    "지도"
  ]);
  if (!queryValue) {
    return null;
  }

  const normalized = normalizeKey(queryValue);
  const direct = REGION_MAPS.find(
    (map) =>
      normalizeKey(map.key) === normalized ||
      normalizeKey(map.title) === normalized ||
      map.aliases.some((alias) => normalizeKey(alias) === normalized)
  );
  if (direct) {
    return direct;
  }

  const scene = resolveSceneByValue(queryValue, env);
  if (scene.realmKey) {
    return REGION_MAPS.find((map) => normalizeKey(map.key) === normalizeKey(scene.realmKey ?? "")) ?? null;
  }

  return null;
}

function regionMapPlaces(regionKey: string): RegionMapPlaceEntry[] {
  const normalized = normalizeKey(regionKey);
  return REGION_MAP_PLACES.filter((place) => normalizeKey(place.regionKey) === normalized).sort(
    (a, b) => a.order - b.order
  );
}

function resolveCurrentMapPlace(url: URL, map: RegionMapEntry, env: Env): RegionMapPlaceEntry | null {
  const queryValue = firstQuery(url, MAP_PLACE_QUERY_NAMES);
  if (!queryValue) {
    return null;
  }

  const direct = resolveMapPlaceByValue(queryValue, map.key);
  if (direct) {
    return direct;
  }

  const scene = resolveSceneByValue(queryValue, env);
  if (scene.realmKey && normalizeKey(scene.realmKey) !== normalizeKey(map.key)) {
    return null;
  }

  return resolveMapPlaceByValue(scene.title, map.key);
}

function resolveMapPlaceByValue(value: string, regionKey: string): RegionMapPlaceEntry | null {
  const normalized = normalizeKey(value);
  if (!normalized) {
    return null;
  }

  return (
    regionMapPlaces(regionKey).find(
      (place) =>
        normalizeKey(place.title) === normalized ||
        place.aliases.some((alias) => normalizeKey(alias) === normalized)
    ) ?? null
  );
}

function isSameMapPlace(left: RegionMapPlaceEntry, right: RegionMapPlaceEntry | null): boolean {
  return Boolean(
    right &&
      normalizeKey(left.regionKey) === normalizeKey(right.regionKey) &&
      normalizeKey(left.title) === normalizeKey(right.title)
  );
}

function pendingRegionMap(url: URL): RegionMapEntry {
  const queryValue =
    firstQuery(url, ["key", "map", "region", "realm", "place", "city", "장소", "도시", "권역", "지도"]) ??
    "pending";
  const normalized = normalizeKey(queryValue);

  return {
    key: normalized || "pending",
    aliases: [],
    title: "준비중인 지도 입니다",
    imageUrl: "",
    sourceFile: "",
    reviewFile: ""
  };
}

function firstQuery(url: URL, names: string[]): string | null {
  for (const name of names) {
    const value = url.searchParams.get(name);
    if (value && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{Letter}\p{Number}-]+/gu, "");
}

function assetUrl(path: string): string {
  return `${ASSET_BASE}/${path}`;
}

async function renderSceneSvg(scene: SceneEntry, origin: string): Promise<string> {
  const title = escapeXml(scene.title);
  const caption = escapeXml(scene.caption);
  const imageDataUri = await fetchDataUri(scene.imageUrl);
  const heraldryDataUri = scene.heraldryUrl ? await fetchDataUri(scene.heraldryUrl) : null;
  const imageUrl = escapeXml(imageDataUri ?? scene.imageUrl);
  const heraldryUrl = scene.heraldryUrl
    ? heraldryDataUri ?? `${origin}/heraldry.image?key=${encodeURIComponent(scene.key)}`
    : null;
  const overlay = scene.heraldryUrl
    ? renderHeraldryOverlay(scene, heraldryUrl)
    : renderTextOverlay(title, caption);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="864" viewBox="0 0 1536 864" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="shade" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#07111f" stop-opacity="0.12"/>
      <stop offset="72%" stop-color="#07111f" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#07111f" stop-opacity="0.62"/>
    </linearGradient>
    <linearGradient id="scenePanel" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#07111f" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#182435" stop-opacity="0.76"/>
    </linearGradient>
    <linearGradient id="sceneBadge" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="#c8b16a" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.18"/>
    </linearGradient>
    <filter id="scenePanelShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.38"/>
    </filter>
  </defs>
  <rect width="1536" height="864" fill="#07111f"/>
  <image href="${imageUrl}" x="0" y="0" width="1536" height="864" preserveAspectRatio="xMidYMid slice"/>
  <rect width="1536" height="864" fill="url(#shade)"/>
  ${overlay}
</svg>`;
}

async function renderRegionMapSvg(
  map: RegionMapEntry,
  origin: string,
  url: URL,
  env: Env
): Promise<string> {
  const layout = normalizeKey(firstQuery(url, ["layout", "view", "mode", "형식", "레이아웃"]) ?? "mobile");
  if (layout === "wide" || layout === "desktop" || layout === "landscape" || layout === "horizontal") {
    return renderRegionMapWideSvg(map, origin, url, env);
  }
  return renderRegionMapMobileSvg(map, origin, url, env);
}

async function renderRegionMapWideSvg(
  map: RegionMapEntry,
  origin: string,
  url: URL,
  env: Env
): Promise<string> {
  const title = escapeXml(map.title);
  const imageDataUri = await fetchDataUri(map.imageUrl);
  const imageUrl = escapeXml(imageDataUri ?? `${origin}/map.image?key=${encodeURIComponent(map.key)}`);
  const places = regionMapPlaces(map.key);
  const currentPlace = resolveCurrentMapPlace(url, map, env);
  const legend = renderRegionMapLegend(places, currentPlace);
  const placeMarkers = renderMapPointMarkers(places, currentPlace);
  const currentMarker = renderCurrentPlaceMarker(currentPlace);
  const regionSentence =
    currentPlace
      ? `현재 위치: ${currentPlace.title}`
      : "권역의 거점 배치를 한눈에 정리한다.";
  const heraldryScene = regionHeraldryScene(map.key);
  const heraldryImageUrl =
    heraldryScene?.heraldryUrl
      ? escapeXml(
          (await fetchDataUri(heraldryScene.heraldryUrl)) ??
            `${origin}/heraldry.image?key=${encodeURIComponent(heraldryScene.key)}`
        )
      : null;
  const header = renderRegionMapHeader(map.title, regionSentence, heraldryImageUrl);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="720" viewBox="0 0 1536 720" role="img" aria-label="${title} 지역 지도">
  <defs>
    <linearGradient id="mapBg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#293022"/>
    </linearGradient>
    <linearGradient id="mapShade" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.32"/>
    </linearGradient>
    <linearGradient id="mapPanel" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#07111f" stop-opacity="0.82"/>
      <stop offset="100%" stop-color="#142338" stop-opacity="0.68"/>
    </linearGradient>
    <linearGradient id="currentBox" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="#c8b16a" stop-opacity="0.12"/>
    </linearGradient>
    <linearGradient id="currentBadge" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#f6edcf"/>
    </linearGradient>
    <filter id="mapPanelShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#000000" flood-opacity="0.34"/>
    </filter>
    <filter id="markerGlow" x="-80%" y="-80%" width="260%" height="260%">
      <feDropShadow dx="0" dy="0" stdDeviation="9" flood-color="#f59e0b" flood-opacity="0.9"/>
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000000" flood-opacity="0.48"/>
    </filter>
    <clipPath id="regionMapClip"><rect x="64" y="40" width="640" height="640" rx="18"/></clipPath>
    <clipPath id="regionCrestClip"><rect x="772" y="66" width="96" height="124" rx="14"/></clipPath>
  </defs>
  <rect width="1536" height="720" rx="0" fill="url(#mapBg)"/>
  <rect x="40" y="28" width="1456" height="664" rx="26" fill="#07111f" fill-opacity="0.46" stroke="#c8b16a" stroke-opacity="0.42"/>
  <rect x="736" y="40" width="736" height="640" rx="24" fill="url(#mapPanel)" stroke="#c8b16a" stroke-opacity="0.34" filter="url(#mapPanelShadow)"/>
  <image href="${imageUrl}" x="64" y="40" width="640" height="640" preserveAspectRatio="xMidYMid slice" clip-path="url(#regionMapClip)" filter="url(#mapPanelShadow)"/>
  <rect x="64" y="40" width="640" height="640" rx="18" fill="url(#mapShade)" stroke="#d8c078" stroke-opacity="0.62"/>
  ${placeMarkers}
  ${currentMarker}
  <g font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
    ${header}
    ${legend}
  </g>
</svg>`;
}

async function renderRegionMapMobileSvg(
  map: RegionMapEntry,
  origin: string,
  url: URL,
  env: Env
): Promise<string> {
  const title = escapeXml(map.title);
  const imageDataUri = await fetchDataUri(map.imageUrl);
  const imageUrl = escapeXml(imageDataUri ?? `${origin}/map.image?key=${encodeURIComponent(map.key)}`);
  const places = regionMapPlaces(map.key);
  const currentPlace = resolveCurrentMapPlace(url, map, env);
  const placeMarkers = renderMapPointMarkers(places, currentPlace, 48, 48, 768);
  const currentMarker = renderCurrentPlaceMarker(currentPlace, 48, 48, 768);
  const legend = renderRegionMapMobileLegend(places, currentPlace);
  const sentence = currentPlace
    ? `현재 위치: ${currentPlace.title}`
    : "권역의 거점 배치를 세로형으로 정리한다.";
  const heraldryScene = regionHeraldryScene(map.key);
  const heraldryImageUrl =
    heraldryScene?.heraldryUrl
      ? escapeXml(
          (await fetchDataUri(heraldryScene.heraldryUrl)) ??
            `${origin}/heraldry.image?key=${encodeURIComponent(heraldryScene.key)}`
        )
      : null;
  const header = renderRegionMapMobileHeader(map.title, sentence, heraldryImageUrl);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="864" height="1740" viewBox="0 0 864 1740" role="img" aria-label="${title} 세로 지도">
  <defs>
    <linearGradient id="mapBg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#243022"/>
    </linearGradient>
    <linearGradient id="mapShade" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.03"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.22"/>
    </linearGradient>
    <linearGradient id="currentBox" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="#c8b16a" stop-opacity="0.12"/>
    </linearGradient>
    <linearGradient id="currentBadge" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#f6edcf"/>
    </linearGradient>
    <linearGradient id="mobilePanel" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#07111f" stop-opacity="0.86"/>
      <stop offset="100%" stop-color="#142338" stop-opacity="0.74"/>
    </linearGradient>
    <filter id="mapPanelShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#000000" flood-opacity="0.34"/>
    </filter>
    <filter id="markerGlow" x="-80%" y="-80%" width="260%" height="260%">
      <feDropShadow dx="0" dy="0" stdDeviation="9" flood-color="#f59e0b" flood-opacity="0.9"/>
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000000" flood-opacity="0.48"/>
    </filter>
    <clipPath id="mobileMapClip"><rect x="48" y="48" width="768" height="768" rx="24"/></clipPath>
    <clipPath id="mobileCrestClip"><rect x="64" y="858" width="86" height="110" rx="13"/></clipPath>
  </defs>
  <rect width="864" height="1740" fill="url(#mapBg)"/>
  <rect x="20" y="20" width="824" height="1700" rx="30" fill="url(#mobilePanel)" stroke="#c8b16a" stroke-opacity="0.42"/>
  <image href="${imageUrl}" x="48" y="48" width="768" height="768" preserveAspectRatio="xMidYMid slice" clip-path="url(#mobileMapClip)" filter="url(#mapPanelShadow)"/>
  <rect x="48" y="48" width="768" height="768" rx="24" fill="url(#mapShade)" stroke="#d8c078" stroke-opacity="0.58"/>
  ${placeMarkers}
  ${currentMarker}
  <g font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
    ${header}
    ${legend}
  </g>
</svg>`;
}

function regionHeraldryScene(regionKey: string): SceneEntry | null {
  const normalized = normalizeKey(regionKey);
  return (
    SCENES.find(
      (scene) => scene.heraldryUrl && scene.realmKey && normalizeKey(scene.realmKey) === normalized
    ) ?? null
  );
}

function renderRegionMapHeader(
  regionTitle: string,
  sentence: string,
  heraldryUrl: string | null
): string {
  const escapedTitle = escapeXml(regionTitle);
  const escapedSentence = escapeXml(sentence);
  const crest = heraldryUrl
    ? `<image href="${heraldryUrl}" x="772" y="66" width="96" height="124" preserveAspectRatio="xMidYMid slice" clip-path="url(#regionCrestClip)"/>`
    : `<text x="820" y="140" text-anchor="middle" fill="#f6edcf" font-size="30" font-weight="850">${escapeXml(
        regionTitle.slice(0, 2)
      )}</text>`;

  return `<g>
      <rect x="760" y="54" width="120" height="150" rx="18" fill="#050b14" fill-opacity="0.58" stroke="#d8c078" stroke-opacity="0.62"/>
      ${crest}
      <rect x="902" y="66" width="218" height="38" rx="11" fill="#07111f" fill-opacity="0.58" stroke="#9fb0c2" stroke-opacity="0.28"/>
      <text x="920" y="92" fill="#d9e4f2" font-size="20" font-weight="850">국가: ${escapedTitle}</text>
      <text x="902" y="148" fill="#f6edcf" font-size="40" font-weight="850">거점 지도</text>
      <text x="902" y="188" fill="#d9e4f2" font-size="22" font-weight="700">${escapedSentence}</text>
      <text x="772" y="246" fill="#f6edcf" font-size="27" font-weight="850">거점 목록</text>
      <line x1="772" y1="268" x2="1324" y2="268" stroke="#c8b16a" stroke-opacity="0.48" stroke-width="2"/>
    </g>`;
}

function renderRegionMapMobileHeader(
  regionTitle: string,
  sentence: string,
  heraldryUrl: string | null
): string {
  const escapedTitle = escapeXml(regionTitle);
  const escapedSentence = escapeXml(sentence);
  const crest = heraldryUrl
    ? `<image href="${heraldryUrl}" x="64" y="858" width="86" height="110" preserveAspectRatio="xMidYMid slice" clip-path="url(#mobileCrestClip)"/>`
    : `<text x="107" y="924" text-anchor="middle" fill="#f6edcf" font-size="28" font-weight="850">${escapeXml(
        regionTitle.slice(0, 2)
      )}</text>`;

  return `<g>
      <rect x="54" y="846" width="106" height="134" rx="18" fill="#050b14" fill-opacity="0.54" stroke="#d8c078" stroke-opacity="0.58"/>
      ${crest}
      <text x="190" y="878" fill="#9fb0c2" font-size="19" font-weight="850">국가</text>
      <text x="248" y="878" fill="#d9e4f2" font-size="21" font-weight="850">${escapedTitle}</text>
      <text x="190" y="928" fill="#f6edcf" font-size="42" font-weight="900">거점 지도</text>
      <text x="190" y="976" fill="#d9e4f2" font-size="22" font-weight="750">${escapedSentence}</text>
      <line x1="58" y1="1024" x2="806" y2="1024" stroke="#c8b16a" stroke-opacity="0.48" stroke-width="2"/>
      <text x="64" y="1060" fill="#f6edcf" font-size="28" font-weight="900">거점 목록</text>
    </g>`;
}

function renderMapPointMarkers(
  places: RegionMapPlaceEntry[],
  currentPlace: RegionMapPlaceEntry | null,
  mapX = 64,
  mapY = 40,
  mapSize = 640
): string {
  const placed: Array<{ x: number; y: number }> = [];

  return places
    .map((place) => {
      const baseX = mapX + (place.mapXPct / 100) * mapSize;
      const baseY = mapY + (place.mapYPct / 100) * mapSize;
      let x = baseX;
      let y = baseY;
      let attempt = 0;

      while (
        placed.some((marker) => Math.hypot(marker.x - x, marker.y - y) < 32) &&
        attempt < 4
      ) {
        attempt += 1;
        const direction = place.order % 2 === 0 ? 1 : -1;
        x = Math.min(Math.max(baseX + direction * 18 * attempt, mapX + 20), mapX + mapSize - 20);
        y = Math.min(Math.max(baseY + (attempt % 2 === 0 ? 12 : -12), mapY + 20), mapY + mapSize - 20);
      }
      placed.push({ x, y });

      const current = isSameMapPlace(place, currentPlace);
      const radius = current ? 17 : 14;
      const fill = current ? "#f59e0b" : "#07111f";
      const stroke = current ? "#f6edcf" : "#d8c078";
      const textFill = current ? "#07111f" : "#f6edcf";
      const order = String(place.order).padStart(2, "0");

      return `<g aria-label="${escapeXml(order)} ${escapeXml(place.title)}">
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius}" fill="${fill}" fill-opacity="0.86" stroke="${stroke}" stroke-opacity="0.92" stroke-width="3"/>
      <text x="${x.toFixed(1)}" y="${(y + 5).toFixed(1)}" text-anchor="middle" fill="${textFill}" font-size="13" font-weight="900">${order}</text>
    </g>`;
    })
    .join("\n  ");
}

function renderCurrentPlaceMarker(
  place: RegionMapPlaceEntry | null,
  mapX = 64,
  mapY = 40,
  mapSize = 640
): string {
  if (!place) {
    return "";
  }

  const x = mapX + (place.mapXPct / 100) * mapSize;
  const y = mapY + (place.mapYPct / 100) * mapSize;
  const labelX = Math.min(Math.max(x - 78, mapX + 24), mapX + mapSize - 176);
  const labelY = y > 140 ? y - 80 : y + 42;
  const lineEndY = labelY > y ? y + 26 : y - 28;
  const order = String(place.order).padStart(2, "0");

  return `<g aria-label="현재 위치" filter="url(#markerGlow)">
    <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="48" fill="#f59e0b" fill-opacity="0.12">
      <animate attributeName="r" values="38;62;38" dur="2.2s" repeatCount="indefinite"/>
      <animate attributeName="fill-opacity" values="0.08;0.24;0.08" dur="2.2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="31" fill="none" stroke="#f6edcf" stroke-opacity="0.88" stroke-width="5">
      <animate attributeName="stroke-opacity" values="0.58;1;0.58" dur="1.8s" repeatCount="indefinite"/>
      <animate attributeName="stroke-width" values="4;7;4" dur="1.8s" repeatCount="indefinite"/>
    </circle>
    <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="15" fill="#f59e0b" stroke="#07111f" stroke-width="5"/>
    <text x="${x.toFixed(1)}" y="${(y + 5).toFixed(1)}" text-anchor="middle" fill="#07111f" font-size="13" font-weight="900">${order}</text>
    <path d="M ${x.toFixed(1)} ${(y - 34).toFixed(1)} L ${(x - 14).toFixed(1)} ${(y - 10).toFixed(
      1
    )} L ${(x + 14).toFixed(1)} ${(y - 10).toFixed(1)} Z" fill="#f6edcf" fill-opacity="0.92"/>
    <line x1="${x.toFixed(1)}" y1="${lineEndY.toFixed(1)}" x2="${(labelX + 76).toFixed(
      1
    )}" y2="${(labelY + 16).toFixed(1)}" stroke="#f6edcf" stroke-opacity="0.82" stroke-width="3"/>
    <rect x="${labelX.toFixed(1)}" y="${labelY.toFixed(1)}" width="152" height="38" rx="12" fill="#07111f" fill-opacity="0.78" stroke="#f6edcf" stroke-opacity="0.88" stroke-width="2">
      <animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="2.4s" repeatCount="indefinite"/>
    </rect>
    <text x="${(labelX + 76).toFixed(1)}" y="${(labelY + 26).toFixed(
      1
    )}" text-anchor="middle" fill="#f6edcf" font-size="20" font-weight="850">현재 위치</text>
  </g>`;
}

function renderRegionMapLegend(
  places: RegionMapPlaceEntry[],
  currentPlace: RegionMapPlaceEntry | null
): string {
  if (places.length === 0) {
    return `<text x="772" y="376" fill="#e7edf6" font-size="24">등록된 거점 좌표 없음</text>`;
  }

  const columns = places.length > 9 ? 2 : 1;
  const rowsPerColumn = Math.ceil(places.length / columns);
  const columnWidth = columns === 2 ? 330 : 560;
  const startX = 772;
  const startY = 334;
  const rowHeight = rowsPerColumn > 8 ? 38 : 44;

  return places
    .map((place, index) => {
      const column = Math.floor(index / rowsPerColumn);
      const row = index % rowsPerColumn;
      const x = startX + column * columnWidth;
      const y = startY + row * rowHeight;
      const order = String(place.order).padStart(2, "0");
      const title = escapeXml(truncateDisplay(place.title, columns === 2 ? 13 : 22));
      const current = isSameMapPlace(place, currentPlace);
      const boxWidth = columns === 2 ? 300 : 560;
      const highlight = current
        ? `<rect x="${x - 18}" y="${y - 31}" width="${boxWidth}" height="44" rx="13" fill="url(#currentBox)" fill-opacity="0.78" stroke="#f6edcf" stroke-opacity="0.9" stroke-width="2" filter="url(#markerGlow)">
        <animate attributeName="fill-opacity" values="0.54;0.9;0.54" dur="2.1s" repeatCount="indefinite"/>
        <animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="2.1s" repeatCount="indefinite"/>
      </rect>
      <rect x="${x - 18}" y="${y - 31}" width="7" height="44" rx="4" fill="#f59e0b">
        <animate attributeName="opacity" values="0.55;1;0.55" dur="1.8s" repeatCount="indefinite"/>
      </rect>
      <rect x="${x + boxWidth - 78}" y="${y - 23}" width="58" height="24" rx="9" fill="url(#currentBadge)" fill-opacity="0.95">
        <animate attributeName="fill-opacity" values="0.78;1;0.78" dur="1.8s" repeatCount="indefinite"/>
      </rect>
      <text x="${x + boxWidth - 49}" y="${y - 6}" text-anchor="middle" fill="#07111f" font-size="14" font-weight="900">현재</text>`
        : "";
      const orderFill = current ? "#f6edcf" : "#f6edcf";
      const titleFill = current ? "#fff6d7" : "#e7edf6";

      return `<g>
      ${highlight}
      <text x="${x}" y="${y}" fill="${orderFill}" font-size="19" font-weight="800">${order}</text>
      <text x="${x + 42}" y="${y}" fill="${titleFill}" font-size="23" font-weight="750">${title}</text>
    </g>`;
    })
    .join("\n    ");
}

function renderRegionMapMobileLegend(
  places: RegionMapPlaceEntry[],
  currentPlace: RegionMapPlaceEntry | null
): string {
  if (places.length === 0) {
    return `<text x="64" y="1124" fill="#e7edf6" font-size="24">등록된 거점 좌표 없음</text>`;
  }

  const startX = 64;
  const startY = 1110;
  const rowHeight = places.length > 14 ? 36 : 44;
  const boxWidth = 736;

  return places
    .map((place, index) => {
      const y = startY + index * rowHeight;
      const order = String(place.order).padStart(2, "0");
      const title = escapeXml(truncateDisplay(place.title, 25));
      const current = isSameMapPlace(place, currentPlace);
      const highlight = current
        ? `<rect x="${startX - 16}" y="${y - 30}" width="${boxWidth}" height="44" rx="13" fill="url(#currentBox)" fill-opacity="0.78" stroke="#f6edcf" stroke-opacity="0.9" stroke-width="2" filter="url(#markerGlow)">
        <animate attributeName="fill-opacity" values="0.54;0.9;0.54" dur="2.1s" repeatCount="indefinite"/>
        <animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="2.1s" repeatCount="indefinite"/>
      </rect>
      <rect x="${startX - 16}" y="${y - 30}" width="7" height="44" rx="4" fill="#f59e0b">
        <animate attributeName="opacity" values="0.55;1;0.55" dur="1.8s" repeatCount="indefinite"/>
      </rect>
      <rect x="${startX + boxWidth - 78}" y="${y - 19}" width="58" height="22" rx="9" fill="url(#currentBadge)" fill-opacity="0.95">
        <animate attributeName="fill-opacity" values="0.78;1;0.78" dur="1.8s" repeatCount="indefinite"/>
      </rect>
      <text x="${startX + boxWidth - 49}" y="${y - 3}" text-anchor="middle" fill="#07111f" font-size="13" font-weight="900">현재</text>`
        : "";
      const titleFill = current ? "#fff6d7" : "#e7edf6";

      return `<g>
      ${highlight}
      <text x="${startX}" y="${y}" fill="#f6edcf" font-size="18" font-weight="850">${order}</text>
      <text x="${startX + 48}" y="${y}" fill="${titleFill}" font-size="24" font-weight="780">${title}</text>
    </g>`;
    })
    .join("\n    ");
}

function truncateDisplay(value: string, maxLength: number): string {
  const chars = Array.from(value);
  if (displayLength(value) <= maxLength) {
    return value;
  }

  let output = "";
  for (const char of chars) {
    if (displayLength(`${output}${char}`) > maxLength - 1) {
      break;
    }
    output += char;
  }
  return `${output}…`;
}

function renderHeraldryOverlay(scene: SceneEntry, heraldryUrl: string | null): string {
  const titleLines = titleDisplayLines(scene.title);
  const titleText = titleLines
    .map((line, index) => {
      const y = titleLines.length === 1 ? 154 : 132 + index * 42;
      return `<text x="232" y="${y}" fill="#f6edcf" font-size="38" font-weight="850">${escapeXml(line)}</text>`;
    })
    .join("\n    ");
  const realmLabel = scene.realmName ? `국가: ${scene.realmName}` : scene.heraldryName ?? "지역 정보";
  const escapedRealmLabel = escapeXml(realmLabel);
  const kindLabel = sceneKindLabel(scene.kind);
  const escapedKindLabel = escapeXml(kindLabel);
  const panelHeight = 650;
  const panelWidth = 690;
  const crestFrameHeight = 234;
  const crestHeight = 210;
  const kindY = titleLines.length === 1 ? 206 : 218;
  const kindWidth = Math.max(128, Math.ceil(46 + displayLength(kindLabel) * 16));
  const dbSummary = renderSceneDbSummary(scene, kindLabel, panelWidth);
  const heraldryMark = heraldryUrl
    ? `<image href="${escapeXml(heraldryUrl)}" x="68" y="61" width="132" height="${crestHeight}" preserveAspectRatio="xMidYMid slice" clip-path="url(#crestClip)"/>`
    : `<text x="134" y="${panelHeight / 2 + 24}" text-anchor="middle" fill="#f6edcf" font-size="34" font-weight="800">${escapeXml(
        (scene.realmName ?? scene.title).slice(0, 3)
      )}</text>`;

  return `<g font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
    <clipPath id="crestClip"><rect x="68" y="61" width="132" height="${crestHeight}" rx="12"/></clipPath>
    <rect x="42" y="42" width="${panelWidth}" height="${panelHeight}" rx="22" fill="url(#scenePanel)" stroke="#c8b16a" stroke-opacity="0.82" filter="url(#scenePanelShadow)"/>
    <rect x="42" y="42" width="${panelWidth}" height="${panelHeight}" rx="22" fill="none" stroke="#f6edcf" stroke-opacity="0" stroke-width="2">
      <animate attributeName="stroke-opacity" values="0;0.44;0" dur="3.4s" repeatCount="indefinite"/>
    </rect>
    <rect x="58" y="54" width="152" height="${crestFrameHeight}" rx="18" fill="#050b14" fill-opacity="0.6" stroke="#d8c078" stroke-opacity="0.62"/>
    ${heraldryMark}
    <text x="232" y="86" fill="#9fb0c2" font-size="18" font-weight="850">소속 국가</text>
    <text x="322" y="86" fill="#d9e4f2" font-size="21" font-weight="850">${escapedRealmLabel.replace("국가: ", "")}</text>
    ${titleText}
    <line x1="232" y1="${kindY - 36}" x2="${Math.min(panelWidth - 34, 620)}" y2="${kindY - 36}" stroke="#c8b16a" stroke-opacity="0.32" stroke-width="2"/>
    <rect x="232" y="${kindY - 22}" width="${kindWidth}" height="34" rx="10" fill="url(#sceneBadge)" fill-opacity="0.78" stroke="#d8c078" stroke-opacity="0.72">
      <animate attributeName="fill-opacity" values="0.58;1;0.58" dur="2.2s" repeatCount="indefinite"/>
      <animate attributeName="stroke-opacity" values="0.56;1;0.56" dur="2.2s" repeatCount="indefinite"/>
    </rect>
    <text x="250" y="${kindY + 2}" fill="#f6edcf" font-size="20" font-weight="800">${escapedKindLabel}</text>
    <text x="74" y="332" fill="#f6edcf" font-size="24" font-weight="900">장소 정보</text>
    <line x1="74" y1="352" x2="${panelWidth - 60}" y2="352" stroke="#c8b16a" stroke-opacity="0.28" stroke-width="2"/>
    ${dbSummary}
  </g>`;
}

function renderSceneDbSummary(scene: SceneEntry, kindLabel: string, panelWidth: number): string {
  const dbX = 74;
  const rowTopY = 360;
  const rowHeight = 56;
  const textBaselineOffset = 34;
  const labelX = dbX;
  const valueX = dbX + 140;
  const scaleLabel = sceneScaleLabel(scene.kind);
  const functionLabel = sceneFunctionLabel(scene);
  const accessLabel = sceneAccessLabel(scene);
  const rows = [
    ["규모", scaleLabel],
    ["소속", scene.realmName ?? "-"],
    ["성격", kindLabel],
    ["주요 기능", functionLabel],
    ["갈 수 있는 곳", accessLabel]
  ];
  const rowText = rows
    .map(([label, value], index) => {
      const rowTop = rowTopY + index * rowHeight;
      const y = rowTop + textBaselineOffset;
      const wrappedValue = renderWrappedSvgText(value, valueX, y, 24, 2, 19);
      const divider =
        index < rows.length - 1
          ? `<line x1="${labelX}" y1="${rowTop + rowHeight}" x2="${panelWidth - 60}" y2="${rowTop + rowHeight}" stroke="#9fb0c2" stroke-opacity="0.14" stroke-width="1"/>`
          : "";
      return `<text x="${labelX}" y="${y}" fill="#9fb0c2" font-size="17" font-weight="800">${escapeXml(label)}</text>
      ${wrappedValue}
      ${divider}`;
    })
    .join("\n      ");

  return `<g>
      ${rowText}
    </g>`;
}

function renderWrappedSvgText(
  value: string,
  x: number,
  y: number,
  maxDisplayLength: number,
  maxLines: number,
  fontSize: number
): string {
  const lines = wrapDisplayText(value, maxDisplayLength, maxLines);
  const tspans = lines
    .map((line, index) => {
      const dy = index === 0 ? 0 : fontSize + 4;
      return `<tspan x="${x}" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join("");
  return `<text x="${x}" y="${y}" fill="#e7edf6" font-size="${fontSize}" font-weight="760">${tspans}</text>`;
}

function wrapDisplayText(value: string, maxDisplayLength: number, maxLines: number): string[] {
  const chars = Array.from(value);
  const lines: string[] = [];
  let current = "";

  for (const char of chars) {
    if (displayLength(`${current}${char}`) > maxDisplayLength && current) {
      lines.push(current);
      current = char;
      if (lines.length === maxLines - 1) {
        break;
      }
    } else {
      current += char;
    }
  }

  const consumed = lines.join("").length + current.length;
  const remainder = chars.slice(consumed).join("");
  if (remainder) {
    while (displayLength(`${current}…`) > maxDisplayLength && current.length > 0) {
      current = Array.from(current).slice(0, -1).join("");
    }
    current = `${current}…`;
  }

  if (current) {
    lines.push(current);
  }
  return lines.slice(0, maxLines);
}

function sceneKindLabel(kind: SceneEntry["kind"]): string {
  if (kind === "city") {
    return "도시/거점";
  }
  if (kind === "village") {
    return "마을/거점";
  }
  if (kind === "facility") {
    return "시설/거점";
  }
  return "개요";
}

function sceneScaleLabel(kind: SceneEntry["kind"]): string {
  if (kind === "city") {
    return "도시급 거점";
  }
  if (kind === "village") {
    return "마을급 생활권";
  }
  if (kind === "facility") {
    return "단일 시설";
  }
  return "광역 개요";
}

function sceneFunctionLabel(scene: SceneEntry): string {
  const title = scene.title;
  const caption = scene.caption;
  const text = `${title} ${caption}`;
  if (text.includes("성문") || text.includes("검문") || text.includes("레이븐스톤")) {
    return "검문·통행·장부 확인";
  }
  if (text.includes("항") || text.includes("부두") || text.includes("항구")) {
    return "선박·화물·항만세";
  }
  if (text.includes("신전") || text.includes("사원") || text.includes("성소")) {
    return "의례·중재·봉납";
  }
  if (text.includes("시장") || text.includes("상단")) {
    return "거래·소문·소개";
  }
  if (scene.kind === "city") {
    return "행정·거래·숙박";
  }
  if (scene.kind === "village") {
    return "생활·숙박·소규모 거래";
  }
  if (scene.kind === "facility") {
    return "출입·대기·절차";
  }
  return "권역 확인";
}

function sceneAccessLabel(scene: SceneEntry): string {
  const title = scene.title;
  const caption = scene.caption;
  const text = `${title} ${caption}`;
  if (text.includes("성문") || text.includes("검문") || text.includes("레이븐스톤")) {
    return "성문·검문대·장터·여관";
  }
  if (text.includes("항") || text.includes("부두") || text.includes("항구")) {
    return "부두·창고·선원 숙소";
  }
  if (text.includes("신전") || text.includes("사원") || text.includes("성소")) {
    return "예배당·봉납소·중재실";
  }
  if (scene.kind === "city") {
    return "성문·시장·관청·숙소";
  }
  if (scene.kind === "village") {
    return "우물·장터·숙소·농지";
  }
  if (scene.kind === "facility") {
    return "입구·대기열·담당 창구";
  }
  return "대표 거점·주요 길";
}

function titleDisplayLines(title: string): string[] {
  if (title.includes(" / ")) {
    return title.split(" / ").map((part) => part.trim()).filter(Boolean).slice(0, 2);
  }

  if (title.length <= 11) {
    return [title];
  }

  const midpoint = Math.ceil(title.length / 2);
  return [title.slice(0, midpoint), title.slice(midpoint)];
}

function overlayPanelWidth(lines: string[]): number {
  const longest = Math.max(...lines.map((line) => displayLength(line)));
  return Math.min(900, Math.max(560, 300 + longest * 24));
}

function displayLength(value: string): number {
  return Array.from(value).reduce(
    (length, char) => length + (/[\uAC00-\uD7AF]/.test(char) ? 1.35 : 0.75),
    0
  );
}

function renderTextOverlay(title: string, caption: string): string {
  return `<g font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
    <rect x="48" y="48" width="690" height="112" rx="18" fill="#07111f" fill-opacity="0.72" stroke="#c8b16a" stroke-opacity="0.78"/>
    <text x="78" y="98" fill="#f6edcf" font-size="34" font-weight="800">${title}</text>
    <text x="78" y="136" fill="#d9e4f2" font-size="18">${caption}</text>
  </g>`;
}

function renderNotFoundSvg(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="864" viewBox="0 0 1536 864" role="img" aria-label="not found">
  <rect width="1536" height="864" fill="#07111f"/>
  <g font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
    <text x="768" y="432" text-anchor="middle" fill="#f6edcf" font-size="36">Vireth scene not found</text>
  </g>
</svg>`;
}

function renderPendingMapSvg(title: string): string {
  const escapedTitle = escapeXml(title);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="360" viewBox="0 0 1536 360" role="img" aria-label="${escapedTitle}">
  <rect width="1536" height="360" fill="#07111f"/>
  <rect x="48" y="48" width="1440" height="264" rx="24" fill="#101b2b" stroke="#c8b16a" stroke-opacity="0.54"/>
  <g font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
    <text x="768" y="160" text-anchor="middle" fill="#f6edcf" font-size="42" font-weight="800">${escapedTitle}</text>
    <text x="768" y="218" text-anchor="middle" fill="#d9e4f2" font-size="24">이 권역 지도는 아직 등록되지 않았다.</text>
  </g>
</svg>`;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      ...TEXT_HEADERS,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

async function image(imageUrl: string, method: string): Promise<Response> {
  const upstream = await fetch(imageUrl, { method: method === "HEAD" ? "HEAD" : "GET" });
  const headers = new Headers(IMAGE_HEADERS);
  headers.set("Content-Type", upstream.headers.get("Content-Type") ?? "image/webp");

  const contentLength = upstream.headers.get("Content-Length");
  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  if (!upstream.ok) {
    return new Response(renderNotFoundSvg(), { status: 502, headers: SVG_HEADERS });
  }

  return new Response(method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    headers
  });
}

async function fetchDataUri(url: string): Promise<string | null> {
  for (const candidateUrl of dataUriCandidates(url)) {
    const upstream = await fetch(candidateUrl, {
      headers: {
        Accept: "image/avif,image/webp,image/png,image/*,*/*",
        "User-Agent": "vireth-svg-worker"
      }
    });

    if (!upstream.ok) {
      continue;
    }

    const contentType = upstream.headers.get("Content-Type") ?? inferImageContentType(candidateUrl);
    const base64 = arrayBufferToBase64(await upstream.arrayBuffer());
    return `data:${contentType};base64,${base64}`;
  }

  return null;
}

function dataUriCandidates(url: string): string[] {
  const pinnedUrl = url.replace(
    "https://raw.githubusercontent.com/musueman/VIRETH/main/",
    `https://raw.githubusercontent.com/musueman/VIRETH/${CURRENT_SCENE_ASSET_REF}/`
  );

  return pinnedUrl === url ? [url] : [url, pinnedUrl];
}

function inferImageContentType(url: string): string {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.endsWith(".png")) {
    return "image/png";
  }

  if (lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  return "image/webp";
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
