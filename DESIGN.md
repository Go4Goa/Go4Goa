---
name: "GO-GOA"
description: "Clear civic tasks in white sections, Helvetica Neue and official UIArc controls."
colors:
  paper: "#ffffff"
  foreground: "#222b26"
  green: "#193e32"
  accent: "#177548"
  accent-strong: "#125c39"
  muted: "#606761"
  line: "#e5e8e5"
  pale: "#f2f5f2"
  white: "#ffffff"
  danger: "#963c2b"
  control-track: "oklch(89.5% 0 0)"
  poster-ocean: "#214d65"
  poster-clay: "#883e2e"
  poster-plum: "#5b3659"
  poster-ink: "#262e2b"
  poster-sand: "#f0e5cd"
typography:
  headline:
    fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.035em"
  headline-mobile:
    fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.035em"
  title:
    fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  section-title:
    fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  body:
    fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.4
  nav-label:
    fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: "12px"
    letterSpacing: "0"
  map-results-title:
    fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  map-selection-title:
    fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "-0.025em"
  map-row-title:
    fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "-0.02em"
  map-body-small:
    fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.6
  map-label:
    fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  map-chip-label:
    fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.6
  map-caption:
    fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.6
  map-event-month:
    fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: 1.05
  map-event-day:
    fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.05
  nav-label-active:
    fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: "12px"
    letterSpacing: "0"
  meetup-poster-title:
    fontFamily: "\"Geist Variable\", sans-serif"
    fontSize: "clamp(2rem, 3vw, 2.75rem)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  meetup-poster-title-mobile:
    fontFamily: "\"Geist Variable\", sans-serif"
    fontSize: "36px"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  meetup-poster-purpose:
    fontFamily: "\"Inter Variable\", sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
  meetup-poster-detail:
    fontFamily: "\"Inter Variable\", sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  control: "12px"
  pill: "9999px"
  status: "4px"
  media: "14px"
  participation: "24px"
  map-media: "9px"
  map-type-chip: "8px"
  map-search-action: "0 13px 13px 0"
  map-marker: "11px"
  map-toolbar: "14px"
  map-filter: "14px"
  map-sheet: "14px"
