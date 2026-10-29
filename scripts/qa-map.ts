import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
const base = process.env.MAP_QA_URL || 'http://127.0.0.1:4310';
const out = '.impeccable/review';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const checks: string[] = [];
const errors: string[] = [];
async function settled(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => document.querySelectorAll('.maplibregl-canvas').length > 0 && !document.querySelector('.radar-map-loading') && !document.querySelector('.radar-map-failure'));
  await page.waitForTimeout(350);
}
try {
  for (const [name, width, height] of [['desktop', 1440, 950], ['mobile', 390, 844], ['short-phone', 390, 540], ['user-459', 459, 618], ['narrow', 320, 720], ['tablet', 768, 1024], ['intermediate', 1024, 800], ['landscape', 844, 390]] as const) {
    console.log('Checking', name);
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const page = await context.newPage(); page.setDefaultTimeout(15000); page.on('pageerror', error => errors.push(error.message));
    // Keep this visual fixture stable while the user creates local meetups.
    await page.route('**/api/explore?**', async route => { const response = await route.fetch(); if (!response.ok()) { await route.fulfill({ response }); return; } const data = await response.json(); data.items = data.items.filter((item: {example: boolean}) => item.example); await route.fulfill({ response, json: data }); });
    await page.goto(base); await settled(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    expect(await page.locator('.radar-marker, .radar-cluster').count()).toBeGreaterThan(0);
    for (const button of await page.locator('.radar-types button').all()) {
      const box = await button.boundingBox(); expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    }
    const nav = await page.locator('.bottom-nav').boundingBox();
    const legend = await page.locator('.radar-map-caption').count() ? await page.locator('.radar-map-caption').boundingBox() : null;
    const controls = await page.locator('.radar-map-controls').boundingBox();
    const attribution = await page.locator('.leaflet-control-attribution').boundingBox();
    if (legend) expect(legend.y + legend.height).toBeLessThanOrEqual(nav!.y);
    expect(controls!.y + controls!.height).toBeLessThan(attribution!.y);
    await expect(page.locator('.radar-results')).toBeHidden();
    await expect(page.locator('.radar-search-area')).toHaveCount(0);
    const toolbar = await page.locator('.radar-search-row').boundingBox();
    expect(toolbar!.height).toBeLessThanOrEqual(48);

    await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
    if (name === 'desktop' || name === 'mobile') {
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await page.getByRole('button', { name: 'Filters', exact: true }).click();
      await page.getByRole('button', { name: /^(Events|Meetups)$/ }).click();
      await expect(page.locator('.radar-report')).toHaveCount(0);
      await expect(page.locator('.radar-event')).toHaveCount(3);
      await page.getByRole('button', { name: 'Reports', exact: true }).click();
      await expect(page.locator('.radar-report')).toHaveCount(4);
      await expect(page.locator('.radar-event')).toHaveCount(0);
      await page.getByRole('button', { name: 'All activity', exact: true }).click();
      await expect(page.locator('.radar-marker')).toHaveCount(7);
      await page.getByRole('button', { name: 'Show results' }).click();
      await page.locator('.radar-marker').first().focus(); await page.keyboard.press('Enter');
      await expect(page.locator('.radar-marker.is-selected')).toHaveCount(1); await settled(page);
      const selected = await page.locator('.radar-marker.is-selected').boundingBox();
      const sheet = await page.locator('.radar-results').boundingBox();
      expect(selected).not.toBeNull(); expect(sheet).not.toBeNull();
      if (name === 'mobile') {
        expect(selected!.y + selected!.height).toBeLessThan(sheet!.y);
        await expect(page.getByRole('link', { name: 'View report', exact: true })).toBeVisible();
        await page.screenshot({ path: `${out}/mobile-selected.png` });
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
        await page.getByRole('button', { name: 'Close selected place' }).click();
        await page.getByRole('button', { name: /View list/ }).click();
        await page.waitForTimeout(400); await page.screenshot({ path: `${out}/mobile-list.png` });
        await page.locator('.radar-results').hover(); await page.mouse.wheel(0, 700);
        await expect.poll(() => page.locator('.radar-results').evaluate(n => n.scrollTop)).toBeGreaterThan(0);
        await page.locator('.radar-report-link').focus(); await expect(page.locator('.radar-report-link')).toBeInViewport();
        await page.getByRole('button', { name: 'Back to map', exact: true }).click();
      } else {
        expect(selected!.y + selected!.height).toBeLessThan(sheet!.y);
        await page.getByRole('button', { name: 'Close selected place' }).click();
      }
      await page.getByRole('button', { name: 'Filters', exact: true }).click();
      const statusControl = page.getByRole('combobox', { name: /^Status/ });
      if (await statusControl.evaluate(n => n.tagName) === 'SELECT') await statusControl.selectOption('resolved');
      else { await statusControl.click(); await page.getByRole('option', { name: 'Resolved', exact: true }).click(); }
      await expect(page.locator('.radar-report')).toHaveCount(1);
      if (name === 'mobile') { await page.waitForTimeout(400); await page.screenshot({ path: `${out}/mobile-filters.png` }); }
      await page.keyboard.press('Escape'); await expect(page.locator('.radar-filters')).toHaveCount(0);
      await page.getByRole('button', { name: /Filters, 1 active/ }).click(); await page.getByRole('button', { name: 'Reset', exact: true }).click(); await page.getByRole('button', { name: 'Show results' }).click();
      await page.getByRole('searchbox').count();
      await page.getByRole('searchbox').fill('unmatched-map-qa-query'); await page.getByRole('button', { name: 'Search', exact: true }).click();
      await expect(page.locator('.radar-marker')).toHaveCount(0);
      await page.getByRole('button', { name: /View list/ }).click();
      await expect(page.getByRole('heading', { name: 'No activity found' })).toBeVisible();
      await page.getByRole('button', { name: 'Reset filters' }).click(); await expect(page.locator('.radar-marker')).toHaveCount(7);
      checks.push(`${name}: modes, selection, safe area, filters, empty results, reset, keyboard, accessibility`);
    }
    checks.push(`${name}: rendered without overflow`); await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage(); page.setDefaultTimeout(15000); page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript("Object.defineProperty(navigator, 'geolocation', { value: { getCurrentPosition: function(ok, fail) { fail({ code: 1 }); } } });");
  await page.goto(base); await settled(page); await page.getByRole('button', { name: 'Use my location', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Location could not be shared'); checks.push('location permission denial recovers');
  await page.route('**/api/explore?**', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Activity unavailable. Please retry.' }) }));
  await page.reload(); await expect(page.getByRole('alert')).toContainText('Activity unavailable'); await page.getByRole('button', { name: /View list/ }).click();
  await expect(page.getByRole('heading', { name: 'Activity couldn’t load' })).toBeVisible(); checks.push('API failure exposes retry and accessible list');
  await page.unroute('**/api/explore?**');
  await page.route('**/tiles.openfreemap.org/**', route => route.abort());
  await page.reload(); await expect(page.locator('.radar-map-failure')).toBeVisible(); checks.push('tile failure exposes retry without hiding results');
  await page.unroute('**/tiles.openfreemap.org/**'); await page.locator('.radar-map-failure button').click(); await settled(page); await expect(page.locator('.radar-map-failure')).toHaveCount(0); checks.push('tile retry restores map');
  await page.goto(base + '/report'); await page.getByRole('button', { name: /Trash Litter/ }).click(); await page.getByRole('button', { name: 'Continue', exact: true }).click();
  const photo = await sharp({ create: { width: 50, height: 50, channels: 3, background: '#193e32' } }).png().toBuffer();
  await page.locator('input[type=file]').last().setInputFiles({ name: 'local-qa.png', mimeType: 'image/png', buffer: photo });
  await expect(page.locator('.upload-preview')).toBeVisible(); await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.locator('.map-canvas').click({ position: { x: 150, y: 170 } }); await expect(page.locator('.radar-meetup-pin')).toHaveCount(1);
  await page.getByText('Enter coordinates', { exact: true }).click(); await page.getByLabel('Latitude', { exact: true }).fill('15.49'); await page.getByLabel('Longitude', { exact: true }).fill('73.82');
  await page.getByRole('button', { name: 'Set location' }).click(); await expect(page.getByLabel('Latitude', { exact: true })).toHaveValue('15.49'); checks.push('report picker and coordinate alternative preserved; no report submitted');
  await context.close(); expect(errors).toEqual([]);
  await writeFile(`${out}/map-qa.json`, JSON.stringify({ checks, errors, passed: true }, null, 2)); console.log(JSON.stringify({ passed: true, checks }, null, 2));
} finally { await browser.close(); }
