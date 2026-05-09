import type { SupportedLocale } from "@brtu/locales";
import type { LangHrefMap } from "../lib/i18n/langAlternates";
import { withLocalePath } from "../lib/i18n/locales";
import LanguageSwitcher from "./LanguageSwitcher";

type Props = {
  locale: SupportedLocale;
  aboutSlug: string;
  contactSlug: string;
  langSwitcherAlternates?: LangHrefMap;
  pathAfterLocale?: string;
};

export default function HeaderNav({
  locale,
  aboutSlug,
  contactSlug,
  langSwitcherAlternates,
  pathAfterLocale,
}: Props) {
  const homeHref = withLocalePath(locale, "");

  return (
    <nav id="site-nav" className="site-nav" aria-label="Primary" data-site-nav>
      <ul className="site-nav__primary">
        <li>
          <a href={homeHref}>Home</a>
        </li>
        <li>
          <a href={withLocalePath(locale, aboutSlug)}>About</a>
        </li>
        <li>
          <a href={withLocalePath(locale, contactSlug)}>Contact</a>
        </li>
        <li>
          <a href={withLocalePath(locale, "blog")}>Blog</a>
        </li>
        <li>
          <a href={withLocalePath(locale, "resources")}>Resources</a>
        </li>
        <li>
          <a href={withLocalePath(locale, "events")}>Events</a>
        </li>
      </ul>
      <LanguageSwitcher
        currentLocale={locale}
        pathAfterLocale={pathAfterLocale}
        alternates={langSwitcherAlternates}
      />
    </nav>
  );
}
