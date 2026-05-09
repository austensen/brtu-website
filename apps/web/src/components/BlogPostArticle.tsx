import type { SupportedLocale } from "@brtu/locales";

type Props = {
  locale: SupportedLocale;
  title: string;
  publishedAt: string;
  heroUrl: string | null;
  heroAlt: string;
  bodyHtml: string;
};

export default function BlogPostArticle({ locale, title, publishedAt, heroUrl, heroAlt, bodyHtml }: Props) {
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "long" });

  return (
    <article>
      <h1>{title}</h1>
      <p>
        <time dateTime={publishedAt} style={{ color: "var(--color-text-muted)" }}>
          {dateFmt.format(new Date(publishedAt))}
        </time>
      </p>
      {heroUrl ? (
        <p style={{ margin: "var(--space-6) 0" }}>
          <img
            src={heroUrl}
            alt={heroAlt}
            width={1200}
            height={675}
            style={{ width: "100%", height: "auto", borderRadius: "var(--radius)" }}
            loading="eager"
            decoding="async"
          />
        </p>
      ) : null}
      <div className="prose" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </article>
  );
}
