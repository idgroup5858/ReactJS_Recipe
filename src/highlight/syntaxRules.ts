/**
 * Bitta til uchun sintaksis qoidalari. Yangi til qo'shilganda faqat yangi [SyntaxRules] obyekti yoziladi
 * va [syntaxRulesFor] ga qo'shiladi — tokenizer o'zgarmaydi (Android'dagi SyntaxRules bilan bir xil).
 */
export interface SyntaxRules {
  keywords: ReadonlySet<string>
  declarations: ReadonlySet<string>
  builtinTypes: ReadonlySet<string>
  literals: ReadonlySet<string>
  lineComment: string | null
  blockComment: readonly [open: string, close: string] | null
  stringDelimiters: ReadonlySet<string>
  templateDelimiter: string | null
  templateExpressionStart: string
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
    'override', 'get', 'set', 'void', 'asserts', 'unique', 'debugger',
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
  decoratorPrefix: '@',
  regexLiterals: true,
}

const RULES_BY_LANGUAGE: Record<string, SyntaxRules> = {
  typescript: TypeScriptSyntax,
  javascript: TypeScriptSyntax,
}

/** NestJS va Next.js misollari ham TypeScript'da yozilgan, shuning uchun standart qoidalar — TypeScript (Android'dagi forLanguage kabi). */
export function syntaxRulesFor(languageId: string): SyntaxRules {
  return RULES_BY_LANGUAGE[languageId] ?? TypeScriptSyntax
}
