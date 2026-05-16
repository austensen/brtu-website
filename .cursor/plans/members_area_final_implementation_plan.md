---
name: Members area — final implementation plan
overview: "Ship members-only events and resource categories with real HTML/SEO concealment on Netlify (Astro hybrid, httpOnly session, server-only secrets), password + magic-link login, long-lived cookie, plain-text Studio help, Members nav + page with sign-out. Marketing-page members-only deferred with a documented extension pattern."
todos:
  - id: step-01-studio
    content: "Step 1: Sanity schemas (membersOnly, membersLoginHelp) — see prompt packet in plan body"
    status: completed
  - id: step-02-groq-ics
    content: "Step 2: GROQ public/full + ICS exclude membersOnly"
    status: completed
  - id: step-03-astro-hybrid
    content: "Step 3: @astrojs/netlify + hybrid + prerender=false on 5 routes"
    status: completed
  - id: step-04-auth
    content: "Step 4: Session cookie + login/logout server routes (plaintext MEMBERS_PASSWORD compare)"
    status: completed
  - id: step-05-ssr-content
    content: "Step 5: SSR lists + detail stubs/noindex for events and resources"
    status: pending
  - id: step-06-members-ui
    content: "Step 6: Members SSR page + magic redirect + HeaderNav"
    status: pending
  - id: step-07-docs-qa
    content: "Step 7: docs/ws-j, sitemap/robots, curl acceptance"
    status: pending
isProject: false
---

# Members area — final implementation plan

This is the **single implementation source of truth** for the members feature. Exploratory context lives in [`members-only_gated_content_afc5a424.plan.md`](members-only_gated_content_afc5a424.plan.md) (soft gating, superseded for this build) and [`members_only_real_concealment_seo_plan.md`](members_only_real_concealment_seo_plan.md) (requirements deep-dive + Netlify billing notes).

---

## Locked decisions (round 1)

| Topic | Decision |
|--------|-----------|
| **Track** | **Real concealment + SEO** — no members-only titles/bodies/list rows in HTML for unauthenticated requests; crawler-oriented controls (noindex, generic titles, sitemap hygiene). |
| **Hosting** | **Netlify server runtime approved** — `@astrojs/netlify`, `output: 'hybrid'` (or `'server'` if required), **server-only** secrets (no shared password in `PUBLIC_*`). |
| **Auth** | **Both** — shared password form **and** magic URL query param, both **validated on the server**; param stripped after successful session establishment (**redirect** after `Set-Cookie` preferred). |
| **Session** | **Long-lived** — httpOnly cookie on the order of **weeks to months** (e.g. 180-day signed payload with optional sliding refresh documented in code). |
| **SSR scope (v1)** | **Hybrid only** for **`/[locale]/events`**, **`/[locale]/events/[slug]`**, **`/[locale]/resources`**, **`/[locale]/resources/[slug]`**, and **`/[locale]/members`** (light SSR for login UI); other routes stay prerendered. |
| **Future members-only pages** | **Not in v1** — document an **extension pattern** (new route group + `prerender = false` + shared auth helper + optional `page.membersOnly` later). |
| **Studio help** | **`siteSettings.membersLoginHelp`** as **plain multiline text** (not portable text). |
| **Logout** | **Members page only** — explicit **Sign out** that **POST**s logout and clears cookie. |

---

## Locked decisions (round 2 — implementation detail)

| Topic | Decision |
|--------|-----------|
| **Unauthenticated member-only detail URL** | **HTTP 200 stub**: generic `<title>` / meta, “Members only” body, **`noindex, nofollow`** (meta or `X-Robots-Tag`). No 404 for v1. |
| **Members page** | **Light SSR** (`prerender = false`): server reads session cookie to show **Sign out** vs login form; still no secrets in HTML. |
| **Magic link token** | **Reusable** server secret `MEMBERS_MAGIC_LINK_TOKEN` (rotate by changing env when needed). **Not** one-time tokens in v1. |
| **Password in env** | **Plaintext** `MEMBERS_PASSWORD` in **server-only** Netlify env; compare in **constant-time** in the login handler (acceptable for v1 threat model). |
| **Auth transport** | **Astro server API routes** only (e.g. `src/pages/api/members/...` with `export const POST` / `GET`), deployed via `@astrojs/netlify` — **not** a separate `netlify/functions` tree unless we explicitly revisit portability. |

---

## Intent (product)

- Editors toggle **members only** on **events** and **resource categories** (default off).
- Unauthenticated visitors: **no** members-only events or member-category resources in **lists**; **no** sensitive detail in **HTML or `<head>`** for member URLs; **no** those events in **public ICS**.
- Authenticated members (password or magic link): full content on events/resources surfaces.
- **Members** in the top nav → **Members** page with help text, login, sign-out.
- **Sanity Studio** role unchanged; schemas + content only.

---

## Architecture summary

```mermaid
flowchart LR
  browser[Browser]
  cdn[Netlify_CDN]
  ssr[SSR_pages]
  fn[Server_auth_routes]
  sanity[Sanity_API]

  browser --> cdn
  cdn --> ssr
  browser --> fn
  fn -->|"Set-Cookie httpOnly"| browser
  ssr -->|"GROQ filtered or full"| sanity
  fn --> sanity
```

1. **Login/logout** — Astro server routes (with Netlify adapter): validate **`MEMBERS_PASSWORD`** / query token vs **`MEMBERS_MAGIC_LINK_TOKEN`**; issue **signed** session in **httpOnly, Secure, SameSite=Lax** cookie (long `Max-Age`).
2. **SSR pages** — Per request: invalid/missing cookie → **public** GROQ; valid cookie → **full** GROQ. Member-only **detail** without cookie → **stub + noindex** (200).
3. **Members page** — **SSR** for cookie-aware UI + forms POSTing to login/logout.
4. **Magic link** — Server **302** to clean URL after `Set-Cookie` (strip query server-side).

---

## Sanity Studio

