import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spreadMarkers } from '../src/components/map/mapGeometry';
import { getScaledSize, getScaledSizeSmooth } from '../src/components/map/markerUtils';

test('coincident map reports separate without corrupting their geographic input', () => {
  const points = [{ id: 'report', x: 100, y: 100 }, { id: 'event', x: 100, y: 100 }];
  const result = spreadMarkers(points, 52);
  assert.ok(Math.max(Math.abs(result[0].x - result[1].x), Math.abs(result[0].y - result[1].y)) > 52);
  assert.deepEqual(points, [{ id: 'report', x: 100, y: 100 }, { id: 'event', x: 100, y: 100 }]);
  assert.deepEqual(spreadMarkers(points, 52), result);
});
test('distant markers retain their positions and dense groups remain finite', () => {
  const apart = [{ id: 'a', x: -200, y: 0 }, { id: 'b', x: 200, y: 0 }];
  assert.deepEqual(spreadMarkers(apart, 52), apart);
  const dense = Array.from({ length: 20 }, (_, i) => ({ id: String(i), x: 100, y: 100 }));
  assert.ok(spreadMarkers(dense, 64).every(point => Number.isFinite(point.x) && Number.isFinite(point.y)));
});
test('Dizko marker zoom sizing remains monotonic across fractional zooms', () => {
  for (let zoom = 10; zoom < 18; zoom += .25) assert.ok(getScaledSizeSmooth('auto', zoom + .25) >= getScaledSizeSmooth('auto', zoom));
  assert.equal(getScaledSize('auto', 13), 52);
});
test('the first map view frames all returned places at every viewport height', async () => {
  const source = await readFile(new URL('../src/components/FieldMap.tsx', import.meta.url), 'utf8');
  assert.match(source, /m\.fitBounds\(L\.latLngBounds\(items\.map/);
  assert.doesNotMatch(source, /m\.getSize\(\)\.y\s*<\s*550/);
});
