---
name: Go4Goa homepage demo
description: A spacious civic marketing world built around local action and an original glossy keychain.
colors:
  forest: "#193e32"
  ink: "#141815"
  paper: "#f8f8f8"
  muted: "#646b65"
  line: "#dce1dc"
  lime: "#c5f269"
  coral: "#ec7857"
  silver: "#e1e5e1"
  white: "#fff"
  action-dark: "#17221b"
  action-hover: "#2b4b37"
  action-light: "#f4f6ef"
  action-light-hover: "#e6f4cf"
  nav-surface: "#f0f1eefa"
  selected-tab: "#eaf0e7"
  selected-tab-ink: "#1b4b31"
  example-surface: "#e8eee6"
  example-ink: "#49634e"
  resource-surface: "#fafcf6"
typography:
  display:
    fontFamily: '"Inter Variable", Inter, sans-serif'
    fontSize: "clamp(60px, 7.8vw, 118px)"
    fontWeight: 450
    lineHeight: 1.07
    letterSpacing: "-0.065em"
  headline:
    fontFamily: '"Inter Variable", Inter, sans-serif'
    fontSize: "clamp(44px, 4.8vw, 72px)"
    fontWeight: 450
    lineHeight: 1.07
    letterSpacing: "-0.05em"
  title:
    fontFamily: '"Inter Variable", Inter, sans-serif'
    fontSize: "27px"
    fontWeight: 450
    lineHeight: "normal"
    letterSpacing: "-0.04em"
  body:
    fontFamily: '"Inter Variable", Inter, sans-serif'
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.03em"
  action:
    fontFamily: '"Inter Variable", Inter, sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "normal"
    letterSpacing: "-0.02em"
  label:
    fontFamily: '"Inter Variable", Inter, sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "normal"
    letterSpacing: "normal"
  brand:
    fontFamily: '"Inter Variable", Inter, sans-serif'
    fontSize: "30px"
    fontWeight: 760
    lineHeight: 1
    letterSpacing: "-0.065em"
rounded:
  tag: "6px"
  control: "10px"
  tab: "11px"
  action: "17px"
  card: "20px"
  navigation: "22px"
  image: "25px"
spacing:
  icon: "8px"
  control: "10px"
  compact: "16px"
  content: "24px"
  copy: "30px"
  column-mobile: "40px"
  section-mobile: "70px"
  section-desktop: "150px"
components:
  button-primary:
    backgroundColor: "{colors.action-dark}"
    textColor: "{colors.white}"
    typography: "{typography.action}"
    rounded: "{rounded.action}"
    padding: "0 26px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
  button-light:
    backgroundColor: "{colors.action-light}"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.action}"
    padding: "0 26px"
  button-light-hover:
    backgroundColor: "{colors.action-light-hover}"
  text-action:
    textColor: "{colors.ink}"
    typography: "{typography.action}"
  navigation:
    backgroundColor: "{colors.nav-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.navigation}"
    padding: "14px 20px"
  product-tab:
    rounded: "{rounded.tab}"
    padding: "10px 14px"
  product-tab-selected:
    backgroundColor: "{colors.selected-tab}"
    textColor: "{colors.selected-tab-ink}"
    rounded: "{rounded.tab}"
    padding: "10px 14px"
  example-tag:
    backgroundColor: "{colors.example-surface}"
    textColor: "{colors.example-ink}"
    rounded: "{rounded.tag}"
    padding: "5px 8px"
  resource-card:
    backgroundColor: "{colors.resource-surface}"
    textColor: "{colors.forest}"
    rounded: "{rounded.card}"
    padding: "30px"
  feature-accordion:
    textColor: "{colors.ink}"
    padding: "18px 0"
  product-tile:
    backgroundColor: "{colors.forest}"
    width: "100px"
    height: "100px"
---

# Design System: Go4Goa homepage demo

## Overview

**Creative North Star: "The local keychain"**

A glossy object opens into a calm, spacious civic world. Oversized upright grotesk type, a neutral gray-to-paper ground, forest-green controls, and real Goa photography make the page direct, warm, and tactile. Color sits in the artwork, product tiles, and selected controls; the surrounding page gives those elements room.

This system describes the finished standalone homepage in homepage/, for Goa residents and local communities. It records the actual CSS and components, informed by the pinned Butter reference and the direction in docs/PLAN.md. The operational app has its own design system in the repository root; these marketing rules do not replace it.

**Key Characteristics:**

