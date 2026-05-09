export const supportedLocales = ["en", "es", "ar", "zh"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale: SupportedLocale = "en";

const localeTitles: Record<SupportedLocale, string> = {
  en: "English",
  es: "Spanish",
  ar: "Arabic",
  zh: "Chinese (Simplified)",
};

/** Options for Sanity `string` fields with `options.list`. */
export function localeOptionsForSanity(): { title: string; value: SupportedLocale }[] {
  return supportedLocales.map((value) => ({
    title: localeTitles[value],
    value,
  }));
}

export function isRtlLocale(locale: SupportedLocale): boolean {
  return locale === "ar";
}

export function normalizeBrowserLocale(raw: string): SupportedLocale | null {
  const lower = raw.toLowerCase();
  if (lower.startsWith("en")) return "en";
  if (lower.startsWith("es")) return "es";
  if (lower.startsWith("ar")) return "ar";
  if (lower.startsWith("zh")) return "zh";
  return null;
}

export function pickBestLocaleFromNavigator(
  navigatorLanguages: readonly string[],
  publishedLocales: readonly SupportedLocale[],
): SupportedLocale {
  for (const lang of navigatorLanguages) {
    const locale = normalizeBrowserLocale(lang);
    if (locale && publishedLocales.includes(locale)) return locale;
  }
  return defaultLocale;
}

export function withLocalePath(locale: SupportedLocale, path: string): string {
  const cleaned = path.startsWith("/") ? path.slice(1) : path;
  const suffix = cleaned.length ? `/${cleaned}` : "/";
  return `/${locale}${suffix}`.replace(/\/+$/, "/");
}
