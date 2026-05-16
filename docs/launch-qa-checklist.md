# Launch QA checklist

Run this before calling the site “live.” Technical env details: [`docs/ws-j-deploy-ci-env.md`](ws-j-deploy-ci-env.md). Editor-facing context: [`docs/editor-handbook.md`](editor-handbook.md).

Replace `https://YOUR_PROD_HOST` with your real production origin (no trailing slash — matches `PUBLIC_SITE_URL`).

---

## 1. Build hygiene (local or CI)

From the **repository root**:

```bash
npm run lint
npm run typecheck
npm run build
```

All must succeed. (`build` includes the web app and Studio per root scripts.)

## 2. Netlify (web)

Confirm in the Netlify UI:

| Setting | Expected |
|--------|----------|
| Build command | `npm run build:web` |
| Publish directory | `apps/web/dist` |
| `PUBLIC_SANITY_PROJECT_ID` | Set |
| `PUBLIC_SANITY_DATASET` | Set |
| `PUBLIC_SANITY_API_VERSION` | Optional |
| `PUBLIC_SITE_URL` | Production origin **without** trailing slash (used for Astro `site` and event `.ics` absolute URLs) |
| `MEMBERS_SESSION_SECRET` | Set (server-only; signs member session cookie) |
| `MEMBERS_PASSWORD` | Set (server-only; Members page login) |
| `MEMBERS_MAGIC_LINK_TOKEN` | Set (server-only; bootstrap URL `t` param) |

## 3. Sanity

- **CORS**: Allowed origins include local dev (e.g. `http://localhost:4321`) and production (and preview if used). See [`docs/ws-j-deploy-ci-env.md`](ws-j-deploy-ci-env.md).
- **On-demand deploy** (no publish webhook):
  1. Confirm there is **no** Sanity webhook pointing at the Netlify build hook (sanity.io/manage → API → Webhooks).
  2. **Verify**: publish a small test change — confirm **no** new Netlify deploy starts within ~1 minute.
  3. In Studio **Dashboard**, deploy **Public website** — confirm a Netlify build starts and succeeds.
  4. Confirm the public site shows the test change after the build.
  5. **Record**: screenshot of the successful Dashboard deploy or Netlify deploy log for launch records.

## 4. Smoke URLs

Check each in a clean browser session (or incognito). Adjust paths if your slugs differ.

| Check | URL / action |
|-------|----------------|
| Home | `https://YOUR_PROD_HOST/en/` (or your default locale) |
| About | Marketing page slug from CMS (often `/en/about`) |
| Contact — mailto | Primary contact button/link opens mail client with expected address |
| Contact — form | Submit test message; after Netlify processes POST, land on **`?sent=1`** and see **success** copy from CMS |
| Blog index | `/en/blog` |
| Blog pagination | `/en/blog/page/2` if you have more than 10 posts |
| Single post | One real post URL |
| Resources list | `/en/resources` |
| Resources filter | Change category filter; list updates |
| Event detail | One real event URL |
| ICS | Open `https://YOUR_PROD_HOST/calendar/en/<event-slug>.ics` — downloads/opens in a calendar app |
| Google Calendar link | From event page, “add to calendar” (or equivalent) opens Google with plausible date/time |
| Language switcher | Switch locale (if multiple published); href alternates sensible |
| Members page | `/en/members` — login form; after password, members-only events/resources visible |
| Members bootstrap | In incognito, open `https://YOUR_PROD_HOST/api/members/bootstrap?t=<TOKEN>&to=/en/events` (use real token from env, not committed); should land on `/en/events` signed in; URL bar must not retain `t` |

## 5. i18n

If a **second locale** has real content:

- Confirm `publishedLocales` in `apps/web/src/lib/i18n/locales.ts` includes it (or build derives locales correctly).
- Confirm translated URLs build and the switcher points to the right slugs.

## 6. Light accessibility / performance

- **Keyboard**: tab through header, main content, footer; focus visible.
- **Headings**: logical order on Home, post, event, resource pages.
- **Images**: hero and key images have **alt text** where editors added them.
- **Optional**: run Lighthouse on Home, a post, an event, and a resource page — note scores; not a full WCAG audit.

## 7. Launch sign-off

| Field | Value |
|-------|--------|
| Launch approver | _Name_ |
| Date | _YYYY-MM-DD_ |
| Notes | _e.g. webhook screenshot location, known follow-ups_ |
