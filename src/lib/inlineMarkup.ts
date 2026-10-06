export interface MarkupSegment {
  kind: 'text' | 'code' | 'bold'
  text: string
}

/**
 * Kontent matnidagi yengil belgilashni bo'laklarga ajratadi (Android'dagi parseInlineMarkup bilan bir xil):
 * `kod` → monospace, **matn** → qalin. Yopilmagan belgi oddiy matn sifatida qoladi.
 */
export function parseInlineMarkup(text: string): MarkupSegment[] {
  const segments: MarkupSegment[] = []
  let i = 0
  while (i < text.length) {
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1)
      if (end === -1) {
        segments.push({ kind: 'text', text: text.slice(i) })
        break
      }
      segments.push({ kind: 'code', text: text.slice(i + 1, end) })
      i = end + 1
    } else if (text.startsWith('**', i)) {
      const end = text.indexOf('**', i + 2)
      if (end === -1) {
        segments.push({ kind: 'text', text: text.slice(i) })
        break
      }
      segments.push({ kind: 'bold', text: text.slice(i + 2, end) })
      i = end + 2
    } else {
      const next = nextMarker(text, i)
      segments.push({ kind: 'text', text: text.slice(i, next) })
      i = next
    }
  }
  return segments
}

function nextMarker(text: string, from: number): number {
  for (let i = from + 1; i < text.length; i++) {
    if (text[i] === '`' || text.startsWith('**', i)) return i
  }
  return text.length
}
