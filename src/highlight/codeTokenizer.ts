import type { SyntaxRules } from './syntaxRules'

export type TokenType =
  | 'keyword'
  | 'declaration'
  | 'type'
  | 'function'
  | 'string'
  | 'number'
  | 'comment'
  | 'punctuation'
  | 'decorator'

/** Koddagi `[start, end)` oralig'i va uning turi. */
export interface Token {
  start: number
  end: number
  type: TokenType
}

/** `/` bo'lish operatorimi yoki regex boshimi — oldingi belgiga qarab taxmin qilinadi. */
const REGEX_PRECEDING_CHARS = '(,=:[!&|?{};\n'

const LETTER = /\p{L}/u
const DIGIT = /\p{Nd}/u
const UPPER_CASE = /\p{Lu}/u

// ASCII uchun tez yo'l, qolganlari Unicode toifasi bo'yicha (Kotlin'dagi Char.isLetter() va boshqalar kabi)
function isDigit(char: string): boolean {
  const code = char.charCodeAt(0)
  return code < 128 ? code >= 48 && code <= 57 : DIGIT.test(char)
}

function isLetter(char: string): boolean {
  const code = char.charCodeAt(0)
  return code < 128 ? (code >= 65 && code <= 90) || (code >= 97 && code <= 122) : LETTER.test(char)
}

function isUpperCase(char: string): boolean {
  const code = char.charCodeAt(0)
  return code < 128 ? code >= 65 && code <= 90 : UPPER_CASE.test(char)
}

const isLetterOrDigit = (char: string) => isLetter(char) || isDigit(char)
const isIdentifierStart = (char: string) => isLetter(char) || char === '_' || char === '$'
const isIdentifierPart = (char: string) => isLetterOrDigit(char) || char === '_' || char === '$'

/**
 * Yengil, regex'siz leksik tahlilchi — Android ilovadagi CodeTokenizer'ning aynan o'zi. To'liq parser emas:
 * maqsad kodni tez va yetarlicha aniq ranglash. Faqat rangli tokenlar qaytariladi; qolgan matn oddiy rangda qoladi.
 */
