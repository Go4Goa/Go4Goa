# Map, Places and meetup handoff · 29 October 2026

The user will coordinate deployment through the orchestrator. Nothing in this pass was deployed, pushed or merged. Work is in `/Users/zakkrevitt/code/GO-GOA` on `codex/hosted-qa`, with concurrent Resources, Directory, navigation and theme changes in the same working tree. Preserve those changes and review the complete intended release snapshot before committing or deploying.

## Completed behavior

- The map uses the adapted Dizko marker, overlap and safe-area patterns with a sparse seven-layer OpenFreeMap vector style. Smaller controls, a single search row, optional filters and a closed-by-default results list leave the map visible. Short screens frame initial activity; clusters remain readable.
- The date picker uses fixed viewport-aware positioning, flips above its trigger and clears bottom navigation. Opening it does not scroll the form; keyboard close returns focus without scrolling.
- Shared place lookup serves meetup venues and report landmarks. Google autocomplete uses a session token; selecting a prediction resolves its coordinates. Explicit Search uses Text Search. Goa bounds and validation, cancellation, rate limits, readable errors and provider attribution are retained. Google results are not added to the OSM response cache.
- `For Kicks` resolves to the café at 325/A, Madhlamaz, Mandrem, Goa, approximately 15.669535, 73.7222267, through the actual supplied key.
- Meetups publish immediately for every signed-in creator, including recurring occurrences. Report moderation is unchanged. Event ownership, capacity and notification-consent checks remain enforced; creating a meetup does not grant a global moderator or organizer role.
- Graphic customization offers six palettes and four backgrounds with a live preview, persisted on creation and recurring dates. Owners can edit, preview, cancel and save graphics after publication; version checks protect concurrent changes.
- Creation opens `/events/:id?created=1` with a live confirmation. The dedicated page uses the exact shared green `MeetupPoster` from the creation preview. Share meetup uses native sharing, clipboard fallback and a selectable URL if clipboard access fails. The shared URL omits the creation query flag.
- Legacy pending meetups remain private until their creator chooses Publish meetup. The user's current local “Beach meatup” (`32ecaef9-c8af-43ee-a94c-2e96aad36347`) was published as requested and verified readable without an app account.

## Release configuration and limits

1. Apply `npm run db:setup` with the intended target database credentials. Migrations `006-publish-meetups.sql` and `007-meetup-poster.sql` are required. Migration 007 adds persisted graphic settings with the original green-solid default; migration 006 changes the event default to published and deliberately does not mass-publish old private pending records. Include the existing series/directory migrations in the complete release.
2. Set the server-only environment variable `GOOGLE_PLACES_API_KEY` on the intended deployment. The supplied local key is in ignored `.local/google-places-key` with mode 0600. Do not commit it, print it, or put it in a `VITE_` variable. Production does not read the local file. A scan confirmed the key is absent from built JavaScript.
3. The key was verified for Places Text Search, Autocomplete and Place Details. Requests to Geocoding, Routes, Static Maps and Elevation were denied. This describes the key's access, not a full inventory of Google Cloud project services. No API restrictions were changed or additional services enabled.
4. Resolve the provider presentation before public release: [Google's Places policy](https://developers.google.com/maps/documentation/places/web-service/policies) requires returned Places data displayed on a map to use a Google map. This local implementation currently selects returned coordinates into the existing OpenFreeMap picker. Use a compatible Google map setup or an appropriate [Places UI Kit integration](https://developers.google.com/maps/architecture/places-ui-kit-getting-started) with a separately restricted browser key; do not expose the server key. The local search/selection behavior is verified, but this provider compatibility work remains a release consideration.
5. Existing hosted target is the password-protected `go-goa-qa` Vercel project. Its stable production target is shared QA, not an ungated public resident launch. The orchestrator should follow the user's forthcoming deployment instructions and `docs/hosted-qa.md`. Local meetup records are not automatically copied into that database. Localhost share URLs only work on this computer; deployed pages generate their own same-origin share URL.
6. Vite reports the existing large shared map bundle (~340 KB gzip plus worker); the map stays lazy-loaded. This is a performance consideration on weak connections, not a build failure.

## Verification

- `npm run build` and TypeScript check passed.
- 27 unit tests passed.
- 6 isolated database/API integration scenarios passed, including immediate resident publishing, anonymous detail/calendar access, recurring publication, owner check-in/updates and rejection of unrelated accounts. Graphic persistence, owner-only updates, invalid styles and stale versions are covered.
- `scripts/qa-map.ts` passed eight sizes: 1440×950, 390×844, 390×540, 459×618, 320×720, 768×1024, 1024×800 and 844×390. Checked selection, filters, safe areas, keyboard, error/retry paths and report pin/coordinates. Fixtures exclude user-created local meetups for stable counts.
- Date picker checked at five viewport/scroll combinations, including opening near the bottom at 459×618 and 390×540, scrolling while open, Escape, focus return and selection.
- Real Places autocomplete/details verified in meetup and report forms. Empty/error/clear behavior checked; no QA report or meetup was submitted to the local user database.
- Dedicated page checked signed out at desktop, 459px and 320px, including native-share mock, cancellation, copied canonical link and manual fallback. Zero Axe violations on those detail pages, shared search, and tested map states.
- Graphic controls checked at 1440px, 459px and 320px: six palettes and four backgrounds, selected states, preview/cancel/save/reload and Axe0. Lowest calculated text contrast is 5.24:1, including intersecting pattern lines. Backend integration tests use an isolated database; browser save tests intercept requests and do not change the user’s meetup.
- Rendered screens and changed source inspected for upright text and absence of decorative side stripes. No Device Hub used.

Local ignored evidence: `.impeccable/review/map-qa.json`, `places-meetup-qa.json`, `google-maps-capabilities.json`, `poster-qa.json`, poster screenshots, map screenshots, calendar screenshots and `meetup-detail-{desktop,mobile,narrow}.png`. These are local verification records, not a claim that the complete concurrent app change set or hosted environment has been certified.

## Main files for this work

Map: `src/pages/Explore.tsx`, `src/components/FieldMap.tsx`, `src/components/map/`, `src/services/maps.ts`, `scripts/qa-map.ts`, `tests/map.test.ts`.

Calendar: `src/components/arc/date-picker/`, `package.json`, `package-lock.json`.

Places: `server/places.ts`, map endpoints in `server/app.ts`, key loader in `server/config.ts`, `src/components/PlaceSearch.tsx`, `place-search.css`, `EventPlaceSearch.tsx`, report integration and `tests/places.test.ts`.

Meetups: `server/events.ts`, `src/pages/CreateEvent.tsx`, `src/pages/Events.tsx`, `event-create.css`, `meetup-detail.css`, `src/components/MeetupPoster.tsx`, `meetup-poster.css`, `ShareMeetup.tsx`, migrations 006/007, shared poster validation, graphic controls/editor, `scripts/setup.ts` and related integration assertions. Shared files also contain other chats' work; do not replace them wholesale from an older checkout.
