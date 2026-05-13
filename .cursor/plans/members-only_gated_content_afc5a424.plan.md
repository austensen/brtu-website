---
name: Members-only gated content
overview: "Add a low-friction “shared password + magic URL query param” member session (localStorage), Studio-driven help copy, `membersOnly` flags on events and resource categories, client-side gating on events/resources UIs, and document static-site limitations plus whether a full React rewrite is justified (spoiler: stay on Astro)."
todos:
  - id: studio-fields
    content: Add membersOnly to event + resourceCategory; members help (+ optional checklist) on siteSettings; deploy schema when ready
    status: pending
  - id: groq-ics
    content: Extend apps/web/src/lib/sanity/queries.ts (events, resources, categories, detail queries, allEventsForIcs) with coalesced membersOnly; update generate-event-ics if types change
    status: pending
  - id: members-session-ui
    content: Add session module, BaseLayout bootstrap island (query strip), [locale]/members page + MembersLoginForm, HeaderNav link
    status: pending
  - id: gate-lists-details
    content: Client-filter EventsIndex + ResourceDirectory; optional gates on EventDetail/ResourceDetail; wire astro pages props
    status: pending
  - id: docs-env
    content: Document PUBLIC_MEMBERS_PASSWORD, PUBLIC_MEMBERS_LINK_TOKEN, and limitations in docs/ws-j-deploy-ci-env.md
    status: pending
isProject: false
---

# Members-only content and “Members” login

## Intent

- Editors can mark **events** and **resource categories** as members-only in Sanity.
- Logged-in members (shared password, long-lived **localStorage** session) see those events on the events index and see those categories (and their resources) on the resources index; logged-out visitors do not.
- A **Members** item in the primary nav opens a small **members** page with password entry and **help text from Sanity** ([`apps/studio/schemas/documents/siteSettings.ts`](../apps/studio/schemas/documents/siteSettings.ts)).
- A **shareable link** can auto-establish the session via a query param, then **strip the param** with `history.replaceState` so accidental resharing is less likely.
- **Sanity Studio** stays the CMS; only schemas + queries change on the backend side.

## Scope boundaries

- **No** per-user accounts, roles, or server sessions (unless you later opt into optional Netlify Functions).
- **No** replacement of Sanity or the monorepo layout.
- **Studio** remains as today; only document fields/schemas extend.

## Classification (master plan guardrails)

- **Type A/B (in-bounds):** Sanity fields, GROQ, Astro pages/components, React islands, new **documented** Netlify env vars for the web app (extend [`docs/ws-j-deploy-ci-env.md`](../docs/ws-j-deploy-ci-env.md) alongside existing `PUBLIC_SANITY_*` / `PUBLIC_SITE_URL`).
- **Type C (requires explicit approval if chosen):** Replacing Astro with a **standalone React/TypeScript SPA** as the primary web app, or any other framework swap. The plan’s assessment section treats this as an **option**, not a decision.

---

## Security model (explicit, aligned with “security is not a major”)

With [`apps/web/astro.config.mjs`](../apps/web/astro.config.mjs) `output: "static"`, **every visitor receives the same HTML/JS**. True confidentiality for members-only **body** content is **not** achievable without **server rendering**, **edge middleware**, or **a small authenticated API**.

**Practical MVP (acceptable for “soft” gating):**

- Treat `membersOnly` as **UI and discoverability** control: lists/tabs hide items when `localStorage` says logged out.
- **Shared password check in the browser** must use a `PUBLIC_*` env value if embedded in client code — **anyone can extract it from the built bundle**. Same for a **magic-link token** in `PUBLIC_*`. Document this in the editor handbook or deploy doc briefly.
- **Static `.ics` files** ([`apps/web/scripts/generate-event-ics.ts`](../apps/web/scripts/generate-event-ics.ts) + [`allEventsForIcs`](../apps/web/src/lib/sanity/queries.ts)): **exclude** `membersOnly` events from generated calendars so meeting details are not published under `/calendar/.../*.ics` for the world. Members rely on the site for those events.

**Recommended parity for detail pages (same threat model as lists):**

- **Event detail** ([`apps/web/src/pages/[locale]/events/[slug].astro`](../apps/web/src/pages/[locale]/events/[slug].astro)) and **resource detail** ([`apps/web/src/pages/[locale]/resources/[slug].astro`](../apps/web/src/pages/[locale]/resources/[slug].astro)): wrap existing content in a small **React gate** that reads the same localStorage session and shows a short “Members only” message when logged out, **while noting** that motivated users can still inspect network/payloads. This matches “certain pages” better than list-only filtering.

