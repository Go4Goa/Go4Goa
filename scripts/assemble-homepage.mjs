import assert from 'node:assert/strict';
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const app = resolve('dist');
const homepage = resolve('homepage/dist');
await readFile(join(app, 'app.html'));
await readFile(join(homepage, 'index.html'));

// Retain the app's manifest, service worker and API assets. Shared hashed
// assets may overlap only when their bytes are identical.
async function mergeDirectory(source, target) {
  await mkdir(target, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    const from = join(source, entry.name), to = join(target, entry.name);
    if (entry.isDirectory()) await mergeDirectory(from, to);
    else {
      const content = await readFile(from);
      let existing;
      try { existing = await readFile(to); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
      if (existing) assert.ok(existing.equals(content), `Conflicting app/homepage asset: ${to}`);
      else await writeFile(to, content);
    }
  }
}
await mergeDirectory(homepage, app);
const homeHtml = await readFile(join(app, 'index.html'), 'utf8');
const appHtml = await readFile(join(app, 'app.html'), 'utf8');
assert.notEqual(homeHtml, appHtml, 'Homepage and app must have separate documents');
for (const html of [homeHtml, appHtml]) {
  for (const match of html.matchAll(/(?:src|href)="(\/[^"#]+)"/g)) {
    await readFile(join(app, match[1]));
  }
}
const manifest = JSON.parse(await readFile(join(app, 'manifest.webmanifest'), 'utf8'));
assert.equal(manifest.start_url, '/map');
const sw = await readFile(join(app, 'sw.js'), 'utf8');
assert.ok(sw.includes('app.html'), 'Offline navigation must use the app document');
assert.ok(!sw.includes('index.html'), 'The app service worker must not replace the homepage');
console.log('Combined site verified: homepage /, app /map, separate offline app shell.');
