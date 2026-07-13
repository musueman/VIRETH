import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const generatedRoot = path.join(root, "assets", "illustrations", "generated_outputs");
const reviewIndexPath = path.join(generatedRoot, "ck5083-generated-image-review-index-v1.md");
const exportRoot = path.join(root, "workers", "vireth-svg", "public", "scene-assets");
const scenesOutPath = path.join(root, "workers", "vireth-svg", "src", "generated-scenes.ts");

const assetBase = "/scene-assets";

const regions = [
  ["dragonspire", "드래곤스파이어"],
  ["fenrir-eye", "펜리르의 눈"],
  ["norghard", "노르가르드"],
  ["linrenet", "린레네트"],
  ["bekdoret", "벡도레트"],
  ["senhalet", "센할레트"],
  ["hesferet", "헤스페레트"],
  ["kelnabet", "켈나베트"],
  ["hesbeket", "헤스베케트"],
  ["yenmebet", "옌메베트"],
  ["nimnaret", "님나레트"],
  ["silnimet", "실니메트"],
  ["garmebet", "가르메베트"],
  ["merhalet", "메르할레트"],
  ["silhalet", "실할레트"],
  ["nimsolet", "님소레트"],
  ["sylvania", "실바니아"],
  ["ardolet", "아르도레트"],
  ["leonia", "레오니아"],
  ["tiris", "티리스"]
];

const heraldrySources = new Map([
  ["leonia", "ck5083-heraldry-leonia-imagegen-v3-dragon-crest.png"],
  ["norghard", "ck5083-heraldry-norghard-imagegen-v1.png"],
  ["tiris", "ck5083-heraldry-tiris-imagegen-v1.png"],
  ["linrenet", "ck5083-heraldry-linrenet-imagegen-v1.png"],
  ["bekdoret", "ck5083-heraldry-bekdoret-imagegen-v1.png"],
  ["senhalet", "ck5083-heraldry-senhalet-imagegen-v1.png"],
  ["hesferet", "ck5083-heraldry-hesferet-imagegen-v2-no-runes.png"],
  ["kelnabet", "ck5083-heraldry-kelnabet-imagegen-v1.png"],
  ["hesbeket", "ck5083-heraldry-hesbeket-imagegen-v1.png"],
  ["yenmebet", "ck5083-heraldry-yenmebet-imagegen-v1.png"],
  ["nimnaret", "ck5083-heraldry-nimnaret-imagegen-v1.png"],
  ["silnimet", "ck5083-heraldry-silnimet-imagegen-v1.png"],
  ["ardolet", "ck5083-heraldry-ardolet-imagegen-v1.png"],
  ["garmebet", "ck5083-heraldry-garmebet-imagegen-v1.png"],
  ["merhalet", "ck5083-heraldry-merhalet-imagegen-v1.png"],
  ["silhalet", "ck5083-heraldry-silhalet-imagegen-v1.png"],
  ["nimsolet", "ck5083-heraldry-nimsolet-imagegen-v1.png"],
  ["sylvania", "ck5083-heraldry-sylvania-imagegen-v1.png"],
  ["dragonspire", "ck5083-heraldry-dragonspire-imagegen-v1.png"],
  ["fenrir-eye", "ck5083-heraldry-fenrir-eye-imagegen-v1.png"]
]);

