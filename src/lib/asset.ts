/**
 * Sub-path the site is served from. Empty for a custom domain or local dev;
 * "/SERMA-WEBSITES-FOR-YOU" on GitHub Pages (set by the deploy workflow).
 * next/link adds this automatically — use `asset()` for media and manual URLs.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (path: string) => `${BASE_PATH}${path}`;