| Document | Field |
|----------|--------|
| `event` | `membersOnly` boolean, default `false`; description: keep translations aligned with English source. |
| `resourceCategory` | `membersOnly` boolean, default `false`; same editor note. |
| `siteSettings` | `membersLoginHelp` — **text**, multiline, per locale. |

Optional: [`editorChecklistAction.tsx`](../apps/studio/actions/editorChecklistAction.tsx) reminder when `membersOnly` is true.

**GROQ convention:** `coalesce(membersOnly, translationOf->membersOnly, false)` for events; for resources use category projection with `coalesce(category->membersOnly, category->translationOf->membersOnly, false)` (exact shape in Step 2).

---

## GROQ and data loading

**File:** [`apps/web/src/lib/sanity/queries.ts`](../apps/web/src/lib/sanity/queries.ts)

- **Public** list/detail queries exclude members-only events and resources in members-only categories.
- **Full** list/detail queries include everything for authenticated SSR.
- **`allEventsForIcs`:** exclude members-only events.

---

## Astro + Netlify

- **`@astrojs/netlify`**, **`output: 'hybrid'`**.
- **`export const prerender = false`** on:
  - `apps/web/src/pages/[locale]/events/index.astro`
  - `apps/web/src/pages/[locale]/events/[slug].astro`
  - `apps/web/src/pages/[locale]/resources/index.astro`
  - `apps/web/src/pages/[locale]/resources/[slug].astro`
  - `apps/web/src/pages/[locale]/members/index.astro` (**new**)
- **Caching:** avoid CDN serving authenticated HTML as anonymous (`Cache-Control` / `Vary: Cookie` as appropriate).

---

## Auth and session

**Canonical approach:** implement login, logout, and optional “magic link bootstrap” as **Astro server endpoints** (HTTP handlers under `apps/web/src/pages/…`, `export const POST` / `GET` as appropriate) with **`@astrojs/netlify`**. Netlify still runs them as **serverless invocations**; this keeps one codebase, shared helpers with SSR pages, and same-origin cookies without maintaining a parallel `netlify/functions` API.

### Server-only environment (Netlify + local `.env`)

| Variable | Purpose |
|----------|---------|
| `MEMBERS_SESSION_SECRET` | Key for **signing** the session cookie (HMAC or JWT signing secret). **Never** `PUBLIC_*`. |
| `MEMBERS_PASSWORD` | Shared password; **plaintext** compare with **constant-time** helper (e.g. `crypto.timingSafeEqual` on equal-length buffers). **Never** `PUBLIC_*`. |
| `MEMBERS_MAGIC_LINK_TOKEN` | Secret value compared to query param (e.g. `?t=…`) for auto-login; **reusable** until env rotated. **Never** `PUBLIC_*`. |

Local dev: document in [`docs/ws-j-deploy-ci-env.md`](../docs/ws-j-deploy-ci-env.md) that these live in Netlify UI and optionally in **non-public** env files ignored by git (never commit).

### Session cookie

- **Name (v1):** e.g. `brtu_member_session` (single constant in code).
- **Attributes:** `HttpOnly`, `Secure` (production), `SameSite=Lax`, `Path=/`, **`Max-Age`** for long session (e.g. **~180 days** per locked decision).
- **Value:** signed opaque payload (e.g. JWT with `exp` / `iat` or HMAC of a random id + metadata). **No** PII. Validate signature on every SSR page that switches GROQ variant.
- **Invalid / expired signature:** treat as logged out (public GROQ only).

### HTTP routes (illustrative; adjust to Astro file routing)

- **`POST` login** — Body: password (form `application/x-www-form-urlencoded` or JSON). On success: `Set-Cookie` with session; **302** back to `Referer` or `/[locale]/members`. On failure: **401** with generic error (no “password wrong” oracle beyond generic message).
- **`POST` logout** — Clear session cookie (`Max-Age=0`); redirect to Members page or home.
- **Magic link bootstrap** — e.g. `GET /api/members/bootstrap` (or dedicated route) reads `t` query param; if `timingSafeEqual(t, MEMBERS_MAGIC_LINK_TOKEN)`, set session cookie and **302** to same path **without** query string (strip secret from URL). Wrong/missing token: **302** to Members login with no cookie set (or **404** — pick one; prefer redirect to Members to avoid enumeration noise).

### SSR pages (consumers)

- Events/resources Astro pages (and Members SSR) import a small **`getMemberSession(Astro)`** (or equivalent) that reads the cookie from the request, verifies signature/expiry, returns `authenticated: boolean`. **No** session logic duplicated in client JS for security decisions.

### CSRF / abuse (v1 baseline)

- **SameSite=Lax** + same-origin POST forms from the Members page is acceptable for v1.
- Optional later: rate limit login POST (Netlify edge or external) — **out of scope** unless requested.

### What not to do

- Do **not** put `MEMBERS_PASSWORD` or `MEMBERS_MAGIC_LINK_TOKEN` in **`PUBLIC_*`** or client bundles.
- Do **not** use **localStorage** as the sole session store for this track (concealment + SEO require server-verified cookie for SSR branching).

---

## SEO (v1 checklist)

| Case | Behavior |
|------|----------|
| Unauthenticated **list** pages | HTML lists **public** rows only. |
| Unauthenticated **member-only detail** | **200 stub**, generic head, **`noindex, nofollow`**. |
| **Sitemap** | Omit member-only URLs from any **public** sitemap. |
| **ICS** | Public ICS excludes members-only events. |

---

## Agent-led implementation phases (ordered)

