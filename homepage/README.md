# Go4Goa homepage demo

A marketing homepage inspired by Butter's layout and scroll choreography. The approved hosted arrangement serves this page at `/`, with the existing application map at `/map`. Other app routes, APIs and database behavior remain in the existing application.

## Run

From `/Users/zakkrevitt/code/GO-GOA`:

```sh
npm --prefix homepage install
npm --prefix homepage run dev
```

Open http://127.0.0.1:4320. The homepage previews need no database, account, API key or external service. In development, the main CTA opens the existing app at http://127.0.0.1:4310/map; run the root app separately to use it. The server binds only to your computer. Stop it with Ctrl+C in the terminal where you started it.

```sh
npm --prefix homepage run build
npm --prefix homepage run preview
```

## What to try

- Scroll from the opening keychain through the pinned statement-to-map reveal.
- Switch Map / Document / Meetups / Resources in the product demo.
- Choose report categories and preview the moderation step.
- Change the meetup poster colour and toggle the fictional RSVP.
- Scroll the desktop horizontal story. Phones use a vertical story.
- Open the Notice / Connect / Act accordion, photo gallery, navigation and FAQs.
- Use the bottom-right motion control or your operating system's reduced-motion setting.

All interactive data is fictional and held only in component state. The map image is a screenshot of the existing Go4Goa local app with fictional seed reports. No report, RSVP, message or account is created. The hero is an original generated product render with pointer-independent scroll motion, not Butter's 3D model or source assets.

From the repository root, `npm run build` builds both pages and validates the combined output in `dist/`. Vercel sends `/` to the homepage and app routes to `app.html`; the app service worker excludes the homepage and launches at `/map`.

Research and intended sequence are in `docs/PLAN.md`. Checks and demo boundaries are in `docs/VERIFICATION.md`, with the independent visual review in `docs/REVIEW.md`. Photo attribution is available from the footer. Publication uses the repository's reviewed `cloud-release` workflow.
