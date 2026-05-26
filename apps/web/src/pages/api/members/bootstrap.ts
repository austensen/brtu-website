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

function escapeHtmlAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

// Avoid Netlify retaining the bootstrap query params in the redirect URL
function redirectPage(location: string, cookie?: string): Response {
  const jsLocation = JSON.stringify(location).replace(/</g, "\\u003c");
  const headers: Record<string, string> = {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Robots-Tag": "noindex",
  };
  if (cookie) {
    headers["Set-Cookie"] = cookie;
  }

  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex" />
    <meta http-equiv="refresh" content="0; url=${escapeHtmlAttr(location)}" />
    <title>Signing in...</title>
    <script>window.location.replace(${jsLocation});</script>
  </head>
  <body>
    <p>Signing in...</p>
    <p><a href="${escapeHtmlAttr(location)}">Continue</a></p>
  </body>
</html>`,
    { status: 200, headers },
  );
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const t = url.searchParams.get("t") ?? "";
  const token = getMembersMagicLinkToken();

  if (!token || !constantTimeEqualUtf8(t, token)) {
    return redirectPage(redirectLocation(null, request));
  }

  const cookie = createSessionCookie();
  if (!cookie) {
    return redirectPage(redirectLocation(null, request));
  }

  const toParam = url.searchParams.get("to");
  const dest = validatedRedirectUrl(toParam, request);
  const location = redirectLocation(dest, request);

  return redirectPage(location, cookie);
};
