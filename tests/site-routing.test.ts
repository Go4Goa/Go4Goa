import assert from 'node:assert/strict';
import test from 'node:test';
import { appNavigationDenylist } from '../shared/site-routing.ts';

function receivesOfflineApp(path: string) {
  const url = new URL(path, 'https://go-goa-qa.vercel.app');
  return !appNavigationDenylist.some(rule => rule.test(url.pathname + url.search));
}

test('offline app routing leaves homepage, campaign links, credits and APIs on the network', () => {
  for (const path of ['/', '/?utm_source=community', '/?ref=friend#explore', '/index.html', '/index.html?ref=friend', '/credits.html', '/credits.html?ref=footer', '/api/health', '/api/explore?mode=events']) {
    assert.equal(receivesOfflineApp(path), false, path);
  }
});

test('offline app routing still covers the map and existing deep links', () => {
  for (const path of ['/map', '/map?query=Panaji', '/report', '/reports/example', '/events', '/events/example', '/resources/topics/waste', '/profile']) {
    assert.equal(receivesOfflineApp(path), true, path);
  }
});
