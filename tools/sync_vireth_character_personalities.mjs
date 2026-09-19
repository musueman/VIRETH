import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = process.argv[2] ??
  "D:/OneDrive/444_비레스/00_최신본/09_루나톡/01_실투입DB/Arcadia_루나톡_캐릭터100인_설정요약_v18.md";
const canonPath = process.argv[3] ??
  "D:/OneDrive/444_비레스/00_최신본/01_문서_정본/Arcadia_비레스_세계관_DB_최종통합본_v1.md";
const outputPath = path.join(root, "workers/vireth-svg/src/generated-talk-personalities.ts");
const characterSourcePath = path.join(root, "workers/vireth-svg/src/generated-talk-characters.ts");

const markdown = fs.readFileSync(sourcePath, "utf8");
const canonMarkdown = fs.readFileSync(canonPath, "utf8");
const headings = [...markdown.matchAll(/^## (C\d{3}) \[\[[^\]]+\]\]\s*$/gm)];
const canonHeadings = [...canonMarkdown.matchAll(/^### 15\.\d+ (C\d{3}) \[\[([^\]]+)\]\]\s*$/gm)];
const personalities = {};
const profileTraits = {};
const roles = {};
const compactProfileTraits = {
  "절차·책임·문서권위 중시, 보증 없는 위험 거부": "절차·책임·문서권위를 중시한다.",
  "신뢰·손익·납기·물류 중시, 명예보다 거래 지속": "신뢰·납기·물류를 중시한다.",
  "일터 신뢰·지역관습·가족·보증관계 중시": "지역관습·가족·보증을 중시한다.",
  "과묵, 생존규칙·보호의무 중시, 무모한 탐험 회피": "생존규칙·보호의무를 중시한다.",
  "기억·출처·문서접근권 중시, 소문 단정 금지": "기억·출처·접근권을 중시한다.",
  "안전·지휘체계·동료보호 우선, 영웅행세 경계": "안전·지휘체계·동료보호 우선."
};

function parseFields(body) {
  const fields = {};
  for (const line of body.split(/\r?\n/)) {
    const field = line.match(/^([^:]+):\s*(.*)$/);
    if (field) {
      fields[field[1].trim()] = field[2].trim();
    }
  }
  return fields;
}

function readGeneratedArray(file) {
  const source = fs.readFileSync(file, "utf8");
  const start = source.indexOf("[");
  const end = source.lastIndexOf("]");
  if (start < 0 || end < 0) {
    throw new Error(`Generated array not found: ${file}`);
  }
  return JSON.parse(source.slice(start, end + 1));
}

function normalizeRole(value = "") {
  return value.replace(/[\s·/_-]+/g, "");
}

const displayRoleById = new Map(
  readGeneratedArray(characterSourcePath).map((character) => [character.characterId, character.role])
);

const canonCharacters = new Map(
  canonHeadings.map((heading, index) => {
    const start = heading.index + heading[0].length;
    const end = canonHeadings[index + 1]?.index ?? canonMarkdown.length;
    return [
      heading[1],
      {
        name: heading[2].trim(),
        fields: parseFields(canonMarkdown.slice(start, end))
      }
    ];
  })
);

for (const [index, heading] of headings.entries()) {
  const start = heading.index + heading[0].length;
  const end = headings[index + 1]?.index ?? markdown.length;
  const body = markdown.slice(start, end);
  const personality = body.match(
    /^성격:\s*([A-Z]{4})\s*·\s*([1-9]w[1-9])\s*·\s*([^;\r\n]+)/m
  );
  if (!personality) {
    throw new Error(`Missing MBTI/wing/profile trait for ${heading[1]}`);
  }
  const canonCharacter = canonCharacters.get(heading[1]);
  if (!canonCharacter?.fields["직능"]) {
    throw new Error(`Missing final canon occupation for ${heading[1]}`);
  }
  const rawProfileTrait = personality[3].trim();
  const compactProfileTrait = compactProfileTraits[rawProfileTrait];
  if (!compactProfileTrait) {
    throw new Error(`Unknown profile trait for ${heading[1]}: ${rawProfileTrait}`);
  }
  const legacyDisplayRole = displayRoleById.get(heading[1]);
  const displayRole = legacyDisplayRole?.endsWith("좌표")
    ? legacyDisplayRole.replace(/좌표$/, "담당")
    : legacyDisplayRole;
  if (!displayRole || normalizeRole(displayRole) !== normalizeRole(canonCharacter.fields["직능"])) {
    throw new Error(
      `Occupation mismatch for ${heading[1]}: display=${displayRole ?? "missing"}, canon=${canonCharacter.fields["직능"]}`
    );
  }
  personalities[heading[1]] = `${personality[1]} · ${personality[2]}`;
  profileTraits[heading[1]] = compactProfileTrait;
  roles[heading[1]] = displayRole;
}

if (
  headings.length !== 100 ||
  canonHeadings.length !== 100 ||
  Object.keys(personalities).length !== 100 ||
  Object.keys(profileTraits).length !== 100 ||
  Object.keys(roles).length !== 100
) {
  throw new Error(
    `Expected 100 character profiles, found ${Object.keys(personalities).length} personalities, ${Object.keys(profileTraits).length} traits, and ${Object.keys(roles).length} roles`
  );
}

const output = [
  "// Generated from the current LunaTalk 100-character summary. Do not edit by hand.",
  `export const GENERATED_TALK_PERSONALITIES = ${JSON.stringify(personalities, null, 2)} as const;`,
  "",
  `export const GENERATED_TALK_PROFILE_TRAITS = ${JSON.stringify(profileTraits, null, 2)} as const;`,
  "",
  `export const GENERATED_TALK_ROLES = ${JSON.stringify(roles, null, 2)} as const;`,
  ""
].join("\n");

fs.writeFileSync(outputPath, output, "utf8");
console.log(`Wrote ${Object.keys(personalities).length} character profiles to ${outputPath}`);
