import type { Map as LeafletMap } from 'leaflet';
import type { Point } from '../../../shared/model';

// Adapted from Dizko mapSafeArea.ts, measuring actual overlay intersection.
export function focusPoint(map: LeafletMap, point: Point, zoom: number): Point {
  const rect = map.getContainer().getBoundingClientRect();
  let bottom = 0;
  for (const element of document.querySelectorAll<HTMLElement>('[data-map-bottom-overlay]')) {
    const overlay = element.getBoundingClientRect();
    if (overlay.width && overlay.left < rect.right && overlay.right > rect.left && overlay.top < rect.bottom && overlay.bottom > rect.top) {
      bottom = Math.max(bottom, rect.bottom - Math.max(rect.top, overlay.top));
    }
  }
  const toolbar = map.getContainer().closest('.radar-canvas')?.querySelector('.radar-search-row')?.getBoundingClientRect();
  const top = toolbar ? Math.max(0, toolbar.bottom - rect.top) + 12 : 0;
  const pixel = map.project([point.lat, point.lng], zoom).add([0, (bottom - top) / 2]);
  const target = map.unproject(pixel, zoom);
  return Number.isFinite(target.lat) && Number.isFinite(target.lng) ? target : point;
}

export interface MarkerPosition { id: string; x: number; y: number; }
// Dizko useDeOverlap's pairwise relaxation and geographic spring, extracted
// into a pure helper. Coincident points get a deterministic direction.
export function spreadMarkers(markers: MarkerPosition[], size: number): MarkerPosition[] {
  const result = markers.map(marker => ({ ...marker }));
  for (let iteration = 0; iteration < 32; iteration++) {
    let overlap = false;
    for (let i = 0; i < result.length; i++) for (let j = i + 1; j < result.length; j++) {
      const a = result[i], b = result[j];
      let dx = b.x - a.x, dy = b.y - a.y;
      if (Math.abs(dx) >= size + 6 || Math.abs(dy) >= size + 6) continue;
      overlap = true;
      if (Math.hypot(dx, dy) < 1) { const angle = (i + j * 2.4) * 2.39996; dx = Math.cos(angle); dy = Math.sin(angle); }
      const distance = Math.hypot(dx, dy);
      const push = Math.min(size + 6 - Math.abs(dx), size + 6 - Math.abs(dy)) * .65;
      a.x -= dx / distance * push; a.y -= dy / distance * push;
      b.x += dx / distance * push; b.y += dy / distance * push;
    }
    for (let i = 0; i < result.length; i++) {
      result[i].x += (markers[i].x - result[i].x) * .025;
      result[i].y += (markers[i].y - result[i].y) * .025;
    }
    if (!overlap) break;
  }
  return result;
}
