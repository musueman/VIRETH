import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wikiPath = process.argv[2] ??
  "D:/OneDrive/333_죽지않는기사와_비단요람/001_신설정/arcadia_updated_md/Arcadia_루나톡_위키DB_실투입_v9.md";
const canonDirectory = path.dirname(wikiPath);
const integratedDbPath = path.join(canonDirectory, "Arcadia_루나톡_통합DB_실투입_v9.md");
const characterDbPath = path.join(canonDirectory, "Arcadia_루나톡_캐릭터DB_실투입_v8.md");

const regionSource = path.join(root, "workers/vireth-svg/src/generated-region-maps.ts");
const placeSource = path.join(root, "workers/vireth-svg/src/generated-region-map-places.ts");
const characterSource = path.join(root, "workers/vireth-svg/src/generated-talk-characters.ts");
const registrySource = path.join(root, "workers/vireth-svg/src/generated-wiki-ids.ts");
const registryJson = path.join(root, "etc/arcadia5083-wiki-id-registry.json");
const registryMarkdown = path.join(root, "Arcadia_5083_위키코드_레지스트리_v1.md");
const localCharacters = path.join(root, "Arcadia_5083_고정캐릭터_200명_v2.md");
const localCharacterIndex = path.join(root, "Arcadia_5083_고정캐릭터_200명_이름색인_v1.md");

function readGeneratedArray(file) {
  const source = fs.readFileSync(file, "utf8");
  const start = source.indexOf("[");
  const end = source.lastIndexOf("]");
  if (start < 0 || end < 0) throw new Error(`Generated array not found: ${file}`);
  return JSON.parse(source.slice(start, end + 1));
}

function cleanWiki(value = "") {
  return value.replaceAll("[[", "").replaceAll("]]", "").trim();
}

