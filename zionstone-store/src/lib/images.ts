/**
 * Product-image serving strategy.
 *
 * The 60 owner-stock products carry ~335 real photos in `public/images/zionstone/`.
 * Committing them is what lets GitHub host them; in production they are served
 * through the jsDelivr CDN (`cdn.jsdelivr.net/gh/<owner>/<repo>@<branch>/...`),
 * which reads straight from this repository. In development the files are on
 * disk, so the same paths resolve locally — no pushes required to iterate.
 *
 * Override the CDN base for a staging/other repo or a different provider by
 * setting `NEXT_PUBLIC_PRODUCT_IMAGE_HOST` (e.g. your own CDN origin). The
 * value is used verbatim as the URL prefix, so it must be protocol-less of
 * "https://" plus origin, without a trailing slash.
 */

const GITHUB_CDN_BASE = "https://cdn.jsdelivr.net/gh/jacobPearsons/zionstone-electro-musical@main";

export function productImageHost(): string {
  if (process.env.NEXT_PUBLIC_PRODUCT_IMAGE_HOST) {
    return process.env.NEXT_PUBLIC_PRODUCT_IMAGE_HOST;
  }
  // Node on the dev server and the browser in `next dev` share this branch, so
  // the client and server can never disagree about which URL to request.
  if (process.env.NODE_ENV !== "production") return "";
  return GITHUB_CDN_BASE;
}

/**
 * Maps a store path to where the browser actually fetches it. Legacy product
 * images (emojis, `/brand/...`) stay put; the new `/images/zionstone/...`
 * catalogue is CDN-backed in production.
 */
export function resolveImageSrc(path: string): string {
  if (path.startsWith("/images/zionstone/")) {
    const host = productImageHost();
    return host ? `${host}${path}` : path;
  }
  return path;
}