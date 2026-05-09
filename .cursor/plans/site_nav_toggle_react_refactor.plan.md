# SiteNavToggle refactor + responsive patterns

## Part A — Refactor summary (implementation)

Refactor [`apps/web/src/components/SiteNavToggle.tsx`](apps/web/src/components/SiteNavToggle.tsx) per prior technical plan:

- Optional [`apps/web/src/hooks/useMediaQuery.ts`](apps/web/src/hooks/useMediaQuery.ts): encapsulate `useSyncExternalStore` + `matchMedia` subscribe/snapshot/server snapshot.
- Replace `openRef` with scoped effects: Escape and nav link listeners only when `open && isMobile`; use `onClick` on the button.
- Single `useLayoutEffect` to sync `data-menu-enhanced` / `data-menu-open` on `closest('[data-site-header]')`; reset `open` when leaving mobile.

---

## Assessment: does this plan simplify and improve the codebase?

### Simplification

- **Within `SiteNavToggle`:** Yes, moderately. Fewer parallel effects, one clear place for header `data-*` attributes, and removal of the `openRef` mirror reduce mental overhead and duplicate DOM walks.
- **Across the repo:** Limited by design—the header wrapper still lives in Astro ([`BaseLayout.astro`](apps/web/src/layouts/BaseLayout.astro)), so imperative syncing of CSS-hook attributes on an ancestor remains until a larger “single React header shell” refactor. The plan does not remove that fundamental bridge; it only organizes it.

### Readability

- **Improves:** Event flow becomes easier to follow (`onClick` for toggle; effects gated on “menu open” for Escape and nav). Media query subscription stays colocated or moves behind a named hook with an obvious API.
- **Tradeoff:** Slightly more `useEffect` dependency reasoning than the single empty-deps listener block, but each effect’s intent is narrower (fewer hidden stale-closure bugs).

### Maintainability

- **Improves:** Future changes (e.g. different close triggers) touch localized effects. Testing `useMediaQuery` in isolation is straightforward.
- **Residual risk:** Breakpoint strings must stay aligned with [`apps/web/src/styles/global.css`](apps/web/src/styles/global.css) (e.g. `47.9375rem`). Without a shared constant or documented single source of truth, drift is possible—addressed in Part B.

### Verdict

The refactor is **worth doing** for component clarity and safer event scoping. It is **not** a silver bullet for “global” responsiveness; pair it with Part B for repetition control.

---

## Part B — Global solution for responsive UI patterns (reduce repetition)

### Goals

- One obvious place for **breakpoint strings** that mirror CSS.
- One reusable **`useMediaQuery`** (or thin wrappers) for **client islands** that need JS-aware breakpoints.
- Clear guidance: **prefer CSS** for layout/responsive visibility; use JS only when interaction or non-CSS state is required (disclosure, focus management, bridging `data-*` to legacy selectors).

### Recommended structure (apps/web)

1. **`apps/web/src/lib/responsive/breakpoints.ts`** (or `tokens.ts`)

   - Export named constants, e.g. `export const NAV_MOBILE_MQ = "(max-width: 47.9375rem)" as const;`
   - Top-of-file comment: **must match** the corresponding block in [`global.css`](apps/web/src/styles/global.css) (line reference updated when CSS changes).
   - Optional: export a small map `BREAKPOINTS` for discoverability.

2. **`apps/web/src/hooks/useMediaQuery.ts`**

   - Generic `useMediaQuery(query: string): boolean` using `useSyncExternalStore` + `getServerSnapshot` returning `false` (or a conservative default for SSR/static HTML).
   - Used by `SiteNavToggle` and any future island (e.g. responsive modal, collapsible sidebar).

3. **Thin aliases (optional)**

   - `useNavMobileMatches()` → `useMediaQuery(NAV_MOBILE_MQ)` so call sites read intent without repeating strings.

4. **When many components subscribe to the same query**

   - For this codebase size, multiple `useMediaQuery` hooks are usually fine (each uses one `matchMedia` subscription via `useSyncExternalStore`).
   - If profiling shows redundant work, add a **`ResponsiveProvider`** at layout level that subscribes once and exposes context—only pay this complexity tax when needed.

5. **CSS coordination**

   - Longer term: PostCSS [`@custom-media`](https://github.com/postcss/postcss-custom-media) or design-token pipeline so **one definition** feeds both CSS and TS—only if the team wants build tooling for tokens; otherwise **breakpoints.ts + comment link to CSS** is the pragmatic minimum.

### What this does *not* replace

- **`client:load` vs `client:visible`** decisions for Astro islands (hydration timing)—document separately per component; responsive hooks do not fix intersection-observer deadlocks.
- **Ancestor attribute bridging** for CSS that targets parents outside the React subtree—either keep a small effect (current approach) or lift layout state (larger refactor).

---

## Implementation todos

- [ ] Add `breakpoints.ts` + `useMediaQuery.ts`; refactor `SiteNavToggle` to use them.
- [ ] Consolidate effects / `onClick` / `useLayoutEffect` per Part A.
- [ ] `npm run typecheck` && `npm run build` in `apps/web`.
