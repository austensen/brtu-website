import type { SupportedLocale } from "@brtu/locales";

import styles from "./ResourceDetail.module.css";

type Props = {
  locale: SupportedLocale;
  title: string;
  categoryTitle?: string | null;
  updatedAt: string;
  summary: string;
  fileUrl?: string | null;
  fileMimeType?: string | null;
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
  fileMimeType,
  fileName,
  externalUrl,
}: Props) {
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const mime = fileMimeType ?? "";
  const isImage = Boolean(fileUrl && mime.startsWith("image/"));
  const isPdf = Boolean(fileUrl && mime === "application/pdf");

  return (
    <article>
      <h1>{title}</h1>
      {categoryTitle ? <p className={styles.category}>{categoryTitle}</p> : null}
      <p className={styles.updated}>
        Updated <time dateTime={updatedAt}>{dateFmt.format(new Date(updatedAt))}</time>
      </p>
      <p className={`prose ${styles.summary}`}>{summary}</p>
      {fileUrl && (isImage || isPdf) ? (
        <div className={styles.preview}>
          {isImage ? (
            <img
              className={styles.previewImg}
              src={fileUrl}
              alt={`Preview of ${title}`}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <>
              <iframe className={styles.previewPdf} src={fileUrl} title="Resource PDF preview" />
              <p className={styles.previewPdfLink}>
                <a href={fileUrl} rel="noopener noreferrer" target="_blank">
                  Open PDF
                </a>
                {fileName ? ` (${fileName})` : null}
              </p>
            </>
          )}
        </div>
      ) : null}
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
