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
| `NETLIFY_SITE_NAME` | Netlify site name (Site settings → General → Site details). Powers the Studio **Dashboard** deploy widget. |
| `NETLIFY_SITE_API_ID` | Netlify **API ID** for the web site (same screen). |
| `NETLIFY_BUILD_HOOK_ID` | Build hook **ID** only (Build & deploy → Build hooks — not the full hook URL). |
| `PUBLIC_SITE_URL` | Optional; production origin without trailing slash. Shown in the deploy widget when set. |

The job runs `npm ci` at the repo root, then `npm run deploy:studio`.

For **local Studio** (`npm run dev:studio`), set the same Netlify values with the `SANITY_STUDIO_` prefix in the repo root `.env` (gitignored):

- `SANITY_STUDIO_NETLIFY_SITE_NAME`
- `SANITY_STUDIO_NETLIFY_SITE_API_ID`
- `SANITY_STUDIO_NETLIFY_BUILD_HOOK_ID`
- `SANITY_STUDIO_PUBLIC_SITE_URL` (optional)

For **hosted Studio** (`*.sanity.studio`), the production bundle is built with Vite, which only exposes variables prefixed with **`SANITY_STUDIO_`** to browser code ([environment variables](https://www.sanity.io/docs/environment-variables)). The workflow therefore sets `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET` from the same secrets as `SANITY_PROJECT_ID` / `SANITY_DATASET`. If those studio-prefixed vars are missing at build time, the deployed site throws “missing SANITY_PROJECT_ID/SANITY_DATASET” in the browser even when CLI deploy succeeds.

## Sanity CORS origins

Configure CORS in the Sanity project to allow:

- local web dev origin (for example `http://localhost:4321`)
- Netlify production domain (and preview domain if used)

## On-demand web deploy (recommended)

Publishing in Sanity updates the **content API** immediately; the **public site** (static pages, blog, `.ics` calendar files) updates only after a **Netlify build**.

**Do not** configure a Sanity webhook that triggers Netlify on every publish — that uses a full build per document and burns Netlify free-tier credits.

### Studio Dashboard widget

1. In Netlify, create a **build hook** for the web site (Build & deploy → Build hooks). Note the site **name**, **API ID**, and hook **ID**.
2. Configure secrets/env as in [Studio deployment (GitHub Actions)](#studio-deployment-github-actions) and local `SANITY_STUDIO_NETLIFY_*` vars above.
3. In hosted Studio, open **Dashboard** → **Deploy public website** after a batch of publishes.

### Other ways to deploy

- **Netlify UI**: Site → Deploys → Trigger deploy.
- **Build hook URL** (maintainers): `curl -X POST -d {} "https://api.netlify.com/build_hooks/<BUILD_HOOK_ID>"`

### Sanity webhooks

If a publish→Netlify webhook was enabled during early setup, **disable or delete it** in [sanity.io/manage](https://www.sanity.io/manage) so deploys stay on-demand only.

## CI command contract

Use root scripts as the source of truth:

```bash
npm run lint
npm run typecheck
npm run build
```

