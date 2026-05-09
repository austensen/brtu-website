import type { SupportedLocale } from "@brtu/locales";
import { withLocalePath } from "../lib/i18n/locales";

type Props = {
  locale: SupportedLocale;
  organizationName: string;
};

export default function HeaderBrand({ locale, organizationName }: Props) {
  const homeHref = withLocalePath(locale, "");

  return (
    <a className="site-brand" href={homeHref}>
      <img
        className="site-brand__logo"
        src="/images/brtu-logo.png"
        width={52}
        height={52}
        alt=""
        decoding="async"
        fetchPriority="high"
      />
      <span>{organizationName}</span>
    </a>
  );
}
