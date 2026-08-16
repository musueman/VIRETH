import assert from "node:assert/strict";
import { test } from "node:test";

import {
  bannerLayerAssets,
  buildAssetPath,
  clampBannerCount,
  isFaviconPath,
  renderBannerSvg,
  selectBannerLayers
} from "../src/banner.js";

const sampleAssets = [
  { id: "t", output: "b/t.webp", width: 1920, height: 684, bytes: 100 },
  { id: "001", output: "b/001.webp", width: 1920, height: 684, bytes: 101 },
  { id: "002", output: "b/002.webp", width: 1920, height: 684, bytes: 102 },
  { id: "003", output: "b/003.webp", width: 1920, height: 684, bytes: 103 },
  { id: "004", output: "b/004.webp", width: 1920, height: 684, bytes: 104 },
  { id: "005", output: "b/005.webp", width: 1920, height: 684, bytes: 105 },
  { id: "006", output: "b/006.webp", width: 1920, height: 684, bytes: 106 }
];

test("bannerLayerAssets excludes the fixed top image", () => {
  assert.deepEqual(
    bannerLayerAssets(sampleAssets).map((asset) => asset.id),
    ["001", "002", "003", "004", "005", "006"]
  );
});

test("selectBannerLayers picks five unique layer assets with a stable seed", () => {
  const layers = bannerLayerAssets(sampleAssets);
  const first = selectBannerLayers(layers, 5, "same-seed").map((asset) => asset.id);
  const second = selectBannerLayers(layers, 5, "same-seed").map((asset) => asset.id);

  assert.equal(first.length, 5);
  assert.equal(new Set(first).size, 5);
  assert.deepEqual(first, second);
  assert.ok(!first.includes("t"));
});

test("clampBannerCount accepts only four or five requested layers", () => {
  assert.equal(clampBannerCount(null), 5);
  assert.equal(clampBannerCount("4"), 4);
  assert.equal(clampBannerCount("5"), 5);
  assert.equal(clampBannerCount("3"), 5);
  assert.equal(clampBannerCount("6"), 5);
});

test("buildAssetPath keeps SVG image hrefs short", () => {
  assert.equal(buildAssetPath({ output: "b/127.webp" }), "/b/127.webp");
  assert.equal(buildAssetPath({ output: "/b/t.webp" }), "/b/t.webp");
});

test("renderBannerSvg puts random layers below the fixed top layer", () => {
  const svg = renderBannerSvg({
    topHref: "/b/t.webp",
    layerHrefs: ["/b/001.webp", "/b/002.webp", "/b/003.webp", "/b/004.webp", "/b/005.webp"],
    durationSeconds: 18
  });

  const firstLayer = svg.indexOf('href="/b/001.webp"');
  const topLayer = svg.indexOf('href="/b/t.webp"');

  assert.match(svg, /<svg[^>]+width="1920"[^>]+height="684"/);
  assert.equal((svg.match(/class="b-layer"/g) ?? []).length, 5);
  assert.ok(firstLayer > -1);
  assert.ok(topLayer > firstLayer);
  assert.match(svg, /<animate attributeName="opacity"/);
});

test("isFaviconPath recognizes the browser favicon probe", () => {
  assert.equal(isFaviconPath("/favicon.ico"), true);
  assert.equal(isFaviconPath("/banner.svg"), false);
});
