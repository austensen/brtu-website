/**
 * GROQ snippets for WS-F through WS-I. Adjust projections when front-end types firm up.
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
    socialLinks
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

/** Resource categories for a locale. */
export const resourceCategoriesByLocale = /* groq */ `
  *[_type == "resourceCategory" && locale == $locale] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    translationOf->{ _id }
  }
`;

/** Resources for a locale. */
export const resourcesByLocale = /* groq */ `
  *[_type == "resource" && locale == $locale] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    updatedAt,
    category->{ title, "slug": slug.current },
    file,
    externalUrl,
    translationOf->{ _id, "slug": slug.current }
  }
`;

/** Single resource by slug + locale. */
export const resourceBySlugAndLocale = /* groq */ `
  *[_type == "resource" && locale == $locale && slug.current == $slug][0]{
    _id,
    locale,
    title,
    "slug": slug.current,
    summary,
    updatedAt,
    category->{ title, "slug": slug.current },
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

/** Events for a locale, soonest first. */
export const eventsByLocale = /* groq */ `
  *[_type == "event" && locale == $locale] | order(startDateTime asc) {
    _id,
    title,
    "slug": slug.current,
    startDateTime,
    endDateTime,
    timezone,
    translationOf->{ _id, "slug": slug.current }
  }
`;

/** Upcoming events for a locale (start >= now), soonest first. */
export const upcomingEventsByLocale = /* groq */ `
  *[_type == "event" && locale == $locale && startDateTime >= $now] | order(startDateTime asc) {
    _id,
    title,
    "slug": slug.current,
    startDateTime,
    endDateTime,
    timezone
  }
`;

/** Past events for a locale, most recent first. */
export const pastEventsByLocale = /* groq */ `
  *[_type == "event" && locale == $locale && startDateTime < $now] | order(startDateTime desc) {
    _id,
    title,
    "slug": slug.current,
    startDateTime,
    endDateTime,
    timezone
  }
`;

/** Single event by slug + locale. */
export const eventBySlugAndLocale = /* groq */ `
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
    "promotionalFlyer": select(
      defined(promotionalFlyer.asset->_id) => promotionalFlyer{asset->{url, originalFilename, mimeType}},
      defined(translationOf->promotionalFlyer.asset->_id) => translationOf->promotionalFlyer{asset->{url, originalFilename, mimeType}}
    ),
    description,
    translationOf->{ _id, "slug": slug.current, locale }
  }
`;

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

/** All events (any locale) for ICS generation. */
export const allEventsForIcs = /* groq */ `
  *[_type == "event"]{
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
