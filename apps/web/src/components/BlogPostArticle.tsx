import type { SupportedLocale } from "@brtu/locales";

import styles from "./BlogPostArticle.module.css";

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
        <time dateTime={publishedAt} className={styles.date}>
          {dateFmt.format(new Date(publishedAt))}
        </time>
      </p>
      {heroUrl ? (
        <p className={styles.heroWrap}>
          <img
            src={heroUrl}
            alt={heroAlt}
            width={1200}
            height={675}
            className={styles.heroImg}
            loading="eager"
            decoding="async"
          />
        </p>
      ) : null}
      <div className="prose" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </article>
  );
}
