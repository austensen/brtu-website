import type { SupportedLocale } from "@brtu/locales";
import { withLocalePath } from "../lib/i18n/locales";

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
        <p style={{ color: "var(--color-text-muted)" }}>
          Page {pageNum} of {totalPages}
        </p>
      ) : null}

      <ul style={{ listStyle: "none", padding: 0, margin: "var(--space-6) 0 0" }}>
        {posts.map((post) => (
          <li key={post.slug} className="card" style={{ marginBottom: "var(--space-4)" }}>
            {post.heroImageUrl ? (
              <a
                href={withLocalePath(locale, `blog/${post.slug}`)}
                style={{ display: "block", marginBottom: "var(--space-3)" }}
              >
                <img
                  src={post.heroImageUrl}
                  alt={post.heroAlt}
                  width={800}
                  height={450}
                  style={{ width: "100%", height: "auto", borderRadius: "var(--radius)" }}
                  loading="lazy"
                  decoding="async"
                />
              </a>
            ) : null}
            <h2 style={{ margin: "0 0 var(--space-2)", fontSize: "1.25rem" }}>
              <a href={withLocalePath(locale, `blog/${post.slug}`)}>{post.title}</a>
            </h2>
            <time dateTime={post.publishedAt} style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
              {dateFmt.format(new Date(post.publishedAt))}
            </time>
          </li>
        ))}
      </ul>

      {pageNum === 1 && totalPages > 1 ? (
        <nav aria-label="Blog pagination" style={{ marginTop: "var(--space-8)" }}>
          <p style={{ margin: "0 0 var(--space-2)", fontWeight: 600 }}>
            Page 1 of {totalPages}
          </p>
          <a href={withLocalePath(locale, "blog/page/2")}>Older posts</a>
        </nav>
      ) : null}

      {pageNum > 1 ? (
        <nav
          aria-label="Blog pagination"
          style={{
            marginTop: "var(--space-8)",
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-4)",
          }}
        >
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
