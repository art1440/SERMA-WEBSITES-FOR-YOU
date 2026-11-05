export type Locale = "en" | "es";

export const LOCALES: readonly Locale[] = ["en", "es"] as const;

/** A string available in both languages. */
export type L10n = Record<Locale, string>;

/** Widens literal string types so the ES dictionary can be checked against the EN shape. */
export type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : { readonly [K in keyof T]: Widen<T[K]> };

/** Replaces `{token}` placeholders in a dictionary string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
