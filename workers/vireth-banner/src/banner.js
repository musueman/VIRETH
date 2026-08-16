export const WIDTH = 1920;
export const HEIGHT = 684;
export const DEFAULT_COUNT = 5;
export const MIN_COUNT = 4;
export const MAX_COUNT = 5;
export const DEFAULT_DURATION_SECONDS = 20;

export function bannerLayerAssets(assets) {
  return assets.filter((asset) => asset.id !== "t");
}

export function clampBannerCount(value) {
  const count = Number.parseInt(value ?? "", 10);
  return count === MIN_COUNT || count === MAX_COUNT ? count : DEFAULT_COUNT;
}

export function clampDurationSeconds(value) {
  const duration = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(duration)) return DEFAULT_DURATION_SECONDS;
  return Math.min(60, Math.max(8, duration));
}

export function buildAssetPath(asset) {
  return asset.output.startsWith("/") ? asset.output : `/${asset.output}`;
}

export function isFaviconPath(pathname) {
  return pathname === "/favicon.ico";
}

export function selectBannerLayers(assets, count, seed) {
  const selected = [];
  const remaining = [...assets];
  const random = seededRandom(seed);

  while (selected.length < count && remaining.length > 0) {
    const index = Math.floor(random() * remaining.length);
    selected.push(remaining.splice(index, 1)[0]);
  }

  return selected;
}

export function renderBannerSvg({ topHref, layerHrefs, durationSeconds = DEFAULT_DURATION_SECONDS }) {
  const layerCount = layerHrefs.length;
  const segment = 1 / layerCount;
  const layers = layerHrefs
    .map((href, index) => {
      const visibleStart = index * segment;
      const visibleEnd = (index + 1) * segment;
      const values = opacityValues(layerCount, index);
      const keyTimes = opacityKeyTimes(layerCount, index);

      return `<image class="b-layer" href="${escapeXml(href)}" x="0" y="0" width="${WIDTH}" height="${HEIGHT}" preserveAspectRatio="xMidYMid slice" opacity="${index === 0 ? "1" : "0"}">
    <animate attributeName="opacity" dur="${durationSeconds}s" repeatCount="indefinite" values="${values}" keyTimes="${keyTimes}" calcMode="linear"/>
  </image>`;
    })
    .join("\n  ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="Vireth LunaTalk banner">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#000"/>
  ${layers}
  <image href="${escapeXml(topHref)}" x="0" y="0" width="${WIDTH}" height="${HEIGHT}" preserveAspectRatio="xMidYMid slice"/>
</svg>`;
}

export function responseHeaders(contentType) {
  return {
    "content-type": contentType,
    "cache-control": "no-store",
    "access-control-allow-origin": "*"
  };
}

export function makeSeed(url) {
  return new URL(url).searchParams.get("seed") ?? `${Date.now()}-${Math.random()}`;
}

function opacityValues(layerCount, targetIndex) {
  return Array.from({ length: layerCount + 1 }, (_, tick) => {
    const index = tick === layerCount ? 0 : tick;
    return index === targetIndex ? "1" : "0";
  }).join(";");
}

function opacityKeyTimes(layerCount) {
  return Array.from({ length: layerCount + 1 }, (_, tick) => (tick / layerCount).toFixed(3)).join(";");
}

function seededRandom(seed) {
  let state = hashSeed(seed);
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function hashSeed(seed) {
  let hash = 2166136261;
  for (const char of String(seed)) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
