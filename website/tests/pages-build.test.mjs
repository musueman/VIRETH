import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { JSDOM } from 'jsdom';

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

test('link crawlers receive complete share metadata without running JavaScript', () => {
  const doc = new JSDOM(html).window.document;
  const meta = key => doc.querySelector(`meta[property="${key}"], meta[name="${key}"]`)?.content;
  for (const key of ['description','og:title','og:description','og:site_name','og:image:alt','twitter:title','twitter:description','twitter:image:alt']) {
    assert.ok(meta(key)?.trim(), `Missing crawler-visible ${key}`);
  }
  assert.equal(meta('og:type'), 'website');
  assert.equal(meta('og:locale'), 'ko_KR');
  assert.equal(meta('twitter:card'), 'summary_large_image');
  assert.equal(meta('og:url'), 'https://musueman.github.io/VIRETH/');
  assert.equal(doc.querySelector('link[rel="canonical"]')?.href, meta('og:url'));
  const image = new URL(meta('og:image'));
  assert.equal(image.origin, 'https://musueman.github.io');
  assert.ok(image.pathname.startsWith('/VIRETH/'));
  assert.equal(meta('twitter:image'), image.href);
  const png = readFileSync(new URL(image.pathname.slice('/VIRETH/'.length), output));
  assert.equal(png.subarray(1,4).toString(), 'PNG');
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
  assert.equal(meta('og:image:width'), '1200');
  assert.equal(meta('og:image:height'), '630');
});

test('browser and iOS icons resolve to published files beneath the Pages base', () => {
  const doc = new JSDOM(html).window.document;
  const icons = [...doc.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]')];
  assert.ok(icons.some(link=>link.type==='image/svg+xml'));
  assert.ok(icons.some(link=>link.getAttribute('sizes')==='32x32'));
  assert.ok(icons.some(link=>link.rel==='apple-touch-icon'));
  for (const icon of icons) {
    const href=icon.getAttribute('href');
    assert.ok(href.startsWith('/VIRETH/'), href);
    assert.ok(readFileSync(new URL(href.slice('/VIRETH/'.length),output)).length>0);
  }
});
