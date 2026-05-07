---
name: WS-A Foundation Plan
overview: Define a complete implementation plan for WS-A (foundation and repository layout) without code changes, including folder/file targets, tooling conventions, env contract, license placement, and downstream handoff artifacts.
todos:
  - id: ws-a-structure
    content: Define root/app folder and config file creation plan for monorepo foundation.
    status: completed
  - id: ws-a-tooling
    content: Define npm workspace scripts and lint/typecheck/format conventions for root and apps.
    status: completed
  - id: ws-a-env
    content: Define local/deploy environment variable contract and example-file strategy.
    status: completed
  - id: ws-a-license
    content: Define dual-license placement and README notice language.
    status: completed
  - id: ws-a-acceptance
    content: Define acceptance criteria, verification commands, and downstream handoff artifacts.
    status: completed
isProject: false
---

# WS-A Implementation Plan (Foundation and Repository Layout)

## Scope

- Establish monorepo foundation for `apps/web` (Astro site) and `apps/studio` (Sanity Studio) using `npm` workspaces.
- Standardize baseline tooling/scripts for local dev and CI: dev, build, lint, typecheck, format.
- Define a clear local/deployment env contract aligned to Netlify + Sanity.
- Apply final non-commercial dual-license structure and placement.
- Produce stable handoff inputs for [WS-B](.cursor/plans/tenant_union_website_plan_81e09108.plan.md), [WS-C](.cursor/plans/tenant_union_website_plan_81e09108.plan.md), and [WS-J](.cursor/plans/tenant_union_website_plan_81e09108.plan.md).

## Proposed architecture/layout

- Monorepo root orchestrates scripts and shared config; apps remain independently runnable.
- Application layout:
  - `apps/web`: Astro public site
  - `apps/studio`: Sanity Studio
- Shared config at root first; optional `packages/*` only if duplication becomes material during implementation.
- Keep TypeScript pragmatic/readable (`strict: false` baseline), enforce consistency through lint/format rather than heavy type complexity.

## File/folder plan

Create/modify the following:

- Root workspace and governance
  - [package.json](/Users/maxwell/repos/brtu-website/package.json)
  - [.npmrc](/Users/maxwell/repos/brtu-website/.npmrc)
  - [.gitignore](/Users/maxwell/repos/brtu-website/.gitignore)
  - [.editorconfig](/Users/maxwell/repos/brtu-website/.editorconfig)
  - [README.md](/Users/maxwell/repos/brtu-website/README.md)
- Tooling/config
  - [tsconfig.base.json](/Users/maxwell/repos/brtu-website/tsconfig.base.json)
  - [eslint.config.mjs](/Users/maxwell/repos/brtu-website/eslint.config.mjs)
  - [.prettierrc](/Users/maxwell/repos/brtu-website/.prettierrc)
  - [.prettierignore](/Users/maxwell/repos/brtu-website/.prettierignore)
- Environment contracts
  - [.env.example](/Users/maxwell/repos/brtu-website/.env.example)
  - [apps/web/.env.example](/Users/maxwell/repos/brtu-website/apps/web/.env.example)
  - [apps/studio/.env.example](/Users/maxwell/repos/brtu-website/apps/studio/.env.example)
- App scaffolds/config
  - [apps/web/package.json](/Users/maxwell/repos/brtu-website/apps/web/package.json)
  - [apps/web/astro.config.mjs](/Users/maxwell/repos/brtu-website/apps/web/astro.config.mjs)
  - [apps/web/tsconfig.json](/Users/maxwell/repos/brtu-website/apps/web/tsconfig.json)
  - [apps/studio/package.json](/Users/maxwell/repos/brtu-website/apps/studio/package.json)
  - [apps/studio/sanity.config.ts](/Users/maxwell/repos/brtu-website/apps/studio/sanity.config.ts)
  - [apps/studio/tsconfig.json](/Users/maxwell/repos/brtu-website/apps/studio/tsconfig.json)
- Deployment/license
  - [netlify.toml](/Users/maxwell/repos/brtu-website/netlify.toml)
  - [LICENSE](/Users/maxwell/repos/brtu-website/LICENSE)
  - [LICENSE-CONTENT](/Users/maxwell/repos/brtu-website/LICENSE-CONTENT)

## Tooling/scripts plan

- Root scripts (single command surface for humans/CI)
  - `dev:web`, `dev:studio`, `dev`
  - `build:web`, `build:studio`, `build`
  - `lint`, `typecheck`, `format`, `format:check`
- Convention: app-level scripts keep same names (`dev`, `build`, `lint`, `typecheck`) and root orchestrates via workspace flags.
- Lint/format approach
  - ESLint + Prettier baseline, readability-first defaults.
  - No strict/noisy rule set that blocks non-technical velocity.
- Typecheck approach
  - Base TS config shared from root; avoid maximal strictness in WS-A.
  - Allow incremental tightening in later workstreams only where value is clear.

## Env/secrets plan

- Local development
  - Single root `.env` (gitignored) for developer secrets.
  - `.env.example` files document required keys and safe placeholders.
- Naming contract
  - Browser-safe/public keys prefixed per app convention (`PUBLIC_` for Astro public runtime, `SANITY_STUDIO_` for Studio-exposed values).
  - Server-only keys stay unprefixed and never referenced in browser bundles.
- Deployment/CI
  - Netlify env vars set in platform UI (no committed secret files).
  - Document required variables per app and per environment (preview/production) in README.

## License recommendation

- Place code license in [LICENSE](/Users/maxwell/repos/brtu-website/LICENSE) with `PolyForm-Noncommercial-1.0.0` text.
- Place content/media/docs license in [LICENSE-CONTENT](/Users/maxwell/repos/brtu-website/LICENSE-CONTENT) with `CC-BY-NC-SA-4.0` text.
- Add short notice in [README.md](/Users/maxwell/repos/brtu-website/README.md) clarifying dual-license split and source-available non-commercial posture.

## Acceptance criteria

- `npm install` completes at repo root without manual fixes.
- `npm run dev:web` starts Astro app; `npm run dev:studio` starts Studio.
- `npm run build` succeeds for both apps.
- `npm run lint`, `npm run typecheck`, and `npm run format:check` pass.
- `.env.example` files match actual runtime needs; no secrets tracked in git.
- Dual-license files exist with correct texts and README references.

## Verification commands

- `npm install`
- `npm run dev:web`
- `npm run dev:studio`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm run format:check`

## Risks/open questions

- No hard blockers for WS-A planning.
- Non-blocking implementation-time choices:
  - Confirm exact Node LTS version to pin in `engines` and docs.
  - Confirm whether to include optional `packages/types` in WS-A or defer until WS-B/WS-C need emerges.
  - Confirm whether Studio deploy target is Netlify or Sanity-hosted in WS-J (does not block WS-A scaffolding).

## Workstream completion note (WS-A)

- Added/updated in [tenant_union_website_plan_81e09108.plan.md](/Users/maxwell/repos/brtu-website/.cursor/plans/tenant_union_website_plan_81e09108.plan.md):
  - planned shipped scope,
  - expected files/folders touched,
  - deviations (none),
  - assumptions/constraints,
  - handoff inputs for WS-B/WS-C/WS-J.

## Next-agent context packet

- Added in [tenant_union_website_plan_81e09108.plan.md](/Users/maxwell/repos/brtu-website/.cursor/plans/tenant_union_website_plan_81e09108.plan.md) under `Next-agent context packet` for direct copy/paste into the next session.
