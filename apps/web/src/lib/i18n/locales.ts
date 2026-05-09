import {
  defaultLocale,
  normalizeBrowserLocale,
  pickBestLocaleFromNavigator as pickBestLocaleFromNavigatorBase,
  supportedLocales,
  withLocalePath,
  type SupportedLocale,
} from "@brtu/locales";

export {
  defaultLocale,
  normalizeBrowserLocale,
  supportedLocales,
  withLocalePath,
  type SupportedLocale,
};

// WS-B locked: show only locales with published content.
// Until Sanity is wired, we conservatively treat only English as published.
// When more locales ship, update here or derive from build-time GROQ (see `src/lib/sanity/queries.ts`).
export const publishedLocales: readonly SupportedLocale[] = ["en"];

export function pickBestLocaleFromNavigator(
  navigatorLanguages: readonly string[],
): SupportedLocale {
  return pickBestLocaleFromNavigatorBase(navigatorLanguages, publishedLocales);
}
