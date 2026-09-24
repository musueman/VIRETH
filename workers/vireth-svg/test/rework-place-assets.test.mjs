import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const workerRoot = fileURLToPath(new URL("..", import.meta.url));
const assetRoot = path.join(workerRoot, "public", "place-image-assets", "rework82");
const manifestPath = path.join(assetRoot, "manifest.json");

test("ships the complete 82-image 1440x1080 place-image set", () => {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  assert.equal(manifest.canvas.width, 1440);
  assert.equal(manifest.canvas.height, 1080);
  assert.equal(manifest.assets.length, 82);
  assert.equal(manifest.assets.filter((asset) => asset.kind === "scene-base").length, 42);
  assert.equal(manifest.assets.filter((asset) => asset.kind === "region-anchor").length, 40);
  assert.equal(new Set(manifest.assets.map((asset) => asset.key)).size, 82);

  const farm = manifest.assets.find((asset) => asset.key === "VBG_FARM_IRRIGATION_DAY");
  assert.equal(farm.sourceVariant, "FIX01");
  assert.ok(manifest.assets.some((asset) => asset.key === "VBG_COURT_DAY"));
  assert.ok(manifest.assets.some((asset) => asset.key === "VRA_N001_DAY"));
  assert.ok(manifest.assets.some((asset) => asset.key === "VRA_N020_NIGHT"));

  for (const asset of manifest.assets) {
    assert.match(asset.file, /^(VBG_[A-Z_]+|VRA_N\d{3})_(DAY|NIGHT)\.webp$/);
    const assetPath = path.join(assetRoot, asset.file);
    assert.ok(fs.existsSync(assetPath), `missing ${asset.file}`);
    const size = execFileSync("magick", ["identify", "-format", "%w %h", assetPath], { encoding: "utf8" }).trim();
    assert.equal(size, "1440 1080", asset.file);
  }
});