| Step | Title | Goal |
|------|--------|------|
| **1** | Sanity schemas | `membersOnly` + `membersLoginHelp`; Studio compiles; optional checklist. |
| **2** | GROQ + ICS | Public/full queries + `allEventsForIcs` filter; type shapes for next steps. |
| **3** | Astro + Netlify hybrid | Adapter, `output: 'hybrid'`, `prerender = false` on five routes; `npm run build` passes (may still serve public-only data until Step 5). |
| **4** | Auth routes + session | Login/logout endpoints, cookie signing, constant-time password check, magic token path for redirect bootstrap. |
| **5** | SSR events + resources | Wire cookie → query variant; detail stubs + noindex when unauthenticated + members-only doc. |
| **6** | Members UI + nav | Members page SSR, forms, magic-link entry, [`HeaderNav.tsx`](../apps/web/src/components/HeaderNav.tsx) link. |
| **7** | Docs + SEO sweep | [`docs/ws-j-deploy-ci-env.md`](../docs/ws-j-deploy-ci-env.md), sitemap/robots if present, curl checklist. |

---

## Mandatory rule after every implementation step

The agent (or human) completing a step **must** edit **this file** — [`.cursor/plans/members_area_final_implementation_plan.md`](members_area_final_implementation_plan.md) — and append:

1. **`### Step N — Implementation log (YYYY-MM-DD)`**  
   - **Merged PR / branch** (if any)  
   - **Files touched** (paths)  
   - **Behavioral outcome** (what works now)  
   - **Deploy notes** (e.g. “run `npm run deploy:studio` after Step 1”)  
   - **Follow-ups / risks** discovered  

2. **`### Context updates for downstream steps`**  
   - Any renamed env vars, schema fields, or route paths  

3. **`### Step N+1 — Prompt packet (copy-paste for next agent)`**  
   - A **fresh, complete** copy-paste block for the next step, revised if Step N changed assumptions.  
   - If nothing material changed, the implementing agent may copy the **pre-generated** packet from the “Step packet library” below and adjust only filenames or env names.

Failure to update this plan is treated as **incomplete work** for the step.

---

## Step packet library (pre-generated; revise in logs if needed)

### Step 2 — Prompt packet (copy-paste after Step 1 completes)

```markdown
## Task: Members area — Step 2 (GROQ + ICS)

Authoritative plan: repo file `.cursor/plans/members_area_final_implementation_plan.md` (read Locked decisions + Phase table).

### Scope
- Update `apps/web/src/lib/sanity/queries.ts`:
  - Add coalesced `membersOnly` for events (`coalesce(membersOnly, translationOf->membersOnly, false)`).
  - Extend resource projections so each resource exposes an effective **categoryMembersOnly** (from category + translationOf) for filtering.
  - Provide **public** variants of: upcoming/past events, events by slug, resources by locale, resource by slug — each excludes members-only rows or member-category resources where appropriate for **anonymous** HTML.
  - Provide **full** variants (or parameterized queries) used when session is valid (Step 5 will consume).
  - Update `allEventsForIcs` to exclude members-only events.
- Update `apps/web/scripts/generate-event-ics.ts` if query exports or types change.
- **Do not** add Netlify adapter yet unless needed for typecheck; prefer Step 3 for adapter.

### Constraints
- Minimal diffs; keep existing query naming patterns; add tests only if repo already uses them for queries (otherwise skip).
- Run `npm run typecheck` from repo root before finishing.

### Mandatory: update master plan
Append to `.cursor/plans/members_area_final_implementation_plan.md`:
1. `### Step 2 — Implementation log (YYYY-MM-DD)` …
2. `### Context updates for downstream steps` …
3. `### Step 3 — Prompt packet (copy-paste for next agent)` — regenerate fully (use Step 3 outline: Netlify hybrid + prerender flags on five routes; build must pass).
```

### Step 3 — Outline for the next agent to turn into a full packet

- Add `@astrojs/netlify`, set `output: 'hybrid'`, configure adapter in `apps/web/astro.config.mjs`.
- Add `export const prerender = false` to the five Astro pages listed in this plan (create stub `members/index.astro` if not created yet — minimal placeholder is OK).
- Ensure `npm run build` from monorepo root passes.

---

## Step 1 — Prompt packet (**copy-paste below**)

```markdown
## Task: Members area — Step 1 (Sanity schemas only)

Authoritative plan: `.cursor/plans/members_area_final_implementation_plan.md`. Read **Locked decisions (round 1 + round 2)** and **Agent-led implementation phases** before coding.

### Scope (strict)
- **`apps/studio` only.** Do **not** modify `apps/web`, `packages/*`, or CI/docs in this step unless a schema registration file under `apps/studio` requires a one-line import.
- Add boolean field **`membersOnly`** (default `false`, sensible `title`/`description`) to:
  - `apps/studio/schemas/documents/event.ts`
  - `apps/studio/schemas/documents/resourceCategory.ts`
- Add **`membersLoginHelp`** to `apps/studio/schemas/documents/siteSettings.ts` as **multiline plain `text`** (not `richText`), with Studio description explaining it appears on the public Members login page.
- Ensure new fields are exported/registered via `apps/studio/schemas/index.ts` (or existing pattern) if required.
- **Optional:** extend `apps/studio/actions/editorChecklistAction.tsx` with a non-blocking reminder when `membersOnly` is true.

### Out of scope
- No GROQ, no Astro, no Netlify, no env vars in `docs/ws-j-deploy-ci-env.md` yet.

### Verification
- From repo root: `npm run typecheck` (or studio-specific check if documented in root `package.json`).
- Sanity Studio starts without schema errors (`npm run dev` in `apps/studio` if that is the local convention).

### Mandatory: update master plan when done
Edit `.cursor/plans/members_area_final_implementation_plan.md` and **append** (do not delete prior content):

1. `### Step 1 — Implementation log (YYYY-MM-DD)`  
   - List every file changed.  
   - Note whether hosted Studio deploy (`npm run deploy:studio` from repo root) is required before editors see fields.  

2. `### Context updates for downstream steps`  
   - Exact **field API names** as stored in Sanity (`membersOnly`, `membersLoginHelp`).  

3. `### Step 2 — Prompt packet (copy-paste for next agent)`  
   - Either paste the **Step 2 packet** from the “Step packet library” in the master plan, **or** a revised version if your schema names differ.  
   - The packet must include the same **Mandatory: update master plan** tail pointing to Step 3.

