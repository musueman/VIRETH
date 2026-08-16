export const WIDTH = 1920;
export const HEIGHT = 684;
export const DEFAULT_COUNT = 5;
export const MIN_COUNT = 4;
export const MAX_COUNT = 5;
export const DEFAULT_HOLD_SECONDS = 3.5;
export const DEFAULT_SLIDE_SECONDS = 0.8;
export const SLIDE_EASE = "0.42 0 0.58 1";

export function bannerLayerAssets(assets) {
  return assets.filter((asset) => asset.id !== "t");
}

export function clampBannerCount(value) {
  const count = Number.parseInt(value ?? "", 10);
  return count === MIN_COUNT || count === MAX_COUNT ? count : DEFAULT_COUNT;
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

export function renderBannerSvg({
  topHref,
  layerHrefs,
  holdSeconds = DEFAULT_HOLD_SECONDS,
  slideSeconds = DEFAULT_SLIDE_SECONDS
}) {
  const deckHrefs = [...layerHrefs, layerHrefs[0]];
  const timing = slideTiming(layerHrefs.length, holdSeconds, slideSeconds);
  const layers = deckHrefs
    .map(
      (href, index) =>
        `<image class="b-layer" href="${escapeXml(href)}" x="${index * WIDTH}" y="0" width="${WIDTH}" height="${HEIGHT}" preserveAspectRatio="xMidYMid slice"/>`
    )
    .join("\n  ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="Vireth LunaTalk banner" data-hold-seconds="${holdSeconds}" data-slide-seconds="${slideSeconds}">
  <defs>
    <clipPath id="b-clip"><rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}"/></clipPath>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#000"/>
  <g clip-path="url(#b-clip)">
  <g>
  ${layers}
    <animateTransform attributeName="transform" type="translate" dur="${timing.durationSeconds}s" repeatCount="indefinite" values="${timing.values}" keyTimes="${timing.keyTimes}" calcMode="spline" keySplines="${timing.keySplines}"/>
  </g>
  </g>
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

function slideTiming(layerCount, holdSeconds, slideSeconds) {
  const cycleSeconds = holdSeconds + slideSeconds;
  const durationSeconds = roundSeconds(layerCount * cycleSeconds);
  const values = ["0 0"];
  const keyTimes = ["0"];

  for (let index = 0; index < layerCount; index += 1) {
    values.push(`${-index * WIDTH} 0`);
    keyTimes.push(formatKeyTime((index * cycleSeconds + holdSeconds) / durationSeconds));
    values.push(`${-(index + 1) * WIDTH} 0`);
    keyTimes.push(formatKeyTime(((index + 1) * cycleSeconds) / durationSeconds));
  }

  return {
    durationSeconds,
    values: values.join(";"),
    keyTimes: keyTimes.join(";"),
    keySplines: slideKeySplines(values.length).join(";")
  };
}

function slideKeySplines(valueCount) {
  return Array.from({ length: valueCount - 1 }, () => SLIDE_EASE);
}

function roundSeconds(value) {
  return Number.parseFloat(value.toFixed(2));
}

function formatKeyTime(value) {
  return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
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
