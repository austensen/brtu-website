---
name: Members-only with real concealment and SEO safety
overview: "Extends the members-only feature to require real concealment (no members-only body or titles in HTML/JSON for unauthenticated visitors) and explicit SEO controls (noindex, sitemap/feed exclusions). Assumes Netlify server/edge behavior (Astro hybrid and/or Functions + httpOnly cookies), not client-only gates. Includes a billing note: extra Functions/SSR are allowed on Netlify’s credit-based Free plan within credit limits; Open Source plan is a separate, application-based program unlikely to apply by default. Sanity Studio unchanged in role."
todos:
  - id: approval-infra
    content: "Confirm explicit approval for Type C drift: @astrojs/netlify, output hybrid (or SSR), serverless auth endpoint, httpOnly session — update docs/ws-j-deploy-ci-env.md build/publish notes"
    status: pending
  - id: studio-fields
    content: Add membersOnly to event + resourceCategory; members help (+ optional checklist) on siteSettings; deploy schema when ready
    status: pending
  - id: groq-ics
    content: Extend apps/web/src/lib/sanity/queries.ts; exclude members-only from static ICS; add server-only GROQ helpers for authenticated responses where needed
    status: pending
  - id: server-session
    content: "Netlify Function (or Astro server endpoint): POST password / magic token → set httpOnly Secure cookie; GET validation helper; no secrets in PUBLIC_ client bundle for auth"
    status: pending
  - id: hybrid-routes
    content: "Mark events/resources list + detail routes as server-rendered (prerender false) or use Edge middleware so HTML response omits members-only rows and bodies without valid cookie"
    status: pending
  - id: seo-surface
    content: "Sitemap, robots, meta/OG, hreflang: exclude or noindex members-only URLs; unauthenticated responses use noindex + generic titles; no JSON-LD for hidden member entities"
    status: pending
  - id: members-ui
    content: Members nav link, members page (help from siteSettings), URL param bootstrap that calls server to set cookie then strip query
    status: pending
  - id: docs-env
    content: Document server-only secrets (session signing key, members password hash or comparison secret), Netlify env split PUBLIC_ vs server, operational limits
    status: pending
isProject: false
---

# Members-only content with real concealment and SEO safety

This document **copies and supersedes** the intent of the repo copy **[`members-only_gated_content_afc5a424.plan.md`](members-only_gated_content_afc5a424.plan.md)** (“soft gating”) and **tightens** requirements for **confidentiality** and **search engine visibility**.

---

## Netlify: Free plan vs Open Source plan (billing determination)