Do not start Step 2 in the same PR unless explicitly asked.
```

---

## Testing and acceptance (full feature)

- `curl` / View Source: unauthenticated events/resources HTML has **no** member-only list rows or titles.
- Unauthenticated **member-only detail**: **200** stub + **noindex** + generic `<title>`.
- Authenticated `curl` with cookie: full content.
- ICS: no member-only events.
- Studio: fields visible; help text publishable per locale.

---

## Billing reminder

See [`members_only_real_concealment_seo_plan.md`](members_only_real_concealment_seo_plan.md) — SSR + Functions are included on Netlify Free **within credits**; Open Source plan is separate.

---

## Out of scope (v1)

- Per-user accounts, one-time magic tokens, password hashing in env.
- Members-only marketing `page` documents (extension pattern only).

---

## References

| Document | Use |
|----------|-----|
| [`members_only_real_concealment_seo_plan.md`](members_only_real_concealment_seo_plan.md) | SEO + billing detail |
| [`members-only_gated_content_afc5a424.plan.md`](members-only_gated_content_afc5a424.plan.md) | Historical soft-gating |
| [`docs/ws-j-deploy-ci-env.md`](../docs/ws-j-deploy-ci-env.md) | Deploy/env |
| [`docs/cursor-plan-mode-prompt.md`](../docs/cursor-plan-mode-prompt.md) | Type C guardrails |

---

### Step 1 — Implementation log (2026-05-12)

- **Branch / PR:** local implementation (no PR number).
- **Files changed:**
  - [`apps/studio/schemas/documents/event.ts`](../apps/studio/schemas/documents/event.ts) — added `membersOnly` boolean (`initialValue: false`).
  - [`apps/studio/schemas/documents/resourceCategory.ts`](../apps/studio/schemas/documents/resourceCategory.ts) — added `membersOnly` boolean (`initialValue: false`).
  - [`apps/studio/schemas/documents/siteSettings.ts`](../apps/studio/schemas/documents/siteSettings.ts) — added `membersLoginHelp` (`type: "text"`, `rows: 4`).
  - [`apps/studio/actions/editorChecklistAction.tsx`](../apps/studio/actions/editorChecklistAction.tsx) — checklist accepts `draft`; extra lines when `membersOnly` is true for `event` and `resourceCategory`.
- **Behavioral outcome:** Studio schema includes members fields; hosted Studio **does not** show them until schema is deployed.
- **Deploy notes:** Run **`npm run deploy:studio`** from the repo root (or your documented Studio deploy path) so **Sanity-hosted Studio** picks up the new fields. Local `npm run dev` in `apps/studio` shows fields immediately.
- **Follow-ups:** Step 2 must project `membersOnly` / category flags in GROQ for `apps/web`.

### Context updates for downstream steps

- **Sanity field names (API / GROQ):** `membersOnly` on types **`event`** and **`resourceCategory`**; **`membersLoginHelp`** on **`siteSettings`** (plain string in API, multiline text in Studio).
- **`schemas/index.ts`:** unchanged — `event`, `resourceCategory`, and `siteSettings` were already registered.

### Step 2 — Prompt packet (copy-paste for next agent)

```markdown
## Task: Members area — Step 2 (GROQ + ICS)

Authoritative plan: repo file `.cursor/plans/members_area_final_implementation_plan.md` (read Locked decisions + Phase table).

### Scope
- Update `apps/web/src/lib/sanity/queries.ts`:
  - Add coalesced **`membersOnly`** for events: `coalesce(membersOnly, translationOf->membersOnly, false)` (field name in API: **`membersOnly`**).
  - Extend resource projections so each resource exposes an effective **category-level members flag** (e.g. `categoryMembersOnly`) using `coalesce(category->membersOnly, category->translationOf->membersOnly, false)` on the referenced **`resourceCategory`**.
  - Provide **public** variants of: upcoming events, past events, event by slug, resources by locale, resource by slug — each suitable for **anonymous** HTML (exclude members-only events; exclude resources whose category is members-only).
  - Provide **full** variants (or parameterized queries) for when a valid member session exists (Step 5 will consume).
  - Update **`allEventsForIcs`** to exclude members-only events (same coalesce rule).
- Update `apps/web/scripts/generate-event-ics.ts` if query exports or TypeScript types change.
- **Do not** add the Netlify adapter yet unless typecheck forces it; Step 3 owns adapter install.

### Constraints
- Minimal diffs; keep existing query naming patterns; add tests only if the repo already tests GROQ helpers.
- Run **`npm run typecheck`** from repo root before finishing.

### Mandatory: update master plan
Append to `.cursor/plans/members_area_final_implementation_plan.md`:
1. `### Step 2 — Implementation log (YYYY-MM-DD)` — files, query names added, ICS behavior.
2. `### Context updates for downstream steps` — exact **exported query constant names** for public vs full (so Step 3–5 import the right symbols).
3. `### Step 3 — Prompt packet (copy-paste for next agent)` — full packet: install `@astrojs/netlify`, `output: 'hybrid'`, `prerender = false` on the five routes in the plan (create minimal `members/index.astro` if missing), **`npm run build`** must pass; then same mandatory append chain for Step 4 (auth routes per **Auth and session** section of the master plan).

