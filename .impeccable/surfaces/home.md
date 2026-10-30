# Home feed

Mode: Operate / Read. Home feed at `/home`; owner-approved release to shared QA.

## Direction contract

THESIS: A single stream connects Goa’s community action, local reports, online news and useful next steps. The user initially chose a balanced mix, then explicitly revised it to favor meetups and feel like Instagram.

OWN-WORLD: Inherit the other app tabs: white canvas, upright Helvetica Neue and civic green. The user explicitly requests rounded rectangular borders around each feed item, and a visual for every item. Photos and the existing MeetupPoster component lead; meaningful category icons accompany reports, news and resources. Reuse UI Arc controls without new overrides; the Carousel is exact official registry source.

STORY: Browse a meetup gallery, swipe its photos, then discover a report, a sourced news story or a practical resource. Follow links to the real local record or original publisher.

FIRST VIEWPORT: Existing header, “Around Goa.” heading, compact feed filters, an “About this feed” disclosure and a large community photo in the sample feed. Five persistent dock destinations are Home, Meetups, Map, Document and Profile. One centered feed uses the existing page width and gutters on desktop and phone.

FORM: Code-led, user-specified Instagram-style cards and galleries within an endless feed. No concept seed applies to this pinned structure. Randomized shuffle bags give meetups 40–50% of the mix and rotate items before repeating, with stable append order and a visible Revisited label. The user approved the photos and authorized invented meetups. Three local fictional meetups use the actual MeetupPoster with existing Ocean, Sand and Forest options. Preview details are read-only and offer no real RSVP. Galleries keep native Arc swipe, arrows, dots and keyboard behavior. No autoplay.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Recorded implementation

This is an ordinary Home surface extension of the incumbent system. Global colors, type families, page spacing and Arc component styles remain unchanged. Feed entries use a one-pixel structural border, white fill, 20px corners and 20px padding, with a 24px gap between entries. At 760px and below, corners reduce to 18px and padding to 16px. This user-approved card treatment is specific to Home; it does not replace open lists on other surfaces.

Card headings use upright medium Helvetica Neue at 22px, reducing to 21px on phones. Supporting copy is 15px with 1.65 line height and a 65ch maximum measure. Galleries use 4:3 photographs; meetup entries reuse the existing square-edged MeetupPoster inside the card, retaining its scoped upright type and saved palettes. Reports use their photo when available and a category icon otherwise. News and resources use meaningful category icons. The shared Arc Carousel supplies the interaction and receives no Home style overrides.

Source evidence: `src/pages/Home.tsx`, `src/pages/home.css`, `src/feed/content.ts`, `src/feed/mix.ts`, `src/components/arc/carousel/` and `src/components/TabBar.tsx`. The independent finish review returned `ship` without material fixes. The primary's verification recorded 52 passing tests and a passing full build. This records the reviewed release candidate and does not establish deployment completion.

The global DESIGN.md and its sidecar are preserved. Existing differences between their navigation/participation documentation remain outside this bounded extension; the five-destination dock above records the approved Home addition without refreshing unrelated system content.

## Scope

The owner approved shipping this update on 30 October 2026. News is a curated online snapshot researched 30 October 2026, with publication dates and original links. Local reports/meetups come from the existing public explore API. Photos are labelled sourced examples or AI-generated fictional scenes and are never attached to actual meetup records. Galleries and invented meetup previews are enabled only in configured demo/QA environments or local development. Future real meetup uploads and a continuously refreshed news ingestion service remain separate work. DESIGN.md and existing in-progress meetup edits remain owned by their current work.
