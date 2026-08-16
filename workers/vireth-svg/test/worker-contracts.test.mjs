import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";

const workerRoot = fileURLToPath(new URL("..", import.meta.url));
const port = 8793;
const baseUrl = `http://127.0.0.1:${port}`;
let worker;
let workerOutput = "";

async function waitForWorker() {
  const deadline = Date.now() + 30_000;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
      lastError = new Error(`health returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Worker did not start within 30 seconds: ${lastError?.message ?? "unknown error"}\n${workerOutput}`);
}

async function getJson(path) {
  const response = await fetch(`${baseUrl}${path}`);
  return { response, body: await response.json() };
}

before(async () => {
  const command = "npx.cmd wrangler dev --local --port 8793 --ip 127.0.0.1";
  worker = spawn(process.platform === "win32" ? process.env.ComSpec ?? "cmd.exe" : "npx", process.platform === "win32" ? ["/d", "/s", "/c", command] : command.split(" "), {
    cwd: workerRoot,
    stdio: ["ignore", "pipe", "pipe"]
  });
  worker.stdout.on("data", (chunk) => {
    workerOutput += chunk;
  });
  worker.stderr.on("data", (chunk) => {
    workerOutput += chunk;
  });
  await waitForWorker();
});

after(() => {
  if (!worker?.pid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(worker.pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }
  worker.kill("SIGTERM");
});

test("resolves every fixed place ID before conflicting fuzzy place names", async () => {
  for (let number = 1; number <= 166; number += 1) {
    const placeId = `L${String(number).padStart(3, "0")}`;
    const { response, body } = await getJson(`/place.json?placeId=${placeId}&place=L022`);
    assert.equal(response.status, 200, placeId);
    assert.equal(body.currentPlace.id, placeId, placeId);
    assert.equal(typeof body.currentPlace.name, "string", placeId);
    assert.equal(typeof body.visualScene.key, "string", placeId);
  }
});

test("rejects a regionId that does not own the requested placeId", async () => {
  const { response, body } = await getJson("/place.json?regionId=R002&placeId=L003");
  assert.equal(response.status, 400);
  assert.equal(body.error, "region_place_mismatch");
  assert.equal(body.regionId, "R002");
  assert.equal(body.placeId, "L003");
});

test("rejects an unknown canonical placeId before fuzzy place fallback", async () => {
  const { response, body } = await getJson("/place.json?placeId=L999&place=L003");
  assert.equal(response.status, 400);
  assert.equal(body.error, "invalid_place_id");
  assert.equal(body.placeId, "L999");
});

test("rejects an unknown canonical regionId before place resolution", async () => {
  const { response, body } = await getJson("/place.json?regionId=R999&placeId=L003");
  assert.equal(response.status, 400);
  assert.equal(body.error, "invalid_region_id");
  assert.equal(body.regionId, "R999");
});

test("uses a placeId to reverse-resolve its region map", async () => {
  const response = await fetch(`${baseUrl}/map?placeId=L022&external=1`);
  const svg = await response.text();
  assert.equal(response.status, 200);
  assert.match(svg, /티리스/);
  assert.match(svg, /베크켈카르\(레이븐스톤\)/);
});

test("combines the rotating banner into the existing scene card URL", async () => {
  const response = await fetch(`${baseUrl}/scene?regionId=R003&placeId=L022&external=1`);
  const svg = await response.text();

  assert.equal(response.status, 200);
  assert.match(svg, /width="100%"/);
  assert.match(svg, /height="auto"/);
  assert.match(svg, /viewBox="0 0 1000 1056\.25"/);
  assert.match(svg, /data-scene-banner="vireth-banner"/);
  assert.match(svg, /data-hold-seconds="3\.5"/);
  assert.match(svg, /animateTransform/);
  assert.match(svg, /data-scene-card="vireth-location"/);
  assert.match(svg, /베크켈카르/);
  assert.doesNotMatch(svg, /data-scene-banner="vireth-banner-fallback"/);
  assert.doesNotMatch(svg, /data-scene-map="vireth-map"/);
});

test("inlines banner images for chat image embedding", async () => {
  const response = await fetch(`${baseUrl}/scene?regionId=R003&placeId=L022&seed=chat-embed`);
  const svg = await response.text();

  assert.equal(response.status, 200);
  assert.match(svg, /data-scene-banner="vireth-banner"/);
  assert.match(svg, /data:image\/webp;base64,/);
  assert.doesNotMatch(svg, /href="https?:\/\/[^"]+\/b\//);
});

test("keeps the canonical current place label when its visual scene falls back", async () => {
  const { response, body } = await getJson("/place.json?placeId=L003");
  assert.equal(response.status, 200);
  assert.equal(body.currentPlace.id, "L003");
  assert.equal(body.currentPlace.name, "렘켈가");
  assert.equal(typeof body.visualScene.title, "string");

  const placeResponse = await fetch(`${baseUrl}/place?placeId=L003&external=1`);
  const svg = await placeResponse.text();
  assert.match(svg, /렘켈가/);
});

test("normalizes the R020 fenrir region alias for scenes, maps, and backgrounds", async () => {
  const { response, body } = await getJson("/place.json?region=fenrir-eye&placeId=L160");
  assert.equal(response.status, 200);
  assert.equal(body.currentPlace.regionId, "R020");
  assert.equal(body.visualScene.realmKey, "fenrir-s-eye");
  assert.equal(body.map.key, "fenrir-s-eye");

  const background = await getJson("/talk-background.json?region=fenrir-eye&placeId=L160");
  assert.equal(background.response.status, 200);
  assert.equal(background.body.regionKey, "fenrir-s-eye");
});

test("returns an anonymous fallback portrait for an unknown fixed character ID", async () => {
  const { response, body } = await getJson("/talk.json?id=C999&name=%EB%B2%A0%EC%BC%88%20%EC%98%A4%EB%A5%B4%EB%AF%BC&placeId=L003");
  assert.equal(response.status, 200);
  assert.equal(body.character.characterId, undefined);
  assert.equal(typeof body.character.npcAssetId, "string");
  assert.match(body.character.imageUrl, /^\/npc-assets\//);
});

test("resolves every fixed character ID", async () => {
  for (let number = 1; number <= 100; number += 1) {
    const characterId = `C${String(number).padStart(3, "0")}`;
    const { response, body } = await getJson(`/talk.json?id=${characterId}&placeId=L003`);
    assert.equal(response.status, 200, characterId);
    assert.equal(body.character.characterId, characterId, characterId);
  }
});

test("keeps fixed-character canon when query overrides are supplied", async () => {
  const base = await getJson("/talk.json?id=C050&placeId=L022");
  const overridden = await getJson(
    "/talk.json?id=C050&placeId=L022&role=gatekeeper&affiliation=tiris&info=bogus"
  );

  assert.equal(overridden.response.status, 200);
  assert.equal(overridden.body.character.role, base.body.character.role);
  assert.equal(overridden.body.character.affiliation, base.body.character.affiliation);
  assert.equal(overridden.body.character.summary, base.body.character.summary);
  assert.deepEqual(overridden.body.infoLines, base.body.infoLines);
});

test("renders talk character art at the configured display scale", async () => {
  const response = await fetch(`${baseUrl}/talk?id=C012&e=a&placeId=L022&external=1`);
  const svg = await response.text();

  assert.equal(response.status, 200);
  assert.match(
    svg,
    /<metadata data-talk-character-display-scale="1\.5"\/>/
  );
  assert.match(
    svg,
    /<mask id="talkCharacterMask" maskUnits="userSpaceOnUse" x="382\.5" y="-155\.5" width="705" height="1005">/
  );
  assert.match(
    svg,
    /<image href="[^"]+" x="382\.5" y="-155\.5" width="705" height="1005" preserveAspectRatio="xMidYMid meet" mask="url\(#talkCharacterMask\)"\/>/
  );
});

test("prefers a matching place function over a region-only city representative", async () => {
  const { response, body } = await getJson("/talk-background.json?regionId=R003&placeId=L022");

  assert.equal(response.status, 200);
  assert.equal(body.kind, "general_archetype");
  assert.equal(body.key, "handoff-20260713-general-b001-city-gate-wallroad");
});

test("keeps an exact city representative ahead of a generic place function", async () => {
  const { response, body } = await getJson("/talk-background.json?regionId=R003&placeId=L021");

  assert.equal(response.status, 200);
  assert.equal(body.kind, "city_representative");
  assert.equal(body.key, "city-representative-tiris");
});

test("keeps a detailed spot alongside the canonical place ID", async () => {
  const { response, body } = await getJson(
    "/talk.json?id=C012&regionId=R003&placeId=L022&spot=%EC%84%9C%EB%AC%B8%20%EC%95%BC%EA%B0%84%20%EC%B4%88%EC%86%8C"
  );

  assert.equal(response.status, 200);
  assert.equal(body.placeLabel, "베크켈카르(레이븐스톤) 서문 야간 초소");
  assert.equal(body.talkBackground.kind, "general_archetype");
  assert.equal(body.talkBackground.key, "handoff-20260713-general-b001-city-gate-wallroad");
});

test("repairs renderer-corrupted region separators before parsing the speaker", async () => {
  const { response, body } = await getJson(
    "/talk.json?name=outsider%C2%AEion%3Dtiris&place=%EB%B2%A0%ED%81%AC%EC%BC%88%EC%B9%B4%EB%A5%B4"
  );

  assert.equal(response.status, 200);
  assert.equal(body.speaker, "outsider");
  assert.equal(body.scene.realmKey, "tiris");
});