Do not start Step 3 in the same PR unless explicitly asked.
```

---

### Step 2 — Implementation log (2026-05-12)

- **Branch / PR:** local (no PR number).
- **Files changed:**
  - [`apps/web/src/lib/sanity/queries.ts`](../apps/web/src/lib/sanity/queries.ts) — Public/Full query pairs for events and resources; `allEventsForIcs` excludes members-only; `siteSettingsByLocale` projects `membersLoginHelp`; `resourceCategoriesByLocale` includes `membersOnly` + new `resourceCategoriesByLocalePublic`; file header comments document naming.
  - **`apps/web/scripts/generate-event-ics.ts`:** unchanged (imports `allEventsForIcs`; filter lives in the query).
- **Behavioral outcome:** ICS build omits members-only events. Legacy exports (`upcomingEventsByLocale`, etc.) alias **Full** queries (prior behavior for which rows exist, plus new projected fields). **Public** variants ready for Step 5.
- **Deploy notes:** None.
- **Follow-ups:** Step 5 switches pages to Public/Full by cookie; until then prerendered pages using legacy aliases may still emit members-only content in HTML.

### Context updates for downstream steps

**Exported constants** (`apps/web/src/lib/sanity/queries.ts`): `upcomingEventsByLocalePublic` / `upcomingEventsByLocaleFull`, `pastEventsByLocalePublic` / `pastEventsByLocaleFull`, `eventBySlugAndLocalePublic` / `eventBySlugAndLocaleFull`, `resourcesByLocalePublic` / `resourcesByLocaleFull`, `resourceBySlugAndLocalePublic` / `resourceBySlugAndLocaleFull`, `eventsByLocalePublic` / `eventsByLocaleFull`, `resourceCategoriesByLocalePublic`; legacy `upcomingEventsByLocale`, `pastEventsByLocale`, `eventBySlugAndLocale`, `resourcesByLocale`, `resourceBySlugAndLocale`, `eventsByLocale` = **Full**. Resource rows include **`categoryMembersOnly`** and expanded **`category`**. **`allEventsForIcs`** filtered. **`siteSettingsByLocale`** includes **`membersLoginHelp`**.

### Step 3 — Prompt packet (copy-paste for next agent)

```markdown
## Task: Members area — Step 3 (Astro + Netlify hybrid)

Authoritative plan: `.cursor/plans/members_area_final_implementation_plan.md` — read **Astro + Netlify**, **SSR scope**, and **Locked decisions**.

### Scope
- In `apps/web`: add **`@astrojs/netlify`**, set **`output: 'hybrid'`**, configure the Netlify adapter in `astro.config.mjs` per current Astro docs.
- Set **`export const prerender = false`** on:
  - `apps/web/src/pages/[locale]/events/index.astro`
  - `apps/web/src/pages/[locale]/events/[slug].astro`
  - `apps/web/src/pages/[locale]/resources/index.astro`
  - `apps/web/src/pages/[locale]/resources/[slug].astro`
  - **Create** `apps/web/src/pages/[locale]/members/index.astro` (minimal SSR placeholder: `BaseLayout` + heading “Members”).
- **`npm run build`** from **repo root** must succeed.

### Out of scope
- Auth/session (Step 4), Public vs Full fetch switching (Step 5), HeaderNav (Step 6).

### Verification
- `npm run build` at monorepo root.

### Mandatory: update master plan
Append `### Step 3 — Implementation log`, `### Context updates`, `### Step 4 — Prompt packet` (auth per master plan **Auth and session**).

Do not implement Step 4 in the same PR unless explicitly asked.
```

---

### Step 3 — Implementation log (2026-05-12)

- **Branch / PR:** local (no PR number).
- **Files changed:**
  - [`apps/web/package.json`](../apps/web/package.json) — added `@astrojs/netlify@^6.6.5` (Astro 5–compatible series; 7.x requires Astro 6).
  - [`apps/web/astro.config.mjs`](../apps/web/astro.config.mjs) — imported `@astrojs/netlify`, wired `adapter: netlify()`; `output` stays `"static"` (see decision below).
  - [`apps/web/src/pages/[locale]/events/index.astro`](../apps/web/src/pages/%5Blocale%5D/events/index.astro) — added `export const prerender = false`.
  - [`apps/web/src/pages/[locale]/events/[slug].astro`](../apps/web/src/pages/%5Blocale%5D/events/%5Bslug%5D.astro) — added `export const prerender = false`.
  - [`apps/web/src/pages/[locale]/resources/index.astro`](../apps/web/src/pages/%5Blocale%5D/resources/index.astro) — added `export const prerender = false`.
  - [`apps/web/src/pages/[locale]/resources/[slug].astro`](../apps/web/src/pages/%5Blocale%5D/resources/%5Bslug%5D.astro) — added `export const prerender = false`.
  - [`apps/web/src/pages/[locale]/members/index.astro`](../apps/web/src/pages/%5Blocale%5D/members/index.astro) — **new**; SSR placeholder using `BaseLayout` with an `<h1>Members</h1>` (Step 4 wires real auth UI).
- **Behavioral outcome:** `npm run build` at the monorepo root succeeds end-to-end. The web build now reports `mode: "server"`, `adapter: @astrojs/netlify`, emits a Netlify SSR Function (`build/entry.mjs`), writes `_redirects`, and continues to prerender the remaining static routes (home, locale home, `[slug]`, blog list/detail/pagination). The five SSR routes (events list/detail, resources list/detail, members) are now served on demand by the Netlify Function.
- **Deviation from packet wording:** Astro 5 removed `output: "hybrid"` ([merge PR #11824](https://github.com/withastro/astro/pull/11824); a future Astro release adds an explicit error if `"hybrid"` is set). The documented Astro 5 replacement is `output: "static"` + per-route `export const prerender = false`, which is exactly the **SSR scope** locked in this plan. `output` remains `"static"` in `astro.config.mjs`; behavior matches the master plan's hybrid intent.
- **Expected non-fatal warnings:** the build prints four `[WARN] [router] getStaticPaths() ignored in dynamic page …` lines for the events/resources routes. They're documented Astro behavior when a dynamic route is opted out of prerendering and don't fail the build; Step 5 will refactor these handlers (drop `getStaticPaths`, read params + cookie at request time) when it wires Public/Full fetch switching and the unauthenticated noindex stub.
- **Deploy notes:** None for Studio. For the web app, the **Netlify site must be configured to deploy the `apps/web` build** with the adapter-emitted SSR function (the existing build command `npm run build` already produces `apps/web/dist/` + `.netlify/functions/`). Deployment env wiring (server-only secrets) is **Step 4 / Step 7** scope; nothing new must be set in Netlify just to ship Step 3 (the adapter functions only render existing pages with the existing public env).
- **Follow-ups / risks:**
  - The members route renders at `/[locale]/members` for any URL-shaped locale; only `publishedLocales` (currently `["en"]`) returns 200, others 404 — consistent with sibling pages.
  - SSR routes will be billed per Netlify Function invocation. The acceptance notes in [`members_only_real_concealment_seo_plan.md`](members_only_real_concealment_seo_plan.md) cover the billing envelope.
  - When Step 5 lands, also revisit `Cache-Control` / `Vary: Cookie` (currently inherits adapter defaults; the master plan's caching note is still pending).

### Context updates for downstream steps

- **Astro `output`** is `"static"` (Astro 5 unified mode), **not** `"hybrid"`. Treat the literal string `"hybrid"` from the master plan as historical/intent-only; Astro 5 errors on it. Per-route `export const prerender = false` is the canonical opt-in for SSR.
- **Adapter:** `@astrojs/netlify@^6.6.5` (6.x line; 7.x is Astro 6 only). Imported as `import netlify from "@astrojs/netlify"` and used as `adapter: netlify()` in `astro.config.mjs`. Pin major when bumping until Astro is upgraded.
- **SSR routes (Step 3 surface):** `[locale]/events/index.astro`, `[locale]/events/[slug].astro`, `[locale]/resources/index.astro`, `[locale]/resources/[slug].astro`, `[locale]/members/index.astro` — all opt-out of prerender. Step 4 server endpoints should live under `apps/web/src/pages/api/members/…` (per master plan **Auth and session → Auth transport**) and will inherit the same Netlify Function.
- **Server endpoints location convention:** Astro file-routed under `apps/web/src/pages/` (e.g. `apps/web/src/pages/api/members/login.ts` with `export const POST`). **Do not** add a parallel `netlify/functions/` tree.
- **Members placeholder DOM:** the `<h1>Members</h1>` is the only content rendered in Step 3; Step 4 should replace the `<main>` body with the real login form / help text / sign-out UI but keep the `BaseLayout` props (`title="Members"`, `pathAfterLocale="members"`, `langSwitcherAlternates`).
- **`getStaticPaths` cleanup is deferred:** the four legacy `getStaticPaths()` exports in the events/resources pages are intentionally retained; Step 5 will remove them when it refactors per-request fetches. Build warnings are expected until then.

### Step 4 — Prompt packet (copy-paste for next agent)

```markdown
## Task: Members area — Step 4 (Auth routes + session cookie)

