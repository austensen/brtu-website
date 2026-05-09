import type { SupportedLocale } from "@brtu/locales";

export type PathMode = "content" | "redirect";

export type TranslatableSlugPath = {
  params: { locale: string; slug: string };
  props: {
    mode: PathMode;
    redirectTo?: string;
    enId?: string;
  };
};

export type TranslatablePathRow = {
  _id: string;
  locale: string;
  slug: string | null;
  translationEnId: string | null;
};

/**
 * EN documents are anchors; other locales link via translationEnId → EN _id.
 * Emits redirect-only paths when a locale has no translation (WS-B silent English).
 */
export function buildTranslatableSlugPaths(
  rows: TranslatablePathRow[],
  publishedLocales: readonly SupportedLocale[],
  defaultLocale: SupportedLocale,
  redirectPath: (locale: SupportedLocale, slug: string) => string,
): TranslatableSlugPath[] {
  const validRows = rows.filter((r): r is TranslatablePathRow & { slug: string } => Boolean(r.slug));
  const anchors = validRows.filter((d) => d.locale === defaultLocale);
  const realKeys = new Set(validRows.map((d) => `${d.locale}/${d.slug}`));
  const paths: TranslatableSlugPath[] = [];
  const consumed = new Set<string>();

  for (const en of anchors) {
    const translations = validRows.filter((d) => d.translationEnId === en._id);
    const byLocale = new Map(translations.map((t) => [t.locale, t]));
    for (const loc of publishedLocales) {
      const doc = loc === defaultLocale ? en : byLocale.get(loc);
      if (doc) {
        const key = `${loc}/${doc.slug}`;
        if (!consumed.has(key)) {
          consumed.add(key);
          paths.push({
            params: { locale: loc, slug: doc.slug },
            props: { mode: "content", enId: en._id },
          });
        }
      } else if (loc !== defaultLocale) {
        const key = `${loc}/${en.slug}`;
        if (!realKeys.has(key) && !consumed.has(key)) {
          consumed.add(key);
          paths.push({
            params: { locale: loc, slug: en.slug },
            props: { mode: "redirect", redirectTo: redirectPath(defaultLocale, en.slug) },
          });
        }
      }
    }
  }

  return paths;
}
