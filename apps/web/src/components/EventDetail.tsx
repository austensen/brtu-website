import type { SupportedLocale } from "@brtu/locales";

import AirTableFormEmbed from "./AirTableFormEmbed";
import styles from "./EventDetail.module.css";

type Props = {
  locale: SupportedLocale;
  title: string;
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  location?: string | null;
  mapLink?: string | null;
  joinUrl?: string | null;
  flyerUrl?: string | null;
  flyerMimeType?: string | null;
  flyerFilename?: string | null;
  bodyHtml: string;
  gcal: string;
  icsHref: string;
  airtableFormUrl: string | null;
};

function calendarDateKeyInTz(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function formatRange(startIso: string, endIso: string, tz: string, loc: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const fullOpts: Intl.DateTimeFormatOptions = {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: tz,
  };
  const startStr = new Intl.DateTimeFormat(loc, fullOpts).format(start);

  if (calendarDateKeyInTz(start, tz) === calendarDateKeyInTz(end, tz)) {
    const endTimeOpts: Intl.DateTimeFormatOptions = { timeStyle: "short", timeZone: tz };
    return `${startStr} – ${new Intl.DateTimeFormat(loc, endTimeOpts).format(end)}`;
  }

  return `${startStr} – ${new Intl.DateTimeFormat(loc, fullOpts).format(end)}`;
}

export default function EventDetail({
  locale,
  title,
  startDateTime,
  endDateTime,
  timezone,
  location,
  mapLink,
  joinUrl,
  flyerUrl,
  flyerMimeType,
  flyerFilename,
  bodyHtml,
  gcal,
  icsHref,
  airtableFormUrl,
}: Props) {
  const mime = flyerMimeType ?? "";
  const isImage = Boolean(flyerUrl && mime.startsWith("image/"));
  const isPdf = Boolean(flyerUrl && mime === "application/pdf");

  return (
    <article>
      <h1>{title}</h1>
      <p className={styles.range}>
        {formatRange(startDateTime, endDateTime, timezone, locale)}
      </p>
      <p className={styles.actions}>
        <a className="btn btn--primary" href={icsHref} download>
          Add to calendar (.ics)
        </a>
        <a className="btn btn--primary" href={gcal} rel="noopener noreferrer" target="_blank">
          Google Calendar
        </a>
        {mapLink ? (
          <a className="btn btn--primary" href={mapLink} rel="noopener noreferrer" target="_blank">
            Map
          </a>
        ) : null}
        {joinUrl ? (
          <a className="btn btn--primary" href={joinUrl} rel="noopener noreferrer" target="_blank">
            Join online
          </a>
        ) : null}
      </p>
      {flyerUrl && (isImage || isPdf) ? (
        <div className={styles.flyer}>
          {isImage ? (
            <img
              className={styles.flyerImg}
              src={flyerUrl}
              alt={`Promotional flyer for ${title}`}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <>
              <iframe
                className={styles.flyerPdf}
                src={flyerUrl}
                title="Event flyer PDF"
              />
              <p className={styles.flyerPdfLink}>
                <a href={flyerUrl} rel="noopener noreferrer" target="_blank">
                  Open PDF
                </a>
                {flyerFilename ? ` (${flyerFilename})` : null}
              </p>
            </>
          )}
        </div>
      ) : flyerUrl ? (
        <p className={styles.flyer}>
          <a className="btn btn--primary" href={flyerUrl} rel="noopener noreferrer" target="_blank">
            {flyerFilename ? `Download ${flyerFilename}` : "Download flyer"}
          </a>
        </p>
      ) : null}
      {location ? (
        <p>
          <strong>Location:</strong> {location}
        </p>
      ) : null}
      <div className="prose" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      {airtableFormUrl && <AirTableFormEmbed formUrl={airtableFormUrl} />}
    </article>
  );
}
