import { tokenize, type Token } from './codeTokenizer'
import { syntaxRulesFor } from './syntaxRules'

/** Taxminan 8-10 ta mavzuning barcha misollari sig'adi; xotira cheklangan qoladi (Android'dagi TokenCache kabi). */
const MAX_ENTRIES = 500

const cache = new Map<string, Token[]>()

/**
 * Kod bloklari tokenlarining umumiy LRU keshi: mavzular orasida yurganda yoki orqaga qaytganda
 * bir xil kod qayta tokenlanmaydi.
 */
export function cachedTokens(code: string, languageId: string): Token[] {
  const key = `${languageId}\u0000${code}`
  const cached = cache.get(key)
  if (cached) {
    // eng oxirgi ishlatilgan sifatida oxiriga ko'chiramiz
    cache.delete(key)
    cache.set(key, cached)
    return cached
  }
  const tokens = tokenize(code, syntaxRulesFor(languageId))
  cache.set(key, tokens)
  if (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next().value
    if (oldest !== undefined) cache.delete(oldest)
  }
  return tokens
}
