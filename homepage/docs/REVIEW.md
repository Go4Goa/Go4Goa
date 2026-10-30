## verdict

1. **Signature motion: resolved.** `desktop-icon-travel.png` shows the four matching Map, Camera, Users, and BookOpen glyphs travelling above the app; `desktop-icon-landing.png` shows the completed toolbar. The code now measures source and destination DOM rectangles, restores current transforms, remeasures on refresh, and waits until all landings finish before the toolbar handoff. The builder's browser measurements report subpixel center alignment.
2. **Secondary material: resolved.** The travel capture visibly uses flat solid-color product tiles. The shared `.charm` rules no longer use inset highlights, gradient fills, or simulated metallic/plastic bevels; the glossy hero raster remains intact.
3. **Ground: resolved.** The updated `desktop-hero.png` has a neutral gray-to-white field. The source uses `#d9d9d9`, `#e8e8e8`, and neutral `#f8f8f8` paper, removing the previous green cast.
4. **Keyboard arrival: resolved.** `goToDemo` focuses the selected feature tab with `preventScroll` after Lenis completion and in the reduced-motion/native branch. The builder reports browser verification that both full-motion and reduced-motion actions focus `feature-tab-0`; this reviewer verified the implementation without using a browser.

No regressions from this fix batch were identified in the three supplied recaptures and changed source. This was a focused scoring pass against the four prior findings, not a new whole-surface audit.

## remaining

Clear. Ship covers the scored fixes, not the whole surface. The hero remains a transformed raster rather than a physical 3D scene. The supplied stills and source establish the transition's structure and endpoint, but do not independently establish the quality of live motion pacing, pauses, or reversal. This verdict covered the local visual fix batch. Publication integration is reviewed below.

disposition: ship


## publication integration addendum

The user subsequently authorized the homepage at `https://go-goa-qa.vercel.app/` with the operational map at `/map`. Reviewed the working-tree integration against `origin/main`, the two production-local captures, separate HTML entries, Vercel and Express fallbacks, internal map links, build assembly, PWA configuration, and QA route changes. No browser was used by this reviewer.

One concrete regression was found and resolved: Workbox matches navigation exclusions against `pathname + search`, so exact-only root/index/credits patterns routed campaign links such as `/?utm_source=community` into the app shell. The shared `appNavigationDenylist` now handles query strings; Vite imports that exact definition. Both targeted routing tests passed independently, covering excluded homepage/credits/API URLs and retained app deep links.

No remaining integration blocker was found in the reviewed scope. The production-local captures show the homepage and operational map as separate surfaces. Build assembly retains the app shell, manifest, and worker, rejects asset collisions, and checks referenced document assets. App navigation targets `/map`; the homepage's production CTA targets `/map`; the app wordmark uses a document navigation back to `/`. No API, authentication, or data logic changed in this integration diff.

This is a prepublication source and capture review. Hosted deployment verification remains the release step; the earlier raster and motion-pacing limitations still apply.

Publication disposition: ship