Authoritative plan: `.cursor/plans/members_area_final_implementation_plan.md` — read **Auth and session**, **Locked decisions (round 1 + round 2)**, and the Step 3 implementation log + context updates.

### Preconditions (already shipped in Step 3)
- `@astrojs/netlify@^6.6.5` installed; `adapter: netlify()` in `apps/web/astro.config.mjs`.
- Astro `output` is `"static"` (Astro 5 unified mode); `export const prerender = false` is set on the five SSR routes.
- SSR placeholder exists at `apps/web/src/pages/[locale]/members/index.astro` (BaseLayout + `<h1>Members</h1>`) — Step 4 will replace its body.

### Scope
1. **Session helper** at `apps/web/src/lib/members/session.ts` (or equivalent under `src/lib/members/`):
   - **Cookie name:** single exported constant, e.g. `MEMBER_SESSION_COOKIE = "brtu_member_session"`.
   - **Signing:** HMAC-SHA256 (or JWT-HS256) over an opaque payload (e.g. `{ iat, exp }`) using `MEMBERS_SESSION_SECRET`. Use Node's `crypto` (Node 20+ is available; the repo's root `engines.node` is `>=20`).
   - **Issue:** `createSessionCookie(): SetCookie string` with `HttpOnly`, `Secure` (in production), `SameSite=Lax`, `Path=/`, **`Max-Age` ≈ 180 days** (locked decision). Document the sliding-refresh option in a code comment but don't implement.
   - **Clear:** `clearSessionCookie(): SetCookie` with `Max-Age=0`.
   - **Verify:** `getMemberSession(request: Request): { authenticated: boolean }` — reads the cookie header, verifies signature + `exp`, returns `{ authenticated: false }` on any failure (no throw).
   - **Constant-time compare** helper using `crypto.timingSafeEqual` on equal-length buffers; pad/reject unequal lengths safely.
2. **Server endpoints** (Astro file-routed; no `netlify/functions/` tree):
   - `apps/web/src/pages/api/members/login.ts` — `export const prerender = false; export const POST: APIRoute = ...`. Accept `application/x-www-form-urlencoded` (and JSON, optional). Compare submitted password to `MEMBERS_PASSWORD` in **constant time**. On success: `Set-Cookie` + **302** to `Referer` (same-origin only) or `/{locale}/members`. On failure: **401** with a generic error string (no oracles). Generic error copy lives in code; English-only for v1.
   - `apps/web/src/pages/api/members/logout.ts` — `export const prerender = false; export const POST: APIRoute = ...`. Always clear cookie; **302** to `/{locale}/members` (or `/{locale}/`).
   - `apps/web/src/pages/api/members/bootstrap.ts` — `export const prerender = false; export const GET: APIRoute = ...`. Read `t` query param; `timingSafeEqual(t, MEMBERS_MAGIC_LINK_TOKEN)`; on match, `Set-Cookie` + **302** to the same path **without** the `t` query string (read intended destination from a server-validated `to` param or default to `/{locale}/members`); on mismatch/absent, **302** to `/{locale}/members` with **no** cookie set (avoid 404 enumeration).
3. **Env wiring (server-only):**
   - Add (as **server-only**, never `PUBLIC_*`): `MEMBERS_SESSION_SECRET`, `MEMBERS_PASSWORD`, `MEMBERS_MAGIC_LINK_TOKEN`.
   - Read via `import.meta.env` or `process.env` (whichever the codebase uses in SSR contexts; check `apps/web/src/lib/sanity/client.ts` for the existing pattern). **Do not** import these in any file shipped to the client bundle.
   - Update [`apps/web/.env.example`](../apps/web/.env.example) (or create it) with placeholder lines and a comment that these must also live in the Netlify UI for production. **Do not** commit real values.
