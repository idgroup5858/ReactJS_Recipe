import type { Token, TokenType } from './codeTokenizer'

export interface CodeSegment {
  text: string
  /** `null` — oddiy (rangsiz) matn */
  type: TokenType | null
}

export type CodeLine = CodeSegment[]

/**
 * Kodni tokenlar bo'yicha bo'laklarga, so'ng qatorlarga ajratadi: har bir qator alohida chiziladi,
 * shunda qator raqamlari o'ralgan (wrap) qatorlar bilan ham mos keladi.
 */
export function highlightLines(code: string, tokens: Token[]): CodeLine[] {
  const lines: CodeLine[] = [[]]

  const append = (text: string, type: TokenType | null) => {
    text.split('\n').forEach((part, index) => {
      if (index > 0) lines.push([])
      if (part.length > 0) lines[lines.length - 1].push({ text: part, type })
    })
  }

  let position = 0
  for (const token of tokens) {
    if (token.start < position) continue
    if (token.start > position) append(code.slice(position, token.start), null)
    append(code.slice(token.start, token.end), token.type)
    position = token.end
  }
  if (position < code.length) append(code.slice(position), null)
  return lines
}
