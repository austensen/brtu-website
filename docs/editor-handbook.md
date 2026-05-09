# Editor handbook — Bay Ridge Tenants Union website

Short guide for people who publish content in **Sanity Studio**. Technical deployment steps live in [`docs/ws-j-deploy-ci-env.md`](ws-j-deploy-ci-env.md).

## How to open Studio

- **Hosted Studio**: use the URL your team uses after deploy (see [`docs/ws-j-deploy-ci-env.md`](ws-j-deploy-ci-env.md) — Studio deploy).
- **Local Studio** (developers): from the repo, `npm run dev:studio` after copying env files per [`README.md`](../README.md).

You need a Sanity account with access to this project. Ask your **Sanity project admin** if you cannot sign in.

## Desk tour (where things live)

The left sidebar is grouped like this (see `apps/studio/structure/index.ts`):

| Section | What it’s for |
|--------|----------------|
| **Site settings** | One document per **locale** — organization name, short description, social links. |
| **Pages** | **Home**, **About**, and **Contact** pages, each listed by type and locale. |
| **Posts** | Blog / news articles. |
| **Resources** | Downloadable items (one file each). |
| **Events** | Meetings and actions with date, time, and location. |
| **Resource categories** | Labels used to filter the resources library. |

## Before you publish (Editor checklist)

In Studio, open any document and use the document menu action **Editor checklist**. It is a **reminder only** — it does **not** block publishing.

Keep the checklist aligned with what you see in Studio; the same ideas are implemented in `apps/studio/actions/editorChecklistAction.tsx`.

**All types**

- **Locale** matches the audience for this document.
- For **non-English** documents: set **English source document** to the matching published English entry (this ties translations together for the language switcher).

**Pages**