**Sources (re-verify before any contractual or budget commitment):** [Netlify Open Source Plan Policy](https://www.netlify.com/legal/open-source-policy/), [Credit-based pricing plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/) (Netlify Docs), [Netlify pricing](https://www.netlify.com/pricing/).

**Open Source plan (OSS program)** — This is **not** the same as “our repo has an open-source license.” Netlify’s policy targets sites **about open-source-licensed software** and its community, requires a **Netlify attribution** link on the main page or all internal pages, and states the project **must not be commercial**. Approval is **application-based** ([opensource form](https://opensource-form.netlify.com/)). A neighborhood **tenant union** public site is **unlikely to match** the published examples (e.g. framework documentation sites) unless Netlify explicitly accepts a specific application. The OSS plan advertises **10,000 credits/month** and other benefits versus the ordinary Free tier.

**Standard Free (credit-based) plan** — For typical new Netlify accounts on credit-based billing, Netlify documents **300 credits/month** on Free with a **hard limit** (no auto-recharge). **Serverless Functions**, hybrid/SSR workloads that run on Netlify’s compute, and traffic are **metered in credits** (e.g. function **GB-hours**, **web requests** per 10k — Netlify states web requests metering **includes edge functions** — and **bandwidth**). **Determination:** the **extra infrastructure** in this plan (`@astrojs/netlify`, hybrid SSR, login/logout **Functions** or Astro server endpoints) is **allowed on the Free plan** as **included product capability**; there is **no separate fee** solely for “turning on Functions/SSR” beyond **staying within credit limits**. Heavy SSR on many routes or viral traffic can still **exhaust** the monthly credit pool and require upgrading or optimization.

**Practical takeaway:** Budget against **Free tier credits** by default; treat **Open Source plan** credits as **uncertain** unless the org applies and Netlify confirms eligibility. Monitor **usage** in the Netlify dashboard after shipping.

**Not required for this feature:** Netlify’s built-in **Password protection** / **basic auth** (tabled as **Pro** features in Netlify’s plan comparison) — custom members auth replaces that.

**Disclaimer:** Pricing and plan tables change; confirm the latest numbers on Netlify’s site for your account type (including **legacy** vs **credit-based** plans).

---

## Explicit user approval required (infrastructure or scope expansion)

Delivering **real concealment** and **SEO-safe** behavior is **not compatible** with a **pure static** `output: "static"` site for pages that embed members-only titles or bodies at build time. The following are **Type C** options until explicitly approved (per [docs/cursor-plan-mode-prompt.md](docs/cursor-plan-mode-prompt.md) and the master plan):

- **Netlify server runtime for the web app** — e.g. [`@astrojs/netlify`](https://docs.astro.build/en/guides/integrations-guide/netlify/) with **`output: 'hybrid'`** or **`'server'`**, and/or **Netlify Edge Functions** for auth checks.
- **Server-side session** — e.g. **httpOnly, Secure, SameSite** cookie issued only after validating the shared password (or magic link) via a **Netlify Function** or Astro **server endpoint** (secrets stay **server-only**, not `PUBLIC_*`).
- **Per-request HTML** for affected routes so crawlers and logged-out users never receive members-only **titles, descriptions, body copy, download URLs, or list rows** in the response body.

**Safer alternative (if approval is withheld):** ship the **original soft-gating** plan only, with documented limits (content may appear in HTML/SEO).

---

## Intent (unchanged product goals)

- Editors mark **events** and **resource categories** as members-only in Sanity.
- Authenticated members see members-only events and categories/resources; unauthenticated visitors do not.
- **Members** in the primary nav opens a page with password entry and **help text from** [`apps/studio/schemas/documents/siteSettings.ts`](apps/studio/schemas/documents/siteSettings.ts).
- **Magic link** via query param: on load, **exchange** param for a **server-set session** (not only `localStorage`), then **strip the URL** with `history.replaceState` (or redirect) so users do not copy secrets by mistake.
- **Sanity Studio** remains the CMS; schemas and queries extend as before.

---

## New requirements: real concealment

**Definition:** For any request **without** a valid member session, the origin must **not** send members-only **content** (including titles, summaries, portable text, file URLs, meeting links, ICS snippets embedded in HTML, or list items) in HTML, JSON embedded in HTML, or **response headers** that duplicate that content.

**Implications:**

1. **No client-only authorization** for sensitive fields. A React “gate” over static HTML **does not** satisfy this plan.
2. **Build-time static generation** for mixed public/members lists is insufficient unless the static HTML **excludes** all members-only rows globally (then logged-in users would need a **client or server refetch** — server refetch with cookie is acceptable).
3. **Password and magic-link secrets** must not ship in the browser bundle. Compare credentials **only on the server**; store an **opaque session** (signed cookie or server-side session store — signed cookie is usually enough on Netlify).

**ICS:** Keep excluding members-only events from **public** [`scripts/generate-event-ics.ts`](apps/web/scripts/generate-event-ics.ts) output, or serve member-capable calendars only behind the same auth mechanism (separate path + cookie), so feeds do not leak.

---

## New requirements: SEO and crawlers

**Goals:** Members-only URLs and content must not **gain search visibility** or **leak snippets** into public search results.

Concrete checks:

| Surface | Requirement |
|--------|-------------|
| **HTML `<title>` / meta description / OG tags** | For unauthenticated access to a members-only **detail** URL, emit a **generic** title/description (e.g. “Members — Bay Ridge Tenant Union”) or minimal stub — **not** the real event/resource title. |
| **`robots` meta / `X-Robots-Tag`** | Unauthenticated responses for members-only resources should include **`noindex, nofollow`** (or stricter as appropriate). Authenticated views may use **`noindex`** for entire members area if you want zero indexation of member views. |
| **Sitemap** | If the site has or adds `sitemap-index.xml` / route listing, **omit** members-only document URLs entirely, **or** list them only on an **authenticated** origin path policy is complex — **prefer omission** from any public sitemap generator. |
| **`hreflang` / alternate links** | Do not emit alternates that **surface** members-only slugs in `<head>` for unauthenticated HTML. |
| **JSON-LD / structured data** | **No** `Event`, `CreativeWork`, or download-oriented schema for members-only entities in unauthenticated HTML. |
| **Canonical URLs** | Avoid signaling duplicate “public” canonicals for member URLs; prefer **noindex** over conflicting canonical gymnastics. |

**Crawler behavior:** Search engines do not send your member cookie. Any **server-rendered** branch that omits members-only rows for “no cookie” requests automatically keeps list pages SEO-aligned with what humans see logged out.

---

## Scope boundaries

- Still **no** full per-user identity product (shared password / shared magic token is fine).
- **No** Sanity replacement; Studio schemas as in the original plan (event + resourceCategory + siteSettings help).
- **Framework:** Prefer **staying on Astro** with **hybrid/server** on Netlify rather than rewriting to a standalone React SPA (see assessment below).

---

## Classification (master plan guardrails)

- **Type C (approved subset):** Netlify **server/edge** behavior for auth and selective SSR, documented in [`docs/ws-j-deploy-ci-env.md`](docs/ws-j-deploy-ci-env.md) (build command, env vars, **server-only** secrets).
- **Type A/B:** Sanity fields, GROQ modules, sitemap/robots **logic**, components — as long as they respect the server boundary.

---

## Sanity Studio (same as original plan)

1. **Event** — [`apps/studio/schemas/documents/event.ts`](apps/studio/schemas/documents/event.ts): `membersOnly` boolean, default `false`; Studio copy explains translation parity.
2. **Resource category** — [`apps/studio/schemas/documents/resourceCategory.ts`](apps/studio/schemas/documents/resourceCategory.ts): same.
3. **Site settings** — [`apps/studio/schemas/documents/siteSettings.ts`](apps/studio/schemas/documents/siteSettings.ts): members login help (`text` or `richText`).
4. **Editor checklist** — optional reminder in [`apps/studio/actions/editorChecklistAction.tsx`](apps/studio/actions/editorChecklistAction.tsx).

---

## GROQ and data loading

- **Shared query definitions** in [`apps/web/src/lib/sanity/queries.ts`](apps/web/src/lib/sanity/queries.ts) with `coalesce(membersOnly, translationOf->membersOnly, false)` for events and categories (same as original plan).
- **Two consumption modes:**
  - **Build-time / public static** (where still allowed): queries **exclude** `membersOnly == true` for any artifact shipped to all users (e.g. ICS script, public sitemap build, optional prerendered stubs).
  - **Request-time (server):** authenticated handler uses **full** query (includes members); unauthenticated uses **filtered** query (excludes members-only rows and rejects or stubs detail fetches for members-only slugs).

Use a **Sanity read token** only in **server** code (Netlify env, not `PUBLIC_`), if the API must read drafts or private fields later; for published members content, CDN API may suffice — still **server-only** client instantiation.

---

## Web app architecture (revised)

**Session**

- **POST** `/api/members/login` (Netlify Function or Astro server route): body `{ password }` or `{ token }` → validate against **server env** → `Set-Cookie` **httpOnly** session (signed payload or opaque id + server secret).
- **POST** logout clears cookie.
- **Magic link:** query param read by a **small server-rendered** fragment or the login API on first paint: prefer **302** to clean URL after `Set-Cookie` to avoid leaving secrets in client-controlled history (evaluate UX vs. original `replaceState`-only flow).

**Route rendering**

- **Hybrid Astro on Netlify:** set `export const prerender = false` on [`apps/web/src/pages/[locale]/events/index.astro`](apps/web/src/pages/[locale]/events/index.astro), [`events/[slug].astro`](apps/web/src/pages/[locale]/events/[slug].astro), [`resources/index.astro`](apps/web/src/pages/[locale]/resources/index.astro), [`resources/[slug].astro`](apps/web/src/pages/[locale]/resources/[slug].astro) (exact set to confirm so **public** pages can remain static if split routes — see “Route split” below).

**Route split (optional optimization)**

- If you want **most** of the site to remain static: extract **only** events/resources segments to a **server** group, or use **middleware** to intercept `/[locale]/events` and `/[locale]/resources` subtree. Document the chosen split in WS-J.

**Members page**

- Can remain **static** if it contains no secrets (only public help text + form that POSTs to server).

**Nav**

- [`apps/web/src/components/HeaderNav.tsx`](apps/web/src/components/HeaderNav.tsx): **Members** link unchanged from original plan.

---

## SEO implementation checklist (engineering)

- Central helper: `membersSeoHeaders(isMembersRoute, authenticated, docIsMembersOnly)` → `noindex` rules.
- Audit **BaseLayout** `<title>`, meta description, OG, any future JSON-LD — ensure **detail** pages never bind real member titles into head for unauthenticated responses.
- **Sitemap:** locate or add generator (if absent today, add when introducing sitemap) and **filter** using same `membersOnly` coalesce logic.
- **robots.txt:** if members paths are under predictable prefixes, optionally disallow `/en/members/` for crawlers — **note** `robots.txt` is not a security control; it assists SEO hygiene only.

---

## i18n (WS-B)

- Unchanged: localized routes and `siteSettings` per locale.
- Language switcher on members-only detail: when unauthenticated, **do not** expose other-locale member slugs in markup.

---

## Acceptance criteria (additions beyond original plan)

- **View-source / curl without cookie:** no members-only titles, descriptions, file URLs, or list rows in HTML for events/resources surfaces.
- **curl -I** on unauthenticated members-only detail: `noindex` (meta or header) and no sensitive `title`.
- **Sitemap / feeds:** no members-only URLs or only URLs that respond with safe public stubs (prefer **omission**).
- **ICS:** no members-only events in **public** calendar files.
- **Lighthouse / Rich Results test:** no structured data referencing hidden member entities for logged-out fetch.
- **Docs:** [`docs/ws-j-deploy-ci-env.md`](docs/ws-j-deploy-ci-env.md) lists server secrets, adapter expectations, and “members” behavior for previews vs production.

---

## Assessment: Astro static vs hybrid vs “basic dynamic React site”

**Recommendation:** **Keep Astro**, adopt **Netlify + hybrid/server** for the **minimum route surface** that must vary by cookie (events + resources list/detail, and any future members-only pages). **Do not** migrate the whole site to a CRA/Vite SPA solely for this feature.

| Concern | Astro hybrid / server on Netlify | Pure static + client gates | Full React SPA |
|--------|-----------------------------------|----------------------------|----------------|
| **Real concealment** | **Yes** — HTML differs by request when implemented correctly. | **No** — same HTML for everyone. | Possible but **reintroduces** SSR/SSG or leaks same as static if mishandled. |
| **SEO control** | **Yes** — per-request head tags and robots. | Weak — crawlers may still see leaked static props. | Same as Astro if SSR; routing rewrite cost. |
| **Framework churn** | Incremental; marketing pages can stay prerendered. | N/A — insufficient for this spec. | High — new router, data loading, i18n, deploy story. |

**Conclusion:** For **real concealment + SEO**, the decisive step is **server-side rendering or middleware on Netlify**, not the **React-vs-Astro** UI layer. Astro remains the best fit; a standalone React site is **Type C** migration with **no inherent security advantage** unless paired with the same server auth model anyway.

---

## Risks and open questions

- **Netlify credits:** SSR + Functions consume **monthly credits** on credit-based Free; monitor dashboards and optimize cache/route split if usage approaches the limit (see **Netlify: Free plan vs Open Source plan** above).
- **Netlify cost and cold starts:** SSR routes add runtime vs static; acceptable for small traffic but should be monitored.
- **Preview deployments:** ensure server env secrets exist on Netlify previews or gate login tests to production-like envs.
- **Caching:** Configure `Cache-Control` appropriately so CDNs do not cache **authenticated** HTML as the public variant (vary by cookie or disable cache on sensitive routes).
- **Magic link in query strings:** may appear in server logs — prefer one-time redemption and short-lived tokens; document operational hygiene.

---

## Relationship to the original plan file

- **Original (soft gating), repo copy:** [`members-only_gated_content_afc5a424.plan.md`](members-only_gated_content_afc5a424.plan.md) — same editor UX and schema baseline; ignore its “bundle-visible password” and “client-only gate” sections when following **this** document.
- **This file:** canonical for **concealment + SEO** requirements and **server** architecture.
- **Final implementation checklist:** [`members_area_final_implementation_plan.md`](members_area_final_implementation_plan.md) (locks decisions from stakeholder Q&A).
