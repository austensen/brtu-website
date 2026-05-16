/**
 * GROQ snippets for WS-F through WS-I. Adjust projections when front-end types firm up.
 *
 * Members area (Step 2+):
 * - **Public** queries omit members-only events and resources in members-only categories (anonymous HTML / ICS).
 * - **Full** queries include all published rows and expose `membersOnly` / `categoryMembersOnly` where relevant for SSR when a session exists.
 * - Legacy names (`resourcesByLocale`, `eventBySlugAndLocale`, etc.) alias **Full** until Step 5 switches call sites explicitly.
 *
 * publishedLocales / language switcher (WS-B):
 * - `apps/web/src/lib/i18n/locales.ts` exports `publishedLocales` (currently `["en"]`).
 * - When non-English content is published, either:
 *   (a) extend `publishedLocales` manually to match launch locales, or
 *   (b) at build time, run `distinctPublishedLocales` (below) and feed the result into the build
 *       so the switcher only lists locales with published docs.
 */

/** Site settings for one locale (singleton-ish: one doc per locale). */
export const siteSettingsByLocale = /* groq */ `
  *[_type == "siteSettings" && locale == $locale][0]{
    _id,
    locale,
    organizationName,
    shortDescription,
    defaultLocale,
    socialLinks,
    membersLoginHelp
  }
`;

/** Marketing pages: home / about / contact for a locale. */
export const pagesByLocale = /* groq */ `
  *[_type == "page" && locale == $locale]{
    _id,
    locale,
    pageType,
    title,
    "slug": slug.current,
    translationOf->{ _id, "slug": slug.current },
    contactEmail,
    contactForm
  }
`;

/** Single page by type + locale (e.g. contact). */
export const pageByTypeAndLocale = /* groq */ `
  *[_type == "page" && locale == $locale && pageType == $pageType][0]{
    _id,
    locale,
    pageType,
    title,
    "slug": slug.current,
    body,
    contactEmail,
    contactForm,
    translationOf->{ _id, "slug": slug.current, locale }
  }
`;

/** Marketing page by slug (about/contact only), for [slug].astro detail + redirects. */
export const marketingPageBySlugAndLocale = /* groq */ `
  *[_type == "page" && locale == $locale && slug.current == $slug && pageType != "home"][0]{
    _id,
    locale,
    pageType,
    title,
    "slug": slug.current,
    body,
    contactEmail,
    contactForm,
    translationOf->{ _id, "slug": slug.current, locale }
  }
`;

/** Blog listing for a locale, newest first. */
export const postsByLocale = /* groq */ `
  *[_type == "post" && locale == $locale] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    heroImage,
    translationOf->{ _id, "slug": slug.current }
  }
`;

/** Single post by slug + locale. */
export const postBySlugAndLocale = /* groq */ `
  *[_type == "post" && locale == $locale && slug.current == $slug][0]{
    _id,
    locale,
    title,
    "slug": slug.current,
    publishedAt,
    heroImage{
      ...,
      alt
    },
    body,
    translationOf->{ _id, "slug": slug.current, locale }
  }
`;

/** Resource categories for a locale (includes members-only categories). */
export const resourceCategoriesByLocale = /* groq */ `
  *[_type == "resourceCategory" && locale == $locale] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    "membersOnly": coalesce(membersOnly, translationOf->membersOnly, false),
    translationOf->{ _id }
  }
`;

/** Resource categories visible without a member session. */
export const resourceCategoriesByLocalePublic = /* groq */ `
  *[_type == "resourceCategory" && locale == $locale && !coalesce(membersOnly, translationOf->membersOnly, false)] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    "membersOnly": coalesce(membersOnly, translationOf->membersOnly, false),
    translationOf->{ _id }
  }
`;

/** Resources for a locale (includes resources in members-only categories). */
export const resourcesByLocaleFull = /* groq */ `
  *[_type == "resource" && locale == $locale] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    updatedAt,
    category->{
      title,
      "slug": slug.current,
      "membersOnly": coalesce(membersOnly, translationOf->membersOnly, false)
    },
    "categoryMembersOnly": coalesce(category->membersOnly, category->translationOf->membersOnly, false),
    file,
    externalUrl,
    translationOf->{ _id, "slug": slug.current }
  }
`;

/** Resources visible without a member session. */
export const resourcesByLocalePublic = /* groq */ `
  *[_type == "resource" && locale == $locale && !coalesce(category->membersOnly, category->translationOf->membersOnly, false)] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    updatedAt,
    category->{
      title,
      "slug": slug.current,
      "membersOnly": coalesce(membersOnly, translationOf->membersOnly, false)
    },
    "categoryMembersOnly": coalesce(category->membersOnly, category->translationOf->membersOnly, false),
    file,
    externalUrl,
    translationOf->{ _id, "slug": slug.current }
  }
`;

