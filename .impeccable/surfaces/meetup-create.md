# Create a meetup

Mode: Operate. Primary target: `src/pages/CreateEvent.tsx`. Related targets: `src/pages/event-create.css`, `src/components/EventPlaceSearch.tsx`, `src/components/LocationField.tsx` and the meetup location pin in `src/components/FieldMap.tsx`.

## Direction contract

THESIS: Help a local organizer compose a meetup and understand exactly what participants will see, using an open editor and a complete live preview.

OWN-WORLD: User-approved, genuine Arc UI registry controls with minimal styling, original rounded controls and scoped Inter/Geist typography. Keep the white canvas and existing civic-green preview. Upright text only; no decorative side stripes.

STORY: Name the meetup, choose its activity, schedule and public place, add practical details, inspect the preview, then submit.

FIRST VIEWPORT: Large unboxed editable title leads the left column; four activity buttons and schedule follow. A civic-green preview occupies the right column. Mobile stacks editor, preview and final submit action in that order.

FORM: Code-led extension, with the Partiful-inspired open editor and right preview pinned by the user. No concept seed was rolled for this pinned direction. The signature interaction is the preview updating as inline text is typed.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implemented scope, 29 October 2026

The title, description and meeting instructions use Arc InlineEdit without boxed display fields. Four activity buttons provide single selection. Bring-along buttons support multiple choices and an optional custom item. One date and start time combine with a duration; times display in India Standard Time. Daily, weekly and monthly recurrence expose an interval and a total count of 2 to 12 meetups, including the first.

Place search accepts beaches, cafés and businesses in Goa. Selecting a result opens the map with a pointed pin; tapping, dragging and explicit coordinate entry remain available. Search attribution and recoverable errors stay visible. The preview includes activity, draft title and description, date, time, duration, end time, place, meeting instructions, capacity, materials and recurrence, with expandable occurrence dates. Submission remains below the preview in document order. User-facing copy uses Meetups; internal event names and routes remain technical identifiers.

The desktop editor uses two columns and a sticky preview, stacking at 700px. Its scoped Arc foundation values prevent the general app theme from restyling these controls. This is an intentional surface exception to the global Helvetica treatment, not a new application-wide theme. The existing `DESIGN.md` and `.impeccable/design.json` are preserved. Arc source and the two small component adaptations are recorded in `src/components/arc/PROVENANCE.md`.

## Evidence and limits

Checked the implementation and saved desktop/mobile renders: `.impeccable/review/eventing-desktop.jpg` and `eventing-mobile.jpg`. Checked corrected calendar edge focus in `eventing-calendar-mobile-viewport.jpg` and `eventing-calendar-left-focus.jpg`. The initial surface review identified one material issue: clipped calendar focus. The follow-up returned **ship**, scoring that specific fix resolved at both selected right-edge and unselected left-edge dates; its verdict covers that fix. No italic/oblique text or decorative side stripe appears in this scoped treatment.

The parent verification pass reports real Miramar search results, point and keyboard coordinate selection, live draft preview, correct final-submit order and no horizontal overflow at 390px. Monthly dates were checked as 31 October, 30 November, 31 December and 31 January. Fourteen unit checks and five API integration checks passed; the latest build passed with the existing nonfatal shared-map chunk-size warning. `.local/qa/eventing-detect.json` contains no primary findings and three type-scale advisories covered by this approved Arc scope. These are narrow local results, not whole-app acceptance.

`shared/event-schedule.ts` keeps each occurrence at the same India wall-clock time, rejects durations crossing an India date boundary and clamps shorter monthly dates from the original day. `server/events.ts` persists the actual occurrences transactionally. Photon is a local demo fallback when no MapTiler key is configured; production and QA require the configured provider. Automatic demo sign-in is restricted to development, demo mode and loopback hosts, excluding QA. Local origin support retains production guards. No deployment or production verification is implied.

## Immediate publishing and shared poster, 29 October 2026

The user removed the meetup review gate. Create meetup (or Create N meetups) now publishes immediately and opens the dedicated page with a success notice. Resident creators retain ownership and can manage their own attendance and consented updates without a global role upgrade. Legacy pending records remain private until their creator publishes them. Reports retain their separate moderation flow.

`MeetupPoster` owns the same green graphic in both the creation preview and the dedicated page. `ShareMeetup` uses native sharing where available, copies the canonical meetup URL otherwise, and offers a selectable link when clipboard access fails. Public detail pages require no app account, although the shared QA deployment retains its outer password gate. The current local URL is not accessible from someone else’s device.

`PlaceSearch` now serves both meetup creation and report landmarks. It uses server-side Google Places autocomplete, session tokens and details; explicit Search uses text search. The key stays server-side. The date picker uses viewport-aware fixed positioning and flips above its trigger to remain clear of bottom navigation.

## Graphic choices, 29 October 2026

The user requested basic color, pattern and background choices. Customize graphic now exposes Forest, Ocean, Clay, Plum, Ink and Sand palettes plus Solid, Dots, Grid and Waves backgrounds. Contrast is controlled by each palette; arbitrary CSS and remote images are not accepted. Choices update the shared poster immediately and persist on every created occurrence. The default remains the original green solid poster. An owner can preview, cancel or save later changes through Edit graphic on the dedicated page; optimistic versions prevent overwriting concurrent changes. Controls remain collapsed until requested.

## Release resilience fixes

The account-scoped, report-scoped draft survives navigation and reload in this browser tab for up to 24 hours. It is cleared after successful publication and when signed out; unavailable browser storage does not prevent using the form. Validation retains the footer message and moves focus to the first missing field. Arc placeholder text uses its neutral-8 token to meet contrast on white. Layout, typography and component treatment remain as approved.