spacing:
  space-1: "0.25rem"
  space-2: "0.5rem"
  space-3: "0.75rem"
  space-4: "1rem"
  space-5: "1.25rem"
  space-6: "1.5rem"
  space-8: "2rem"
  space-10: "2.5rem"
  page-width: "800px"
  workspace-width: "1120px"
  page-gutter: "40px"
  page-gutter-mobile: "20px"
  page-gutter-narrow: "16px"
  page-padding-top: "32px"
  page-padding-top-mobile: "24px"
  section-gap: "32px"
  section-gap-mobile: "28px"
  title-description-gap: "8px"
  page-title-gap: "28px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "48px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "48px"
  button-danger:
    backgroundColor: "{colors.white}"
    textColor: "{colors.danger}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "48px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "48px"
  status:
    backgroundColor: "{colors.pale}"
    textColor: "{colors.green}"
    rounded: "{rounded.status}"
    padding: "3px 7px"
  participation:
    backgroundColor: "{colors.white}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.participation}"
    padding: "28px"
  segmented-control:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "3px"
  tab-bar:
    backgroundColor: "{colors.white}"
    textColor: "{colors.muted}"
    typography: "{typography.nav-label}"
    padding: "0 0 max(env(safe-area-inset-bottom, 0px), 6px)"
    height: "calc(47px + max(env(safe-area-inset-bottom, 0px), 6px))"
    width: "100%"
  switch:
    backgroundColor: "{colors.control-track}"
    rounded: "{rounded.pill}"
    padding: "3px"
    height: "24px"
    width: "42px"
  map-search:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "0"
    height: "44px"
  map-tool:
    backgroundColor: "transparent"
    textColor: "{colors.green}"
    rounded: "{rounded.map-search-action}"
    padding: "0"
    height: "44px"
    width: "44px"
  map-type-chip:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.map-chip-label}"
    rounded: "{rounded.map-type-chip}"
    padding: "0 8px"
    height: "44px"
  map-type-chip-selected:
    backgroundColor: "{colors.pale}"
    textColor: "{colors.foreground}"
    typography: "{typography.map-chip-label}"
    rounded: "{rounded.map-type-chip}"
    padding: "0 8px"
    height: "44px"
  map-report-marker:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
    rounded: "{rounded.map-marker}"
  map-event-marker:
    backgroundColor: "{colors.white}"
    textColor: "{colors.green}"
    rounded: "{rounded.map-marker}"
  map-location-control:
    backgroundColor: "{colors.white}"
    textColor: "{colors.green}"
    rounded: "{rounded.control}"
    height: "44px"
    width: "44px"
  map-results-sheet:
    backgroundColor: "{colors.white}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.map-sheet}"
    padding: "0 16px"
  map-selection-preview:
    backgroundColor: "{colors.white}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.map-sheet}"
    padding: "0 14px"
    width: "360px"
  map-results-sidebar:
    backgroundColor: "{colors.white}"
    textColor: "{colors.foreground}"
    padding: "0 20px"
    width: "340px"
  map-list-toggle:
    backgroundColor: "{colors.white}"
    textColor: "{colors.foreground}"
    typography: "{typography.map-label}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "44px"
  map-filter-panel:
    backgroundColor: "{colors.white}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.map-filter}"
    padding: "12px 16px 16px"
    width: "340px"
  button-primary-hover:
    backgroundColor: "{colors.accent-strong}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "48px"
  map-toolbar:
    backgroundColor: "{colors.white}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.map-toolbar}"
    padding: "0 0 0 12px"
    height: "46px"
    width: "400px"
  meetup-poster:
    backgroundColor: "{colors.green}"
    textColor: "{colors.paper}"
    typography: "{typography.meetup-poster-detail}"
    rounded: "0"
    padding: "28px"
---

# Design System: GO-GOA

## Overview

**Creative North Star: "Act For Goa civic workspace"**

GO-GOA keeps Act For Goa's civic green identity while intentionally replacing the earlier paper-and-Manrope treatment with the user's requested white canvas, Helvetica Neue and official UIArc controls. The supplied Airbnb image guides the clean section spacing, softer depth and rounder actions. It is a treatment reference, not an exact layout or content specification.

Open rows and clear sections carry civic information. Action green identifies major next actions, while the deeper civic green remains the identity, navigation and map-selection color. Soft offset shadows separate controls and temporary layers without wrapping every section in a card.

This record captures the 29 October 2026 extension of the accepted Resources layout and spacing across the app, retaining the compact full-width dock and map search/filter row. The user explicitly requested this extension and shipment to production, superseding the earlier local-preview restriction. The independent finish review returned `ship` for the nine-file implementation without material fixes. The subsequent Profile refinement prioritizes reports and meetups, with account controls on a separate preferences page; its independent finish review also returned `ship` without material fixes. This records the reviewed release candidate; it does not claim deployment has completed.

The map retains its code-led reuse of Dizko's map composition and behavior, with GO-GOA civic content. Its surface contract is `.impeccable/surfaces/map.md`; the latest shared treatment is recorded in `.impeccable/surfaces/app.md`. This refresh updates the intentional UI changes and preserves the map's behavior and provenance.

**Key Characteristics:**

- White canvas, dark readable text and retained civic-green identity.
- Upright Helvetica Neue with regular body, medium labels and stronger key headings.
- Open rows and section spacing instead of repeated nested containers.
- Shared page widths, responsive gutters and title-copy grouping across lists, forms, profile and reading surfaces.
- Round UIArc actions, green major CTAs and soft offset shadows.
- A compact full-width bottom dock with visible labels.
- Visible provenance, example labels and accessible map/list alternatives.
- A sparse vector map with compact square content markers, one search/filter row and results that open on request as a sibling pane or phone sheet.
- The same customizable meetup poster in creation and the dedicated page, retaining Forest and Solid defaults and scoped upright Geist and Inter typography.

