import { portableTextToPlain } from "./plainText";

function formatGCalUtc(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export type GoogleCalendarEventInput = {
  title: string;
  startDateTime: string;
  endDateTime: string;
  location?: string | null;
  joinUrl?: string | null;
  description?: unknown;
};

export function googleCalendarTemplateUrl(input: GoogleCalendarEventInput): string {
  const details = portableTextToPlain(input.description ?? []).slice(0, 8000);
  const locParts = [input.location, input.joinUrl].filter(Boolean);
  const location = locParts.join(" — ");
  const dates = `${formatGCalUtc(input.startDateTime)}/${formatGCalUtc(input.endDateTime)}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates,
    details,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
