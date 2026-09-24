import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const sourceManifestPath = "D:/OneDrive/444_비레스/00_최신본/09_루나톡/00_기준/Arcadia_루나톡_장소이미지82_로컬매니페스트_v1.json";
const outputRoot = path.resolve("workers/vireth-svg/public/place-image-assets/rework82");
const outputManifestPath = path.join(outputRoot, "manifest.json");

function sha256(filePath) {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex").toUpperCase();
}

function dimensions(filePath) {
  return execFileSync("magick", ["identify", "-format", "%w %h", filePath], { encoding: "utf8" }).trim();
}

if (!fs.existsSync(sourceManifestPath)) {
  throw new Error(`Missing local staging manifest: ${sourceManifestPath}`);
}
if (fs.existsSync(outputRoot)) {
  throw new Error(`Refusing to overwrite existing public asset directory: ${outputRoot}`);
}

const source = JSON.parse(fs.readFileSync(sourceManifestPath, "utf8"));
if (source.canvas?.width !== 1440 || source.canvas?.height !== 1080 || source.assets?.length !== 82) {
  throw new Error("Local staging manifest is not the expected 82-image 1440x1080 set.");
}

fs.mkdirSync(outputRoot, { recursive: true });
const assets = source.assets.map((asset) => {
  if (!fs.existsSync(asset.sourcePath)) {
    throw new Error(`Missing staged source for ${asset.key}: ${asset.sourcePath}`);
  }
  if (sha256(asset.sourcePath) !== asset.sha256) {
    throw new Error(`Source hash mismatch for ${asset.key}`);
  }
  if (dimensions(asset.sourcePath) !== "1440 1080") {
    throw new Error(`Source dimensions are not 1440x1080 for ${asset.key}`);
  }

  const file = `${asset.key}.webp`;
  const destination = path.join(outputRoot, file);
  execFileSync("magick", [asset.sourcePath, "-strip", "-quality", "90", "-define", "webp:method=6", destination], {
    stdio: "inherit"
  });
  if (dimensions(destination) !== "1440 1080") {
    throw new Error(`WebP dimensions are not 1440x1080 for ${asset.key}`);
  }

  return {
    key: asset.key,
    kind: asset.kind,
    regionCode: asset.regionCode,
    time: asset.time,
    sourceVariant: asset.sourceVariant,
    file,
    sourceSha256: asset.sha256,
    sha256: sha256(destination)
  };
});

const payload = {
  schemaVersion: 1,
  canvas: { width: 1440, height: 1080 },
  format: "webp",
  assets
};
fs.writeFileSync(outputManifestPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`staged=${assets.length} output=${outputRoot}`);
