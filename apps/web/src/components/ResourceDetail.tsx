import type { SupportedLocale } from "@brtu/locales";

type Props = {
  locale: SupportedLocale;
  title: string;
  categoryTitle?: string | null;
  updatedAt: string;
  summary: string;
  fileUrl?: string | null;
  fileName: string;
  externalUrl?: string | null;
};

export default function ResourceDetail({
  locale,
  title,
  categoryTitle,
  updatedAt,
  summary,
  fileUrl,
  fileName,
  externalUrl,
}: Props) {
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <article>
      <h1>{title}</h1>
      {categoryTitle ? (
        <p style={{ color: "var(--color-text-muted)", marginTop: "calc(-1 * var(--space-2))" }}>{categoryTitle}</p>
      ) : null}
      <p style={{ fontSize: "0.95rem", color: "var(--color-text-muted)" }}>
        Updated <time dateTime={updatedAt}>{dateFmt.format(new Date(updatedAt))}</time>
      </p>
      <p className="prose" style={{ marginTop: "var(--space-4)" }}>
        {summary}
      </p>
      <p style={{ marginTop: "var(--space-6)", display: "flex", flexWrap: "wrap", gap: "var(--space-4)" }}>
        {fileUrl ? (
          <a className="btn btn--primary" href={fileUrl} download={fileName}>
            Download
          </a>
        ) : null}
        {externalUrl ? (
          <a className="btn btn--primary" href={externalUrl} rel="noopener noreferrer">
            External link
          </a>
        ) : null}
      </p>
    </article>
  );
}