export function tokenize(code: string, rules: SyntaxRules): Token[] {
  const tokens: Token[] = []

  const emit = (start: number, end: number, type: TokenType): number => {
    if (end > start) tokens.push({ start, end, type })
    return end
  }

  const previousNonSpace = (index: number): string | null => {
    let i = index - 1
    while (i >= 0 && code[i] === ' ') i--
    return i >= 0 ? code[i] : null
  }

  const nextNonSpace = (index: number, limit: number): string | null => {
    let i = index
    while (i < limit && code[i] === ' ') i++
    return i < limit ? code[i] : null
  }

  const isPrecededByIdentifier = (index: number) => index > 0 && isIdentifierPart(code[index - 1])

  const scanIdentifier = (start: number, limit: number): number => {
    let i = start
    while (i < limit && isIdentifierPart(code[i])) i++
    return i
  }

  const classifyWord = (start: number, end: number, limit: number): TokenType | null => {
    const word = code.slice(start, end)
    const afterDot = previousNonSpace(start) === '.'
    const isCall = nextNonSpace(end, limit) === '('
    // `map.get(...)`, `obj.type` — xossa nomlari kalit so'z sifatida ranglanmaydi
    if (afterDot) return isCall ? 'function' : null
    if (rules.literals.has(word)) return 'number'
    if (rules.declarations.has(word)) return 'declaration'
    if (rules.keywords.has(word)) return 'keyword'
    if (rules.builtinTypes.has(word)) return 'type'
    if (isUpperCase(word[0])) return 'type'
    return isCall ? 'function' : null
  }

  const scanString = (start: number, limit: number, quote: string): number => {
    let i = start + 1
    while (i < limit) {
      const char = code[i]
      if (char === '\\') i += 2
      else if (char === quote) return i + 1
      else if (char === '\n') return i
      else i++
    }
    return limit
  }

  const canStartRegex = (index: number): boolean => {
    if (index + 1 >= code.length || code[index + 1] === '/' || code[index + 1] === '*') return false
    const previous = previousNonSpace(index)
    return previous === null || REGEX_PRECEDING_CHARS.includes(previous)
  }

  const scanRegex = (start: number, limit: number): number => {
    let i = start + 1
    let inClass = false
    while (i < limit) {
      const char = code[i]
      if (char === '\\') i++
      else if (char === '[') inClass = true
      else if (char === ']') inClass = false
      else if (char === '\n') return i
      else if (char === '/' && !inClass) {
        i++
        while (i < limit && isLetter(code[i])) i++ // bayroqlar: g, i, m, ...
        return i
      }
      i++
    }
    return limit
  }

  const findClosingBrace = (from: number, limit: number): number => {
    let depth = 0
    for (let i = from; i < limit; i++) {
      if (code[i] === '{') depth++
      else if (code[i] === '}') {
        if (depth === 0) return i
        depth--
      }
    }
    return limit
  }

  const scanNumber = (start: number, limit: number): number => {
    const isHex = code.slice(start, start + 2).toLowerCase() === '0x'
    let i = start
    while (i < limit) {
      const char = code[i]
      const isExponentSign = (char === '+' || char === '-') && i > start && (code[i - 1] === 'e' || code[i - 1] === 'E') && !isHex
      if (!(isLetterOrDigit(char) || char === '_' || char === '.' || isExponentSign)) break
      // `1..toString()` yoki `arr.length` kabi holatlarda nuqtada to'xtaymiz
      if (char === '.' && (i + 1 >= limit || !isDigit(code[i + 1]))) break
      i++
    }
    return i
  }

  /**
   * Template literal: matn qismlari satr sifatida, `${...}` ichidagi ifodalar esa
   * rekursiv ravishda oddiy kod sifatida ranglanadi.
   */
  const scanTemplate = (start: number, limit: number): number => {
    const delimiter = rules.templateDelimiter
    if (delimiter === null) return start + 1
    const exprStart = rules.templateExpressionStart
    let segmentStart = start
    let i = start + 1
    while (i < limit) {
      if (code[i] === '\\') {
        i += 2
      } else if (code[i] === delimiter) {
        emit(segmentStart, i + 1, 'string')
        return i + 1
      } else if (code.startsWith(exprStart, i)) {
        emit(segmentStart, i, 'string')
        emit(i, i + exprStart.length, 'punctuation')
        const exprEnd = findClosingBrace(i + exprStart.length, limit)
        tokenizeRange(i + exprStart.length, exprEnd)
        if (exprEnd < limit) emit(exprEnd, exprEnd + 1, 'punctuation')
        i = exprEnd + 1
        segmentStart = i
      } else {
        i++
      }
    }
    emit(segmentStart, limit, 'string')
    return limit
  }

  function tokenizeRange(from: number, to: number): void {
    let i = from
    while (i < to) {
      const char = code[i]
      let next: number
      if (rules.lineComment !== null && code.startsWith(rules.lineComment, i)) {
        const newline = code.indexOf('\n', i)
        next = emit(i, newline === -1 || newline > to ? to : newline, 'comment')
      } else if (rules.blockComment !== null && code.startsWith(rules.blockComment[0], i)) {
        const [open, close] = rules.blockComment
        const closeAt = code.indexOf(close, i + open.length)
        next = emit(i, closeAt === -1 || closeAt > to ? to : closeAt + close.length, 'comment')
      } else if (rules.stringDelimiters.has(char)) {
        next = emit(i, scanString(i, to, char), 'string')
      } else if (char === '/' && rules.regexLiterals && canStartRegex(i)) {
        next = emit(i, scanRegex(i, to), 'string')
      } else if (char === rules.templateDelimiter) {
        next = scanTemplate(i, to)
      } else if (isDigit(char) || (char === '.' && i + 1 < to && isDigit(code[i + 1]) && !isPrecededByIdentifier(i))) {
        next = emit(i, scanNumber(i, to), 'number')
      } else if (char === rules.decoratorPrefix && i + 1 < to && isIdentifierStart(code[i + 1])) {
        next = emit(i, scanIdentifier(i + 1, to), 'decorator')
      } else if (isIdentifierStart(char)) {
        const end = scanIdentifier(i, to)
        const type = classifyWord(i, end, to)
        if (type !== null) tokens.push({ start: i, end, type })
        next = end
      } else {
        next = i + 1
      }
      i = next
    }
  }

  tokenizeRange(0, code.length)
  return tokens
}
