# Cursor Plan mode prompt (tenant union site)

Use this when starting a **Cursor Plan** session or any **plan-only** pass for site work. It anchors scope to the master plan, locks the approved stack, and requires explicit approval before material infrastructure or Phase 2 scope drift.

**Related:** [`.cursor/plans/tenant_union_website_plan_81e09108.plan.md`](../.cursor/plans/tenant_union_website_plan_81e09108.plan.md) (source of truth, WS-A/B/C, phases). The master plan’s “Cursor execution playbook” workstream templates complement this file.

---

## Template (copy into Plan mode)

```markdown
You are operating in **Cursor Plan mode**: produce an implementation plan only. Do **not** assume permission to edit files, run commands, or implement until the user accepts the plan.

## Authoritative context (read before planning)

1. **Master plan (MVP scope, phases, locked decisions, workstreams)**: `.cursor/plans/tenant_union_website_plan_81e09108.plan.md`
   - Treat Phase 1 as the shipped MVP baseline; Phase 2 items are **out of scope** unless this task explicitly expands scope.
   - Respect locked decisions in **WS-A** (monorepo `apps/web` + `apps/studio`, **npm**, **Astro**, TypeScript readability-first, secrets pattern, licenses), **WS-B** (i18n/URL behavior, silent English fallback, `/en/...`, routing/precedence), and **WS-C** (e.g. Contact via **Netlify Forms**, resource model constraints, portable text scope).

2. **Editor-facing reality** (when Studio or content workflows matter): `docs/editor-handbook.md`

3. **Deploy/env contract** (when builds, domains, or env vars matter): `docs/ws-j-deploy-ci-env.md`

4. **Operational stack (do not drift without approval)**:
   - Public site: **Astro** in `apps/web`, static output, **Netlify** build/publish as documented.
   - CMS: **Sanity**; Studio in `apps/studio` (hosted Studio per docs).
   - Package manager: **npm**; workspaces `apps/*`, `packages/*`; Node **>=20** per root `package.json`.

## Task to plan

[Describe the change, bug, or feature in 2–6 sentences. Link issues/PRs if any.]

## Plan mode output requirements

Return a concise plan with:

1. **Intent** — What user-visible or editor-visible outcome improves, tied to MVP goals (recruit/inform members, events, resources, multilingual architecture).
2. **Scope boundaries** — What is explicitly *not* changing.
3. **Files / areas** — Specific paths you expect to touch (e.g. `apps/web/...`, `apps/studio/...`, `docs/...`). If unknown, list discovery steps first.
4. **Data / routing / i18n impact** — Whether Sanity schemas, GROQ, `apps/web/src/lib/i18n/locales.ts`, or URL rules are affected; cite master plan sections if non-obvious.
5. **Acceptance criteria** — Testable checks (including a11y/editor checklist impact if relevant).
6. **Risks & open questions** — Only what blocks execution.

## Infrastructure and scope drift guardrails (mandatory)

Classify this task:

- **Type A — Product/content/UI (in-bounds)**  
  Changes inside existing Astro + Sanity patterns (templates, components, queries, Studio desk/actions, copy, a11y, bugfixes) that **do not** change hosting, CMS, framework, repo layout philosophy, or add a persistent backend.

- **Type B — Dependency or tooling (bounded)**  
  New npm dependencies, small scripts, or config tweaks that stay within **Astro + Sanity + Netlify + npm** and preserve the documented deploy model.

- **Type C — Material infrastructure / architecture drift (requires explicit user approval)**  
  Any of: replacing **Sanity** or **Astro**; moving off **Netlify** for the public site; switching package manager or monorepo layout; adding **server/database** owned by this project; introducing **paid** or non-documented services; changing **CI/CD** platform or secrets strategy in conflict with `docs/ws-j-deploy-ci-env.md`; implementing **Phase 2** master-plan items (search, rich SEO/OG/schema UI, newsletter, analytics, etc.) **without** the user asking for that scope.

**If any part of the task is Type C:**  
- Put a section at the **top** of your plan titled **“Explicit user approval required (infrastructure or scope expansion)”** listing each proposed drift and safer alternatives aligned with the master plan.  
- **Do not** present Type C changes as settled; frame them as options until the user confirms.

## Quality bar

- Prefer **minimal diffs**; reuse existing patterns in the repo.
- Preserve **editor guardrails** (required fields, checklist, help text) unless the task explicitly changes them with justification.
- Call out **translation/locale** behavior per WS-B (fallback, redirects, `publishedLocales`) when URLs or content visibility change.

Do not write or modify project files in this turn.
```
