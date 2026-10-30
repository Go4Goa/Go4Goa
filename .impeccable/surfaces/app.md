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

## App-wide layout extension, 29 October 2026

THESIS: Carry the accepted Resources layout and spacing into the rest of the app so each task starts with clear page identity, nearby controls and open content.

OWN-WORLD: Retain the white canvas, civic green, upright Helvetica Neue, official UIArc controls and soft action shadows. Use shared page and workspace measures, responsive gutters, title-copy grouping and section spacing. The meetup composer now inherits the same typography, colors and 44px / 48px / 52px controls; only poster artwork retains its scoped Geist and Inter fonts and palette choices.

STORY: Browse meetups or Directory, choose a report category, review a report, create a meetup, or manage a profile with the same page rhythm. Resources and Directory lists share the standard measure; Directory details, report and meetup details, and editing workspaces retain the wider measure. Existing map behavior, privacy, provenance and browser-local Directory notes remain intact.

FIRST VIEWPORT: Standard content uses an 800px maximum width and workspaces use 1120px. Gutters are 40px by default, 20px at 760px and below, and 16px at 360px and below; top padding is 32px by default and 24px on phones. Shared section spacing is 32px by default and 28px on phones. Descriptions sit 8px below their heading, with a general 28px title-group gap before controls. Open event rows use 24px vertical padding. Report category choices align icon and text horizontally and stack on phones, with 112px desktop and 88px phone minimum heights. Profile, sign-in and reading sections use the same compact spacing vocabulary.

FORM: This is a code-led extension of an accepted layout. The user's explicit request to apply it across the app and ship to production supersedes the local-only restrictions in the dated dev sections above. Those sections remain as historical direction records. The normative shared tokens and their responsive variants are recorded in DESIGN.md; the sidecar extends those tokens without duplicating their primitives.

FINISH: The independent finish review returned `ship` for the nine-file implementation, with no material fixes, after reviewing 320px, 378px and 390px phones, 768px tablet and 1280px desktop. Ignored evidence in the authoring checkout is `.impeccable/review/ui-refinement/`: current `release-*.jpg` captures plus `app-events-mobile.jpg`, `app-report-mobile.jpg` and `app-layout-checks.json`. The checks record Helvetica Neue, zero italic elements and no horizontal overflow for Events, Directory, Resources and Profile at 320px, 768px and 1280px. This documents readiness and the current authorization; it does not claim the production deployment has completed.

### Profile follow-up

The user's final Profile direction prioritizes reports and meetups. The username and private-profile context lead into activity tabs and results; contribution points and history follow. A labeled UIArc-styled cog opens `/profile/preferences`, which contains notification toggles, email changes, export, deletion, sign-out, privacy and role-gated moderation access. Back preserves the selected activity tab. Original account handlers, verification conditions and deletion confirmation remain unchanged, and account controls are absent from the main Profile DOM.

The independent review returned `ship` with no material fixes, and source checks and the build passed. Current ignored captures in the same review folder are `profile-activity-mobile.jpg`, `profile-preferences-mobile.jpg` (390px by 844px), `profile-preferences-expanded-320.jpg` (scrolled), `profile-activity-desktop.jpg` and `profile-preferences-desktop.jpg` (1280px by 900px). This refinement reuses the shared tokens and does not establish completed deployment.

## Navigation order, 30 October 2026

The user specifies four bottom links, in order: Meetups, Map, Document and Profile. Document replaces the Report label while retaining the camera icon and `/report` route. Resources is removed from the dock; Resources and Directory routes remain intact with no unrelated dock item selected. The existing 560px row, 46px targets, typography, colors and safe-area behavior are preserved. The user approved this preview and authorized its production release on 30 October 2026.


## Resources restoration, 30 October 2026

The user requested restoring the Resources tab on the live site, superseding its removal in the earlier navigation revision. The dock now reads Meetups, Map, Document, Resources and Profile. Resources reuses the original book icon and `/resources` route; nested Resources and Directory routes keep it selected. Preserve the current compact styling, 560px row, 46px targets, upright labels, colors and safe-area behavior. No sign-in or other page changes are part of this restoration.
