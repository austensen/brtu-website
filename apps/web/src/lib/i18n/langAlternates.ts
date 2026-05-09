import type { SupportedLocale } from "@brtu/locales";
import { supportedLocales } from "@brtu/locales";
import type { SanityClient } from "@sanity/client";
import { slugsByEnglishSource } from "../sanity/queries";
import { withLocalePath } from "./locales";

export type LangHrefMap = Partial<Record<SupportedLocale, string>>;

export function englishSourceId(doc: {
  locale: string;
  _id: string;
  translationOf?: { _id: string } | null;
}): string {
  if (doc.locale === "en") return doc._id;
  return doc.translationOf?._id ?? doc._id;
}

/**
 * Full path including locale prefix, e.g. `/en/blog/slug`.
 * Missing translations reuse the English href (silent fallback).
 */
export async function fetchLangHrefAlternates(
  client: SanityClient,
  docType: string,
  enId: string,
  pathForSlug: (locale: SupportedLocale, slug: string) => string,
  publishedLocales: readonly SupportedLocale[],
): Promise<LangHrefMap> {
  const rows = await client.fetch<Array<{ locale: string; slug: string | null }>>(slugsByEnglishSource, {
    docType,
    enId,
  });
  const map: LangHrefMap = {};
  for (const row of rows) {
    if (!row.slug) continue;
    const loc = row.locale as SupportedLocale;
    if (supportedLocales.includes(loc)) {
      map[loc] = pathForSlug(loc, row.slug);
    }
  }
  const enHref = map.en;
  if (enHref) {
    for (const loc of publishedLocales) {
      if (!map[loc]) map[loc] = enHref;
    }
  }
  return map;
}

/** Home lives at `/[locale]/` (not the CMS slug segment). */
export async function fetchHomeLangHrefAlternates(
  client: SanityClient,
  enId: string,
  publishedLocales: readonly SupportedLocale[],
): Promise<LangHrefMap> {
  const q = /* groq */ `
    *[_type == "page" && pageType == "home" && (_id == $enId || translationOf._ref == $enId)]{
      locale
    }
  `;
  const rows = await client.fetch<Array<{ locale: string }>>(q, { enId });
  const map: LangHrefMap = {};
  for (const row of rows) {
    const loc = row.locale as SupportedLocale;
    if (supportedLocales.includes(loc)) {
      map[loc] = withLocalePath(loc, "");
    }
  }
  const enHref = map.en;
  if (enHref) {
    for (const loc of publishedLocales) {
      if (!map[loc]) map[loc] = enHref;
    }
  }
  return map;
}
