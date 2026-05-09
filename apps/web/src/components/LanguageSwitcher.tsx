import type { SupportedLocale } from "@brtu/locales";
import { publishedLocales } from "../lib/i18n/locales";
import type { LangHrefMap } from "../lib/i18n/langAlternates";

type Props = {
  currentLocale: SupportedLocale;
  pathAfterLocale?: string;
  /** Full paths like `/en/blog/slug` when slugs differ per locale. */
  alternates?: LangHrefMap;
};

function fallbackPath(locale: SupportedLocale, pathAfterLocale: string) {
  return `/${locale}/${pathAfterLocale}`.replace(/\/+$/, "/");
}

export default function LanguageSwitcher({
  currentLocale,
  pathAfterLocale = "",
  alternates,
}: Props) {
  return (
    <ul className="lang-switcher" aria-label="Language">
      {publishedLocales.map((locale) => {
        const href = alternates?.[locale] ?? fallbackPath(locale, pathAfterLocale);
        return (
          <li key={locale}>
            <a href={href} aria-current={locale === currentLocale ? "page" : undefined}>
              {locale.toUpperCase()}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
