import type { SupportedLocale } from "@brtu/locales";

import styles from "./ResourceDetail.module.css";

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
      {categoryTitle ? <p className={styles.category}>{categoryTitle}</p> : null}
      <p className={styles.updated}>
        Updated <time dateTime={updatedAt}>{dateFmt.format(new Date(updatedAt))}</time>
      </p>
      <p className={`prose ${styles.summary}`}>{summary}</p>
      <p className={styles.actions}>
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
