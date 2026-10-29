---
name: GO-GOA
description: Calm civic reporting and local action in the Act For Goa visual system.
colors:
  paper: "#f7f6ee"
  green: "#193e32"
  muted: "#56675c"
  line: "#d0d8ca"
  pale: "#e9eddf"
  white: "#fffef8"
  link-button-hover: "#29523e"
  danger: "#963c2b"
  nav-material: "rgb(248 249 246 / 72%)"
  nav-ink: "#505651"
  nav-selection: "rgb(30 55 43 / 9%)"
typography:
  headline:
    fontFamily: '"Manrope Variable", sans-serif'
    fontSize: "32px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.035em"
  headline-mobile:
    fontFamily: '"Manrope Variable", sans-serif'
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.035em"
  title:
    fontFamily: '"Manrope Variable", sans-serif'
    fontSize: "22px"
    fontWeight: 750
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  section-title:
    fontFamily: '"Manrope Variable", sans-serif'
    fontSize: "18px"
    fontWeight: 750
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  body:
    fontFamily: '"Manrope Variable", sans-serif'
    fontSize: "16px"
    fontWeight: 550
    lineHeight: 1.6
  label:
    fontFamily: '"Manrope Variable", sans-serif'
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.4
  nav-label:
    fontFamily: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: "13px"
    letterSpacing: "0"
  nav-label-wide:
    fontFamily: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: "18px"
    letterSpacing: "0"
rounded:
  control: "4px"
  tab-bar: "34px"
  tab-item: "28px"
  switch: "999px"
spacing:
  space-1: "0.25rem"
  space-2: "0.5rem"
  space-3: "0.75rem"
  space-4: "1rem"
  space-5: "1.25rem"
  space-6: "1.5rem"
  space-8: "2rem"
  space-10: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.green}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "48px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "48px"
  button-danger:
    backgroundColor: "{colors.white}"
    textColor: "{colors.danger}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "48px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.green}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "48px"
  status:
    backgroundColor: "{colors.pale}"
    textColor: "{colors.green}"
    rounded: "{rounded.control}"
    padding: "3px 7px"
  participation:
    backgroundColor: "{colors.pale}"
    textColor: "{colors.green}"
    rounded: "{rounded.control}"
    padding: "24px"
  segmented-control:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "3px"
  tab-bar:
    backgroundColor: "{colors.nav-material}"
    textColor: "{colors.nav-ink}"
    typography: "{typography.nav-label}"
    rounded: "{rounded.tab-bar}"
    padding: "5px"
    height: "64px"
    width: "min(352px, calc(100% - 32px))"
  switch:
    backgroundColor: "{colors.line}"
    rounded: "{rounded.switch}"
    padding: "3px"
    height: "26px"
    width: "44px"
---

# Design System: GO-GOA

## Overview

**Creative North Star: "Act For Goa civic workspace"**

GO-GOA inherits the existing Act For Goa visual system: warm paper, deep green ink, upright Manrope, restrained controls and open content rows. Its character is calm, local and practical. The design supports outdoor mobile use and clear civic actions through legible type, strong text contrast and visible state.

The content layer is mostly flat. The user-approved navigation is a separate translucent material with compact Apple HIG-inspired proportions, short system-font labels and a quiet neutral selection surface. This record describes the current local QA baseline. The rendered evidence and finish disposition cover the map and navigation; this is not a whole-app production-readiness claim.

The descriptive language follows the user-approved Act For Goa direction and current build. No new visual-world interview or concept seed was introduced for the pinned navigation refinement.

**Key Characteristics:**

- Act For Goa paper and green identity, preserved from the actual source.
- Upright Manrope content with semibold system labels confined to tab navigation.
- Open rows, structural horizontal rules and modest control corners.
- Compact glass navigation with a neutral selection surface and green tint.
- Visible provenance, example labels and accessible map/list alternatives.

Source evidence: `src/styles.css`, `src/components/tab-bar.css`, `src/components/TabBar.tsx`, `src/components/arc/foundation.css`, the Arc control styles and `src/components/ui/controls.css`. `src/main.tsx` loads the Arc foundation before the GO-GOA theme. The current rendered captures are `.impeccable/review/mobile.png` and `.impeccable/review/desktop.png`.

## Colors

Warm paper and pale green surfaces support deep green ink, with muted green-gray metadata and light structural rules.

### Primary

