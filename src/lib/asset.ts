/**
 * Optional sub-path the site is served from (empty on Netlify / custom domains).
 * next/link adds this automatically — use `asset()` for media and manual URLs.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (path: string) => `${BASE_PATH}${path}`;