/** @deprecated Use `resourcesByLocaleFull` or `resourcesByLocalePublic` (Step 5). Alias of full list. */
export const resourcesByLocale = resourcesByLocaleFull;

/** Single resource by slug + locale (includes members-only categories). */
export const resourceBySlugAndLocaleFull = /* groq */ `
  *[_type == "resource" && locale == $locale && slug.current == $slug][0]{
    _id,
    locale,
    title,
    "slug": slug.current,
    summary,
    updatedAt,
    category->{
      title,
      "slug": slug.current,
      "membersOnly": coalesce(membersOnly, translationOf->membersOnly, false)
    },
    "categoryMembersOnly": coalesce(category->membersOnly, category->translationOf->membersOnly, false),
    file{
      asset->{
        url,
        originalFilename,
        mimeType
      }
    },
    externalUrl,
    translationOf->{ _id, "slug": slug.current, locale }
  }
`;

/** Resource detail when unauthenticated: null if category is members-only. */
export const resourceBySlugAndLocalePublic = /* groq */ `
  *[_type == "resource" && locale == $locale && slug.current == $slug && !coalesce(category->membersOnly, category->translationOf->membersOnly, false)][0]{
    _id,
    locale,
    title,
    "slug": slug.current,
    summary,
    updatedAt,
    category->{
      title,
      "slug": slug.current,
      "membersOnly": coalesce(membersOnly, translationOf->membersOnly, false)
    },
    "categoryMembersOnly": coalesce(category->membersOnly, category->translationOf->membersOnly, false),
    file{
      asset->{
        url,
        originalFilename,
        mimeType
      }
    },
    externalUrl,
    translationOf->{ _id, "slug": slug.current, locale }
  }
`;

/** @deprecated Use `resourceBySlugAndLocaleFull` or `resourceBySlugAndLocalePublic`. */
export const resourceBySlugAndLocale = resourceBySlugAndLocaleFull;

/** Events for a locale, soonest first (includes members-only). */
export const eventsByLocaleFull = /* groq */ `
  *[_type == "event" && locale == $locale] | order(startDateTime asc) {
    _id,
    title,
    "slug": slug.current,
    startDateTime,
    endDateTime,
    timezone,
    "membersOnly": coalesce(membersOnly, translationOf->membersOnly, false),
    translationOf->{ _id, "slug": slug.current }
  }
`;

/** Events for a locale without members-only rows. */
export const eventsByLocalePublic = /* groq */ `
  *[_type == "event" && locale == $locale && !coalesce(membersOnly, translationOf->membersOnly, false)] | order(startDateTime asc) {
    _id,
    title,
    "slug": slug.current,
    startDateTime,
    endDateTime,
    timezone,
    "membersOnly": coalesce(membersOnly, translationOf->membersOnly, false),
    translationOf->{ _id, "slug": slug.current }
  }
`;

/** @deprecated Use `eventsByLocaleFull` or `eventsByLocalePublic`. */
export const eventsByLocale = eventsByLocaleFull;

/** Upcoming events (includes members-only). */
export const upcomingEventsByLocaleFull = /* groq */ `
  *[_type == "event" && locale == $locale && startDateTime >= $now] | order(startDateTime asc) {
    _id,
    title,
    "slug": slug.current,
    startDateTime,
    endDateTime,
    timezone,
    "membersOnly": coalesce(membersOnly, translationOf->membersOnly, false)
  }
`;

/** Upcoming events visible without a member session. */
export const upcomingEventsByLocalePublic = /* groq */ `
  *[_type == "event" && locale == $locale && startDateTime >= $now && !coalesce(membersOnly, translationOf->membersOnly, false)] | order(startDateTime asc) {
    _id,
    title,
    "slug": slug.current,
    startDateTime,
    endDateTime,
    timezone,
    "membersOnly": coalesce(membersOnly, translationOf->membersOnly, false)
  }
`;

/** @deprecated Use `upcomingEventsByLocaleFull` or `upcomingEventsByLocalePublic`. */
export const upcomingEventsByLocale = upcomingEventsByLocaleFull;

/** Past events (includes members-only). */
export const pastEventsByLocaleFull = /* groq */ `
  *[_type == "event" && locale == $locale && startDateTime < $now] | order(startDateTime desc) {
    _id,
    title,
    "slug": slug.current,
    startDateTime,
    endDateTime,
    timezone,
    "membersOnly": coalesce(membersOnly, translationOf->membersOnly, false)
  }
`;

/** Past events visible without a member session. */
export const pastEventsByLocalePublic = /* groq */ `
  *[_type == "event" && locale == $locale && startDateTime < $now && !coalesce(membersOnly, translationOf->membersOnly, false)] | order(startDateTime desc) {
    _id,
    title,
    "slug": slug.current,
    startDateTime,
    endDateTime,
    timezone,
    "membersOnly": coalesce(membersOnly, translationOf->membersOnly, false)
  }
`;