4. **Members page (replace placeholder):**
   - `apps/web/src/pages/[locale]/members/index.astro` — call `getMemberSession(Astro.request)`; if authenticated, render a Sign-out form (`<form method="post" action="/api/members/logout">`); if not, render a login form (`<form method="post" action="/api/members/login">` with a `password` field) plus a placeholder for `siteSettings.membersLoginHelp` (the GROQ is already wired in Step 2 — fetch via `siteSettingsByLocale` and render `membersLoginHelp` as plain text with line breaks, no HTML).
   - Keep `prerender = false`. Keep `BaseLayout` props unchanged.

### Out of scope
- Public vs Full GROQ switching on events/resources pages (Step 5).
- HeaderNav "Members" link + magic-link UI polish (Step 6).
- Sitemap/robots and docs/curl acceptance (Step 7).
- Per-user accounts, one-time tokens, password hashing in env.

### Constraints
- Minimal diffs; keep existing naming conventions.
- **Never** expose secrets via `PUBLIC_*` or client bundles.
- No new top-level dependencies if `crypto` from Node 20 suffices (HMAC + `timingSafeEqual` are stdlib). If a JWT lib is added, prefer a tiny, audited one (e.g. `jose`) and pin a version.
- `npm run typecheck` and `npm run build` from the repo root must both pass. The four "getStaticPaths() ignored" warnings from Step 3 should remain (Step 5 removes them).

### Verification
- `npm run typecheck` at repo root.
- `npm run build` at repo root.
- Local smoke (optional, not required to ship): `npm run dev` in `apps/web`; visit `/{locale}/members`; submit form with wrong password → generic 401; submit with right password → 302 to members page + cookie set; reload → "Sign out" shown.

### Mandatory: update master plan
Append to `.cursor/plans/members_area_final_implementation_plan.md`:
1. `### Step 4 — Implementation log (YYYY-MM-DD)` — files added/changed; cookie name; env vars introduced; any cryptographic choices (HMAC vs JWT); deploy notes (Netlify env UI setup); follow-ups.
2. `### Context updates for downstream steps` — exact exported symbols (`MEMBER_SESSION_COOKIE`, `getMemberSession`, helpers), API route paths, env var names as they appear in `.env`/Netlify UI.
3. `### Step 5 — Prompt packet (copy-paste for next agent)` — full packet: wire `getMemberSession` in the four events/resources SSR pages to choose Public vs Full queries; render the unauthenticated noindex stub on members-only detail; drop the deferred `getStaticPaths()` exports; ensure ICS still excludes members-only events; build + typecheck must pass; then chain the same mandatory-append rule for Step 6.

Do not implement Step 5 in the same PR unless explicitly asked.
```

---

### Step 4 — Implementation log (2026-05-12)

- **Branch / PR:** local (no PR number).
- **Files changed / added:**
  - [`apps/web/src/lib/members/session.ts`](../apps/web/src/lib/members/session.ts) — **new**; HMAC-SHA256 signed session (`base64url(JSON { iat, exp })` + `.` + `base64url(HMAC)`), cookie helpers, `getMemberSession`, `constantTimeEqualUtf8`, `getMembersPassword`, `getMembersMagicLinkToken` (server env readers co-located with signing).
  - [`apps/web/src/pages/api/members/login.ts`](../apps/web/src/pages/api/members/login.ts) — **new**; `POST`, form + optional JSON, constant-time password check, `Set-Cookie` + `302` to same-origin `Referer` or `/{locale}/members`, generic **401** text on failure.
  - [`apps/web/src/pages/api/members/logout.ts`](../apps/web/src/pages/api/members/logout.ts) — **new**; `POST`, clears cookie, `302` to `/{locale}/members`.
  - [`apps/web/src/pages/api/members/bootstrap.ts`](../apps/web/src/pages/api/members/bootstrap.ts) — **new**; `GET`; `t` vs `MEMBERS_MAGIC_LINK_TOKEN` (constant-time); optional same-origin `to` path (validated; `t` stripped from query on redirect); mismatch → `302` to `/en/members` (via `defaultLocale`) with no cookie.
  - [`apps/web/src/pages/[locale]/members/index.astro`](../apps/web/src/pages/%5Blocale%5D/members/index.astro) — session-aware UI, Sanity `siteSettingsByLocale` for `membersLoginHelp` (plain text, `white-space: pre-wrap`), login + sign-out forms posting to API routes.
  - [`apps/web/src/env.d.ts`](../apps/web/src/env.d.ts) — optional typings for `MEMBERS_*` (server-only).
  - [`apps/web/.env.example`](../apps/web/.env.example) — placeholders + Netlify UI comment.
- **Cookie name (v1):** `brtu_member_session` — exported as **`MEMBER_SESSION_COOKIE`**.
- **Cryptography:** **HMAC-SHA256** over the base64url payload (stdlib `node:crypto` only; no JWT library).
- **Env vars (server-only, never `PUBLIC_*`):** `MEMBERS_SESSION_SECRET`, `MEMBERS_PASSWORD`, `MEMBERS_MAGIC_LINK_TOKEN` — read in SSR/API via `import.meta.env` with `process.env` fallback (matches Sanity client pattern for runtime injection on Netlify).
- **Deploy notes:** In **Netlify → Site configuration → Environment variables**, set the three `MEMBERS_*` values for Production (and Preview if desired). Local: add them to repo-root `.env` and/or `apps/web/.env` (gitignored); never commit real secrets. Until secrets are set, login/bootstrap cannot issue a session (`createSessionCookie()` returns `null` → login responds **401** with the same generic copy as a bad password).
- **Follow-ups:** Step 5 wires `getMemberSession` into events/resources SSR + stubs; Step 6 may link to `/api/members/bootstrap?…`; Step 7 documents curl + `docs/ws-j-deploy-ci-env.md`. Consider `Cache-Control` / `Vary: Cookie` when authenticated HTML diverges (still pending from Step 3 notes).

### Context updates for downstream steps

- **Exports from** `apps/web/src/lib/members/session.ts`:
  - **`MEMBER_SESSION_COOKIE`** — string literal `brtu_member_session`.
  - **`createSessionCookie(): string | null`** — full `Set-Cookie` value; `null` if `MEMBERS_SESSION_SECRET` unset.
  - **`clearSessionCookie(): string`** — clearing `Set-Cookie` (`Max-Age=0`).
  - **`getMemberSession(request: Request): { authenticated: boolean }`** — never throws; invalid/expired/missing cookie → `{ authenticated: false }`.
  - **`constantTimeEqualUtf8(a, b): boolean`** — UTF-8 safe constant-time compare (used by login/bootstrap for password/token).
  - **`getMembersPassword()`** / **`getMembersMagicLinkToken()`** — trimmed server env strings (empty if unset).
- **API routes (all `export const prerender = false`):**
  - **`POST /api/members/login`** — `apps/web/src/pages/api/members/login.ts`
  - **`POST /api/members/logout`** — `apps/web/src/pages/api/members/logout.ts`
  - **`GET /api/members/bootstrap`** — query: `t` (required for success), optional `to` (same-origin path only; `t` removed from destination query on success).
- **Forms:** Login and logout POST bodies should include hidden **`locale`** (supported locale string) so redirects target the correct `/{locale}/members` when `Referer` is absent or unsafe.
- **Bootstrap failure redirect:** `withLocalePath(defaultLocale, "members")` → currently **`/en/members`** (same as `defaultLocale` in `@brtu/locales`).
- **Netlify / `.env` keys:** `MEMBERS_SESSION_SECRET`, `MEMBERS_PASSWORD`, `MEMBERS_MAGIC_LINK_TOKEN` (identical names in Netlify UI and local env files).

### Step 5 — Prompt packet (copy-paste for next agent)

```markdown
## Task: Members area — Step 5 (SSR Public vs Full + detail stubs)

