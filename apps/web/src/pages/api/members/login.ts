export const prerender = false;

import type { APIRoute } from "astro";
import type { SupportedLocale } from "../../../lib/i18n/locales";
import {
  defaultLocale,
  supportedLocales,
  withLocalePath,
} from "../../../lib/i18n/locales";
import { constantTimeEqualUtf8, createSessionCookie, getMembersPassword } from "../../../lib/members/session";

const GENERIC_LOGIN_ERROR =
  "Sign-in failed. Check your password and try again, or contact the union if you need access.";

function parseLocale(raw: string | null | undefined): SupportedLocale {
  if (raw && (supportedLocales as readonly string[]).includes(raw)) {
    return raw as SupportedLocale;
  }
  return defaultLocale;
}

function safePathFromReferer(referer: string | null, request: Request, fallback: string): string {
  if (!referer) return fallback;
  try {
    const ref = new URL(referer);
    const self = new URL(request.url);
    if (ref.origin !== self.origin) return fallback;
    const path = ref.pathname + ref.search + ref.hash;
    return path || fallback;
  } catch {
    return fallback;
  }
}

async function readPasswordBody(request: Request): Promise<{ password: string; locale: SupportedLocale } | null> {
  const ct = request.headers.get("content-type") ?? "";
  let password = "";
  let localeRaw: string | undefined;

  if (ct.includes("application/json")) {
    try {
      const body = (await request.json()) as { password?: string; locale?: string };
      password = typeof body.password === "string" ? body.password : "";
      localeRaw = typeof body.locale === "string" ? body.locale : undefined;
    } catch {
      return null;
    }
  } else {
    let fd: FormData;
    try {
      fd = await request.formData();
    } catch {
      return null;
    }
    const p = fd.get("password");
    password = typeof p === "string" ? p : "";
    const l = fd.get("locale");
    localeRaw = typeof l === "string" ? l : undefined;
  }

  return { password, locale: parseLocale(localeRaw) };
}

export const POST: APIRoute = async ({ request }) => {
  const parsed = await readPasswordBody(request);
  if (!parsed) {
    return new Response(GENERIC_LOGIN_ERROR, {
      status: 401,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const { password, locale } = parsed;
  const expected = getMembersPassword();
  if (!expected || !constantTimeEqualUtf8(password, expected)) {
    return new Response(GENERIC_LOGIN_ERROR, {
      status: 401,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const cookie = createSessionCookie();
  if (!cookie) {
    return new Response(GENERIC_LOGIN_ERROR, {
      status: 401,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const fallback = withLocalePath(locale, "members");
  const location = safePathFromReferer(request.headers.get("referer"), request, fallback);

  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      "Set-Cookie": cookie,
    },
  });
};
