# Civic app

Mode: Operate. Established world: Act For Goa. Code-led app screen; no standing build-path preference recorded.

## Direction contract

THESIS: A resident can see what needs attention and take the next practical action in one place. The brief explicitly pins the map as the operational center.

OWN-WORLD: Actual Act For Goa paper/green tokens, upright Manrope, UIArc 4px controls, shadcn switches, open rows and square evidence images. The daylight use scene calls for a light surface with high-contrast green actions.

STORY: Explore reports and events, inspect one, then report, join or organize. State and provenance remain visible without explanatory filler.

FIRST VIEWPORT: A compact wordmark header, issue/event filter, a Goa map, and nearby action rows. Desktop places list and map side by side. Mobile gives the map a bounded height and the user-requested liquid-glass bottom navigation for Map, Report, Events and Profile. Following the user’s 29 October correction, navigation follows Apple HIG tab-bar proportions: a compact 64px floating glass capsule, 24px icons, 11px semibold labels, a quiet neutral selection surface and green selection tint. Wider screens place icons beside labels in a 52px bar. Touch targets remain at least 44px, safe-area insets are respected, and reduced-transparency and increased-contrast modes use opaque material. A large dark green selected block is explicitly rejected. A pin selects the matching list item, connecting place to action. Profile links points history to good reports, attendance, organizing and event bookmarks.

FORM: Brief-pinned map/list workspace, no alternative visual-world selection. Concept seed: not applicable to the user-pinned structure and precisely specified navigation refinement. Motion is limited to control feedback and map/list selection and honors reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Navigation dev revision, 29 October 2026

THESIS: A compact dock keeps the four destinations available while giving space back to the map. The user rejected the floating capsule and selected Dizko mobile navigation as the reference.

OWN-WORLD: Follow the current EventChat BottomNav implementation: flat full-width warm-white surface, a structural top hairline, 22px Lucide outline icons, 11px upright labels. Keep GO-GOA green for the current destination and muted green-gray for inactive links.

STORY: Map, Report, Events and Profile stay persistent links with unchanged destinations and current-page semantics. Focus and direct press feedback remain visible.

FIRST VIEWPORT: A 46px row plus a 1px rule and at least 6px of bottom safe-area clearance sits flush to the viewport bottom. Four equal targets occupy a centered row up to 448px wide. Map attribution clears the bar. No floating capsule or selected background.

FORM: User-pinned Dizko reference, code-led local iteration. Source inspected read-only at /Users/zakkrevitt/code/Dizko-Labs/EventChat/web/src/components/layout/BottomNav.tsx and bottomNavMetrics.ts, plus web/src/index.css. This supersedes the earlier glass navigation direction for this dev revision. No deployment, push or release until the user explicitly requests it. DESIGN.md remains the last baseline until the user accepts this iteration.

FINISH: Inspect the live dev render and navigation behavior. This is a local preview, not a release or whole-app approval.

## UIArc and Helvetica dev refinement

THESIS: Civic tasks read as clear sections with one obvious next action, rather than nested cards.
OWN-WORLD: User-pinned Helvetica Neue, upright regular body and medium headings, white surfaces, soft offset shadows and rounder UIArc buttons. The supplied Airbnb screenshot is a treatment reference, not a content or exact-layout comp. Green carries major CTAs; green remains the civic identity and map-selection color.
STORY: Browse map or events, inspect relevant information, then report or participate. Existing privacy, provenance, examples and functions remain.
FIRST VIEWPORT: One map toolbar holds search and activity selection. A plain bottom summary replaces the floating result card. Events use open rows and distinct section spacing; primary actions earn saturated color.
FORM: Code-led refinement with official UIArc controls throughout. Existing accepted compact navigation stays. No new visual-world interview required for these explicit reference and typography constraints.
FINISH: Inspect dev renders and key interactions; document the local revision. No deployment, push or release until explicitly requested.