- Oversized upright type with tight tracking and short, balanced lines.
- Long quiet intervals around photography, product previews, and a single measured icon handoff.
- Neutral page ground with forest-green actions and restrained lime, coral, and silver accents.
- Rounded controls and softly lifted previews; flat solid-color secondary icon tiles.
- Visible example labels, keyboard focus, and a complete static reading path when motion is reduced.

## Colors

The palette pairs neutral paper and dark green-black text with a forest-green core and a small set of object colors. Frontmatter is the normative token source; the prose assigns roles.

### Primary

- **Forest:** product identity, selected resource controls, default event poster, and the green icon tile.
- **Dark action and hover:** primary calls to action shift to a lighter forest tone on hover.

### Secondary

- **Lime:** selection highlight and one product tile; it is an accent rather than a text ground for long copy.
- **Coral:** one product tile and the closing heart; it also appears in the authored keychain.
- **Silver:** the camera tile echoes the hero's metal through a flat fill.

### Neutral

- **Paper, ink, muted, and line:** page ground, primary copy, supporting copy, and structural dividers.
- **White:** product toolbar, report preview, map selection, and text on dark controls.
- **Navigation surface:** an almost opaque light capsule that remains legible over moving content.
- **Light action and hover:** the inverse call to action on photography.
- **Selected tab and selected tab ink:** quiet, readable product selection.
- **Example surface and example ink:** compact evidence labels inside the demo.
- **Resource surface:** a pale green-white panel behind practical next steps.

**The quiet ground Rule.** Keep the page ground neutral. Let the artwork and product states carry the brighter colors.

## Typography

**Display Font:** self-hosted Inter Variable, with Inter and sans-serif fallbacks.

**Body Font:** the same self-hosted family. There is no separate mono or decorative face.

**Character:** a broad, direct grotesk voice, with regular-to-medium headlines and a much heavier wordmark. The scale is fluid and role-specific, not a fixed mathematical ratio. Inter is the implemented substitute for the reference's commercial typeface.

### Hierarchy

- **Display:** the opening promise uses the frontmatter display token. At the phone breakpoint it becomes `clamp(47px, 12.5vw, 73px)` with a (1.04) line height; the narrowest layout uses (12.6vw).
- **Headline:** paired feature sections use the headline token and a short measure (10.6ch). Other section headings vary with their composition, rather than sharing a single forced size.
- **Title:** feature summaries use the title token. Photo stories and preview titles have their own compact variants.
- **Body:** feature explanations use the body token, normally constrained to (34ch). Supporting copy uses (16px); long FAQ answers use (15px) and a (1.65) line height on desktop.
- **Action and label:** actions remain comfortably readable; navigation labels use the label token. Demo captions are smaller and remain specific to the miniature previews.
- **Brand:** the compact wordmark uses the brand token. The footer is a separate oversized treatment, with `clamp(120px, 21vw, 330px)` and tight tracking; it is not a general heading size.

**The upright voice Rule.** Use upright type throughout. Emphasis comes from scale, weight, spacing, and color.

## Layout

The principal desktop content width is (88%) with a (1320px) maximum. Main feature pairs use equal columns with an (8%) gap and the desktop section-spacing token above and below. Large imagery, short copy measures, and long unoccupied intervals establish the rhythm. The fixed navigation sits (6%) from the viewport edges and (25px) below the top.

The opening section occupies a viewport, bounded by (900px) and (1150px) on the base desktop layout. The statement and horizontal story use viewport-height stages only while desktop motion is enabled. Their pin distances are implementation choreography, not a general page spacing scale.

At (1150px), navigation and split layouts tighten. At (899px), desktop links disappear, pinned sequences become normal flow, the product remains visible, and the photographic story becomes a three-column grid. At (599px), feature pairs, FAQs, and trust panels become single columns with (20px) content gutters; the photographic story stacks vertically and the capability grid has two columns. At (370px), headings, controls, and preview padding tighten again. The wide hero artwork has an additional (1600px) breakpoint.

Motion uses GSAP and Lenis with native touch behavior. The persistent motion control and system preference remove animated pins and parallax while preserving content. Reduced-motion desktop stories remain a three-column grid; phones stack them. Primary calls to action scroll to the usable product panel and focus its selected tab.

**The measured handoff Rule.** When an object becomes a control, measure the actual source and destination, refresh those measurements after layout changes, and reveal the destination only after arrival.

## Elevation & Depth

