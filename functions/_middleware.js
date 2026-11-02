// Nifty — case-insensitive redirect handler (Cloudflare Pages Function). v1
// Managed by the dashboard — 301 Redirect Bulk Delete & Replace. Do not edit by hand.
//
// Cloudflare's _redirects file matches case-sensitively, so a visit like
// /tiler-Parramatta/ never fires the /tiler-parramatta/ rule and 404s. Pages and
// redirect rules are always lowercase, so WHEN (and only when) a request would
// otherwise 404, we send a mixed-case PAGE path to its lowercase form with a 301 —
// the existing lowercase _redirects rule (or the real lowercase page) then matches.
//
// Safe by design: runs AFTER normal serving (next()), so every real page, asset and
// existing redirect is returned untouched; we only ever act on a genuine 404, and we
// never touch a path that looks like a file.

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // Health check — lets the dashboard confirm the handler is live on a site.
  if (url.pathname.toLowerCase() === "/__nifty-redirect-handler") {
    return new Response("nifty-redirect-handler-ok", {
      status: 200,
      headers: { "content-type": "text/plain", "cache-control": "no-store", "x-robots-tag": "noindex" },
    });
  }

  const res = await next();
  if (res.status !== 404) return res;

  const path = url.pathname;
  const last = path.split("/").pop() || "";
  const looksLikeFile = /\.[a-z0-9]{1,8}$/i.test(last);
  const lower = path.toLowerCase();
  if (!looksLikeFile && lower !== path) {
    url.pathname = lower;
    return Response.redirect(url.toString(), 301);
  }
  return res;
}