- **Civic green** (`green`): headings, primary actions, map report pins, active controls and selected tab tint.
- **Link hover green** (`link-button-hover`): primary link-button hover state. Arc button hover uses opacity instead.
- **Danger clay** (`danger`): destructive actions, validation errors and moderation redaction outlines; it is semantic feedback, not a decorative accent.

### Neutral

- **Warm paper** (`paper`): page background and text on filled primary buttons.
- **Warm white** (`white`): fields, outlined buttons, map controls and switch thumbs.
- **Pale leaf** (`pale`): restrained selected, hovered and supporting surfaces.
- **Muted green-gray** (`muted`): secondary text and quiet control labels.
- **Soft rule** (`line`): structural dividers and control borders.
- **Glass material**, **navigation ink** and **neutral selection** (`nav-material`, `nav-ink`, `nav-selection`): confined to the tab bar. Keep their translucent source syntax.

**The Inherited Palette Rule.** Use the active Act For Goa colors for content and controls. The tab bar material is a local navigation treatment; it does not introduce a second brand palette.

The sidecar's synthesized tonal ramps are swatch previews only, not additional production colors. The inherited `search-focus` and `warning` declarations have no active references in this snapshot and are not promoted to visual roles here. Status variants retain their implementation-specific semantic colors and text labels.

## Typography

**Content Font:** Manrope Variable, with a sans-serif fallback. The bundled variable font is loaded through `@fontsource-variable/manrope`.

**Navigation Label Font:** `-apple-system, BlinkMacSystemFont, system-ui, sans-serif`.

Content uses compact, strong headings and readable medium-weight body text. The system font is confined to the navigation control to follow the user-approved tab-bar direction; it is not a display face.

### Hierarchy

- **Headline:** the frontmatter headline roles correspond to desktop and mobile h1 sizing. The desktop headline reduces at the mobile breakpoint.
- **Title:** section headings use the title role. Most mobile h2 elements reduce to 21px, while the nearby-list heading retains its title size.
- **Section title:** h3 and form legends use the section-title scale.
- **Body:** the base role has a maximum paragraph measure of 70ch.
- **Control label:** the label role describes Arc buttons and field labels; compact metadata uses the observed 11px to 13px range.
- **Navigation label:** short, semibold upright labels, paired with 24px icons on mobile and 20px icons on wider layouts.

**The Upright Type Rule.** Use upright type everywhere. Weight, size and spacing carry emphasis; content headings remain Manrope and tab labels use the system stack.

## Layout

The app is an Operate surface. General pages use a centered 1200px maximum width, with a 720px narrow form variant. The header and map workspace expand to 1440px. Desktop padding is 40px; the intermediate workspace uses 28px; mobile content uses 20px, reducing to 16px at 360px and below.

The map workspace pairs a flexible map with a 370px list and a 28px gap. At 1050px and below, the list becomes 330px with a 22px gap. At 760px and below, the layout stacks, the map reaches the viewport edges, and the list scrolls with the document. The map is 570px tall on the standard desktop layout, 640px from 1500px upward, and 340px on mobile.

The mobile tab bar is centered above the bottom safe area with four equal columns. Its current source sets a 64px minimum height and a 352px maximum width. At 761px and above, or in landscape at 500px height and below, it uses a 52px minimum height, 424px width and horizontal icon-label arrangement. Mobile links have a 52px minimum height; wide links have a 44px minimum height. Main content retains 140px bottom clearance. Dimensions represented as `height` in the portable component tokens are source minimum heights.

Spacing follows the inherited 4px rhythm where practical. Open incident and resource rows use structural top borders and 20px to 24px vertical padding. Photos use square corners; current incident thumbnails are rectangular, rather than a mandated square aspect ratio.

## Elevation & Depth

The content plane is flat, with pale tonal fields and thin rules for structure. Map controls and navigation use soft ambient shadows so controls stay legible above geographic detail. The glass bar uses a 24px blur with 150% saturation, a translucent white border and an inset highlight. Reduced transparency, increased contrast or missing backdrop-filter support switch it to an opaque material.

### Shadow Vocabulary

- **Arc resting control:** `0 1px 2px oklch(0% 0 0 / .035)`, used by applicable hovered buttons.
- **Map search:** `0 3px 12px #193e3214`, separating the field from map imagery.
- **Map marker:** `0 2px 5px #193e3240`, used for individual pins; clusters use the lighter `#193e3233` shadow.
- **Tab material:** `0 4px 20px rgb(18 36 27 / 12%), inset 0 1px 0 rgb(255 255 255 / 70%)`.

