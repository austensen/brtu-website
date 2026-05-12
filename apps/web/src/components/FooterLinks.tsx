import type { SupportedLocale } from "@brtu/locales";
import { withLocalePath } from "../lib/i18n/locales";

type Props = {
  organizationName: string;
  locale: SupportedLocale;
  aboutSlug: string;
  contactSlug: string;
};

export default function FooterLinks({
  organizationName,
  locale,
  aboutSlug,
  contactSlug,
}: Props) {
  const year = new Date().getFullYear();
  const homeHref = withLocalePath(locale, "");

  return (
    <div className="site-footer__left">
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
      <p className="site-footer__copyright">
        © {year} {organizationName}
      </p>
      <p className="site-footer__netlify">
        <a href="https://www.netlify.com/" rel="noopener noreferrer">
          This site is powered by Netlify
        </a>
      </p>
    </div>
  );
}