If you later need **real** concealment, the smallest lift is usually **Astro + Netlify adapter** with `output: 'hybrid'` and `prerender = false` on gated routes (still not a CRA rewrite), or a **Netlify Function** that returns JSON only after password validation.

---

## Sanity Studio

1. **Event** — [`apps/studio/schemas/documents/event.ts`](../apps/studio/schemas/documents/event.ts)  
   - Add `membersOnly` boolean, **default `false`**, with description that translations should match the English source for consistent behavior.

2. **Resource category** — [`apps/studio/schemas/documents/resourceCategory.ts`](../apps/studio/schemas/documents/resourceCategory.ts)  
   - Same `membersOnly` boolean, default `false`.

3. **Site settings** — [`apps/studio/schemas/documents/siteSettings.ts`](../apps/studio/schemas/documents/siteSettings.ts)  
   - Add **members login help** field (e.g. `text` or the project’s existing `richText` object type from [`apps/studio/schemas/objects/richText.ts`](../apps/studio/schemas/objects/richText.ts) if editors need links/formatting). This populates the help area on the members page.

4. **Editor checklist** (optional but aligned with repo patterns): extend [`apps/studio/actions/editorChecklistAction.tsx`](../apps/studio/actions/editorChecklistAction.tsx) with a reminder when `membersOnly` is true (e.g. confirm translations / category assignments).

---

## GROQ and build-time data

Update [`apps/web/src/lib/sanity/queries.ts`](../apps/web/src/lib/sanity/queries.ts):

- **`upcomingEventsByLocale` / `pastEventsByLocale`**: project `membersOnly`, using **`coalesce(membersOnly, translationOf->membersOnly, false)`** so non-English events can inherit the English source flag when unset (document the convention in the Studio field description).
- **`resourceCategoriesByLocale`** (if still used) **or** derive categories from resources: project `membersOnly` with the same `coalesce` pattern for `translationOf`.
- **`resourcesByLocale`**: extend `category->{ title, slug, membersOnly, translationOf->membersOnly }` (or a single coalesced boolean) so the web app can filter resources whose category is members-only.
- **`eventBySlugAndLocale` / `resourceBySlugAndLocale`**: include the coalesced `membersOnly` (event) and category-level flag (resource) for detail gates.
- **`allEventsForIcs`**: add filter so **members-only events never** enter ICS generation.

No change to Sanity **project** hosting model; rebuild-on-publish webhook behavior in [`docs/ws-j-deploy-ci-env.md`](../docs/ws-j-deploy-ci-env.md) stays valid.

---

## Web app: session, URL bootstrap, Members page

**New small module** (e.g. [`apps/web/src/lib/members/session.ts`](../apps/web/src/lib/members/session.ts)):

- `localStorage` key + version string (easy migration later).
- `isMemberSession()`, `setMemberSession()`, `clearMemberSession()`.
- Constants for **query param names** (e.g. `member_token` for magic link, configurable via `PUBLIC_*` if you want the token value in env).

**URL bootstrap** — mount once from [`apps/web/src/layouts/BaseLayout.astro`](../apps/web/src/layouts/BaseLayout.astro) via a **tiny React island** `client:load`:

- On load: if query token matches `import.meta.env.PUBLIC_MEMBERS_LINK_TOKEN` (or similar), call `setMemberSession()` then **`history.replaceState`** to the same path without the query (preserve path + hash behavior you prefer).
- Same island can run password comparison against `PUBLIC_MEMBERS_PASSWORD` **only if** you accept bundle exposure; otherwise defer to a later Netlify Function.

**New route** — e.g. [`apps/web/src/pages/[locale]/members/index.astro`](../apps/web/src/pages/[locale]/members/index.astro) (mirrors other locale sections):

- `getStaticPaths` from `publishedLocales` (same as [`events/index.astro`](../apps/web/src/pages/[locale]/events/index.astro)).
- Fetch `siteSettingsByLocale` extended with the new help field; render help via existing portable-text pipeline if using `richText`, or plain text.
- Embed a **React** `MembersLoginForm` for password + optional “Sign out” that clears storage.

**Nav** — [`apps/web/src/components/HeaderNav.tsx`](../apps/web/src/components/HeaderNav.tsx):

- Add a **Members** link to `withLocalePath(locale, "members")` (same list item pattern as Blog/Resources/Events).

---

## Web app: filtering behavior

**Events index** — today [`EventsIndex`](../apps/web/src/components/EventsIndex.tsx) is a static props component. Options:

- **Preferred minimal change:** extend `EventsIndexEvent` with `membersOnly: boolean`; pass full arrays from [`events/index.astro`](../apps/web/src/pages/[locale]/events/index.astro); convert `EventsIndex` to **`client:visible` or `client:load`** and filter `upcoming`/`past` with `isMemberSession()` inside the component (or a thin wrapper). Keeps one component responsible for display rules.