Source evidence: `src/styles.css`, `src/components/common.tsx`, `src/components/tab-bar.css`, `src/components/map/radar.css`, `src/components/FieldMap.tsx`, `src/components/map/markers.ts`, `src/components/map/baseStyle.ts`, `src/components/map/mapGeometry.ts`, `src/pages/Explore.tsx` and the official UIArc component styles. `src/main.tsx` loads the Arc foundation before the GO-GOA theme. Shared-theme captures remain `.impeccable/review/ui-refinement/events-mobile.jpg`, `report-360.jpg` and `events-desktop.jpg`. Current map captures are `.impeccable/review/desktop.png`, `mobile.png`, `short-phone.png`, `user-459.png`, `narrow.png`, `tablet.png`, `intermediate.png`, `landscape.png`, `mobile-selected.png`, `mobile-list.png` and `mobile-filters.png`; the map images in `ui-refinement/` are historical. Captures and source-backed tokens do not establish final QA completion.

The shared meetup poster and detail-page evidence is `src/components/MeetupPoster.tsx`, `src/components/meetup-poster.css`, `src/components/ShareMeetup.tsx`, `src/pages/Events.tsx` and `src/pages/meetup-detail.css`. The approved creation direction is `.impeccable/surfaces/meetup-create.md`. Saved detail renders are `.impeccable/review/meetup-detail-desktop.png`, `meetup-detail-mobile.png` and `meetup-detail-narrow.png`.

Graphic customization is defined by `shared/meetup-poster.ts`, `src/components/PosterControls.tsx`, `src/components/poster-controls.css` and `src/components/MeetupGraphicEditor.tsx`. The source-backed color and pattern choices extend the same poster; they do not change the app theme. Control captures are `.impeccable/review/poster-controls-desktop.png`, `poster-controls-mobile.png` and `poster-controls-narrow.png`.

The app-wide layout extension is grounded in `src/styles.css`, `src/components/common.tsx`, `src/pages/Events.tsx`, `src/pages/Report.tsx`, `src/pages/ReportDetail.tsx`, `src/pages/Directory.tsx`, `src/pages/directory.css`, `src/pages/resources.css` and `src/pages/event-create.css`. Its current ignored review evidence lives in `.impeccable/review/ui-refinement/` in the authoring checkout: the `release-*.jpg` captures cover Directory, creation and its calendar, report selection and detail, events, profile, Resources, privacy and sign-in; `app-events-mobile.jpg` and `app-report-mobile.jpg` cover the 378px phone. The independent finish review covered 320px, 378px and 390px phones, 768px tablet and 1280px desktop. `app-layout-checks.json` records Helvetica Neue, no horizontal overflow and zero italic elements on Events, Directory, Resources and Profile at 320px, 768px and 1280px. Earlier capture references above remain historical snapshots, not evidence of this extension's deployment.

The final Profile organization is implemented in `src/pages/Profile.tsx`, `src/App.tsx` and the scoped styles in `src/styles.css`. Its current captures in the same ignored review folder are `profile-activity-mobile.jpg` and `profile-preferences-mobile.jpg` at 390px by 844px, `profile-preferences-expanded-320.jpg` in its scrolled state, and `profile-activity-desktop.jpg` and `profile-preferences-desktop.jpg` at 1280px by 900px. Source checks and the build passed; the review verified that Back preserves the selected activity tab and export controls are absent from the main Profile DOM.

## Colors

White and softly tinted neutral surfaces keep information clear; action green and deeper civic green serve distinct roles.

### Primary

- **Action green** (`accent`): major next actions, including primary UIArc buttons. Search-this-area uses a white surface and civic-green text.
- **Deep green** (`accent-strong`): primary action hover state.

### Secondary

