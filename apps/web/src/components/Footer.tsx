import type { SupportedLocale } from "@brtu/locales";
import { withLocalePath } from "../lib/i18n/locales";

type Props = {
  organizationName: string;
  locale: SupportedLocale;
  aboutSlug: string;
  contactSlug: string;
};

export default function Footer({
  organizationName,
  locale,
  aboutSlug,
  contactSlug,
}: Props) {
  const year = new Date().getFullYear();
  const homeHref = withLocalePath(locale, "");

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <nav className="site-footer__nav" aria-label="Footer">
          <ul className="site-footer__links">
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
        </nav>
        <p>
          © {year} {organizationName}
        </p>
      </div>
    </footer>
  );
}
