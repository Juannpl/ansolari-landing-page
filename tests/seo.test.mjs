import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];

test('canonical, sitemap and robots advertise the same public origin', () => {
  assert.ok(canonical, 'Configurer PUBLIC_SITE_URL avant de tester le build SEO');
  const origin = new URL(canonical).origin;
  const sitemap = readFileSync(new URL('../dist/sitemap.xml', import.meta.url), 'utf8');
  const robots = readFileSync(new URL('../dist/robots.txt', import.meta.url), 'utf8');
  assert.ok(sitemap.includes(`<loc>${canonical}</loc>`));
  assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
  assert.ok(robots.includes('User-agent: *\nAllow: /'));
  assert.ok(html.includes(`content="${origin}/social-card.png"`));
  assert.ok(!html.includes('noindex'));
});

test('structured data identifies the real publisher and matches the page', () => {
  const json = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1];
  assert.ok(json, 'JSON-LD absent');
  const graph = JSON.parse(json)['@graph'];
  const page = graph.find(item => item['@type'] === 'WebPage');
  assert.equal(page.url, canonical);
  assert.equal(page.name, html.match(/<title>(.*?)<\/title>/)?.[1]);
  assert.equal(graph.find(item => item['@type'] === 'Person').name, 'Juan-Pablo LONDONO RAMIREZ');
  assert.ok(!json.includes('aggregateRating'));
});

test('service explanations and FAQ are available before JavaScript executes', () => {
  assert.ok(html.includes('Qu’est-ce qu’Ansolari ?'));
  assert.ok(html.includes('Il vise à accueillir les appels'));
  assert.ok(html.includes('Aucun appel ni rendez-vous réel n’est créé.'));
  assert.ok(html.includes('<summary>'));
});
