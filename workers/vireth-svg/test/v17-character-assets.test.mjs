import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const workerRoot = fileURLToPath(new URL("..", import.meta.url));
const publicRoot = path.join(workerRoot, "public");
const hashFile = (file) => createHash("sha256").update(fs.readFileSync(file)).digest("hex");

test("serves every reviewed v30 WebP listed in the canonical manifest", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(workerRoot, "character-emotion-assets-v30-manifest.json"), "utf8"));
  assert.equal(manifest.length, 3000);

  for (const asset of manifest) {
    const file = path.join(publicRoot, "character-emotion-assets", asset.output);
    assert.equal(hashFile(file), asset.output_sha256, asset.output);
  }

  assert.equal(new Set(manifest.map((asset) => asset.character_id)).size, 100);
  assert.equal(new Set(manifest.map((asset) => asset.emotion)).size, 30);
});
