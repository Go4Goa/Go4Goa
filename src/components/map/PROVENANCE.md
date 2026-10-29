# Dizko map reuse

Adapted on 29 October 2026 at the user's explicit request to reuse Dizko's map code and services. Reference repository: `/Users/zakkrevitt/code/Dizko-Labs/EventChat`, commit `00c9d7cb927d53e04f513a6bfdc102e8fc7c156a`. The reference repository was read only.

- `markerUtils.ts` is copied from `web/src/components/map/markerUtils.ts`. The existing zoom sizing and minimum target constants are used by GO-GOA.
- `mapGeometry.ts` adapts `web/src/components/map/mapSafeArea.ts` and `web/src/hooks/useDeOverlap.ts`. It measures actual overlay intersections, separates coincident coordinates, and connects displaced markers to their public geographic positions.
- `FieldMap.tsx` adapts `RadarMap.tsx` resize invalidation, fractional zoom and deferred camera changes. GO-GOA keeps its existing Leaflet integration, without pulling in Dizko's app context or React Leaflet wrapper.
- `markers.ts` adapts `EventMarker.tsx` square image/fallback construction and slow-connection behavior. Only GO-GOA's public report thumbnails load. Missing media uses civic category icons; civic events use their actual date in Asia/Kolkata.
- `radar.css` initially reused Dizko's paper-map filter and `RadarPage.tsx` viewport layout. The user's subsequent clutter feedback replaces the filter with a sparse vector style and makes both the list and activity filters opt-in. The list remains an accessible sibling pane on wide screens and an overlay on phones.
- `src/services/maps.ts` provides one-shot, Goa-validated geolocation. GO-GOA's existing MapTiler tile proxy, geocoding and static preview endpoints remain available with its own configuration. No Dizko account, private API, credential, analytics or event data is connected.

This is focused authorized source reuse; it does not relicense the reference application. No offline or bulk tile fetching was added.

Simplification, 29 October 2026: `baseStyle.ts` is a local seven-layer MapLibre style using OpenFreeMap's OpenMapTiles source and Noto Sans Regular glyphs. The official Leaflet adapter preserves the existing marker, selection and location-picker behavior. OpenFreeMap, OpenMapTiles and OpenStreetMap attribution stays visible. This removes baked-in raster detail rather than attempting to blur or fade it away. The interactive base no longer requires the MapTiler tile proxy; existing geocoding/static preview services remain configured separately. The production CSP permits only the OpenFreeMap tile host in addition to same-origin connections, and the MapLibre worker is bundled on the same origin. See https://openfreemap.org/quick_start/ and https://github.com/maplibre/maplibre-gl-leaflet. All authored map labels use upright type.
