import type { SupportedLocale } from "@brtu/locales";

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
  bodyHtml: string;
  gcal: string;
  icsHref: string;
};

function formatRange(startIso: string, endIso: string, tz: string, loc: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const dOpts: Intl.DateTimeFormatOptions = {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: tz,
  };
  return `${new Intl.DateTimeFormat(loc, dOpts).format(start)} – ${new Intl.DateTimeFormat(loc, dOpts).format(end)}`;
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
  bodyHtml,
  gcal,
  icsHref,
}: Props) {
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
      {location ? (
        <p>
          <strong>Location:</strong> {location}
        </p>
      ) : null}
      <div className="prose" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </article>
  );
}
