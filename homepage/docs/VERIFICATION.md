# Local demo verification

Verified 30 October 2026 at http://127.0.0.1:4320. This is a frontend concept demo, with no production deployment or live submissions.

## Publication preparation

The user subsequently authorized publishing the homepage at the shared QA site's root and moving the map to `/map`. The combined production build passed, including separate document, asset collision, asset reference, manifest and offline-shell checks. After integration, all 48 unit tests, 18 integration tests and 15 workflow tests passed again.

The combined build was served locally at port 4330. Browser verification confirmed the homepage's main action loads the existing map at `/map`, with visible markers and the selected Map tab; the app wordmark returns to the homepage after service worker registration. The homepage previews retain their fictional-example labels. Hosted verification is recorded separately after publication.

## Build and regression checks

- Homepage TypeScript and production Vite build passed.
- Existing application unit tests: 48 passed.
- Existing application integration tests: 18 passed.
- Existing application production build passed, with its existing large map-bundle warning.
- `git diff --check` passed. Changes are scoped to the new `homepage/` directory.

## Render and behavior

Inspected the rendered page at 1440×1000, 390×844, and 320×740, including full-page desktop/mobile captures. No horizontal document overflow or clipped narrow headings. No browser errors or warnings were observed.

- Desktop pinned statement, icon travel, map reveal, and horizontal photographic story respond to scrolling. Reverse scroll restores earlier stages.
- The four traveling glyphs match their toolbar destinations. After landing, measured source-to-target differences were below 0.002 CSS pixels for each icon; the toolbar glyphs become visible after arrival. Destination measurements refresh with layout changes.
- Main CTAs reveal the product demo and focus the selected feature tab. Verified with motion enabled and paused.
- Map, Document, Meetups, and Resources tabs switch content; arrow keys navigate tabs.
- Example report categories and next-step preview work.
- Meetup poster palettes and the fictional RSVP toggle work.
- Notice / Connect / Act accordion updates the adjacent preview.
- Gallery controls change the visible photographs; FAQ disclosures expand.
- Mobile navigation opens, closes, and supports Escape with focus restored.
- Pausing motion removes both desktop pins and keeps all content and toolbar icons visible. Re-enabling motion restores the sequence. The app also honors the operating system reduced-motion preference.

## Visual requirements and review

Source and rendered DOM were checked for italic/oblique text and decorative side stripes; none were found. Asset provenance scan found six raster assets and zero missing sidecars. The Impeccable detector reported only font-choice warnings (Inter in the reference-led demo and Helvetica fallback on the credits page), with no mechanical layout finding. Inter is a self-hosted substitute for Butter's commercial typeface.

The independent review and the fixes it requested are recorded in `REVIEW.md`. Screenshots are stored in the repository's ignored `.impeccable/review/homepage/` review folder. Original reference JavaScript is research only, under the ignored `.reports/homepage-butter/` folder.

## Deliberate demo boundaries

The glossy hero is an original raster render animated with transforms, rather than a physics-driven 3D scene. Map imagery comes from the existing local app with fictional seed data. Other interactive panels are local React demonstrations, and photographs from the ActForGoa archive are labeled as historical examples. No report, event registration, account, message, or notification is created. Device Hub was not opened or used.

## Scroll pacing follow-up · 30 October 2026

The user's direction is to retain all scroll animations while removing unresponsive stretches. The icon-to-toolbar handoff remains the focal sequence; its movement, measured destinations, blur, and crossfade are unchanged. Short reading holds bracket the sequence. Existing controls and reduced-motion behavior remain in place, with no new animation dependencies.

Two causes were corrected: an initial no-op timeline hold plus a long final hold, and an unconditional `data-lenis-prevent` on every demo panel that trapped wheel gestures over non-scrolling previews. Lenis now detects actual nested scrolling, allowing longer panels to scroll internally and returning input to the page at their boundaries. Each selected panel mounts fresh so the library cannot reuse overflow measurements from the previous tab.

At 1280×720, the product pin now uses 972px instead of 1800px; the initial hold is about 37px instead of 372px. The horizontal story uses its measured 1242px travel distance instead of 1792px. Both pins retain smoothing with a shorter 0.35-second catch-up. Demo links land after the icon handoff finishes.

Browser checks at 1280×720 and 390×844 confirmed forward and reverse animation, the demo shortcut and focused tab, two desktop pins and no mobile pins, no horizontal document overflow, and pause/resume with all content visible. The Resources panel scrolled internally to its 136.5px limit before the next wheel gesture moved the page. No browser errors, italic/oblique text, or decorative side stripes were observed. Captures are under the ignored `.impeccable/review/scroll-pacing/` directory.

The shared app header no longer displays “Shared QA” on any route. Local demo labeling and all environment/access/data settings are unchanged. The combined production build and all 50 unit tests pass.