**The Content Stays Flat Rule.** Content rows rely on spacing and structural rules. Reserve ambient depth for controls above the map and the floating navigation material.

## Shapes

Content controls use the inherited modest control radius. Navigation uses its distinct capsule and rounded selected item. Switches and report pins are circular or pill-shaped because those shapes express their function. Event pins use a rounded square, so map categories remain distinguishable beyond color. Imagery and open list rows keep square corners.

Structural dividers may separate rows or sections. Decorative accent stripes along the side of a card, notice, quote or other content block are prohibited.

## Components

### Buttons

Direct and compact, using the actual Arc control source. Primary buttons use green with paper text; secondary buttons use warm white with a rule border; ghost buttons are transparent with muted text; danger buttons retain a clear outlined silhouette. Medium controls have a 48px minimum height, with 44px and 52px variants. Keyboard focus uses a green outline with an offset. Fine-pointer hover adds the resting shadow for primary and secondary variants; active states provide immediate color or opacity feedback. Disabled controls remain visibly disabled. Primary link buttons use the separate inherited hover green.

### Chips

Status labels use compact upright bold text on a pale surface with modest corners. Status-specific color is paired with literal state text, and sometimes an SVG icon. These are informative labels, not decorative eyebrows. Example labels and provenance remain visible wherever fictional development content appears.

### Cards / Containers

Use open, horizontally separated rows for reports, resources and activity. A participation panel is an actual bounded exception: pale background, modest corners, 24px padding and an 18px content gap, reduced to 20px padding on mobile. Notices use plain tonal backgrounds without side stripes.

### Inputs / Fields

Arc fields use warm white, a rule border, the control radius and 48px minimum height. Labels are explicit and sit above the field. Focus uses a pale background change; the foundation intentionally suppresses text-input outlines. Invalid fields use danger-colored borders and written errors. The map search uses a visible focus-within outline around its whole shell. Textarea, disabled and reduced-motion states remain from the reused component implementation.

### Navigation

Four link destinations are Map, Report, Events and Profile. Current-page semantics use `aria-current="page"`; their label stays visible. Selection uses the neutral surface with green icon and text tint. The selected icon stroke is slightly stronger, while label weight stays constant. Hover and press use subtle neutral feedback. Transition timing is 160ms ease-out, removed for reduced motion. Reduced-transparency and increased-contrast modes use opaque material, stronger borders and darker inactive text.

The sidecar navigation specimen preserves control dimensions, material and states in normal document flow so it can render inside the design panel. The app positions this same control at the viewport bottom.

### Segmented controls and selection controls

Arc segmented controls use an open track with no border or shadow; the selected segment is pale. Keyboard changes select immediately; pointer changes may use the inherited non-bouncing morph spring. Shadcn/Radix switches and checkboxes retain native accessible behavior, green checked state, visible keyboard focus and reduced motion. The switch's painted size is 44px by 26px; the settings row enlarges its pointer target with a transparent hit area.

### Map and list

Use report circles and event rounded squares with an explanatory key. Selecting a pin highlights the matching list item. The map has a bounded height, real provider attribution, search controls and an accessible list alternative. Keep resource provenance and availability context with the action it informs.

Source ownership is documented in `docs/repository-intake.md`, `src/components/arc/PROVENANCE.md` and `src/components/ui/PROVENANCE.md`. UIArc source was inherited through the Act For Goa theme; shadcn/Radix behavior and attribution are retained. These provenance files do not imply that every upstream gallery component is part of GO-GOA. Keep license and publication checks separate from this visual record.

## Do's and Don'ts

### Do:

- **Do** inherit the active theme from src/styles.css after the UIArc foundation.
- **Do** use existing UIArc and shadcn/Radix controls and retain their provenance.
- **Do** retain concise labels, visible keyboard focus, reduced-motion handling and opaque navigation fallbacks.
- **Do** keep list content available when a map cannot load and preserve map attribution.
- **Do** label fictional local examples and retain source and availability context.

### Don't:

- **Don't** use italic or oblique type, eyebrow text, em dashes or decorative side stripes.
- **Don't** expand the selected tab into a large dark green block.
- **Don't** promote unused foundation gradients, alternate accents or dark themes into the GO-GOA palette.
- **Don't** replace open lists with decorative card grids or use glyphs as substitute icons.
- **Don't** treat this documented QA baseline or its map/navigation review as whole-app production approval.
