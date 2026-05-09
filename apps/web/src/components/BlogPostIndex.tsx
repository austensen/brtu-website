import type { SupportedLocale } from "@brtu/locales";
import { withLocalePath } from "../lib/i18n/locales";

import styles from "./BlogPostIndex.module.css";

export type BlogPostIndexItem = {
  title: string;
  slug: string;
  publishedAt: string;
  heroImageUrl: string | null;
  heroAlt: string;
};

type Props = {
  locale: SupportedLocale;
  posts: BlogPostIndexItem[];
  pageNum: number;
  totalPages: number;
};

export default function BlogPostIndex({ locale, posts, pageNum, totalPages }: Props) {
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <>
      <h1>Blog</h1>
      {pageNum > 1 ? (
        <p className={styles.meta}>
          Page {pageNum} of {totalPages}
        </p>
      ) : null}

      <ul className={styles.list}>
        {posts.map((post) => (
          <li key={post.slug} className={`card ${styles.cardItem}`}>
            {post.heroImageUrl ? (
              <a href={withLocalePath(locale, `blog/${post.slug}`)} className={styles.heroLink}>
                <img
                  src={post.heroImageUrl}
                  alt={post.heroAlt}
                  width={800}
                  height={450}
                  className={styles.heroImg}
                  loading="lazy"
                  decoding="async"
                />
              </a>
            ) : null}
            <h2 className={styles.postTitle}>
              <a href={withLocalePath(locale, `blog/${post.slug}`)}>{post.title}</a>
            </h2>
            <time dateTime={post.publishedAt} className={styles.date}>
              {dateFmt.format(new Date(post.publishedAt))}
            </time>
          </li>
        ))}
      </ul>

      {pageNum === 1 && totalPages > 1 ? (
        <nav aria-label="Blog pagination" className={styles.pagination}>
          <p className={styles.paginationIntro}>
            Page 1 of {totalPages}
          </p>
          <a href={withLocalePath(locale, "blog/page/2")}>Older posts</a>
        </nav>
      ) : null}

      {pageNum > 1 ? (
        <nav aria-label="Blog pagination" className={styles.paginationRow}>
          {pageNum > 2 ? (
            <a href={withLocalePath(locale, `blog/page/${pageNum - 1}`)}>Newer posts</a>
          ) : null}
          {pageNum === 2 ? <a href={withLocalePath(locale, "blog")}>Newer posts</a> : null}
          {pageNum < totalPages ? (
            <a href={withLocalePath(locale, `blog/page/${pageNum + 1}`)}>Older posts</a>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}