/** @deprecated Use `pastEventsByLocaleFull` or `pastEventsByLocalePublic`. */
export const pastEventsByLocale = pastEventsByLocaleFull;

/** Single event by slug + locale (includes members-only events). */
export const eventBySlugAndLocaleFull = /* groq */ `
  *[_type == "event" && locale == $locale && slug.current == $slug][0]{
    _id,
    locale,
    title,
    "slug": slug.current,
    startDateTime,
    endDateTime,
    timezone,
    location,
    mapLink,
    joinUrl,
    "membersOnly": coalesce(membersOnly, translationOf->membersOnly, false),
    "promotionalFlyer": select(
      defined(promotionalFlyer.asset->_id) => promotionalFlyer{asset->{url, originalFilename, mimeType}},
      defined(translationOf->promotionalFlyer.asset->_id) => translationOf->promotionalFlyer{asset->{url, originalFilename, mimeType}}
    ),
    description,
    translationOf->{ _id, "slug": slug.current, locale }
  }
`;

/** Event detail when unauthenticated: null if event is members-only. */
export const eventBySlugAndLocalePublic = /* groq */ `
  *[_type == "event" && locale == $locale && slug.current == $slug && !coalesce(membersOnly, translationOf->membersOnly, false)][0]{
    _id,
    locale,
    title,
    "slug": slug.current,
    startDateTime,
    endDateTime,
    timezone,
    location,
    mapLink,
    joinUrl,
    "membersOnly": coalesce(membersOnly, translationOf->membersOnly, false),
    "promotionalFlyer": select(
      defined(promotionalFlyer.asset->_id) => promotionalFlyer{asset->{url, originalFilename, mimeType}},
      defined(translationOf->promotionalFlyer.asset->_id) => translationOf->promotionalFlyer{asset->{url, originalFilename, mimeType}}
    ),
    description,
    translationOf->{ _id, "slug": slug.current, locale }
  }
`;

/** @deprecated Use `eventBySlugAndLocaleFull` or `eventBySlugAndLocalePublic`. */
export const eventBySlugAndLocale = eventBySlugAndLocaleFull;

/** Locales that appear on any localizable document (for automating the language switcher). */
export const distinctPublishedLocales = /* groq */ `
  array::unique(
    *[_type in ["page","post","resource","event","siteSettings","resourceCategory"]].locale
  )
`;

/** About + contact slugs for primary nav (per locale). */
export const marketingNavSlugsByLocale = /* groq */ `
  *[_type == "page" && locale == $locale && pageType in ["about", "contact"]]{
    pageType,
    "slug": slug.current
  }
`;

/** Minimal rows to build static paths + translation fallbacks. */
export const allPostsPathRows = /* groq */ `
  *[_type == "post"]{
    _id,
    locale,
    "slug": slug.current,
    "translationEnId": translationOf._ref
  }
`;

export const allMarketingPagePathRows = /* groq */ `
  *[_type == "page" && pageType in ["about", "contact"]]{
    _id,
    locale,
    pageType,
    "slug": slug.current,
    "translationEnId": translationOf._ref
  }
`;

export const allResourcePathRows = /* groq */ `
  *[_type == "resource"]{
    _id,
    locale,
    "slug": slug.current,
    "translationEnId": translationOf._ref
  }
`;

export const allEventPathRows = /* groq */ `
  *[_type == "event"]{
    _id,
    locale,
    "slug": slug.current,
    "translationEnId": translationOf._ref
  }
`;

/** Locales + slugs tied to the same English source document (for language switcher). */
export const slugsByEnglishSource = /* groq */ `
  *[_type == $docType && (_id == $enId || translationOf._ref == $enId)]{
    locale,
    "slug": slug.current
  }
`;

export const postCountByLocale = /* groq */ `
  count(*[_type == "post" && locale == $locale])
`;

/** Paginated posts (end index exclusive in GROQ slice). */
export const postsByLocaleSlice = /* groq */ `
  *[_type == "post" && locale == $locale] | order(publishedAt desc)[$start...$end] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    heroImage{
      ...,
      alt
    },
    translationOf->{ _id, "slug": slug.current }
  }
`;

/** All events (any locale) for ICS generation — excludes members-only. */
export const allEventsForIcs = /* groq */ `
  *[_type == "event" && !coalesce(membersOnly, translationOf->membersOnly, false)]{
    _id,
    locale,
    title,
    "slug": slug.current,
    startDateTime,
    endDateTime,
    timezone,
    location,
    joinUrl,
    mapLink,
    description
  }
`;
