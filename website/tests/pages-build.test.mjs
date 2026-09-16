import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

// Run after: npx vite build --base=/VIRETH/
const output = new URL('../dist/client/', import.meta.url);
const html = readFileSync(new URL('index.html', output), 'utf8');
const bundle = readdirSync(new URL('assets/', output))
  .filter(name => /\.(js|css)$/.test(name))
  .map(name => readFileSync(new URL(`assets/${name}`, output), 'utf8')).join('\n');

test('Pages entry points resolve beneath the repository path', () => {
  assert.match(html, /src="\/VIRETH\/assets\/index-[^"]+\.js"/);
  assert.match(html, /href="\/VIRETH\/assets\/index-[^"]+\.css"/);
});

test('all emitted public artwork URLs stay inside the Pages repository', () => {
  const rootURLs = bundle.match(/["'`(]\/assets\//g) || [];
  assert.equal(rootURLs.length, 0, 'Root-relative art bypasses /VIRETH/ and returns 404');
  assert.ok(bundle.includes('/VIRETH/assets/explore/v63/terrain.png'));
  assert.ok(bundle.includes('/VIRETH/assets/characters/duran-welcome-transparent.png'));
  assert.ok(bundle.includes('url(/VIRETH/assets/footer/'));
});
