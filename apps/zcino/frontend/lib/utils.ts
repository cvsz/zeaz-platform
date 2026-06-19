export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("en", options).format(value);
}

export function formatCompact(value: number) {
  return formatNumber(value, { notation: "compact", maximumFractionDigits: 1 });
}

export function formatLatency(value: number) {
  return `${Math.round(value)}ms`;
}
