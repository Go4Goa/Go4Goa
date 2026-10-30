# Go4Goa homepage demo

## Direction

User-pinned reference: https://www.butter.video/ (inspected 30 October 2026). Code-led adaptation of the observed reference, with Go4Goa product truth and original/sourced Goa assets. Mode: Persuade. User-confirmed audience: Goa residents and local communities. Main action: explore a self-contained app demonstration. The current application is a separate operational surface and remains intact.

First viewport: a floating light navigation bar, an original reflective Go4Goa keychain above a very large upright headline, one short description, and a dark rounded action. Gray-to-white ground, black and forest-green type, lime and coral concentrated in the authored artwork.

## Observed source mechanics

Inspected the public production HTML and JavaScript chunks, saved as ignored research under `.reports/homepage-butter/source/`. This is shipped/minified browser code, not Butter's private repository.

- `page-b593d5508e75f015.js`: HomeHero uses a 100vh minimum section and a centered column. A React Three Fiber scene has a raster fallback; the fallback masks to transparent at the lower edge.
- `StatementTimeline`: measures bounding rectangles of inline icon placeholders and timeline destinations. GSAP translates/scales the same icons between those positions over 1.5s, `power2.inOut`, with 0.1s stagger and a mid-flight rotation. Scroll direction determines the destination.
- `StoryOne`: text effects use character blur and focus. It pairs a large left text block with a right product panel.
- `StoryTwo`: reverses the composition and embeds control imagery into its heading.
- `StoryThree`: horizontal flex track inside a 200vh region; ScrollTrigger pins the region, scrubs x to `-(scrollWidth-innerWidth)`, starts `center center`, ends `bottom bottom`, and recalculates on refresh. Desktop only.
- `TickerSection`: duplicated items with an infinite xPercent tween, 1.5 seconds per logo, and scroll velocity changes the timeScale.
- `FeaturesSection`: masked image transition uses a 400%-wide linear mask and a 0.6s reveal.
- `1996-ed495363eed4d6fe.js`: Lenis 1.3.25 smoothing, native touch by default, default lerp 0.1.
- The reference uses DieGrotesk, neutral gray backgrounds, very large regular-weight text, high-gloss objects, long quiet intervals, feature accordions, and an oversized closing wordmark.

## Go4Goa sequence

1. Glossy original keychain, oversized headline, compact floating navigation.
2. Goa place-name strip in place of unsubstantiated partner logos.
3. A pinned oversized statement transforms into the real app map. Product icons travel into the demo toolbar. Deliberate hold before and after the transition.
4. Report demonstration: choose an example category and inspect the privacy/review stages.
5. Meetup demonstration: a customizable poster and invitation preview.
6. Desktop pinned horizontal sequence: notice, gather, act. Native vertical stack on phones and reduced motion.
7. Four concrete capability summaries.
8. Three-way accordion with changing product previews.
9. Local-action photo gallery with functional arrows and bounded, user-controlled movement.
10. Privacy/resources feature pair and concise FAQ.
11. Oversized Go4Goa close and useful links.

## Motion and quality contract

GSAP ScrollTrigger and Lenis reproduce the reference's timing model. Transform, opacity and bounded blur carry motion. The primary sequence has entry, hold, transition, and hold intervals. Smooth scrolling does not take over touch. A persistent motion control and system reduced-motion preference remove pins, parallax and movement while preserving all content. Native anchors, keyboard focus, accessible buttons, and example labels remain usable. No fabricated impact statistics, partner endorsements, or live event claims.

## Build and review

Standalone Vite/React app under `homepage/`, dedicated port 4320. Self-hosted font and assets. No shipping, deployment, or production route changes. Verify desktop, 390px mobile, the user's panel width, keyboard, menu, feature tabs, poster palettes, gallery, FAQs, and reduced motion. Scan for italic/oblique styles and decorative side stripes. Run build and a fresh independent Impeccable finish review. Document the scoped system inside this demo, not by replacing the app design system.

## Approved publication

After reviewing the local demo, the user requested production publication and selected: make the homepage the root of `go-goa-qa.vercel.app`, with the map at `/map`. This supersedes the initial local-only limit. The homepage remains a separate document and stylesheet; its primary CTA enters the app. Existing app routes, API behavior, credentials and database are preserved. The Vercel production alias remains the project's shared QA environment.
