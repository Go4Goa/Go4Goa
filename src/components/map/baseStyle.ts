import type { StyleSpecification } from 'maplibre-gl';

// Deliberately sparse OpenMapTiles style: no buildings, POIs, route shields,
// transit, land-use patterns or road labels. Local streets appear only up close.
export function quietMapStyle(): StyleSpecification {
  return {
    version: 8,
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: { geography: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' } },
    layers: [
      { id: 'land', type: 'background', paint: { 'background-color': '#f5f6f3' } },
      { id: 'parks', type: 'fill', source: 'geography', 'source-layer': 'park',
        paint: { 'fill-color': '#e9eee5', 'fill-opacity': .55 } },
      { id: 'water', type: 'fill', source: 'geography', 'source-layer': 'water',
        filter: ['!=', ['get', 'brunnel'], 'tunnel'], paint: { 'fill-color': '#dce7e7' } },
      { id: 'local-streets', type: 'line', source: 'geography', 'source-layer': 'transportation', minzoom: 15,
        filter: ['match', ['get', 'class'], ['minor', 'service'], true, false],
        paint: { 'line-color': '#fff', 'line-width': ['interpolate', ['linear'], ['zoom'], 15, 1, 19, 5] } },
      { id: 'main-roads', type: 'line', source: 'geography', 'source-layer': 'transportation',
        filter: ['match', ['get', 'class'], ['motorway', 'trunk', 'primary', 'secondary', 'tertiary'], true, false],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#fff', 'line-width': ['interpolate', ['linear'], ['zoom'], 8, .6, 13, 2.5, 17, 7, 19, 12] } },
      { id: 'towns', type: 'symbol', source: 'geography', 'source-layer': 'place',
        filter: ['match', ['get', 'class'], ['city', 'town'], true, false],
        layout: { 'text-field': ['coalesce', ['get', 'name:latin'], ['get', 'name']], 'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 8, 12, 14, 14], 'text-padding': 24, 'text-max-width': 10 },
        paint: { 'text-color': '#626d68', 'text-halo-color': '#f5f6f3', 'text-halo-width': 1.5 } },
      { id: 'villages', type: 'symbol', source: 'geography', 'source-layer': 'place', minzoom: 13,
        filter: ['==', ['get', 'class'], 'village'],
        layout: { 'text-field': ['coalesce', ['get', 'name:latin'], ['get', 'name']], 'text-font': ['Noto Sans Regular'],
          'text-size': 11, 'text-padding': 32, 'text-max-width': 10 },
        paint: { 'text-color': '#69746e', 'text-halo-color': '#f5f6f3', 'text-halo-width': 1.5 } },
    ],
  };
}
export const mapAttribution = '<a href="https://openfreemap.org/">OpenFreeMap</a> · © <a href="https://openmaptiles.org/">OpenMapTiles</a> · © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
