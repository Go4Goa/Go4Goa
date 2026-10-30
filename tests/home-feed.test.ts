import test from 'node:test';
import assert from 'node:assert/strict';
import { mixFeed } from '../src/feed/mix.ts';
import type { FeedItem } from '../src/feed/content.ts';

const pool: FeedItem[] = ['meetups', 'reports', 'news', 'resources'].flatMap(category => Array.from({ length: 4 }, (_, i) => ({ id: `${category}-${i}`, category, kind: 'reading' } as FeedItem)));
test('mixed feed favors meetups, avoids adjacent subjects, and retains its prefix when appended', () => {
  for (let seed = 0; seed < 100; seed++) {
    const entries = mixFeed(pool, 200, seed);
    assert.deepEqual(entries.slice(0, 12), mixFeed(pool, 12, seed));
    assert.equal(new Set(entries.map(entry => entry.key)).size, 200);
    for (let i = 1; i < entries.length; i++) assert.notEqual(entries[i]!.item.category, entries[i - 1]!.item.category);
    const meetups = entries.filter(entry => entry.item.category === 'meetups').length;
    assert.ok(meetups >= 80 && meetups <= 101);
    for (const category of ['meetups', 'reports', 'news', 'resources']) {
      const subject = entries.filter(entry => entry.item.category === category);
      assert.equal(new Set(subject.slice(0, 4).map(entry => entry.item.id)).size, 4);
      assert.ok(subject.slice(4).every(entry => entry.repeated));
    }
  }
});
test('filtered and empty feeds stay usable; small pools avoid immediate repeats where possible', () => {
  assert.deepEqual(mixFeed([], 12, 1), []);
  const filtered = pool.filter(item => item.category === 'news');
  const entries = mixFeed(filtered, 100, 7);
  for (let i = 1; i < entries.length; i++) assert.notEqual(entries[i]!.item.id, entries[i - 1]!.item.id);
  assert.equal(mixFeed([pool[0]!], 20, 1).length, 20);
  assert.notDeepEqual(mixFeed(pool, 16, 1), mixFeed(pool, 16, 2));
});
