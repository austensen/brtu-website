discovery questions:

WS-A — Foundation and repository layout

- Monorepo layout: single repo with apps/web + apps/studio
- Package manager: npm
  \*Frontend framework final pick: Astro
- TypeScript strictness baseline: prioritize readability over type safety
- Where will secrets live for local dev (.env pattern) and CI: .env file in root of project
- Any required license (MIT, etc.) or org GitHub org settings: share-alike license

WS-B — Internationalization and URL strategy

- Confirm fallback UX: silent English
- Default URL for English: /en/
- Language switcher: show only locales with published content
- Default language: detect browser settings
- Chinese: Simplified
- Arabic: system font acceptable
- events/posts should expose localized slugs, but redirect url with no language slug to english page

WS-C — Sanity content model (schemas)

- Contact page: Netlify Forms
- Resource taxonomy: flat categories
- Max file sizes and allowed MIME types for resources: needs to allow for images, but video and large files can be externally hosted, for example via youtube
  Rich text: which Portable Text features (headings, lists, links, embeds, callouts): no special requirements, typical default options
- Single vs multiple file attachments per resource: single is ok
- Events: all-day support needed at MVP: no
- Any required CTA fields on Home (join, donate, meeting link): no
