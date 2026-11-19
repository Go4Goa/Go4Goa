# Home feed

Mode: Operate / Read. Local design preview at `/home`.

## Direction contract

THESIS: A single stream connects Goa’s community action, local reports, online news and useful next steps. The user initially chose a balanced mix, then explicitly revised it to favor meetups and feel like Instagram.

OWN-WORLD: Inherit the other app tabs: white canvas, upright Helvetica Neue and civic green. The user explicitly requests rounded rectangular borders around each feed item, and a visual for every item. Photos and the existing MeetupPoster component lead; meaningful category icons accompany reports, news and resources. Reuse UI Arc controls without new overrides; the Carousel is exact official registry source.

STORY: Browse a meetup gallery, swipe its photos, then discover a report, a sourced news story or a practical resource. Follow links to the real local record or original publisher.

FIRST VIEWPORT: Existing header, “Around Goa.” heading, compact feed filters, a local-preview note and a large community photo. Five persistent dock destinations start with Home. One centered feed uses the existing page width and gutters on desktop and phone.

FORM: Code-led, user-specified Instagram-style cards and galleries within an endless feed. No concept seed applies to this pinned structure. Randomized shuffle bags give meetups 40–50% of the mix and rotate items before repeating, with stable append order and a visible Revisited label. The user approved the photos and authorized invented meetups. Three local fictional meetups use the actual MeetupPoster with existing Ocean, Sand and Forest options. Preview details are read-only and offer no real RSVP. Galleries keep native Arc swipe, arrows, dots and keyboard behavior. No autoplay.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Scope

Local preview only. News is a curated online snapshot researched 30 October 2026, with publication dates and original links. Local reports/meetups come from the existing public explore API. Photos are labelled sourced examples or AI-generated fictional scenes and are never attached to actual meetup records. Galleries are development-only on loopback hosts. Future real meetup uploads and a continuously refreshed news ingestion service are outside this design preview. DESIGN.md and existing in-progress meetup edits remain owned by their current work.