- **Civic green** (`green`): the wordmark, navigation selection, map markers, focus outlines and checked selection controls.
- **Danger clay** (`danger`): destructive actions, validation errors and moderation redaction outlines; semantic feedback is paired with words.

### Neutral

- **White canvas and surface** (`paper`, `white`): the canvas, controls and panels. The legacy token name `paper` now resolves to white.
- **Dark foreground** (`foreground`): main content and headings.
- **Quiet gray-green** (`muted`): secondary text and inactive labels.
- **Soft rule** (`line`): structural dividers and control borders.
- **Muted surface** (`pale`): selected segments, hover feedback and quiet support surfaces.
- **Switch track** (`control-track`): the UIArc switch's neutral unchecked state, preserving its source OKLCH syntax.

**The Action Color Rule.** Use action green for the major next action and retain the deeper civic green for identity, navigation and map selection.

The sidecar's synthesized tonal ramps are swatch previews only, not additional production colors. Status variants retain their implementation-specific semantic colors and written state labels. Unused foundation accents are not part of this palette.

Meetup posters offer six predefined palettes. Forest reuses civic green; Ocean, Clay, Plum, Ink and Sand use the scoped `poster-*` tokens. Forest, Ocean, Clay, Plum and Ink pair with white text; Sand pairs with civic-green text. These combinations are fixed choices for the graphic, with Forest and Solid as the unchanged default. Pattern ink is white at 8% opacity on the five dark palettes and civic green at 6% on Sand.

## Typography

**Content and Navigation Font:** Helvetica Neue, with Helvetica, Arial and sans-serif fallbacks, including the meetup composer and its controls. Only the shared poster artwork remains a scoped exception: it uses upright Geist Variable headings and Inter Variable supporting copy in both creation and the dedicated page.

Regular body text, medium labels and stronger key headings keep the interface readable without the previous uniformly heavy treatment. The core weight roles are regular (400), medium (500) and semibold (600); the current destination in the compact dock is a scoped bold (700) exception.

### Hierarchy

- **Headline:** the frontmatter roles record general desktop and mobile h1 sizing. The event-page mobile heading now uses the mobile headline role and wraps across the available measure. Page descriptions stay with their heading at the title-description gap; the action remains a separate sibling.
- **Title:** section headings use the title role. Most mobile h2 elements reduce to 21px; map results and selected-place previews retain their scoped roles at every width.
- **Section title:** h3 and form legends use the section-title scale.
- **Body:** the base role has a maximum paragraph measure of 70ch.
- **Control label:** the label role describes UIArc buttons and field labels; compact metadata uses the observed 11px to 13px range.
- **Navigation label:** visible upright labels sit beneath 22px icons at every width; the active label uses its scoped weight role.
- **Map hierarchy:** list headings, selected-place titles, report row titles, supporting copy, list controls and example metadata retain scoped `map-*` roles. Activity labels keep the same compact size inside the filter panel at every width; the search input remains 16px. Calendar markers use distinct month and day roles, with dates formatted in Asia/Kolkata.
- **Meetup poster:** scoped `meetup-poster-*` roles preserve the existing preview hierarchy. The title uses the mobile role at 700px and below. Secondary date, time, location and materials text is 12px; activity text is 13px. Long titles and supporting text wrap, and intentional line breaks remain visible.

**The Upright Type Rule.** Use upright type throughout: Helvetica Neue for the shared app and composer, with scoped Geist and Inter only in meetup poster artwork. Weight, size and spacing carry emphasis; never use italic or oblique styling.

## Layout

General pages use the centered `page-width` maximum, including narrow forms, profile, the admin queue, Resources and the Directory list. Report and meetup detail pages, a report moderation workspace and Directory detail use the wider `workspace-width` maximum. The meetup composer retains the same wide maximum and adopts the shared page padding. Outside the map route, the header still expands to 1440px.

