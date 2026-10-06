const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

/** 4213 → "4,213" (hr-ui dagi raqam formati). */
export function formatCount(value: number): string {
  return numberFormat.format(value)
}
