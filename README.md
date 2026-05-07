# Bay Ridge Tenants Union (BRTU) website

Monorepo with:

- `apps/web`: public website (Astro)
- `apps/studio`: CMS (Sanity Studio)

## Licenses

This repository is source-available and non-commercial.

- Code: see `LICENSE` (`PolyForm-Noncommercial-1.0.0`)
- Content/media/docs: see `LICENSE-CONTENT` (`CC-BY-NC-SA-4.0`)

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
- **Studio (`apps/studio`)**
  - `SANITY_PROJECT_ID`
  - `SANITY_DATASET`
  - `SANITY_API_VERSION` (optional)

## Scripts

- `npm run dev:web`: run Astro site
- `npm run dev:studio`: run Sanity Studio
- `npm run build`: build both apps
- `npm run lint`: lint repo
- `npm run typecheck`: typecheck both apps
- `npm run format`: format repo
- `npm run format:check`: verify formatting