function parseWikiCharacters(markdown) {
  const headings = [...markdown.matchAll(/^## (C\d{3}) \[\[([^\]]+)\]\]\s*$/gm)];
  return headings.map((match, index) => {
    const bodyStart = match.index + match[0].length;
    const bodyEnd = headings[index + 1]?.index ?? markdown.length;
    const body = markdown.slice(bodyStart, bodyEnd);
    const fields = {};
    for (const line of body.split(/\r?\n/)) {
      const field = line.match(/^([^:]+):\s*(.+)$/);
      if (field) fields[field[1].trim()] = cleanWiki(field[2]);
    }
    const [region = "", place = ""] = (fields["위치"] ?? "").split("/").map((part) => part.trim());
    return {
      id: match[1],
      name: match[2].trim(),
      gender: fields["성별"] ?? "-",
      age: fields["연령대"] ?? "-",
      region,
      place,
      culture: fields["문화"] ?? "-",
      role: fields["역할"] ?? "등장 인물",
      appearance: fields["외견"] ?? "",
      tendency: fields["성향"] ?? "",
      knowledge: fields["지식"] ?? "",
      speech: fields["말투"] ?? ""
    };
  });
}

function id(prefix, number, width) {
  return `${prefix}${String(number).padStart(width, "0")}`;
}

const regionsRaw = readGeneratedArray(regionSource);
const placesRaw = readGeneratedArray(placeSource);
const talkCharacters = readGeneratedArray(characterSource);
const wiki = fs.readFileSync(wikiPath, "utf8");
const wikiCharacters = parseWikiCharacters(wiki);

if (regionsRaw.length !== 20) throw new Error(`Expected 20 regions, found ${regionsRaw.length}`);
if (placesRaw.length !== 166) throw new Error(`Expected 166 places, found ${placesRaw.length}`);
if (wikiCharacters.length !== 100) throw new Error(`Expected 100 wiki characters, found ${wikiCharacters.length}`);

const regions = regionsRaw.map((region, index) => ({
  id: id("R", index + 1, 3),
  key: region.key,
  name: region.title,
  aliases: [...new Set([region.key, region.title, ...(region.aliases ?? [])])]
}));
const regionByKey = new Map(regions.map((region) => [region.key, region]));

const places = placesRaw.map((place, index) => {
  const region = regionByKey.get(place.regionKey);
  if (!region) throw new Error(`Unknown region for ${place.title}: ${place.regionKey}`);
  return {
    id: id("L", index + 1, 3),
    regionId: region.id,
    regionKey: place.regionKey,
    regionName: place.regionName,
    name: place.title,
    aliases: [...new Set([place.title, ...(place.aliases ?? [])])],
    kind: place.kind,
    order: place.order
  };
});

function normalizeLookup(value = "") {
  return value.toLowerCase().replace(/[\s_()\[\]·/.-]+/g, "");
}

function characterPlace(character) {
  const region = regions.find((entry) => entry.name === character.region);
  if (!region) throw new Error(`Unknown character region ${character.id}: ${character.region}`);
  const target = normalizeLookup(character.place);
  const candidates = places.filter((place) => place.regionId === region.id);
  const place = candidates.find((entry) =>
    [entry.name, ...entry.aliases].some((alias) => {
      const normalized = normalizeLookup(alias);
      return normalized === target || normalized.includes(target) || target.includes(normalized);
    })
  );
  if (!place) throw new Error(`Unknown character place ${character.id}: ${character.region}/${character.place}`);
  return { regionId: region.id, placeId: place.id };
}

for (const character of wikiCharacters) {
  Object.assign(character, characterPlace(character));
}

const characterById = new Map(wikiCharacters.map((character) => [character.id, character]));
const characterByName = new Map(wikiCharacters.map((character) => [character.name, character]));
for (const character of talkCharacters) {
  const canonical = characterById.get(character.characterId);
  if (!canonical || canonical.name !== character.displayName) {
    throw new Error(`Character mismatch ${character.characterId}: worker=${character.displayName}, wiki=${canonical?.name ?? "missing"}`);
  }
  character.role = canonical.role;
  character.affiliation = [canonical.region, canonical.place].filter(Boolean).join(" / ");
  character.summary = canonical.tendency || canonical.knowledge;
  character.gender = canonical.gender;
}

const generated = `// Generated by tools/sync_vireth_wiki_registry.mjs. Do not edit by hand.\n` +
  `export const GENERATED_WIKI_REGIONS = ${JSON.stringify(regions, null, 2)} as const;\n\n` +
  `export const GENERATED_WIKI_PLACES = ${JSON.stringify(places, null, 2)} as const;\n`;
fs.writeFileSync(registrySource, generated, "utf8");

const talkGenerated = `// Generated from the LunaTalk wiki character registry and final Best100 images. Do not edit by hand.\n` +
  `export const GENERATED_TALK_CHARACTERS = ${JSON.stringify(talkCharacters, null, 4)};\n`;
fs.writeFileSync(characterSource, talkGenerated, "utf8");

fs.mkdirSync(path.dirname(registryJson), { recursive: true });
fs.writeFileSync(registryJson, JSON.stringify({ version: 1, source: wikiPath, regions, places, characters: wikiCharacters }, null, 2), "utf8");

const md = [
  "# Arcadia 5083 위키 호출 코드 레지스트리 v1",
  "",
  `위키 정본: \`${wikiPath}\``,
  "",
  "코드는 이미지 호출 URL에서만 사용한다. 표시 문장에는 정본 이름을 쓴다.",
  "",
  "## 지역",
  "",
  "| 코드 | 정본명 | 내부 키 |",
  "|---|---|---|",
  ...regions.map((region) => `| ${region.id} | ${region.name} | ${region.key} |`),
  "",
  "## 장소",
  "",
  "| 코드 | 지역 코드 | 지역 | 정본명 | 종류 |",
  "|---|---|---|---|---|",
  ...places.map((place) => `| ${place.id} | ${place.regionId} | ${place.regionName} | ${place.name} | ${place.kind} |`),
  "",
  "## 캐릭터",
  "",
  "| 코드 | 이름 | 위치 | 역할 |",
  "|---|---|---|---|",
  ...wikiCharacters.map((character) => `| ${character.id} | ${character.name} | ${character.region}/${character.place} | ${character.role} |`),
  ""
].join("\n");
fs.writeFileSync(registryMarkdown, md, "utf8");

function annotateWiki(markdown) {
  let updated = markdown.replace(/\r\n/g, "\n");
  updated = updated.replace(/^위키코드: R\d{3}\n/gm, "");
  updated = updated.replace(/^장소 호출 코드: .+\n/gm, "");
  for (const region of regions) {
    updated = updated.replace(`## [[${region.name}]]\n`, `## [[${region.name}]]\n위키코드: ${region.id}\n`);
    const regionPlaces = places.filter((place) => place.regionId === region.id);
    const codeLine = `장소 호출 코드: ${regionPlaces.map((place) => `${place.id} [[${place.name}]]`).join(", ")}`;
    const sectionStart = updated.indexOf(`## [[${region.name}]]\n`);
    const nextSection = updated.indexOf("\n## [[", sectionStart + 1);
    const sectionEnd = nextSection < 0 ? updated.length : nextSection;
    const section = updated.slice(sectionStart, sectionEnd);
    const anchor = section.match(/^지역 도시·거점:.*$/m)?.[0] ?? section.match(/^대표도시:.*$/m)?.[0];
    if (!anchor) throw new Error(`Place code insertion point missing for ${region.name}`);
    const absoluteAnchor = sectionStart + section.indexOf(anchor) + anchor.length;
    updated = `${updated.slice(0, absoluteAnchor)}\n${codeLine}${updated.slice(absoluteAnchor)}`;
  }
  return updated;
}

const characterRules = `<!-- VIRETH_WIKI_ID_RULES_START -->
## 정본 식별 코드

고정 캐릭터 100명은 \`C001\`부터 \`C100\`까지의 영구 정본 코드를 사용한다. 이 코드는 위키 DB, 객관정보 통합DB, 캐릭터 이미지와 대화카드 매핑에서 같은 인물을 가리킨다. 직책·소속·위치·별칭이 바뀌어도 코드는 유지한다.

- 일반 서술과 대사에는 인물명을 사용한다.
- 코드는 DB 연결과 이미지 호출에만 사용한다.
- 이름과 코드가 충돌하면 위키 DB의 코드와 인물명을 우선한다.
- \`C101\` 이후 로컬 확장 인물은 위키 등록 전까지 정본 코드가 아니다.
- 코드가 없는 임시 인물에게 임의의 C코드를 만들지 않는다.
- 지역은 \`R001~R020\`, 장소는 \`L001~L166\`을 사용하며 각 인물의 위치 아래에 함께 기록한다.
<!-- VIRETH_WIKI_ID_RULES_END -->`;

function annotateCharacterDatabase(markdown, expectedCharacters) {
  let updated = markdown.replace(/\r\n/g, "\n");
  updated = updated.replace(/\n?<!-- VIRETH_WIKI_ID_RULES_START -->[\s\S]*?<!-- VIRETH_WIKI_ID_RULES_END -->\n?/g, "\n");
  const characterHeading = /^\uFEFF?# 캐릭터\s*$/m;
  if (!characterHeading.test(updated)) throw new Error("Character database heading not found");
  updated = updated.replace(/^(\uFEFF?# 캐릭터)[ \t]*\n(?:[ \t]*\n)*/m, "$1\n");
  updated = updated.replace(characterHeading, (heading) => `${heading}\n\n${characterRules}\n`);
  updated = updated.replace(/^장소 코드: R\d{3}\/L\d{3}\s*\n/gm, "");

  for (const character of wikiCharacters) {
    const heading = `## ${character.id} [[${character.name}]]`;
    const start = updated.indexOf(heading);
    if (start < 0) throw new Error(`Character heading missing: ${heading}`);
    const next = updated.indexOf("\n## C", start + heading.length);
    const end = next < 0 ? updated.length : next;
    const block = updated.slice(start, end);
    const locationLine = block.match(/^위치:.*$/m)?.[0];
    if (!locationLine) throw new Error(`Character location missing: ${character.id}`);
    const insertAt = start + block.indexOf(locationLine) + locationLine.length;
    updated = `${updated.slice(0, insertAt)}\n장소 코드: ${character.regionId}/${character.placeId}${updated.slice(insertAt)}`;
  }

  const parsed = parseWikiCharacters(updated);
  if (parsed.length !== expectedCharacters) throw new Error(`Expected ${expectedCharacters} characters after annotation, found ${parsed.length}`);
  for (const canonical of wikiCharacters) {
    const current = parsed.find((entry) => entry.id === canonical.id);
    if (!current || current.name !== canonical.name || current.region !== canonical.region || current.place !== canonical.place) {
      throw new Error(`Canonical character mismatch after annotation: ${canonical.id}`);
    }
  }
  return updated;
}

const wikiWithLocationIds = annotateCharacterDatabase(annotateWiki(wiki), 100);
fs.writeFileSync(wikiPath, wikiWithLocationIds, "utf8");
if (!fs.existsSync(integratedDbPath)) throw new Error(`Required local database missing: ${integratedDbPath}`);
const integratedDb = annotateWiki(fs.readFileSync(integratedDbPath, "utf8"));
fs.writeFileSync(integratedDbPath, annotateCharacterDatabase(integratedDb, 100), "utf8");
if (!fs.existsSync(characterDbPath)) throw new Error(`Required local database missing: ${characterDbPath}`);
fs.writeFileSync(characterDbPath, annotateCharacterDatabase(fs.readFileSync(characterDbPath, "utf8"), 100), "utf8");

function parseLocalCharacterLines(markdown) {
  return [...markdown.matchAll(/^- C\d{3} \[\[([^\]]+)\]\].*$/gm)].map((match) => ({ name: match[1], line: match[0] }));
}

if (fs.existsSync(localCharacters)) {
  const oldEntries = parseLocalCharacterLines(fs.readFileSync(localCharacters, "utf8"));
  const extras = oldEntries.filter((entry) => !characterByName.has(entry.name));
  if (extras.length < 100) throw new Error(`Need 100 unique local extension characters, found ${extras.length}`);
  const canonicalLines = wikiCharacters.map((character) =>
    `- ${character.id} [[${character.name}]] | [[${character.region}]]/[[${character.place}]] | ${character.role} | ${character.gender}/${character.age} | ${character.tendency || character.knowledge}`
  );
  const extensionLines = extras.slice(0, 100).map((entry, index) =>
    entry.line.replace(/^- C\d{3}/, `- ${id("C", index + 101, 3)}`)
  );
  const synced = [
    "# Arcadia 5083 고정 캐릭터 200명 v2",
    "",
    "위키 C001~C100을 정본으로 동기화했다. C101~C200은 위키에 아직 등록되지 않은 로컬 확장 인물이며, 위키 등록 전에는 이미지 호출 코드로 사용하지 않는다.",
    "",
    "## 1. 위키 정본 캐릭터 C001~C100",
    "",
    ...canonicalLines,
    "",
    "## 2. 로컬 확장 캐릭터 C101~C200",
    "",
    ...extensionLines,
    ""
  ].join("\n");
  fs.writeFileSync(localCharacters, synced, "utf8");
  const indexMd = [
    "# Arcadia 5083 고정 캐릭터 200명 이름색인 v1",
    "",
    "| 코드 | 이름 | 구분 |",
    "|---|---|---|",
    ...wikiCharacters.map((character) => `| ${character.id} | [[${character.name}]] | 위키 정본 |`),
    ...extensionLines.map((line) => {
      const match = line.match(/^- (C\d{3}) \[\[([^\]]+)\]\]/);
      return `| ${match[1]} | [[${match[2]}]] | 로컬 확장 |`;
    }),
    ""
  ].join("\n");
  fs.writeFileSync(localCharacterIndex, indexMd, "utf8");
}

console.log(JSON.stringify({ regions: regions.length, places: places.length, characters: wikiCharacters.length, wikiPath, registryJson }, null, 2));
