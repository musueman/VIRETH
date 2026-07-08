import { GENERATED_SCENES } from "./generated-scenes";

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
        routes: ["/scene?key=world-overview", "/scene.json?key=world-overview"]
      });
    }

    if (url.pathname === "/scene.json") {
      const scene = resolveScene(url, env);
      return json(scene);
    }

    if (url.pathname === "/scene.webp" || url.pathname === "/scene.image") {
      const scene = resolveScene(url, env);
      return image(scene, request.method);
    }

    if (url.pathname === "/scene" || url.pathname === "/scene.svg") {
      const scene = resolveScene(url, env);
      return new Response(await renderSceneSvg(scene), { headers: SVG_HEADERS });
    }

    return new Response(renderNotFoundSvg(), { status: 404, headers: SVG_HEADERS });
  }
} satisfies ExportedHandler<Env>;

function resolveScene(url: URL, env: Env): SceneEntry {
  const queryValue =
    firstQuery(url, ["key", "scene", "place", "city", "region", "장소", "도시", "권역"]) ??
    "world-overview";
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

async function renderSceneSvg(scene: SceneEntry): Promise<string> {
  const title = escapeXml(scene.title);
  const caption = escapeXml(scene.caption);
  const imageDataUri = await fetchDataUri(scene.imageUrl);
  const heraldryDataUri = scene.heraldryUrl ? await fetchDataUri(scene.heraldryUrl) : null;
  const imageUrl = escapeXml(imageDataUri ?? scene.imageUrl);
  const overlay = scene.heraldryUrl
    ? renderHeraldryOverlay(scene, heraldryDataUri)
    : renderTextOverlay(title, caption);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="864" viewBox="0 0 1536 864" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="shade" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#07111f" stop-opacity="0.12"/>
      <stop offset="72%" stop-color="#07111f" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#07111f" stop-opacity="0.62"/>
    </linearGradient>
  </defs>
  <rect width="1536" height="864" fill="#07111f"/>
  <image href="${imageUrl}" x="0" y="0" width="1536" height="864" preserveAspectRatio="xMidYMid slice"/>
  <rect width="1536" height="864" fill="url(#shade)"/>
  ${overlay}
</svg>`;
}

function renderHeraldryOverlay(scene: SceneEntry, heraldryDataUri: string | null): string {
  const title = escapeXml(scene.title);
  const heraldryName = escapeXml(scene.heraldryName ?? scene.realmName ?? "");
  const heraldryMark = heraldryDataUri
    ? `<image href="${escapeXml(heraldryDataUri)}" x="70" y="68" width="136" height="136" preserveAspectRatio="xMidYMid meet"/>`
    : `<text x="138" y="148" text-anchor="middle" fill="#f6edcf" font-size="34" font-weight="800">${escapeXml(
        (scene.realmName ?? scene.title).slice(0, 3)
      )}</text>`;

  return `<g font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
    <rect x="42" y="42" width="650" height="188" rx="18" fill="#07111f" fill-opacity="0.78" stroke="#c8b16a" stroke-opacity="0.84"/>
    <rect x="58" y="58" width="160" height="160" rx="14" fill="#050b14" fill-opacity="0.82" stroke="#d8c078" stroke-opacity="0.62"/>
    ${heraldryMark}
    <text x="246" y="120" fill="#f6edcf" font-size="42" font-weight="800">${title}</text>
    <text x="248" y="162" fill="#d9e4f2" font-size="24" font-weight="650">${heraldryName}</text>
  </g>`;
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

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      ...TEXT_HEADERS,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

async function image(scene: SceneEntry, method: string): Promise<Response> {
  const upstream = await fetch(scene.imageUrl, { method: method === "HEAD" ? "HEAD" : "GET" });
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
