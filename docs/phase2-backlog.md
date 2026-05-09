# Phase 2 backlog (triage)

Prioritized from the master plan (`.cursor/plans/tenant_union_website_plan_81e09108.plan.md`) — **Phase 2** and deferred **`N` / `U`** intake items. This is planning only; nothing here is committed for a date.

## Next (highest leverage after launch)

| Item | Rationale |
|------|-----------|
| **Per-field SEO + Open Graph** | Fine control over sharing and search snippets once content volume grows. |
| **Schema.org** (Organization, Article, Event) | Incremental SEO win with manageable scope. |
| **Spam / CAPTCHA** (if forms spam) | Netlify honeypot exists; escalate to Turnstile or similar if needed. |
| **Resource filters / sorting** | Plan already notes richer filtering if the library grows. |

## Later (valuable but heavier or policy-dependent)

| Item | Rationale |
|------|-----------|
| **Sitewide search** | Explicitly **deferred** (`U`) in master plan; IA + resource/event filters cover MVP. Revisit when navigation pain is real. |
| **Newsletter** | Requires provider choice (cost, privacy, list ownership). |
| **Analytics** | Privacy vs free tier tradeoff (e.g. Plausible vs GA4). |
| **FAQ** page type or structured FAQs | Nice for support load; not required for MVP. |
| **Blog categories / tags** | Deferred unless trivial; posts work without them. |
| **XML sitemap controls UI** | Defer until SEO workflow needs it. |
| **Redirects tooling** | Defer until URL churn justifies CMS-managed redirects. |
| **Backups / export automation** | Phase 3 “handoff hardening” also mentions governance; operational policy first. |

## Cut or park (explicitly out of MVP / low priority)

| Item | Rationale |
|------|-----------|
| **Calendar month grid view** | MVP uses list + detail + ICS; grid is polish. |
| **Recurring events** | Not in MVP schema. |
| **Scheduled publishing** | Not in MVP; manual publish workflow. |
| **RSS** | Called out as optional Phase 2 in workstream notes; only add if audience asks. |
| **Vision / GROQ in Studio** | Blocked on Sanity major upgrade path per WS-D note; use API playground externally. |

## Post-launch hygiene (from WS-F–I completion note)

- **English UI chrome**: section titles (“Blog”, “Resources”, “Events”) and some CTAs are not CMS-driven yet — consider moving to `siteSettings` or i18n files in a future pass.

---

Review this list after **4–8 weeks** of real traffic and editor feedback; reorder **Next / Later** accordingly.
