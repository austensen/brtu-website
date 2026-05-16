# Bay Ridge Tenants Union (BRTU) website

Monorepo with:

- `apps/web`: public website (Astro)
- `apps/studio`: CMS (Sanity Studio)

## Licenses

- Code: see `LICENSE` (GNU General Public License v3.0 only, `GPL-3.0-only`)
- Content/media/docs: see `LICENSE-CONTENT` (`CC-BY-NC-SA-4.0`)

## Code of conduct

Participation is covered by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Getting started

1. Copy env examples:
   - `cp .env.example .env`
2. Install dependencies:
   - `npm install`
3. Run locally:
   - `npm run dev:web`
   - `npm run dev:studio`

## Environment variables

Local development uses a single root `.env` file (never committed). Deployment/CI uses platform env vars.

- **Shared (root `.env`)**
  - `SANITY_PROJECT_ID`
  - `SANITY_DATASET`
  - `SANITY_API_VERSION` (optional)
- **Web (`apps/web`)**
  - `PUBLIC_SANITY_PROJECT_ID`
  - `PUBLIC_SANITY_DATASET`
  - `PUBLIC_SANITY_API_VERSION` (optional)
  - **Members-only (server-only, never `PUBLIC_*`):** `MEMBERS_SESSION_SECRET`, `MEMBERS_PASSWORD`, `MEMBERS_MAGIC_LINK_TOKEN` — password login at `/[locale]/members`; magic-link bootstrap at `/api/members/bootstrap?t=<TOKEN>` with optional `&to=/en/events` (see [`docs/ws-j-deploy-ci-env.md`](docs/ws-j-deploy-ci-env.md#members-only-access))
- **Studio (`apps/studio`)**
  - `SANITY_PROJECT_ID`
  - `SANITY_DATASET`
  - `SANITY_API_VERSION` (optional)

## Scripts

- `npm run dev:web`: run Astro site
- `npm run dev:studio`: run Sanity Studio
- `npm run build`: build both apps
- `npm run deploy:studio`: deploy Sanity Studio
- `npm run lint`: lint repo
- `npm run typecheck`: typecheck both apps
- `npm run format`: format repo
- `npm run format:check`: verify formatting

## Deployment notes

- WS-A foundation contract: `docs/ws-a-foundation-contract.md`
- WS-J deploy/CI/env wiring: `docs/ws-j-deploy-ci-env.md`
- Editor handbook (publishing, translations, contact form, events): `docs/editor-handbook.md`
- Launch QA checklist: `docs/launch-qa-checklist.md`
- Phase 2 backlog triage: `docs/phase2-backlog.md`
