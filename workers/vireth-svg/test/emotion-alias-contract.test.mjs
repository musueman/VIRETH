import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";

const workerRoot = fileURLToPath(new URL("..", import.meta.url));
const port = 8794;
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

test("resolves disgust aliases to the V5 disgust portrait", async () => {
  for (const emotion of ["d", "disgust", encodeURIComponent("혐오")]) {
    const response = await fetch(`${baseUrl}/talk.json?id=C001&e=${emotion}&regionId=R003&placeId=L022`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.emotionCode, "d");
    assert.equal(body.character.imageUrl, "/character-emotion-assets/c001/d.webp");
  }
});