Depth is selective: the original glossy keychain is an image, product previews have diffuse offset shadows, and the rest of the layout relies on pale surfaces, photography, and spacing. Navigation uses a (16px) backdrop blur to remain readable over the page. The main content's rounded lower edge reveals the footer ground.

### Shadow Vocabulary

- **Product window:** `0 35px 65px -25px #1e3c2d3b`; the major application preview.
- **Report preview:** `0 17px 40px #1d39261c`; the white report surface inside its pale stage.
- **Product tile:** `0 14px 24px #253c2e1a`; a soft lift below the flat colored tile.
- **Expanded navigation:** `0 18px 50px #172b1f20`; separates the open menu from content below it.
- **Map selection:** `0 10px 35px #213c2b22`; makes the local selection readable over map imagery.

**The material boundary Rule.** Keep gloss in the authored hero image. Secondary icon tiles use solid fills and soft offset shadows, without simulated bevels or inset highlights.

## Shapes

Controls use rounded rectangles rather than full pills. The repeated radii in frontmatter cover tags, small controls, tabs, primary actions, cards, navigation, and image frames. Larger presentation stages vary around (30–35px), while the event poster keeps a nearly square (4px) corner. Circular shapes are reserved for palette swatches and gallery arrows. The icon tiles are softly rounded squares, with a (29px) desktop radius and smaller responsive variants.

Thin full-width dividers separate accordion rows, FAQ items, and resource entries. They convey structure. No decorative stripe is used along one side of a container.

## Components

### Buttons

Confident rounded actions with an outline arrow and generous internal spacing. The primary action has a (58px) minimum height and moves upward (2px) on hover. Its light variant is used on photography; the compact navigation version has a (44px) minimum height, (13px) type, and a (12px) radius. Text actions leave the ground visible and move only the arrow diagonally on hover. Keyboard focus uses a (3px) green outline with a (5px) offset.

### Chips

The compact example tag is an informational label, not an action. It has a pale green ground, dark green text, and ordinary case. Its text explicitly distinguishes demo or screenshot content. Do not turn this small caption treatment into an eyebrow above a marketing heading.

### Cards / Containers

The product window is a clipped white surface with a thin green-gray border and the large preview shadow. Report cards are white with the card radius; resource cards use the resource surface and retain simple row dividers. Outer stages use muted grounds and larger padding. Photograph cards place their text below the image, with no extra decorative card shell.

### Navigation

The fixed header has a light translucent identity/navigation capsule and a separate action capsule. Desktop links collapse after (90px) of scrolling. The menu remains available, opens a rounded link list, closes on selection, and restores focus to its trigger on Escape. Narrow screens use the compact menu from the start. Footer navigation returns to plain vertical links.

### Product tabs

Map, Document, Meetups, and Resources appear in one toolbar. The selected tab has a pale green fill and darker text, with matching iconography. Arrow keys move between tabs and focus follows the selected tab. On phones the brand sits above a four-column tab row. The screenshot is background imagery; the overlaid controls and panels are real local interactions.

### Feature accordion

Large plain-word buttons sit on thin structural dividers. The active item uses ink, reveals explanatory copy and an arrow, and changes the adjacent product preview. Inactive items are muted. The FAQ uses the same quiet divider principle at a smaller type size, with plus/minus SVG controls and native hidden answer content.

### Product tiles and motion

The four flat tiles share outline icons with the four product tabs. At desktop widths, the same visible glyphs translate and scale into measured toolbar positions; their colored backgrounds and shadows disappear as they land. On narrower or reduced-motion layouts the tiles and complete product view remain in normal reading order. The hero is a transformed raster object, not a physical 3D scene.

## Do's and Don'ts

### Do:

- Do preserve the neutral ground, upright type, and generous spacing of this standalone marketing surface.
- Do keep the actual outline SVG icons consistent between a moving tile and its destination control.
- Do label fictional interactive examples and historical photography where they appear.
- Do provide visible keyboard focus and preserve all content when scroll motion is removed.
- Do collapse the desktop choreography into the existing responsive reading order on narrow screens.

### Don't:

- Don't use italic or oblique type, including wordmarks and artwork text.
- Don't use decorative accent stripes along the side of any card, alert, quote, or container.
- Don't add eyebrow labels, fabricated impact metrics, partner endorsements, or live-event claims.
- Don't turn the hero's glossy material into beveled secondary controls.
- Don't inherit the demo's smallest caption sizes as a general text scale or apply this homepage system to the operational app.
