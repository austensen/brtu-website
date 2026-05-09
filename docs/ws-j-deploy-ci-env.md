## WS-J deploy, CI, and environment wiring

This project follows a two-site deployment model:

- **Web**: Netlify site built from `apps/web`
- **Studio**: Sanity-hosted Studio (recommended for MVP simplicity)

## Web deployment (Netlify)

1. Create a Netlify site connected to this repository.
2. Use these build settings:
   - Build command: `npm run build:web`
   - Publish directory: `apps/web/dist`
3. Configure environment variables in Netlify UI:
   - `PUBLIC_SANITY_PROJECT_ID`
   - `PUBLIC_SANITY_DATASET`
   - `PUBLIC_SANITY_API_VERSION` (optional)
   - `PUBLIC_SITE_URL` (production origin without a trailing slash; used for Astro `site` and event `.ics` links)
4. Deploy from the default branch.

The `apps/web` build runs `tsx scripts/generate-event-ics.ts` before `astro build`, writing files under `public/calendar/[locale]/` that are served as `/calendar/[locale]/[slug].ics`.

## Studio deployment (Sanity hosted)

1. From `apps/studio`, run:
   - `npm run deploy:studio`
2. Configure Studio env vars in the deployment target:
   - `SANITY_PROJECT_ID`
   - `SANITY_DATASET`
   - `SANITY_API_VERSION` (optional)

## Sanity CORS origins

Configure CORS in the Sanity project to allow:

- local web dev origin (for example `http://localhost:4321`)
- Netlify production domain (and preview domain if used)

## Rebuild-on-publish webhook (optional but recommended)

1. In Netlify, create a build hook for the web site.
2. In Sanity project settings, add a webhook:
   - Trigger: publish/unpublish on relevant document types
   - URL: Netlify build hook URL
3. Confirm a content publish triggers a new Netlify build.

## CI command contract

Use root scripts as the source of truth:

```bash
npm run lint
npm run typecheck
npm run build
```

