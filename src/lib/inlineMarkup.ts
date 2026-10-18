export interface MarkupSegment {
  kind: 'text' | 'code' | 'bold'
  text: string
  /** faqat `bold` uchun: qalin matn ichidagi `kod` bo'laklari bilan bo'lingan qismlar (`**`tsc`**` → qalin monospace) */
  children?: MarkupSegment[]
}

/**
 * Kontent matnidagi yengil belgilashni bo'laklarga ajratadi (Android'dagi parseInlineMarkup'ning kengaytirilgani):
 * `kod` → monospace, **matn** → qalin. Qalin matn ichida ham `kod` bo'lishi mumkin. Yopilmagan belgi oddiy matn
 * sifatida qoladi.
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
      const end = findBoldEnd(text, i + 2)
      if (end === -1) {
        segments.push({ kind: 'text', text: text.slice(i) })
        break
      }
      const inner = text.slice(i + 2, end)
      segments.push({ kind: 'bold', text: inner, children: parseCodeSpans(inner) })
      i = end + 2
    } else {
      const next = nextMarker(text, i)
      segments.push({ kind: 'text', text: text.slice(i, next) })
      i = next
    }
  }
  return segments
}

/** Qalin matnning yopuvchi `**` o'rni; `kod` bo'laklari ichidagi `**` (masalan `2 ** 3`) hisobga olinmaydi. */
function findBoldEnd(text: string, from: number): number {
  let i = from
  while (i < text.length) {
    if (text[i] === '`') {
      const close = text.indexOf('`', i + 1)
      if (close !== -1) {
        i = close + 1
        continue
      }
    } else if (text.startsWith('**', i)) {
      return i
    }
    i++
  }
  return -1
}

/** Faqat `kod` bo'laklarini ajratadi (qalin matn ichida ichma-ich qalin yo'q). */
function parseCodeSpans(text: string): MarkupSegment[] {
  const segments: MarkupSegment[] = []
  let i = 0
  while (i < text.length) {
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1)
      if (end !== -1) {
        segments.push({ kind: 'code', text: text.slice(i + 1, end) })
        i = end + 1
        continue
      }
    }
    const next = text.indexOf('`', i + 1)
    const stop = next === -1 ? text.length : next
    segments.push({ kind: 'text', text: text.slice(i, stop) })
    i = stop
  }
  return segments
}

function nextMarker(text: string, from: number): number {
  for (let i = from + 1; i < text.length; i++) {
    if (text[i] === '`' || text.startsWith('**', i)) return i
  }
  return text.length
}
