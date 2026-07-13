import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const inventoryCsvPath = path.join(
  "S:",
  "du",
  "o",
  "arcadia_background_inventory_20260713",
  "arcadia_background_inventory_20260713.csv"
);
const exportRoot = path.join(root, "workers", "vireth-svg", "public", "talk-background-assets");
const outPath = path.join(root, "workers", "vireth-svg", "src", "generated-talk-backgrounds.ts");
const assetBase = "/talk-background-assets";

const regionAliases = {
  fenrir: "fenrir-eye",
  "fenrir-eye": "fenrir-eye",
  norgard: "norghard",
  norghard: "norghard"
};

const regionNames = {
  ardolet: "아르돌레트",
  bekdoret: "베크도레트",
  dragonspire: "드래곤스파이어",
  "fenrir-eye": "펜리르의 눈",
  garmebet: "가르메베트",
  hesbeket: "헤스베케트",
  hesferet: "헤스페레트",
  kelnabet: "켈나베트",
  leonia: "레오니아",
  linrenet: "린레네트",
  merhalet: "메르할레트",
  nimnaret: "님나레트",
  nimsolet: "님솔레트",
  norghard: "노르가르드",
  senhalet: "센할레트",
  silhalet: "실할레트",
  silnimet: "실니메트",
  sylvania: "실바니아",
  tiris: "티리스",
  yenmebet: "옌메베트"
};

const selectedKinds = {
  region_representative: {
    folder: "city-representative",
    kind: "city_representative",
    priority: 80
  },
  national_default: {
    folder: "region-default",
    kind: "region_default",
    priority: 50
  }
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  const [headers, ...body] = rows;
  const cleanHeaders = headers.map((header) => header.replace(/^\uFEFF/, ""));
  return body
    .filter((values) => values.some((value) => value.trim()))
    .map((values) =>
      Object.fromEntries(cleanHeaders.map((header, index) => [header, values[index] ?? ""]))
    );
}

function normalizeRegion(value) {
  const normalized = value.trim().toLowerCase().replace(/_/g, "-");
  return regionAliases[normalized] ?? normalized;
}

function slug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function placeAliasFromAsset(assetId, regionKey) {
  if (!assetId) {
    return "";
  }
  const parts = assetId.toLowerCase().split("_").filter(Boolean);
  const regionTokens = new Set([
    regionKey,
    regionKey.replace(/-/g, ""),
    "fenrir",
    "eye",
    "norgard",
    "norghard"
  ]);
  const content = parts.filter((part) => !/^\d+$/.test(part) && !/^n\d+[a-z]?$/.test(part));
  const start = content.findIndex((part) => regionTokens.has(part));
  const place = start >= 0 ? content[start + 1] : content[1];
  return place ? slug(place) : "";
}

function convert(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
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
    "62",
    "-define",
    "webp:method=6",
    dst
  ]);
}

function build() {
  const rows = parseCsv(fs.readFileSync(inventoryCsvPath, "utf8"));
  fs.rmSync(exportRoot, { recursive: true, force: true });

  const entries = [];
  for (const row of rows) {
    const config = selectedKinds[row.set_kind];
    if (!config) {
      continue;
    }

    const regionKey = normalizeRegion(row.region_key_guess);
    if (!regionKey || !regionNames[regionKey]) {
      continue;
    }

    const src = row.collected_path;
    if (!src || !fs.existsSync(src)) {
      continue;
    }

    const fileName = `${regionKey}.webp`;
    const rel = `${config.folder}/${fileName}`;
    convert(src, path.join(exportRoot, rel));

    const placeAlias = placeAliasFromAsset(row.asset_id, regionKey);
    const aliases = [
      row.asset_id,
      regionKey,
      regionNames[regionKey],
      placeAlias,
      placeAlias ? `${regionKey}-${placeAlias}` : "",
      row.bg_type_guess
    ].filter(Boolean);

    entries.push({
      key: `${config.folder}-${regionKey}`,
      aliases: [...new Set(aliases)],
      kind: config.kind,
      regionKey,
      regionName: regionNames[regionKey],
      cityAlias: placeAlias || undefined,
      bgType: row.bg_type_guess || undefined,
      imageUrl: `${assetBase}/${rel}`,
      sourceAssetId: row.asset_id,
      priority: config.priority
    });
  }

  entries.sort((a, b) => b.priority - a.priority || a.regionKey.localeCompare(b.regionKey));
  fs.writeFileSync(
    outPath,
    `// Auto-generated by tools/build_vireth_talk_background_assets.mjs\nexport const GENERATED_TALK_BACKGROUNDS = ${JSON.stringify(entries, null, 2)} as const;\n`,
    "utf8"
  );

  console.log(`talk backgrounds=${entries.length}`);
  console.log(`export=${path.relative(root, exportRoot)}`);
  console.log(`registry=${path.relative(root, outPath)}`);
}

build();
