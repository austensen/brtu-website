export const supportedLocales = ["en", "es", "ar", "zh"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale: SupportedLocale = "en";

// WS-B locked: show only locales with published content.
// Until Sanity is wired, we conservatively treat only English as published.
export const publishedLocales: readonly SupportedLocale[] = ["en"];

export function normalizeBrowserLocale(raw: string): SupportedLocale | null {
  const lower = raw.toLowerCase();
  if (lower.startsWith("en")) return "en";
  if (lower.startsWith("es")) return "es";
  if (lower.startsWith("ar")) return "ar";
  if (lower.startsWith("zh")) return "zh";
  return null;
}

export function pickBestLocaleFromNavigator(navigatorLanguages: readonly string[]): SupportedLocale {
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

