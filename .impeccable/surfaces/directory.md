# Directory

Mode: Operate. Local development extension of the established Go4Goa interface. Primary target: src/pages/Directory.tsx. Related: src/pages/directory.css, src/components/TabBar.tsx.

## Direction contract

THESIS: Find the right Goa contact, inspect its evidence, then save the next follow-up. Open search results carry the work.

OWN-WORLD: Inherit the current white canvas, upright sans, civic green, rounded UIArc controls and compact bottom dock. No photos, decorative tiles or side stripes.

STORY: Search ActForGoa listings related to trash and infrastructure, narrow to sector, government or services, and open a listing. Keep local relationship notes alongside evidence.

FIRST VIEWPORT: Directory title and Saved control, a broad search field, category chips, optional filters, then divided result rows with a name, short description and useful location. Mobile stacks controls and keeps Resources selected in the bottom dock.

FORM: User-pinned port of ActForGoa community and CRM into the incumbent UI, code-led. No concept roll for this specified extension. Query/filter URLs survive back navigation.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Scope correction: The user narrowed both Resources and Directory to trash and infrastructure only. Both headers link attribution to ActForGoa, and both have “Need more resources? Visit ActForGoa” below the content.

Navigation correction: The user subsequently moved Directory out of the bottom dock and into a button on the Resources landing page. `/directory` remains its route, with Resources active in navigation. The user also requested concise Directory rows and a Resources footer containing only the bold onward link.

## Implemented local surface, 29 October 2026

The Directory uses the incumbent white canvas, upright Helvetica Neue, civic green and UIArc controls. It introduces no new palette, type family or raster assets. Its page is capped at 1120px, with search and filters capped at 820px. Results remain open rows separated by structural horizontal rules, prioritizing a name, short description and useful location, with a compact Save action. Full source and contact details remain on the listing detail page. A result title is 20px on desktop and 18px at 700px and below. This surface does not establish new global design tokens.

Search, sector, audience, location, listing type, activity evidence, relationship, saved state, due state and sort use URL query parameters. Opening a record and returning preserves that query. The primary sectors are All contacts, Trash & recycling and Infrastructure; audience filters refine the already scoped results. The shared dock has Map, Report, Meetups, Resources and Profile in a centered row up to 560px wide. Resources provides the Directory button and remains selected on Directory routes.

Record details pair source evidence and public contact routes with a separate notes column. At 700px and below, notes move below the evidence with a structural top divider. Source review dates, activity evidence, historical status, website-access caveats and current-availability cautions remain distinct from a successful sync. Personal and volunteer direct phone/email values are withheld by the server projection; public institutional routes retain their caveats.

Saved relationships, notes and follow-up dates stay under `go4goa.directory.workspace.v1` in this browser profile. They are not account-synced or shared with ActForGoa. Explicit version-1 backup import/export remains compatible with the source format; imports preserve existing local notes. Imported notes for out-of-scope records remain in the backup but do not broaden the displayed directory. Storage failures, unavailable data, stale data and empty results have visible recovery or explanatory text.

Directory and Resources keep their ActForGoa attribution and onward link in the shared page framing. Resources places only the bold “Need more resources? Visit ActForGoa” link after its nested route content, so topic guides, the scoped resource directory, emergency information and missing-route states keep the same exit to the wider ActForGoa site. The former source-check reminder is removed from that footer.

## Evidence and limits

Source inspected: `src/pages/Directory.tsx`, `src/pages/directory.css`, `src/components/TabBar.tsx`, `src/components/tab-bar.css`, `src/pages/Resources.tsx`, `src/pages/resources.css`, `shared/directory.ts`, `shared/civic-scope.ts`, `server/directory.ts` and `shared/actforgoa/PROVENANCE.md`.

Earlier rendered evidence: `.impeccable/review/directory/desktop-viewport.png`, `mobile.png`, `narrow.png`, `resources-desktop.png` and `resources-mobile.png`. These establish the incumbent visual system but predate the five-tab navigation, concise rows and simplified Resources footer. Those focused revisions are recorded from current source; the earlier captures do not verify their final rendering or every nested route. Documentation and captures do not imply user acceptance, deployment or current contact verification.
