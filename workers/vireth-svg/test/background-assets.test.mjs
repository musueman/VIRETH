import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUBLIC = path.join(ROOT, "public");

function uint24le(buffer, offset) {
  return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
}

function webpDimensions(buffer) {
  assert.equal(buffer.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(buffer.subarray(8, 12).toString("ascii"), "WEBP");
  const chunk = buffer.subarray(12, 16).toString("ascii");
  if (chunk === "VP8X") return [uint24le(buffer, 24) + 1, uint24le(buffer, 27) + 1];
  if (chunk === "VP8 ") return [buffer.readUInt16LE(26) & 0x3fff, buffer.readUInt16LE(28) & 0x3fff];
  if (chunk === "VP8L") {
    const bits = buffer.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
  }
  throw new Error(`Unsupported WebP chunk ${chunk}`);
}

test("background delivery contains the complete 534 matrix", async () => {
  const manifest = JSON.parse(await fs.readFile(path.join(PUBLIC, "b", "manifest.json"), "utf8"));
  assert.equal(manifest.assets.length, 534);
  assert.equal(new Set(manifest.assets.map((asset) => asset.path)).size, 534);
  assert.equal(new Set(manifest.assets.map((asset) => `${asset.scene}-${asset.weather}${asset.time}`)).size, 534);

  for (const asset of manifest.assets) {
    const image = await fs.readFile(path.join(PUBLIC, asset.path.replace(/^\//, "")));
    assert.deepEqual(webpDimensions(image), [1000, 700], asset.path);
  }
});

test("C036 neutral portrait retains the reviewed V17 cutout", async () => {
  const expectedHash = "d89271975dda4bc5f05765a7600c6930097ddb472c92dd36aa215527efba7c6d";
  const portrait = await fs.readFile(path.join(PUBLIC, "character-assets", "char-c036.webp"));
  const neutral = await fs.readFile(path.join(PUBLIC, "character-emotion-assets", "c036", "n.webp"));

  for (const image of [portrait, neutral]) {
    assert.equal(createHash("sha256").update(image).digest("hex"), expectedHash);
  }
});
