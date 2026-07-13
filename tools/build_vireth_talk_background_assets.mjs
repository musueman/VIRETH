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
const handoffManifestPath = path.join(
  "S:",
  "du",
  "o",
  "ck5083_arcadia_background_handoff_best_20260713",
  "_arcadia_background_handoff_manifest_20260713.csv"
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

const leoniaPlaceNames = {
  "jirbar-et": "지르바르에트",
  jirmevga: "지르메브가",
  paltekga: "팔테크가",
  paltekumga: "팔테쿰가",
  radarhal: "라드아르할",
  radgarga: "라드가르가",
  remdatum: "렘다트움",
  remkelga: "렘켈가"
};

const norghardPlaceNames = {
  "pernav-pier": "페르나브부두"
};

const bgTypeAliases = {
  ADM: ["행정", "관청", "기록", "장부", "검문", "허가", "administration", "archive"],
  COM: ["상업", "시장", "거래", "상단", "장터", "trade", "market"],
  REL: ["종교", "신전", "사원", "성소", "예배", "temple", "sanctuary"],
  MIL: ["군사", "요새", "성문", "초소", "무기", "검문", "military", "fortress", "gate"],
  EDU: ["학술", "학당", "도서관", "문서고", "교육", "서원", "school", "library"],
  POR: ["항구", "부두", "등대", "선착장", "항만", "harbor", "pier", "lighthouse"],
  RES: ["주거", "골목", "숙소", "거주지", "마을", "residential", "lane"],
  NAT: ["자연", "숲길", "농촌", "야영", "산길", "외곽", "forest", "rural", "camp"],
  SPC: ["특수기관", "기관", "봉인", "등록소", "보관소", "storehouse", "registry"]
};

const archetypeAliases = {
  B001_city_gate_wallroad: ["성문", "성벽", "검문", "관문", "길목", "gate", "wallroad", "checkpoint", "MIL"],
  B002_market_square_trade_street: ["시장", "장터", "광장", "상업", "거래", "상단", "market", "trade", "COM"],
  B003_administration_archive_hall: ["관청", "행정", "기록원", "문서고", "장부", "archive", "administration", "ADM"],
  B004_guild_inn_tradepost: ["길드", "여관", "교역소", "숙박", "접객", "guild", "inn", "tradepost", "COM"],
  B005_artisan_workshop: ["공방", "장인", "수리", "작업장", "납품", "artisan", "workshop", "COM"],
  B006_temple_cloister_sanctuary: ["신전", "성소", "수도원", "의례", "종교", "temple", "cloister", "REL"],
  B007_library_observatory_school: ["도서관", "학당", "관측소", "학술", "교육", "library", "school", "EDU"],
  B008_harbor_lighthouse_coast: ["항구", "부두", "등대", "해안", "항만", "harbor", "lighthouse", "POR"],
  B009_mountain_outpost_fortress: ["산악", "초소", "요새", "산길", "전초기지", "mountain", "outpost", "MIL"],
  B010_rural_forest_campsite: ["숲", "숲길", "야영", "농촌", "외곽", "길", "forest", "campsite", "NAT"]
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

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function splitAssetWords(assetId) {
  return assetId
    .toLowerCase()
    .split(/[_-]+/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

function placeFromHandoffAsset(assetId, prefix, bgType) {
  const parts = assetId.toUpperCase().split("_").filter(Boolean);
  const content = parts.slice(1, Math.max(1, parts.length - 1));
  if (content[content.length - 1] === bgType) {
    content.pop();
  }
  return slug(content.join("-").toLowerCase().replace(`${prefix.toLowerCase()}-`, ""));
}

function handoffFolder(row, regionKey) {
  if (row.group === "general_archetype_v2") {
    return "handoff-20260713/general";
  }
  const decisionFolder = row.decision === "USE" ? "use" : "use-with-note";
  return `handoff-20260713/${regionKey}/${decisionFolder}`;
}

function buildHandoffEntry(row) {
  const assetId = row.asset_id?.trim();
  const src = row.package_path?.trim();
  if (!assetId || !src || !fs.existsSync(src)) {
    return null;
  }

  if (row.group === "general_archetype_v2") {
    const fileName = `${slug(assetId)}.webp`;
    const rel = `${handoffFolder(row, "general")}/${fileName}`;
    convert(src, path.join(exportRoot, rel));
    const wordAliases = splitAssetWords(assetId).filter((part) => !/^b\d+$/i.test(part));
    return {
      key: `handoff-20260713-general-${slug(assetId)}`,
      aliases: unique([assetId, slug(assetId), ...wordAliases, ...(archetypeAliases[assetId] ?? [])]),
      kind: "general_archetype",
      imageUrl: `${assetBase}/${rel}`,
      sourceAssetId: assetId,
      priority: 25
    };
  }

  const isLeonia = row.group === "leonia_v1_6_usable" || assetId.startsWith("LEO_");
  const isNorghard = row.group === "norghard_best_pilot6" || assetId.startsWith("NOR_");
  if (!isLeonia && !isNorghard) {
    return null;
  }

  const regionKey = isLeonia ? "leonia" : "norghard";
  const regionName = regionNames[regionKey];
  const bgType = assetId.split("_").at(-1);
  const cityAlias = isLeonia
    ? placeFromHandoffAsset(assetId, "LEO", bgType)
    : placeFromHandoffAsset(assetId, "NOR", bgType);
  const placeNames = isLeonia ? leoniaPlaceNames : norghardPlaceNames;
  const placeName = placeNames[cityAlias];
  const fileName = `${slug(assetId)}.webp`;
  const rel = `${handoffFolder(row, regionKey)}/${fileName}`;
  convert(src, path.join(exportRoot, rel));

  return {
    key: `handoff-20260713-${regionKey}-${slug(assetId)}`,
    aliases: unique([
      assetId,
      slug(assetId),
      cityAlias,
      placeName,
      placeName ? `${regionName} ${placeName}` : "",
      placeName ? `${regionName}-${placeName}` : "",
      `${regionKey}-${cityAlias}`,
      bgType,
      ...(bgTypeAliases[bgType] ?? [])
    ]),
    kind: "place_type",
    regionKey,
    regionName,
    cityAlias,
    bgType,
    imageUrl: `${assetBase}/${rel}`,
    sourceAssetId: assetId,
    priority: row.decision === "USE" ? 95 : 85
  };
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

  const handoffRows = parseCsv(fs.readFileSync(handoffManifestPath, "utf8"));
  for (const row of handoffRows) {
    const entry = buildHandoffEntry(row);
    if (entry) {
      entries.push(entry);
    }
  }

  entries.sort(
    (a, b) =>
      b.priority - a.priority ||
      (a.regionKey ?? "").localeCompare(b.regionKey ?? "") ||
      a.key.localeCompare(b.key)
  );
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
