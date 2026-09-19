import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = process.argv[2] ??
  "D:/OneDrive/444_비레스/00_최신본/09_루나톡/01_실투입DB/Arcadia_루나톡_캐릭터100인_설정요약_v18.md";
const outputPath = path.join(root, "workers/vireth-svg/src/generated-talk-personalities.ts");

const markdown = fs.readFileSync(sourcePath, "utf8");
const headings = [...markdown.matchAll(/^## (C\d{3}) \[\[[^\]]+\]\]\s*$/gm)];
const personalities = {};

for (const [index, heading] of headings.entries()) {
  const start = heading.index + heading[0].length;
  const end = headings[index + 1]?.index ?? markdown.length;
  const body = markdown.slice(start, end);
  const personality = body.match(/^성격:\s*([A-Z]{4})\s*·\s*([1-9]w[1-9])(?:\s*·|\s*$)/m);
  if (!personality) {
    throw new Error(`Missing MBTI/wing for ${heading[1]}`);
  }
  personalities[heading[1]] = `${personality[1]} · ${personality[2]}`;
}

if (headings.length !== 100 || Object.keys(personalities).length !== 100) {
  throw new Error(`Expected 100 character personalities, found ${Object.keys(personalities).length}`);
}

const output = [
  "// Generated from the current LunaTalk 100-character summary. Do not edit by hand.",
  `export const GENERATED_TALK_PERSONALITIES = ${JSON.stringify(personalities, null, 2)} as const;`,
  ""
].join("\n");

fs.writeFileSync(outputPath, output, "utf8");
console.log(`Wrote ${Object.keys(personalities).length} personalities to ${outputPath}`);
