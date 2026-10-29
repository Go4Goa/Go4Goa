import L from 'leaflet';
import type { Incident, CivicEvent } from '../../../shared/model';
import { categoryLabel, statusLabel } from '../../../shared/model';
export type MapItem = Incident | CivicEvent;
const paths: Record<string, string> = {
  trash: '<path d="M3 6h18M19 6l-1 14H6L5 6M9 6V3h6v3M10 10v6M14 10v6"/>',
  pothole: '<path d="m3 18 3-12h12l3 12M9 6l2 4-2 4 3 4M3 21h18"/>',
  streetlight: '<path d="M9 18h6M10 22h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 2H9s0-1-1-2"/>',
  water: '<path d="M12 3c-2 4-7 8-7 12a7 7 0 0 0 14 0c0-4-5-8-7-12Z"/>',
  electrical: '<path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z"/>',
  other: '<path d="m14 6 4-4 4 4-4 4M3 21l10-10M3 3l18 18"/>',
};
export function markerLabel(item: MapItem): string {
  return item.kind === 'incident'
    ? `${categoryLabel(item.category)}: ${item.description || item.title}. ${item.locationLabel}. ${statusLabel[item.status]}${item.privacy === 'blurred' ? '. Approximate location' : ''}${item.example ? '. Example' : ''}`
    : `${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(item.startsAt))}. ${item.title}. ${item.locationLabel}${item.example ? '. Example' : ''}`;
}
// EventMarker's square image/fallback pattern, minimum 44px target, and safe
// text nodes. Only GO-GOA's own public media is used, never Dizko imagery.
export function itemIcon(item: MapItem, size: number, selected: boolean): L.DivIcon {
  const tile = document.createElement('span'); tile.className = 'radar-marker-face';
  if (item.kind === 'event') {
    const month = document.createElement('span'), day = document.createElement('strong');
    month.textContent = new Intl.DateTimeFormat('en-IN', { month: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(item.startsAt));
    day.textContent = new Intl.DateTimeFormat('en-IN', { day: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(item.startsAt));
    tile.append(month, document.createTextNode(' '), day);
  } else {
    const icon = document.createElement('span'); icon.className = 'radar-marker-glyph';
    icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[item.category] || paths.other}</svg>`;
    tile.append(icon);
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (item.thumbnail && !connection?.saveData && !['slow-2g', '2g'].includes(connection?.effectiveType || '')) {
      try {
        const url = new URL(item.thumbnail, window.location.origin);
        if (url.origin === window.location.origin && url.pathname.startsWith('/api/media/')) {
          const img = document.createElement('img'); img.src = url.href; img.alt = ''; img.decoding = 'async';
          img.addEventListener('error', () => img.remove(), { once: true }); tile.append(img);
        }
      } catch { /* Keep the category icon for malformed media URLs. */ }
    }
    if (item.status === 'resolved') {
      const check = document.createElement('span'); check.className = 'radar-marker-resolved';
      check.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>'; tile.append(check);
    }
  }
  tile.setAttribute('aria-hidden', 'true');
  return L.divIcon({ className: `radar-marker ${item.kind === 'event' ? 'radar-event' : 'radar-report'}${selected ? ' is-selected' : ''}`, html: tile, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}