**Resources index** — [`resources/index.astro`](../apps/web/src/pages/[locale]/resources/index.astro) + [`ResourceDirectory.tsx`](../apps/web/src/components/ResourceDirectory.tsx):

- Build `categories` and `resources` with `membersOnly` metadata.
- Either filter in Astro (still static — **cannot** depend on login) **or** move filtering into `ResourceDirectory` with `client:visible` / `client:load` so category buttons and rows respect `isMemberSession()`. The second matches the events approach.

**Detail pages** — optional but recommended:

- **Event:** pass `membersOnly` into a gate wrapper around [`EventDetail`](../apps/web/src/components/EventDetail.tsx).
- **Resource:** resolve “members-only resource” as **resource whose category is members-only** (using expanded GROQ); gate [`ResourceDetail`](../apps/web/src/components/ResourceDetail.tsx).

---

## i18n (WS-B)

- Members route under `[locale]/members` with `langSwitcherAlternates` like other pages.
- Help text comes from **per-locale** `siteSettings` documents (same pattern as other localized singletons).

---

## Acceptance criteria

- Studio: toggles exist with default off; help text editable per locale.
- Nav shows **Members** on all pages using `BaseLayout`.
- Password form sets session; reload keeps session until cleared (localStorage).
- Magic URL with token sets session and **removes token from address bar** without full navigation.
- Logged out: members-only events absent from events index UI; members-only categories and their resources absent from resources UI; ICS files omit those events.
- Logged in: above content visible.
- Detail gates (if implemented): logged out sees a clear members-only message without navigation loops.
- **Docs:** new env vars listed in [`docs/ws-j-deploy-ci-env.md`](../docs/ws-j-deploy-ci-env.md); security limitations noted in one short paragraph.

---

## Assessment: Astro static vs “basic dynamic React/TypeScript site”

**Recommendation: keep Astro** and implement this feature with **React islands + localStorage**, plus the ICS query change. **Do not** rewrite the public site to a standalone React SPA for this feature alone.

| Factor | Stay on Astro (current + islands) | Full React/Vite SPA |
|--------|-----------------------------------|---------------------|
| **Fit to feature** | Session + filtering + URL cleanup are **client-side** concerns; they do not require a new framework. | Same client logic still needed; you **lose** Astro’s static page composition and file-based routing ergonomics unless you rebuild them. |
| **Content delivery** | Already optimal: **build-time GROQ**, minimal JS on mostly-static pages. | Heavier client bundles or you reintroduce SSR/SSG (e.g. Next/Remix) anyway. |
| **i18n** | Existing `[locale]` routes, [`withLocalePath`](../apps/web/src/lib/i18n/locales.ts), and [`langAlternates`](../apps/web/src/lib/i18n/langAlternates.ts) stay intact. | Reimplement routing, static paths, and alternate links in React Router (non-trivial migration). |
| **Deploy contract** | Still `npm run build:web` → Netlify static publish per [`docs/ws-j-deploy-ci-env.md`](../docs/ws-j-deploy-ci-env.md). | Would require a **Type C** decision: new build command, hosting assumptions, and possibly SSR — **explicit user approval** per [`tenant_union_website_plan_81e09108.plan.md`](tenant_union_website_plan_81e09108.plan.md) / [`docs/cursor-plan-mode-prompt.md`](../docs/cursor-plan-mode-prompt.md). |
| **If you need real secrecy later** | Incremental path: **Astro hybrid** on Netlify for specific routes, or Netlify Functions — **without** abandoning Astro. | SPA alone does not fix secrecy; you still need server or edge unless you accept client-only obfuscation. |

**Conclusion:** Given existing patterns (Sanity at build time, React for interactive slices, static Netlify deploy), a **CRA-style dynamic React site** is **more migration cost than benefit** for members-only UI gating. Revisit only if the product direction becomes “app-like” navigation, heavy client-only data, or large interactive surfaces where Astro’s model fights you.

---

## Risks and open questions

- **Bundle-visible secrets** with `PUBLIC_*` — acceptable only because you deprioritized security; call out in docs.
- **SEO / crawlers**: members-only content may still appear in raw HTML if embedded in static props; mitigations (hybrid SSR) are out of MVP unless requested.
- **Query param name and token rotation**: pick stable names in code; editors share links from runbook, not from guessing param names.

---

## Related plan

- **Stricter variant (real concealment + SEO):** [`members_only_real_concealment_seo_plan.md`](members_only_real_concealment_seo_plan.md) in this folder.
- **Final implementation (use this to build):** [`members_area_final_implementation_plan.md`](members_area_final_implementation_plan.md)
