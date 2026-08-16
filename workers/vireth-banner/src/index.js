import assets from "../banner-assets.json" with { type: "json" };
import {
  bannerLayerAssets,
  buildAssetPath,
  clampBannerCount,
  clampDurationSeconds,
  isFaviconPath,
  makeSeed,
  renderBannerSvg,
  responseHeaders,
  selectBannerLayers
} from "./banner.js";

const TOP_ASSET = assets.find((asset) => asset.id === "t");
const LAYER_ASSETS = bannerLayerAssets(assets);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (isFaviconPath(url.pathname)) {
      return new Response(null, { status: 204 });
    }

    if (url.pathname === "/health") {
      return json({
        ok: true,
        service: "vireth-banner",
        top: TOP_ASSET?.id ?? null,
        layers: LAYER_ASSETS.length
      });
    }

    if (url.pathname.startsWith("/b/")) {
      return staticAsset(request, env);
    }

    if (url.pathname === "/banner.json") {
      const selection = selectForUrl(url);
      return json({
        top: selection.top.output,
        layers: selection.layers.map((asset) => asset.output),
        count: selection.layers.length
      });
    }

    if (url.pathname !== "/" && url.pathname !== "/banner" && url.pathname !== "/banner.svg") {
      return new Response("Not Found", { status: 404 });
    }

    const inline = shouldInline(url);
    const selection = selectForUrl(url);
    const durationSeconds = clampDurationSeconds(url.searchParams.get("duration"));
    const topHref = await assetHref(selection.top, inline, env);
    const layerHrefs = await Promise.all(selection.layers.map((asset) => assetHref(asset, inline, env)));

    return new Response(renderBannerSvg({ topHref, layerHrefs, durationSeconds }), {
      headers: responseHeaders("image/svg+xml; charset=utf-8")
    });
  }
};

function selectForUrl(url) {
  const count = clampBannerCount(url.searchParams.get("count"));
  return {
    top: TOP_ASSET,
    layers: selectBannerLayers(LAYER_ASSETS, count, makeSeed(url.toString()))
  };
}

async function assetHref(asset, inline, env) {
  const path = buildAssetPath(asset);
  if (!inline) return path;
  const dataUri = await fetchDataUri(path, env);
  return dataUri ?? path;
}

async function fetchDataUri(path, env) {
  const assetsBinding = env?.ASSETS;
  if (!assetsBinding) return null;

  const response = await assetsBinding.fetch(new Request(`https://assets.local${path}`));
  if (!response.ok) return null;

  const contentType = response.headers.get("content-type") ?? "image/webp";
  const bytes = new Uint8Array(await response.arrayBuffer());
  return `data:${contentType};base64,${base64(bytes)}`;
}

function base64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function shouldInline(url) {
  const external = normalize(url.searchParams.get("external") ?? url.searchParams.get("noembed") ?? "");
  if (external === "1" || external === "true" || external === "yes" || external === "on") {
    return false;
  }

  const inline = url.searchParams.get("inline") ?? url.searchParams.get("embed");
  if (!inline) return true;

  const normalized = normalize(inline);
  return !(normalized === "0" || normalized === "false" || normalized === "no" || normalized === "off");
}

async function staticAsset(request, env) {
  const assetsBinding = env?.ASSETS;
  if (!assetsBinding) return new Response("Assets binding unavailable", { status: 503 });
  return assetsBinding.fetch(request);
}

function json(value, init = {}) {
  return new Response(JSON.stringify(value, null, 2), {
    ...init,
    headers: responseHeaders("application/json; charset=utf-8")
  });
}

function normalize(value) {
  return String(value).trim().toLowerCase();
}