The frontmatter's `page-gutter`, `page-padding-top` and `section-gap` entries describe the default shared custom properties. Their mobile variants apply at 760px and below, with the narrow gutter applying at 360px and below. General pages retain 24px bottom padding. The shared title-description gap keeps introductory copy with the page identity; the page-title gap separates that group from controls. Events stack the title group and primary action on phones and use a 24px gap below the title group; Profile uses an 8px title gap for the adjacent privacy note.

**The Shared Page Rhythm Rule.** Use the shared page-width, workspace-width, page-gutter, page-padding-top and section-gap tokens for app content. Apply their mobile and narrow variants at the documented breakpoints, group each description with its heading, and keep lists open on the page canvas.

The map route occupies the viewport beneath a 48px header and above `--bottom-nav-height`, without the general page container or bottom padding. Results are closed by default at every width. A 44px minimum-height View list button sits 12px from the left and 28px above the map bottom. Opening it above 600px width adds a 340px sibling pane with a structural divider, no gap and independent scrolling beneath a sticky heading.

At 600px width and below, the requested list is a floating sheet inset 12px horizontally, 70px from the map top and 28px from its bottom. Selecting a marker closes the list and opens a compact preview, up to 360px wide and 45% of the map height; phones use the available width within the same side insets. The measured preview height lifts map utilities above it. Camera positioning measures the search row and intersecting bottom overlay to keep the selected place visible. The initial activity fit on map canvases shorter than 550px reserves top and bottom overlay space. At widths of at least 600px and heights of at most 600px, map utilities arrange horizontally. Coarse-pointer devices hide zoom buttons and retain pinch zoom and location. The View list button remains available on narrow phones.

Search and the filter trigger occupy one 46px-high white row, up to 400px wide, inset 12px from the map top and sides. Search and filter actions have 44px targets, with a structural vertical divider before the filter trigger. Activity modes and other filters appear only in the temporary 340px-wide panel below the row; its width is capped by the available space. Opening filters closes the full list and temporarily hides the preview and list toggle.

**The Map Owns Its Viewport Rule.** Keep the map's available height derived from its header and navigation, open results only on request, and account for overlay space when framing activity or focusing a selected place.

The full-width bottom dock sits flush with the viewport. Five equal destinations occupy a centered row up to 560px wide. Each link is 46px tall, above the larger of the safe-area inset and 6px; a 1px structural rule separates navigation from content. General pages reserve the dock height plus 40px of bottom clearance. The portable tab-bar height token includes that rule and safe-area clearance.

Spacing follows the inherited 4px rhythm where practical. Open incident and resource rows use structural top borders and 20px to 24px vertical padding. Event rows use 24px vertical padding, medium titles and a 44px row-arrow target at every width; the first feed row keeps its open leading edge. Evidence thumbnails have rounded corners; current incident thumbnails are rectangular rather than a mandated square aspect ratio. Report detail images stay within the content column, with a 16px radius, and the report description is readable 18px body copy rather than a heading.

The dedicated meetup page places the shared green poster beside the existing participation panel using the detail page's columns and a 48px gap. At 760px and below, the poster, host information, directions and participation section stack with a 32px column gap. Back and Share meetup actions sit above the content in a wrapping row. The poster's padding reduces to 24px at 900px and below; its minimum height remains 360px on the dedicated page. The creation preview keeps its existing 300px intermediate and 320px mobile minimum heights, and stacks below the editor at 700px. The composer uses a 48px desktop column gap, reducing to 36px at 900px and below, then a 40px stacked gap at 700px and below. Composer sections use 32px spacing, reducing to 28px at its stacking breakpoint.

Profile begins with the username and private-profile context, then activity tabs and their report or meetup results. Contribution points and history follow the results. Account settings occupy the separate preferences page, using the existing open sections and shared spacing. Sign-in fields use a 24px stack gap. Privacy headings use the responsive section-gap token with 12px between heading and body. These align the supporting account and reading flows with the primary app rhythm.

## Elevation & Depth

Open content sections stay on the white canvas. Soft offset shadows distinguish primary actions, the single map toolbar and temporary panels. The compact dock stays opaque and flat, with a structural top rule. Do not restore the superseded glass capsule.

