import type { MetricFormat } from "@/data/niches";

/** Formats a metric for display. Both locales use U.S. number conventions ($12,450). */
export function formatMetric(value: number, format: MetricFormat, intlLocale: string): string {
  const v = Math.round(value);
  switch (format) {
    case "currency":
      return new Intl.NumberFormat(intlLocale, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(v);
    case "percent":
      return `${new Intl.NumberFormat(intlLocale).format(v)}%`;
    case "seconds":
      return `${new Intl.NumberFormat(intlLocale).format(v)}s`;
    default:
      return new Intl.NumberFormat(intlLocale).format(v);
  }
}

export function formatCurrency(value: number, intlLocale: string): string {
  return formatMetric(value, "currency", intlLocale);
}
