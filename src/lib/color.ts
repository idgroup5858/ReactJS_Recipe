/** `#RRGGBB` rangining nisbiy yorqinligi (0 — qora, 1 — oq), Compose'dagi Color.luminance() kabi. */
export function relativeLuminance(hex: string): number {
  const value = Number.parseInt(hex.replace('#', ''), 16)
  const channels = [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff].map((channel) => {
    const srgb = channel / 255
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

/** Shu fon ustida o'qiladigan matn rangi. */
export function readableTextColor(background: string): string {
  return relativeLuminance(background) > 0.5 ? '#000' : '#fff'
}