function parseRows(kind) {
  const markdown = readFileSync(reviewIndexPath, "utf8");
  const rows = [];
  const prefix = `${kind}_vistas/`;
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^\|\s*([^|]+?)\s*\|\s*`([^`]+)`\s*\|\s*([^|]+?)\s*\|$/);
    if (!match) continue;
    const title = match[1].trim();
    const labeledPath = match[2].trim();
    const caption = match[3].trim();
    if (!labeledPath.startsWith(prefix) || !labeledPath.endsWith("-2560-labeled.png")) continue;
    rows.push({ kind: kind === "city" ? "city" : "village", title, labeledPath, caption });
  }
  return rows;
}

function detectRegion(filename, kind) {
  const prefix = `ck5083-${kind}-`;
  const rest = filename.slice(prefix.length);
  for (const [slug, name] of regions) {
    if (rest.startsWith(`${slug}-`)) {
      const suffix = rest.slice(slug.length + 1);
      const placeSlug = suffix.replace(/-imagegen-v\d(?:-2560|-original)?\.png$/, "");
      return { regionSlug: slug, regionName: name, placeSlug };
    }
  }
  throw new Error(`Cannot detect region from ${filename}`);
}

function rawSourceFor(row) {
  const labeledAbs = path.join(generatedRoot, row.labeledPath);
  const base = labeledAbs.replace(/-2560-labeled\.png$/, "");
  const candidates = [`${base}-2560.png`, `${base}.png`, `${base}-original.png`];
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) throw new Error(`No raw source for ${row.labeledPath}`);
  return found;
}

function outputName(row) {
  return path.basename(row.labeledPath).replace(/-2560-labeled\.png$/, "-scene-v2.webp");
}

function convertScene(src, dst) {
  mkdirSync(path.dirname(dst), { recursive: true });
  execFileSync("magick", [
    src,
    "-resize",
    "1000x700^",
    "-gravity",
    "center",
    "-extent",
    "1000x700",
    "-strip",
    "-quality",
    "58",
    "-define",
    "webp:method=6",
    dst
  ]);
}

function convertHeraldry(src, dst) {
  mkdirSync(path.dirname(dst), { recursive: true });
  execFileSync("magick", [
    src,
    "-resize",
    "512x512",
    "-gravity",
    "center",
    "-extent",
    "512x512",
    "-strip",
    "-quality",
    "78",
    "-define",
    "webp:method=6",
    dst
  ]);
}

function titleParts(title) {
  return title.split("/").map((part) => part.trim()).filter(Boolean);
}

function displayTitleFor(title) {
  const parts = titleParts(title);
  if (parts.length === 2) {
    return `${parts[0]}(${parts[1]})`;
  }
  return title.trim();
}

function aliasesFor(row, regionName, regionSlug, placeSlug) {
  const titles = titleParts(row.title);
  const displayTitle = displayTitleFor(row.title);
  const primaryTitle = titles[0] ?? displayTitle;
  return [
    ...new Set([
      regionName,
      `${regionName} ${primaryTitle}`,
      `${regionName} ${displayTitle}`,
      regionSlug,
      `${regionSlug}-${placeSlug}`,
      placeSlug,
      displayTitle,
      ...titles
    ])
  ];
}

function assetUrl(rel) {
  return `${assetBase}/${rel.replaceAll("\\", "/")}`;
}

function build() {
  rmSync(exportRoot, { recursive: true, force: true });

  const cityRows = parseRows("city");
  const villageRows = parseRows("village");
  if (cityRows.length !== 97) throw new Error(`Expected 97 city rows, got ${cityRows.length}`);
  if (villageRows.length !== 70) throw new Error(`Expected 70 village rows, got ${villageRows.length}`);
  if (heraldrySources.size !== 20) throw new Error(`Expected 20 heraldry sources, got ${heraldrySources.size}`);

  const heraldryUrls = new Map();
  for (const [regionSlug, sourceName] of heraldrySources) {
    const src = path.join(generatedRoot, "heraldry", sourceName);
    if (!existsSync(src)) throw new Error(`Missing heraldry source ${sourceName}`);
    const outName = sourceName.replace(/\.png$/, "-crest-v1.webp");
    const rel = path.join("heraldry", outName);
    convertHeraldry(src, path.join(exportRoot, rel));
    heraldryUrls.set(regionSlug, assetUrl(rel));
  }

  const scenes = [];
  for (const row of [...cityRows, ...villageRows]) {
    const src = rawSourceFor(row);
    const { regionSlug, regionName, placeSlug } = detectRegion(path.basename(src), row.kind);
    const rel = path.join(row.kind === "city" ? "city-vistas" : "village-vistas", outputName(row));
    convertScene(src, path.join(exportRoot, rel));
    scenes.push({
      key: placeSlug,
      aliases: aliasesFor(row, regionName, regionSlug, placeSlug),
      title: displayTitleFor(row.title),
      kind: row.kind,
      imageUrl: assetUrl(rel),
      caption: row.caption,
      realmKey: regionSlug,
      realmName: regionName,
      heraldryName: `${regionName} 문장`,
      heraldryUrl: heraldryUrls.get(regionSlug)
    });
  }

  const ts = `// Generated by tools/build_vireth_scene_router_assets.mjs. Do not edit by hand.\nexport const GENERATED_SCENES = ${JSON.stringify(scenes, null, 2)};\n`;
  writeFileSync(scenesOutPath, ts, "utf8");
  console.log(`city=${cityRows.length} village=${villageRows.length} heraldry=${heraldrySources.size} scenes=${scenes.length}`);
  console.log(`export=${path.relative(root, exportRoot)}`);
  console.log(`registry=${path.relative(root, scenesOutPath)}`);
}

build();