### Shadow Vocabulary

- **Resting control:** `0 2px 5px rgb(22 37 29 / 5%), 0 7px 20px rgb(22 37 29 / 7%)`, used by primary actions, applicable secondary hover states, shared search surfaces, unselected report category choices and the desktop participation panel.
- **Floating panel:** `0 8px 28px rgb(22 37 29 / 13%)`, used by select menus and the map filter panel.
- **Map utility control:** uses the resting-control shadow for zoom, location, View list and search-this-area.
- **Map marker and cluster:** `0 2px 6px rgb(25 62 50 / 18%)`, used for compact square markers and circular count clusters. The draggable location pin uses `drop-shadow(0 3px 3px rgb(25 62 50 / 22%))`.
- **Map preview and phone list:** use the floating-panel shadow. The requested desktop sibling pane remains flat.

**The Open Sections Rule.** Use spacing and structural rules for content hierarchy. Reserve soft depth for actions, shared toolbars and temporary layers instead of adding a container around each group.

## Shapes

Form controls use the control radius, while buttons use the pill radius. The map search/filter row has one rounded outline; its inner search and filter actions have no independent surface or shadow. Activity controls appear inside the temporary filter panel. Evidence thumbnails, calendar tiles and participation surfaces use the softer source-backed corner vocabulary. The mobile participation area becomes an open section with a top divider.

Map report markers remain square with rounded corners and show a photo or civic category icon. Event markers share that silhouette and show their month and date. Count clusters and resolved checks remain circular; the location picker uses a draggable pin. Status labels retain their compact source-specific corners. The full-width bottom dock has square edges.

Structural dividers may separate rows or sections. Decorative accent stripes along the side of a card, notice, quote or other content block are prohibited.

## Components

### Buttons

Official UIArc buttons use round silhouettes and medium labels. Primary actions are green with white text and deepen on hover; secondary buttons are white with a rule border and dark text; ghost buttons are transparent with muted text; danger buttons retain an outlined silhouette. Medium controls have a 48px minimum height, with 44px and 52px variants. Keyboard focus uses a green outline with an offset. Press, disabled, loading and reduced-motion states remain from UIArc. The React Router `ButtonLink` adapter shares the same UIArc variant classes and keeps link semantics.

### Chips

Status labels use UIArc Badge with compact upright medium text and existing written semantic states. These are informative labels, not decorative eyebrows. Example labels and provenance remain visible wherever fictional development content appears. Activity selection uses UIArc SegmentedControl, with a pale selected segment and dark text.

### Cards / Containers

Use open, horizontally separated rows for reports, resources and activity. A desktop participation panel is a bounded exception: white surface, rounded corners, resting shadow, 28px padding and an 18px content gap. On mobile it becomes an open section with a top rule and no shadow. Informational notices and receipts sit in the content flow without side stripes.

Report category choices remain functional selection buttons: icon beside a left-aligned title and supporting line, with 112px minimum height and 20px padding on desktop. At 760px and below, the two choices stack with a 12px gap, 88px minimum height and 16px padding. Unselected choices use the resting shadow; the chosen state removes it and keeps the existing selected treatment.

### Inputs / Fields

Official UIArc Input, Textarea, Select and SearchField share the Helvetica theme. Form fields use white, a light border, the control radius and 48px minimum height. Explicit labels sit above the field unless an accessible hidden label is appropriate for search. The current input focus treatment darkens its border and exposes a green focus outline; SearchField draws focus around its inner shell. Invalid fields use danger borders and written errors. Select options use the shared floating-panel shadow. Disabled and reduced-motion states remain from UIArc.

Resources and Directory list search share a pill-shaped search surface with resting depth. Directory's submit action is an accessible, labeled 44px icon button within that surface. The meetup composer and its portal menus inherit the shared Helvetica Neue, civic-green theme and UIArc 44px / 48px / 52px control heights; its poster artwork retains its separate font and palette choices.