- Title and slug match what should appear on the public site.
- **Contact** pages: confirm **email** and **Netlify form** labels and messages are complete (see [Contact page](#contact-page) below).

**Posts**

- **Hero image** has meaningful **alt text** when you use an image.
- **Slug** is unique for this locale.

**Resources**

- **File** attachment is present and opens correctly.
- **Category** is set for this locale.

**Events**

- **Start** and **end** times, **timezone**, and **location** look correct.
- **Slug** is unique for this locale.

**Resource categories**

- Title and slug are set.

**Site settings**

- Organization name and short description are up to date.

## Locales and translations

Each localizable document has a **locale** field (e.g. English first; more can be added over time).

**English source document** (`translationOf`): for a non-English document, point this at the **English** document it translates. That lets the site offer the right alternate URL in the language switcher.

### What visitors see without a translation

The site is built so **English documents are the anchor**. For another **published** locale, if there is no translated document yet but the English page exists, visiting the same slug under that locale (for example `/es/about` when only English exists) shows a **short redirect** to the English page (`RedirectShell` — “Continue to the English page”). This keeps links shareable while translations are rolled out.

### Developer note: `publishedLocales`

The public site only builds routes and language-switcher entries for locales listed in **`apps/web/src/lib/i18n/locales.ts`** (`publishedLocales`). When you start publishing a new language, a developer may need to add that locale there (or the project may automate this using a build-time query such as `distinctPublishedLocales` in `apps/web/src/lib/sanity/queries.ts`).

## Pages (Home, About, Contact)

- **Home** is served at the locale root only (`/en/`, `/es/`, …). In Studio the **Slug** field is hidden for Home — you do not set one.
- **About** and **Contact**: **Slug** becomes part of the URL after the locale (for example `/en/about`). Those slugs also feed the main navigation (defaults are often `about` and `contact` — confirm in your CMS entries).

**Home** is still a special page type in the desk (under **Pages → Home pages**); it is not edited like a `/slug` marketing page.

## Contact page

### Current setup: Netlify Forms

The public **Contact** page uses a Netlify form when **contact form** fields are filled in Sanity. **All** user-visible form text (labels, submit button, success and error messages) must come from the CMS — do not expect the website to hardcode copy.

Important behavior:

- The form **posts** to the same path with **`?sent=1`**. After a successful submit, Netlify redirects back to that URL and visitors see the **success message** from the CMS.
- A **honeypot** field is included for spam protection — do not remove or rename hidden fields unless a developer changes the template.

If submissions never arrive, check Netlify form settings and spam filtering; technical contacts are in [Break-glass contacts](#break-glass-contacts-fill-in-locally).

### Alternative: Google Form (not wired in code today)

The project may later use an **embedded Google Form** instead of Netlify. Two editorial patterns:

1. **One form per locale** — each Contact document stores the embed URL for that language (simplest for translators).
2. **One shared form** — add an explicit **language** question so you can sort responses.

Switching to Google Forms requires a **developer** to change the Astro template; until then, use the Netlify fields in Sanity.

## Blog (Posts)

- **Published date** controls ordering (newest first).
- **Hero image**: add **alt text** for accessibility.
- **Slug**: must be unique per locale.
- The listing shows **10 posts per page**; older posts appear on `/[locale]/blog/page/2`, `/[locale]/blog/page/3`, etc.

## Resources

- Each resource has **one** file attachment.
- **Category** is required for filtering on the public site.
- **Replace file workflow**: upload a new file on the same resource document and **publish**. The public URL stays the same (same slug); visitors get the new file. If a CDN caches the old file aggressively, ask a developer about cache behavior.

## Events

- Enter **start** and **end** in the editor; set **timezone** so times display correctly (there is **no all-day** toggle in MVP).
- **Location**, **map link**, and **join URL** help people attend online or in person.

**Add to calendar**

- The event page includes a **Google Calendar** link built from the event fields.
- An **ICS** file is generated at build time at:

  `https://<your-site>/calendar/<locale>/<slug>.ics`

  For correct absolute links inside ICS files, production must set **`PUBLIC_SITE_URL`** (see [`docs/ws-j-deploy-ci-env.md`](ws-j-deploy-ci-env.md)).

  **Local preview:** the dev server does not generate `.ics` files automatically. Developers can run `npx tsx scripts/generate-event-ics.ts` from `apps/web` with the same Sanity-related `.env` values as the web app, or expect those URLs to 404 until a full `npm run build` (see [`docs/ws-j-deploy-ci-env.md`](ws-j-deploy-ci-env.md)).

## Publishing: from draft to live

1. **Draft** in Studio until ready.
2. Click **Publish** when content is correct.
3. The public site updates on the **next successful build**. If your team configured a **Sanity webhook** to Netlify, publishing triggers a rebuild automatically (usually within a few minutes). Otherwise, someone must **trigger a deploy** manually.

Details: [`docs/ws-j-deploy-ci-env.md`](ws-j-deploy-ci-env.md).

## Screenshots to capture (optional)

If you want visual runbooks, capture these and store them where your team keeps internal docs (or add them under `docs/editor-handbook/` in git):

1. Studio **desk** showing Pages / Posts / Resources / Events.
2. A **Contact** page document with **contact form** fields filled.
3. **translationOf** / English source field on a non-English document.
4. Netlify **Forms** tab showing a test submission after launch QA.
5. Sanity **Webhook** delivery log or Netlify **Deploy** triggered by a publish (for launch records).

## Break-glass contacts (fill in locally)

Do not commit personal phone numbers or emails to the public repo. Copy this table into your private runbook and fill it in.

| Role | Who | Notes |
|-----|-----|--------|
| Sanity project admin | _Name / contact_ | Access, dataset, CORS, webhooks |
| Netlify site admin | _Name / contact_ | Build hooks, env vars, forms, DNS |
| DNS / domain owner | _Name / contact_ | Custom domain, TLS |
| Code / repo maintainer | _Name / contact_ | `publishedLocales`, template changes |

## Launch QA and Phase 2

- **Launch checklist (printable)**: [`docs/launch-qa-checklist.md`](launch-qa-checklist.md)
- **Post-MVP backlog triage**: [`docs/phase2-backlog.md`](phase2-backlog.md)
