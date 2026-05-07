---
name: WS-A handoff + WS-B/C/J plans
overview: Handoff WS-A (planning-only) and define executable implementation plans for WS-B (i18n/routing), WS-C (Sanity schemas), and WS-J (deploy/CI/env), strictly following the master plan’s locked decisions.
todos:
  - id: handoff-wsA
    content: Extract WS-A execution checklist from master plan and treat it as the dependency contract for downstream work.
    status: completed
  - id: plan-wsB
    content: Write WS-B implementation plan for Astro locale routing + fallback + session detection per locked rules, with acceptance criteria.
    status: completed
  - id: plan-wsC
    content: Write WS-C implementation plan for Sanity schemas + translation linkage + Contact(Netlify Forms) editor UX/validation.
    status: in_progress
  - id: plan-wsJ
    content: Write WS-J implementation plan for Netlify/Sanity deploy wiring, env contract, and optional rebuild-on-publish flow.
    status: pending
isProject: false
---

## Source of truth

- Use the master plan as canonical: [`.cursor/plans/tenant_union_website_plan_81e09108.plan.md`](.cursor/plans/tenant_union_website_plan_81e09108.plan.md)
- Use the concise discovery summary as a cross-check: [`.cursor/plans/discovery-questions.md`](.cursor/plans/discovery-questions.md)

## Locked decisions (do not reopen)

- Monorepo: `apps/web` + `apps/studio`
- Package manager: `npm`
- Frontend: **Astro**
- TypeScript posture: readability > strictness
- Secrets: root `.env` local; deploy/CI env vars in platform
- Hosting/CMS: Netlify + Sanity Studio
- License split:
  - `LICENSE`: PolyForm-Noncommercial-1.0.0 (code)
  - `LICENSE-CONTENT`: CC-BY-NC-SA-4.0 (content/media/docs)

## WS-A handoff (planning-only)

- Treat WS-A as complete *as a plan artifact only*.
- WS-A’s expected files are explicitly listed in the master plan under “Workstream completion note (WS-A)”. Downstream streams should assume those paths exist once execution begins, but must not implement WS-A changes inside WS-B/WS-C/WS-J.

## WS-B — i18n + URL routing (implementation plan)

### Goal

Implement locale-aware routing, locale detection, and fallback/redirect rules in the **Astro** app (`apps/web`) to match the plan’s locked behavior.

### Required behavior (all locked in master plan)

- **Canonical English URLs are locale-prefixed**: `/en/...` (no bare `/...` canonical pages).
- **No-locale URL requests** redirect to the English canonical route.
- **Browser-language detection** happens **once per session**, on the *first* site visit (any route). If detected locale has no published content, default to English.
- **Language switcher** shows **only locales with published content**.
- **Localized slugs** for posts/events.
- **Missing translation rule**: if a localized URL is requested but that locale variant doesn’t exist, **redirect to the English version of the same document** when it exists; if no English source doc exists, 404.
- Chinese target: **Simplified** first.
- Arabic typography: **system font acceptable** initially.

### Key design decisions to implement

- Centralize locale constants (shared module) so WS-C and WS-J can reuse.
- Define “published locale exists” in a way that works for static builds (e.g., build-time available locales per doc).
- Decide session persistence mechanism (cookie vs `sessionStorage`) consistent with static hosting on Netlify.

### Files likely touched

- [ ] `apps/web/src/*` routing + middleware-like entry points (Astro integration points)
- [ ] A shared `locales` module (either in `apps/web/src/lib/*` or a shared `packages/*` if WS-A creates one)

### Acceptance criteria

- Starting from any deep link, first request in a new session redirects according to browser locale once; subsequent navigation does not auto-switch.
- Requests to `/foo` (no locale) redirect to `/en/foo`.
- Locale switcher only lists locales that actually have content.
- Requesting `/es/some-post` when Spanish variant missing redirects to `/en/some-post` for the same doc; otherwise 404.

## WS-C — Sanity schemas (implementation plan)

### Goal

Implement Sanity Studio schemas (`apps/studio`) for the MVP content types with editor-friendly validation, translation relationships, and fields required by WS-B routing.

### Locked schema decisions

- Contact page mode for v1: **Netlify Forms**
- Resource taxonomy: **flat categories**
- Resource attachments: **single file** per resource
- Rich text: typical default Portable Text features
- Resource files: allow common doc/image types; large media/video externally hosted (e.g., YouTube)
- Events: **no all-day support** in MVP
- Home CTA fields: **not required**

### Schema set (MVP)

- `siteSettings` (singleton)
- `page` (or page singletons) covering **Home**, **About**, **Contact**
- `post`
- `resource` + `resourceCategory` (flat)
- `event`

### i18n alignment

- Use **document-level translations** with explicit linkage (the master plan’s default recommendation).
- Ensure the Studio exposes enough metadata for the web app to:
  - discover available locales per doc
  - resolve “same document in English” for redirect/fallback

### Contact schema requirements

- Fields to drive Netlify Forms copy per locale (labels/help/success state) as content, not hardcoded strings.

### Files likely touched

- [ ] `apps/studio/schemas/**`
- [ ] `apps/studio/sanity.config.ts`

### Acceptance criteria

- Editor can create English docs and (later) additional locale variants with clear linkage.
- Validation is readable, editor-centric, and prevents obvious broken content (missing title/slug, missing resource file, invalid event times).
- Contact doc contains all needed per-locale strings/fields to render a fully translatable Netlify form.

## WS-J — deploy/CI/env wiring (implementation plan)

### Goal

Wire Netlify + Sanity deployment ergonomics, environment variables, and “rebuild on publish” flow without violating the secrets posture.

### Decisions to make (non-locked, but required for execution)

- One vs two Netlify sites (web + studio). Default recommendation: **two sites** (separate build commands/env scopes), unless the repo chooses a unified deploy approach.
- Auto-rebuild on publish: implement Sanity webhook → Netlify build hook if required for MVP (plan lists this as a key WS-J responsibility).

### Expected deliverables

- `netlify.toml` aligned with root script contract (WS-A) and monorepo paths.
- Documented environment variables:
  - local: root `.env` (plus per-app `.env.example` as needed)
  - deploy: Netlify environment variables set in UI
- Sanity CORS origins configured for local + deployed web.
- Optional: branch deploy previews (if desired later), but keep MVP minimal.

### Acceptance criteria

- Web deploys on Netlify from repo default branch using documented build command.
- Studio deploys (either on Netlify or Sanity-hosted) with documented build command.
- Publishing content in Sanity can trigger a Netlify rebuild via webhook/build hook (if enabled).

## Execution order and parallelism

- Execute WS-A (repo scaffold) first.
- Then run WS-B and WS-C in parallel.
- Start WS-J early enough to validate env contracts, but don’t block WS-B/WS-C on final deploy details.

## Workstream completion notes (required after execution)

After each workstream is executed, append to the master plan:

- Workstream completion note: what shipped, files touched, deviations, new constraints, follow-ups.
- Next-agent context packet: copy/paste block for the next stream.