### Navigation

The bottom dock has five destinations in this order: Meetups, Map, Document, Resources and Profile. Document opens the existing `/report` flow with its camera icon. On 30 October 2026 Zachary requested restoring Resources, superseding its earlier removal. Resources opens `/resources` with its original book icon; Resources and Directory routes keep Resources selected. Current-page semantics use `aria-current="page"`; the label stays visible. Selection uses green icon and text tint with stronger label weight. Hover and press use a pale surface. Color transitions run for 150ms with ease-out and are removed for reduced motion. Increased contrast strengthens the divider and current-page underline; forced colors retain explicit selection.

The sidecar navigation specimen uses the current dock in normal document flow so it can render inside the design panel. The app positions it at the viewport bottom.

The Profile header's UIArc-styled cog link is labeled Account preferences and opens `/profile/preferences`. That page contains notification toggles, email changes, data export, account deletion, sign-out, privacy and the role-gated moderation workspace. Back returns to Profile with the selected activity tab preserved. The original account handlers, verification conditions and username-confirmation requirement for deletion remain in place; these controls are not mounted in the main activity view.

### Segmented controls and selection controls

UIArc segmented controls use an open track with no border or independent shadow; the selected segment is pale. Keyboard changes select immediately; pointer changes may use the inherited non-bouncing morph spring. Official UIArc Switch and Checkbox replace the former shadcn adapters, while preserving UIArc's Radix accessibility internals, green checked state, visible keyboard focus and reduced motion. The switch's painted track is 42px by 24px inside a 48px minimum-height button. The checkbox paints an 18px square inside a 48px target.

### Feedback

Shared errors, loading, empty states and status labels use the attributed UIArc Alert, Skeleton, EmptyState and Badge components. Written errors and recovery actions remain visible. The local error treatment has a light danger-tinted surface without a decorative side stripe.

### Map and list

The basemap uses a local seven-layer OpenFreeMap vector style: pale land, parks and water, white roads, and sparse upright city, town and village labels. Buildings, POIs, transit, route shields, road labels and land-use patterns are omitted. Local streets appear from zoom 15 and village labels from zoom 13; no grayscale, contrast or brightness filter is applied. Report/photo/category and calendar-date event markers are square with rounded corners, zoom-scaled between 44px and 48px; count clusters are 48px. A report thumbnail loads only from GO-GOA's public media, and category icons remain available when media fails or data-saving settings discourage images. Resolved reports add a 17px check badge with an explicitly sized, centered SVG. Marker labels, example context and approximate-location text preserve meaning beyond color.

Selecting a marker opens a compact preview at every width and closes the full list. Overlapping markers spread with dashed geographic connectors. Search and the filter trigger share one white row with one soft shadow and a vertical divider. Activity selection lives inside the filter panel; its selected UIArc segment uses a pale fill and dark text. Location, zoom and search-this-area remain separate white map utilities with civic-green icons and text. UIArc SearchField supplies visible focus around its shell, filter controls support keyboard focus and Escape, and marker and list actions remain keyboard accessible. Filters temporarily hide the preview and list toggle. The full list opens only on request and returns to the map through its close button or Escape; at phone widths it hides map utilities beneath the sheet. Above 600px width, including short landscape, the list retains its sibling pane and map controls.

The accessible result list remains the alternative when tiles cannot load. Loading and tile failures have explicit text and recovery, and provider attribution stays visible. The report form's embedded location picker retains tap, drag and coordinate-entry behavior; the viewport layout belongs only to the activity map. Keep resource provenance and availability context with the action it informs.

### Meetup poster and sharing

`MeetupPoster` renders the same flat, square-edged graphic in the live creation preview and dedicated meetup page. It carries the activity, title, description, date and time in India Standard Time, public place, meeting instructions, capacity, recurrence and bring-along items. Its heading is h2 in the preview and h1 on the dedicated page. The selected palette controls text and background color; 18px outline icons and an 18px gap between detail rows preserve the existing preview treatment. The poster has no border, shadow or decorative side stripe.

