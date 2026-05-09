import { portableTextToPlain } from "./plainText";

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toIcsUtcInstant(iso: string): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const h = pad(d.getUTCHours());
  const min = pad(d.getUTCMinutes());
  const s = pad(d.getUTCSeconds());
  return `${y}${m}${day}T${h}${min}${s}Z`;
}

function icsFold(line: string): string {
  if (line.length <= 72) return line;
  let out = "";
  let rest = line;
  while (rest.length > 72) {
    out += `${rest.slice(0, 72)}\r\n `;
    rest = rest.slice(72);
  }
  return out + rest;
}

function icsEscapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

export type EventIcsInput = {
  slug: string;
  locale: string;
  title: string;
  startDateTime: string;
  endDateTime: string;
  location?: string | null;
  joinUrl?: string | null;
  description?: unknown;
  siteUrl: string;
};

export function buildEventIcs(input: EventIcsInput): string {
  const descRaw = portableTextToPlain(input.description ?? []);
  const desc = icsEscapeText(descRaw.slice(0, 4000));
  const summary = icsEscapeText(input.title);
  const locParts = [input.location, input.joinUrl].filter(Boolean);
  const location = icsEscapeText(locParts.join(" — ").slice(0, 2000));
  const uid = `${input.slug}-${input.locale}@brtu-website`;
  const dtStamp = toIcsUtcInstant(new Date().toISOString());
  const dtStart = toIcsUtcInstant(input.startDateTime);
  const dtEnd = toIcsUtcInstant(input.endDateTime);
  const base = input.siteUrl.replace(/\/+$/, "");
  const eventPageUrl = `${base}/${input.locale}/events/${input.slug}`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BRTU//Event//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    icsFold(`SUMMARY:${summary}`),
    desc ? icsFold(`DESCRIPTION:${desc}`) : "",
    location ? icsFold(`LOCATION:${location}`) : "",
    `URL:${eventPageUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return lines.join("\r\n") + "\r\n";
}
