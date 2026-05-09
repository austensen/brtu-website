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

Deploy from the repo root with:

```bash
npm run deploy:studio
```

That runs `sanity deploy` in `apps/studio`. Configure Studio env vars wherever you deploy:

- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_VERSION` (optional)

### Studio deployment (GitHub Actions)

The workflow [`.github/workflows/deploy-studio.yml`](../.github/workflows/deploy-studio.yml) deploys hosted Studio on **`main`** when files under **`apps/studio/`** or **`packages/locales/`** change. You can also run it manually from the Actions tab (**workflow_dispatch**).

Configure these **repository secrets** (Settings → Secrets and variables → Actions):

| Secret | Purpose |
|--------|---------|
| `SANITY_AUTH_TOKEN` | Required for non-interactive `sanity deploy`. Create a token with deploy access in [sanity.io/manage](https://www.sanity.io/manage). |
| `SANITY_PROJECT_ID` | Same as local Studio / `apps/studio/sanity.config.ts`. |
| `SANITY_DATASET` | Same. |
| `SANITY_API_VERSION` | Optional; omit to use the default in `sanity.config.ts`. |

The job runs `npm ci` at the repo root, then `npm run deploy:studio`.

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