Customize graphic is collapsed above the creation preview until opened. Labeled Color and Background fieldsets offer Forest, Ocean, Clay, Plum, Ink and Sand, plus Solid, Dots, Grid and Waves. Color buttons have 64px minimum targets and 28px circular swatches, arranged in six columns or three at 380px and below. Background buttons use a two-column grid, 44px minimum targets and 28px by 24px swatches. Labels, check icons and `aria-pressed` communicate selection; the chosen background also receives an outline. The patterns are local CSS textures: Dots repeat every 18px, Grid every 28px and Waves every 64px by 44px. Solid has no texture.

Choices update the shared preview immediately and persist on every created occurrence. The existing graphic remains visible when customization is closed. On the dedicated page, Edit graphic exposes the same controls to people allowed to manage the meetup, with live preview, Cancel and Save graphic. Cancel restores the saved appearance. Saving disables edits while pending, reports errors inline and announces success after server acceptance; version checks reject stale edits. `shared/meetup-poster.ts` restricts persisted choices to the predefined palette and pattern names, with no arbitrary CSS or remote-image background input.

Creating a meetup publishes it immediately and opens its dedicated page. The creator sees a plain inline success notice with a check icon and the invitation to share. Legacy pending meetups show their state and a Publish meetup action for people allowed to manage them; the sharing action stays hidden until publication. Cancelled and ended meetups retain written state messages. Report moderation is separate.

Share meetup is a secondary UIArc button above the poster. It invokes native sharing when available; otherwise it copies the canonical `/events/:id` URL. A successful copy changes the icon to a check and shows an announced status beneath the button. Native-share cancellation is quiet. Other sharing or clipboard failures reveal a labeled, read-only link field that selects its value on focus for manual copying. The detail page remains readable without an app account; joining uses the existing sign-in action. Public sharing still depends on a reachable host and any deployment access gate.

Source ownership is documented in `docs/repository-intake.md`, `src/components/arc/PROVENANCE.md`, `src/components/ui/PROVENANCE.md` and `src/components/map/PROVENANCE.md`. The map provenance records the exact Dizko source commit and adapted marker sizing, overlap handling, viewport layout and tile options. UIArc source was inherited through the Act For Goa reference or added from the official UIArc registry. Its underlying Radix behavior and attribution are retained; the former shadcn switch and checkbox adapters have been replaced. These provenance files do not imply that every upstream gallery component is part of GO-GOA. Keep license and publication checks separate from this visual record.


## Do's and Don'ts

### Do:

- **Do** load the active theme from src/styles.css after the UIArc foundation.
- **Do** use official UIArc controls, including its accessible Radix internals, and retain their provenance.
- **Do** use Helvetica Neue, white sections, pill actions and spacing to establish hierarchy.
- **Do** apply the shared page rhythm to lists, forms, profile and reading surfaces, reserving the wider workspace measure for detail and editing layouts.
- **Do** keep the map search/filter row compact, put activity modes inside filters and open results only on request.
- **Do** reuse MeetupPoster between creation and the dedicated page, keeping its saved palette, background, scoped typography and content in sync.
- **Do** retain concise labels, visible keyboard focus and reduced-motion handling.
- **Do** keep list content available when a map cannot load and preserve map attribution.
- **Do** label fictional local examples and retain source and availability context.

### Don't:

- **Don't** use italic or oblique type, eyebrow text, em dashes or decorative side stripes.
- **Don't** restore the superseded paper palette, Manrope type or floating glass navigation.
- **Don't** expand the selected tab into a large dark green block.
- **Don't** promote unused foundation gradients, alternate accents or dark themes into the GO-GOA palette.
- **Don't** replace open lists with decorative card grids, nest decorative containers or use glyphs as substitute icons.
- **Don't** treat design documentation or captured renders as evidence that an authorized production deployment has completed.
