import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";

const workerRoot = fileURLToPath(new URL("..", import.meta.url));
const port = 8795;
const baseUrl = `http://127.0.0.1:${port}`;
let worker;
let workerOutput = "";

async function waitForWorker() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      // Wrangler is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Worker did not start within 30 seconds.\n${workerOutput}`);
}

before(async () => {
  const command = `npx.cmd wrangler dev --local --port ${port} --ip 127.0.0.1`;
  worker = spawn(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", command], {
    cwd: workerRoot,
    stdio: ["ignore", "pipe", "pipe"]
  });
  worker.stdout.on("data", (chunk) => { workerOutput += chunk; });
  worker.stderr.on("data", (chunk) => { workerOutput += chunk; });
  await waitForWorker();
});

after(() => {
  if (worker?.pid) spawnSync("taskkill", ["/pid", String(worker.pid), "/T", "/F"], { stdio: "ignore" });
});

test("uses one character-image contract for an emotion state on a selected place background", async () => {
  const response = await fetch(
    `${baseUrl}/character-image.json?id=C003&bg=VBG_INN_NIGHT&e=a`
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.kind, "character_image");
  assert.equal(body.state.kind, "emotion");
  assert.equal(body.state.code, "a");
  assert.equal(body.background.key, "VBG_INN_NIGHT");
  assert.equal(
    body.background.imageUrl,
    "/place-image-assets/rework82/VBG_INN_NIGHT.webp"
  );
  assert.equal(body.character.imageUrl, "/character-emotion-assets/c003/a.webp");
});

test("uses that same contract for a complete adult action image without a transparent overlay", async () => {
  const response = await fetch(
    `${baseUrl}/character-image.json?id=C003&bg=VBG_INN_NIGHT&ss=08`
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.kind, "character_image");
  assert.equal(body.state.kind, "action");
  assert.equal(body.state.code, "08");
  assert.equal(body.background.key, "VBG_INN_NIGHT");
  assert.equal(body.presentation, "complete_image");
  assert.equal(
    body.character.imageUrl,
    "https://raw.githubusercontent.com/musueman/VIRETH/main/n/C003_08.webp"
  );
});

test("renders the adult action state in a labelled single-image wrapper", async () => {
  const response = await fetch(
    `${baseUrl}/character-image?id=C003&bg=VBG_INN_NIGHT&ss=08&external=1`
  );
  const svg = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^image\/svg\+xml/i);
  assert.match(svg, /C003_08\.webp/);
  assert.match(svg, />팔리아 렘킨<\/text>/);
  assert.match(svg, />신뢰, 손익, 납기, 물자 흐름을 중시하며 명예보다 거래 지속성을 앞세운다\.<\/text>/);
});

test("keeps the explicit WebP place endpoint available as a bare asset", async () => {
  const response = await fetch(`${baseUrl}/place-image.webp?bg=VBG_INN_NIGHT`);

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^image\/webp/i);
});

test("keeps the selected rework background when a composite character image uses external references", async () => {
  const response = await fetch(
    `${baseUrl}/character-image?id=C003&bg=VBG_INN_NIGHT&e=a&external=1`
  );
  const svg = await response.text();

  assert.equal(response.status, 200);
  assert.match(svg, /place-image-assets\/rework82\/VBG_INN_NIGHT\.webp/);
});

test("rejects an action state for a non-female fixed character", async () => {
  const response = await fetch(`${baseUrl}/character-image.json?id=C001&bg=VBG_INN_NIGHT&ss=08`);
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error, "invalid_character_image_state");
});

test("renders the turn-top location as a labelled regional overview, not the character place background", async () => {
  const response = await fetch(
    `${baseUrl}/place-image?regionId=R003&placeId=L022&time=DAY`
  );
  const svg = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^image\/svg\+xml/i);
  assert.match(svg, /href="data:image\/webp;base64,/i);
  assert.match(svg, />티리스<\/text>/);
  assert.match(svg, />베크켈카르\(레이븐스톤\)<\/text>/);
  assert.match(svg, /font-size="42" font-weight="800">티리스<\/text>/);
  assert.match(svg, /font-size="48" font-weight="800">베크켈카르\(레이븐스톤\)<\/text>/);
  assert.match(svg, /font-size="28" font-weight="600">도시·거점<\/text>/);
});

test("uses the L022 night variant", async () => {
  const response = await fetch(
    `${baseUrl}/character-image.json?id=C003&regionId=R003&placeId=L022&time=NIGHT&e=a`
  );
  const body = await response.json();

  assert.equal(body.background.key, "VBG_GATE_NIGHT");
});

test("derives a place-type image for a named lodging settlement", async () => {
  const response = await fetch(
    `${baseUrl}/character-image.json?id=C003&regionId=R001&placeId=L003&time=DAY&e=a`
  );
  const body = await response.json();

  assert.equal(body.background.key, "VBG_LODGING_DAY");
});

test("uses a regional image outside a settlement ahead of a stale place", async () => {
  const response = await fetch(
    `${baseUrl}/character-image.json?id=C003&regionId=R003&placeId=L022&scope=region&time=DAY&e=a`
  );
  const body = await response.json();

  assert.equal(body.background.key, "VRA_N003_DAY");
});

test("keeps an explicit bg ahead of location inference", async () => {
  const response = await fetch(
    `${baseUrl}/character-image.json?id=C003&regionId=R003&placeId=L022&time=DAY&bg=VBG_INN_NIGHT&e=a`
  );
  const body = await response.json();

  assert.equal(body.background.key, "VBG_INN_NIGHT");
});

test("uses the inferred asset in the normal composite", async () => {
  const response = await fetch(
    `${baseUrl}/character-image?id=C003&regionId=R003&placeId=L022&time=DAY&e=a&external=1`
  );
  const svg = await response.text();

  assert.equal(response.status, 200);
  assert.match(svg, /place-image-assets\/rework82\/VBG_GATE_DAY\.webp/);
});

test("labels a normal character composite with the character name and personality", async () => {
  const response = await fetch(
    `${baseUrl}/character-image?id=C015&regionId=R003&placeId=L022&time=DAY&e=a&external=1`
  );
  const svg = await response.text();

  assert.equal(response.status, 200);
  assert.match(svg, /data-talk-character-display-scale="1.5"/);
  assert.match(svg, />베크라 소멘<\/text>/);
  assert.match(svg, />일터의 신뢰, 지역 관습, 가족과 보증 관계를 중시한다\.<\/text>/);
  assert.match(svg, /font-size="48" font-weight="800">베크라 소멘<\/text>/);
  assert.match(svg, /font-size="26" font-weight="600">일터의 신뢰, 지역 관습, 가족과 보증 관계를 중시한다\.<\/text>/);
  assert.match(svg, /id="talkCaptionTextShadow"/);
  assert.doesNotMatch(svg, /talkLowerBand|talkPanel|talkCrest/i);
});