Authoritative plan: `.cursor/plans/members_area_final_implementation_plan.md` — read **Locked decisions (round 1 + round 2)**, **GROQ and data loading**, **Step 2 + Step 4 context updates**, and this packet.

### Preconditions (shipped before this step)

- **Step 2:** Public/Full GROQ pairs and legacy Full aliases in `apps/web/src/lib/sanity/queries.ts` (see Step 2 log for exact export names: `*Public` / `*Full`, `allEventsForIcs` excludes members-only).
- **Step 3:** Astro `output: "static"` + `@astrojs/netlify`; `export const prerender = false` on the five SSR routes; four routes still use deferred `getStaticPaths()` (build warnings OK until this step removes them).
- **Step 4:** `getMemberSession(Astro.request)` in `apps/web/src/lib/members/session.ts`; API routes under `/api/members/*`; session cookie **`brtu_member_session`**.

### Scope

1. **Wire session into the four events/resources SSR pages** (`[locale]/events/index.astro`, `[locale]/events/[slug].astro`, `[locale]/resources/index.astro`, `[locale]/resources/[slug].astro`):
   - Call **`getMemberSession(Astro.request)`** once per request (or equivalent).
   - If **`authenticated`**: fetch with **Full** query constants (`…Full`, or legacy aliases that already map to Full per Step 2).
   - If not authenticated: fetch with **Public** query constants (`…Public`).
2. **Members-only detail (unauthenticated):** When the resolved document is members-only (event `membersOnly` / resource in members-only category per existing projections) **and** the session is not authenticated: render the **HTTP 200 stub** — generic `<title>` / meta, minimal body copy, **`noindex, nofollow`** (meta and/or `X-Robots-Tag` per locked decision). Do not leak member-only titles or body in HTML or `<head>`.
3. **Remove deferred `getStaticPaths()`** from those four pages: resolve `locale` / `slug` from `Astro.params` at request time, return **404** when params invalid (keep alignment with `supportedLocales` / existing patterns).
4. **ICS:** Confirm **`allEventsForIcs`** (or the script that consumes it) still **excludes members-only events**; no regression in `npm run build` (ICS generation runs in web build).
5. **Caching:** Prefer sensible **`Cache-Control` / `Vary: Cookie`** (or documented adapter defaults) so authenticated HTML is not served as anonymous at the CDN — at minimum, document in code comment if the adapter already does the right thing.

### Out of scope

- HeaderNav “Members” link and magic-link UX polish (**Step 6**).
- Sitemap/robots and `docs/ws-j` / curl checklist (**Step 7**).
- Changing session cookie format or login/logout/bootstrap handlers unless typecheck forces a small fix.

### Constraints

- Minimal diffs; reuse **`getMemberSession`** and existing query exports; **no** `PUBLIC_*` for secrets.
- **`npm run typecheck`** and **`npm run build`** from the **repo root** must pass.
- The four **`getStaticPaths() ignored`** warnings should **disappear** after this step (expected cleanup).

### Verification

- `npm run typecheck` (repo root).
- `npm run build` (repo root).
- Manual: unauthenticated member-only detail URL returns **200** stub + **noindex**; authenticated cookie shows full content; lists hide member-only rows when anonymous.

### Mandatory: update master plan

Append to `.cursor/plans/members_area_final_implementation_plan.md`:

1. `### Step 5 — Implementation log (YYYY-MM-DD)` — files touched; query switch behavior; stub/noindex behavior; ICS confirmation; any `Cache-Control` decisions.
2. `### Context updates for downstream steps` — any new helpers, header patterns, or query renames.
3. `### Step 6 — Prompt packet (copy-paste for next agent)` — full packet: HeaderNav Members link, optional magic-link entry, polish on `apps/web/src/pages/[locale]/members/index.astro` as needed; then the same mandatory-append chain for Step 7.

Do not implement Step 6 in the same PR unless explicitly asked.
```

