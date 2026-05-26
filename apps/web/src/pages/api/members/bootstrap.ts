export const prerender = false;

import type { APIRoute } from "astro";
import { defaultLocale, withLocalePath } from "../../../lib/i18n/locales";
import { createSessionCookie, constantTimeEqualUtf8, getMembersMagicLinkToken } from "../../../lib/members/session";

function membersHomePath(): string {
  return withLocalePath(defaultLocale, "members");
}

/**
 * Accepts only same-origin relative paths starting with `/` (no scheme, no `//`).
 * Strips bootstrap-only params from the resulting query string after validation.
 */
function validatedRedirectUrl(toRaw: string | null, request: Request): URL | null {
  if (toRaw == null || toRaw === "") return null;
  let pathPart: string;
  try {
    pathPart = decodeURIComponent(toRaw.trim());
  } catch {
    return null;
  }
  if (!pathPart.startsWith("/") || pathPart.startsWith("//")) return null;
  if (pathPart.includes("\0") || pathPart.includes("://")) return null;

  let u: URL;
  try {
    u = new URL(pathPart, request.url);
  } catch {
    return null;
  }
  const self = new URL(request.url);
  if (u.origin !== self.origin) return null;
  u.searchParams.delete("t");
  u.searchParams.delete("to");
  return u;
}

function redirectLocation(dest: URL | null, request: Request): string {
  const u = dest ?? new URL(membersHomePath(), request.url);
  u.searchParams.delete("t");
  u.searchParams.delete("to");
  return u.href;
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const t = url.searchParams.get("t") ?? "";
  const token = getMembersMagicLinkToken();

  if (!token || !constantTimeEqualUtf8(t, token)) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectLocation(null, request),
        "Cache-Control": "no-store",
      },
    });
  }

  const cookie = createSessionCookie();
  if (!cookie) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectLocation(null, request),
        "Cache-Control": "no-store",
      },
    });
  }

  const toParam = url.searchParams.get("to");
  const dest = validatedRedirectUrl(toParam, request);
  const location = redirectLocation(dest, request);

  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      "Set-Cookie": cookie,
      "Cache-Control": "no-store",
    },
  });
};
