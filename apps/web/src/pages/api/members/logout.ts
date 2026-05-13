export const prerender = false;

import type { APIRoute } from "astro";
import type { SupportedLocale } from "../../../lib/i18n/locales";
import { defaultLocale, supportedLocales, withLocalePath } from "../../../lib/i18n/locales";
import { clearSessionCookie } from "../../../lib/members/session";

function parseLocale(raw: string | null | undefined): SupportedLocale {
  if (raw && (supportedLocales as readonly string[]).includes(raw)) {
    return raw as SupportedLocale;
  }
  return defaultLocale;
}

export const POST: APIRoute = async ({ request }) => {
  let locale: SupportedLocale = defaultLocale;
  const ct = request.headers.get("content-type") ?? "";
  try {
    if (ct.includes("application/json")) {
      const body = (await request.json()) as { locale?: string };
      locale = parseLocale(body?.locale);
    } else {
      const fd = await request.formData();
      const l = fd.get("locale");
      locale = parseLocale(typeof l === "string" ? l : undefined);
    }
  } catch {
    locale = defaultLocale;
  }

  const location = withLocalePath(locale, "members");

  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      "Set-Cookie": clearSessionCookie(),
    },
  });
};
