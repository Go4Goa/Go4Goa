# Goa activity map

Mode: Operate. Primary target: `src/pages/Explore.tsx`. Related targets: `src/components/FieldMap.tsx`, `src/components/map/radar.css`.

User direction, 29 October 2026: reuse Dizko's map implementation, then simplify further after the user's screenshot showed excessive chrome and map detail. Maximize visible geography, make non-map controls smaller, and remove unnecessary basemap detail. Retain civic content, current app identity and navigation.

THESIS: The map is the workspace, and a resident can move from a recognizable report or dated event marker to its real detail without losing their place.

OWN-WORLD: A quiet map with pale land and water, white main roads and sparse upright place labels. Compact Dizko-derived category and calendar markers retain civic green. The surrounding UI follows the current white app surface and upright shared typography.

FIRST VIEWPORT: An edge-to-edge map below a 48px header. One 46px search/filter row at the top; a 44px list button and map controls near the bottom. Results are closed by default at every viewport. Activity modes and other filters open only from the filter button. The list opens as a desktop sibling pane or a phone overlay; marker selection opens a compact preview.

STORY: Choose a report or event, inspect its marker, then open the civic detail or report an issue.

FORM: Code-led simplification of the user-pinned Dizko map. No new comp or concept round. A local seven-layer vector style removes buildings, POIs, transit, route shields, road labels and land-use patterns. Local streets appear only from zoom 15; village labels from zoom 13. Touch devices use pinch zoom with the location button retained.

QUALITY BAR: Match the actual Dizko working map in viewport use, square content markers, clear floating controls, visible attribution, unobscured selected points and accessible scroll lists.

INTERACTION: Filters and search update public reports and events. Marker selection centers within the unobscured map and opens a compact preview. The list button opens the full accessible list; Escape or the close button returns to the map. Overlapping markers spread with geographic connector lines. Events retain a readable date marker. Location is explicit and one-shot, validated within Goa, and never persisted. The report form retains tap, drag and coordinate entry.

FINISH: Inspect desktop, intermediate, tablet, phone and narrow/landscape layouts, selected place, filters and list. Check keyboard access, no text/controls clipped, meaningful loading/empty/error recovery, tile attribution, approximate-location and example labels. Own UI uses no italic/oblique type or decorative side stripe. The 1px divider between desktop map and results is structural. No generated raster assets.
