import type { SupportedLocale } from "@brtu/locales";
import { withLocalePath } from "../lib/i18n/locales";

import styles from "./EventsIndex.module.css";

export type EventsIndexEvent = {
  title: string;
  slug: string;
  startDateTime: string;
  endDateTime: string;
  timezone: string;
};

type Props = {
  locale: SupportedLocale;
  upcoming: EventsIndexEvent[];
  past: EventsIndexEvent[];
};

function formatRange(startIso: string, endIso: string, tz: string, loc: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const dOpts: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: tz,
  };
  return `${new Intl.DateTimeFormat(loc, dOpts).format(start)} – ${new Intl.DateTimeFormat(loc, dOpts).format(end)}`;
}

export default function EventsIndex({ locale, upcoming, past }: Props) {
  return (
    <>
      <h1>Events</h1>

      <section aria-labelledby="upcoming-heading" className={styles.section}>
        <h2 id="upcoming-heading">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className={styles.muted}>No upcoming events.</p>
        ) : (
          <ul className={styles.list}>
            {upcoming.map((ev) => (
              <li key={ev.slug} className={`card ${styles.cardItem}`}>
                <h3 className={styles.eventTitle}>
                  <a href={withLocalePath(locale, `events/${ev.slug}`)}>{ev.title}</a>
                </h3>
                <p className={styles.range}>
                  {formatRange(ev.startDateTime, ev.endDateTime, ev.timezone, locale)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="past-heading" className={styles.sectionPast}>
        <h2 id="past-heading">Past</h2>
        {past.length === 0 ? (
          <p className={styles.muted}>No past events.</p>
        ) : (
          <ul className={styles.list}>
            {past.map((ev) => (
              <li key={ev.slug} className={`card ${styles.cardItem}`}>
                <h3 className={styles.eventTitle}>
                  <a href={withLocalePath(locale, `events/${ev.slug}`)}>{ev.title}</a>
                </h3>
                <p className={styles.range}>
                  {formatRange(ev.startDateTime, ev.endDateTime, ev.timezone, locale)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
