import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const workerRoot = fileURLToPath(new URL("..", import.meta.url));
const publicRoot = path.join(workerRoot, "public");
const hashFile = (file) => createHash("sha256").update(fs.readFileSync(file)).digest("hex");

test("serves the reviewed V17 SFW cutout set rather than the old C015 art", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(workerRoot, "character-emotion-assets-manifest.json"), "utf8"));
  assert.equal(manifest.length, 900);
  assert.equal(
    hashFile(path.join(publicRoot, "character-emotion-assets", "c015", "n.webp")),
    "a9e0d2fc80c290aa768709f6b94c98078ed021e25477f36e7368ec3d1c2cbe31"
  );

  for (const asset of manifest) {
    const file = path.join(publicRoot, "character-emotion-assets", asset.output);
    assert.equal(hashFile(file), asset.output_sha256, asset.output);
  }

  for (let index = 1; index <= 100; index++) {
    const code = `c${String(index).padStart(3, "0")}`;
    const portrait = path.join(publicRoot, "character-assets", `char-${code}.webp`);
    const neutral = path.join(publicRoot, "character-emotion-assets", code, "n.webp");
    assert.equal(hashFile(portrait), hashFile(neutral), code);
  }
});
