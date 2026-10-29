export type PosterSize = 'auto' | 'sm' | 'md' | 'lg' | 'xl'

export const BASE_ZOOM = 13
export const MIN_MARKER_TARGET_SIZE = 44

// Aspect for flyer markers on the map. Square (1.0) - every thumbnail
// renders as a uniform tile so the map reads as a consistent grid of
// pins instead of a ragged collage; varying portrait/landscape source
// art gets center-cropped via object-fit:cover in EventMarker.
// useDeOverlap reads the same constant so its collision rectangle
// matches the Leaflet iconSize the marker actually registers - they
// can't drift apart (an earlier 1.4-vs-square mismatch caused flyers
// to visually clip each other even when DeOverlap thought it had
// spaced them out).
export const MARKER_ASPECT = 1

// Base pixel sizes for each named poster size at the reference zoom level
const SIZE_MAP: Record<Exclude<PosterSize, 'auto'>, number> = {
  sm: 36,
  md: 52,
  lg: 72,
  xl: 96,
}

// When PosterSize is 'auto', map zoom level to a base size
const AUTO_ZOOM_SIZE: [number, number][] = [
  [10, 20],
  [11, 28],
  [12, 36],
  [13, 52],
  [14, 64],
  [15, 80],
  [16, 96],
  [17, 110],
  [18, 128],
]

function autoSizeForZoom(zoom: number): number {
  for (let i = AUTO_ZOOM_SIZE.length - 1; i >= 0; i--) {
    if (zoom >= AUTO_ZOOM_SIZE[i][0]) return AUTO_ZOOM_SIZE[i][1]
  }
  return AUTO_ZOOM_SIZE[0][1]
}

/**
 * Get the discrete (integer-zoom) scaled poster size in pixels.
 * Used for icon DOM construction - only rebuilds at zoom boundaries.
 */
export function getScaledSize(posterSize: PosterSize, zoom: number): number {
  if (posterSize === 'auto') return autoSizeForZoom(zoom)
  const base = SIZE_MAP[posterSize]
  // Scale relative to the base zoom level
  const factor = Math.pow(2, (zoom - BASE_ZOOM) * 0.4)
  return Math.round(base * factor)
}

/**
 * Get a smooth (fractional-zoom) scaled poster size in pixels.
 * Used for CSS transform interpolation between integer zoom steps.
 */
export function getScaledSizeSmooth(posterSize: PosterSize, zoom: number): number {
  if (posterSize === 'auto') {
    // Interpolate between the two nearest auto breakpoints
    for (let i = AUTO_ZOOM_SIZE.length - 1; i > 0; i--) {
      if (zoom >= AUTO_ZOOM_SIZE[i][0]) return AUTO_ZOOM_SIZE[i][1]
      if (zoom >= AUTO_ZOOM_SIZE[i - 1][0]) {
        const t = (zoom - AUTO_ZOOM_SIZE[i - 1][0]) / (AUTO_ZOOM_SIZE[i][0] - AUTO_ZOOM_SIZE[i - 1][0])
        return AUTO_ZOOM_SIZE[i - 1][1] + t * (AUTO_ZOOM_SIZE[i][1] - AUTO_ZOOM_SIZE[i - 1][1])
      }
    }
    return AUTO_ZOOM_SIZE[0][1]
  }
  const base = SIZE_MAP[posterSize]
  const factor = Math.pow(2, (zoom - BASE_ZOOM) * 0.4)
  return base * factor
}

// Resolution tier for the flyer image fetched by EventMarker. Two tiers
// on purpose - a coarse split means the browser/SW cache holds at most
// two entries per flyer, and we only cache-miss once when crossing the
// threshold zoom level (not every integer step).
//
//   • zoom < 15 (default): width=128, q=60. Markers are ≤ 64 px on
//     screen at city-level zoom; 128 px source covers DPR=2 comfortably
//     and a single flyer is ~3 kB. Fast bulk panning.
//   • zoom ≥ 15 (zoomed in): width=384, q=75. Markers grow to 80-128 px
//     and the eye starts noticing source blur on DPR=3 retina. 384 px
//     source is pixel-perfect for a 128 px marker at DPR=3. ~12 kB per
//     flyer; we only pay this once the user has zoomed in past the
//     city view, where there are far fewer markers on screen anyway.
//
// Tied to integer zoom because EventMarker rebuilds its icon DOM at
// integer-zoom boundaries already (createEventIcon is memoised on
// intZoom), so swapping the URL at the tier crossing piggybacks on
// the existing rebuild - no extra DOM churn.
export interface FlyerResolution {
  width: number
  quality: number
  retina: boolean
}

const HIGH_RES_FLYER_ZOOM = 15

export function getFlyerResolution(zoom: number): FlyerResolution {
  if (zoom >= HIGH_RES_FLYER_ZOOM) {
    return { width: 384, quality: 75, retina: false }
  }
  return { width: 128, quality: 60, retina: false }
}
