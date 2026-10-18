/**
 * Bitta til uchun sintaksis qoidalari. Yangi til qo'shilganda faqat yangi [SyntaxRules] obyekti yoziladi
 * va [RULES_BY_LANGUAGE] ga qo'shiladi — tokenizer o'zgarmaydi (Android'dagi SyntaxRules bilan bir xil).
 */
export interface SyntaxRules {
  keywords: ReadonlySet<string>
  declarations: ReadonlySet<string>
  builtinTypes: ReadonlySet<string>
  literals: ReadonlySet<string>
  lineComment: string | null
  blockComment: readonly [open: string, close: string] | null
  stringDelimiters: ReadonlySet<string>
  /** `${...}` ifodali satr (TypeScript template literal); ichidagi ifodalar kod sifatida ranglanadi */
  templateDelimiter: string | null
  templateExpressionStart: string
  /** escape'siz, ko'p qatorli "xom" satr (Go: `...`) — yopuvchi belgigacha hammasi satr */
  rawStringDelimiter: string | null
  decoratorPrefix: string | null
  regexLiterals: boolean
}

export const TypeScriptSyntax: SyntaxRules = {
  keywords: new Set([
    'if', 'else', 'switch', 'case', 'default', 'break', 'continue', 'return',
    'for', 'while', 'do', 'in', 'of', 'try', 'catch', 'finally', 'throw', 'new',
    'delete', 'typeof', 'instanceof', 'await', 'async', 'yield', 'import', 'export',
    'from', 'as', 'is', 'keyof', 'satisfies', 'extends', 'implements', 'infer',
    'readonly', 'declare', 'abstract', 'public', 'private', 'protected', 'static',
    'override', 'get', 'set', 'void', 'asserts', 'unique', 'debugger', 'using',
  ]),
  declarations: new Set([
    'let', 'const', 'var', 'function', 'class', 'interface', 'type', 'enum',
    'namespace', 'module', 'constructor', 'super', 'this',
  ]),
  builtinTypes: new Set(['string', 'number', 'boolean', 'bigint', 'symbol', 'any', 'unknown', 'never', 'object']),
  literals: new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Infinity']),
  lineComment: '//',
  blockComment: ['/*', '*/'],
  stringDelimiters: new Set(['"', "'"]),
  templateDelimiter: '`',
  templateExpressionStart: '${',
  rawStringDelimiter: null,
  decoratorPrefix: '@',
  regexLiterals: true,
}

/** Go: `:=`, `go`, `chan`, `defer` kabi kalit so'zlar, `nil`/`iota` literal, raw string (`...`) va rune ('a') literallari. */
export const GoSyntax: SyntaxRules = {
  keywords: new Set([
    'break', 'case', 'chan', 'continue', 'default', 'defer', 'else', 'fallthrough',
    'for', 'go', 'goto', 'if', 'import', 'map', 'package', 'range', 'return',
    'select', 'switch',
  ]),
  declarations: new Set(['const', 'func', 'interface', 'struct', 'type', 'var']),
  builtinTypes: new Set([
    'bool', 'byte', 'rune', 'string', 'error', 'any', 'comparable',
    'int', 'int8', 'int16', 'int32', 'int64',
    'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'uintptr',
    'float32', 'float64', 'complex64', 'complex128',
  ]),
  literals: new Set(['true', 'false', 'nil', 'iota']),
  lineComment: '//',
  blockComment: ['/*', '*/'],
  stringDelimiters: new Set(['"', "'"]),
  templateDelimiter: null,
  templateExpressionStart: '${',
  rawStringDelimiter: '`',
  decoratorPrefix: null,
  regexLiterals: false,
}

const RULES_BY_LANGUAGE: Record<string, SyntaxRules> = {
  typescript: TypeScriptSyntax,
  javascript: TypeScriptSyntax,
  golang: GoSyntax,
}

/** NestJS va Next.js misollari ham TypeScript'da yozilgan, shuning uchun standart qoidalar — TypeScript (Android'dagi forLanguage kabi). */
export function syntaxRulesFor(languageId: string): SyntaxRules {
  return RULES_BY_LANGUAGE[languageId] ?? TypeScriptSyntax
}
