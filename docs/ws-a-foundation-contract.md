## WS-A foundation contract (executed)

This repo’s foundation is locked by the master plan at `.cursor/plans/tenant_union_website_plan_81e09108.plan.md`.

### Locked baseline

- **Monorepo**: `apps/web` (Astro) + `apps/studio` (Sanity Studio)
- **Package manager**: `npm` (workspaces)
- **TypeScript posture**: readability over strictness (`strict: false` baseline)
- **Secrets**: root `.env` for local only; deployment/CI env vars live in the platform
- **Hosting/CMS**: Netlify + Sanity Studio

### Required files present

- **Root**
  - `package.json` (workspaces + script matrix)
  - `.npmrc`, `.gitignore`, `.editorconfig`, `.prettierrc`
  - `eslint.config.mjs`, `tsconfig.base.json`
  - `.env.example` (root env contract)
  - `README.md`
  - `LICENSE` (PolyForm-Noncommercial-1.0.0)
  - `LICENSE-CONTENT` (CC-BY-NC-SA-4.0)
  - `netlify.toml`
- **Apps**
  - `apps/web/*` (Astro app)
  - `apps/studio/*` (Sanity Studio app)
  - `apps/web/.env.example`, `apps/studio/.env.example`

### Environment variable contract

- **Root `.env` (local only)**:
  - `SANITY_PROJECT_ID`
  - `SANITY_DATASET`
  - `SANITY_API_VERSION` (optional; defaulted in app config)
- **Web (browser-safe via Astro `PUBLIC_`)**:
  - `PUBLIC_SANITY_PROJECT_ID`
  - `PUBLIC_SANITY_DATASET`
  - `PUBLIC_SANITY_API_VERSION` (optional)
- **Studio**:
  - `SANITY_PROJECT_ID`
  - `SANITY_DATASET`
  - `SANITY_API_VERSION` (optional)

### Verification commands

```bash
npm install
npm run dev:web
npm run dev:studio
npm run build
npm run lint
npm run typecheck
npm run format:check
```

