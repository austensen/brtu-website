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
    heroImage,
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
    file,
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
