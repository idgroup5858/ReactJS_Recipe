import { useEffect, useMemo, useState } from 'react'
import { loadSearchIndex, searchTerms, type SearchIndex, type SearchResult } from '@/data/searchIndex'

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; results: SearchResult[] }

/**
 * Tanlangan til bo'yicha qidiruv. Indeks sahifa ochilishi bilan fonda tayyorlanadi (tilning barcha bo'limlari
 * yuklanadi), shuning uchun yozish boshlanganda natijalar darhol chiqadi.
 */
export function useLanguageSearch(languageId: string, query: string): SearchState {
  const [loaded, setLoaded] = useState<{ languageId: string; index: SearchIndex } | null>(null)
  const [failedLanguageId, setFailedLanguageId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    loadSearchIndex(languageId).then(
      (index) => !cancelled && setLoaded({ languageId, index }),
      () => !cancelled && setFailedLanguageId(languageId),
    )
    return () => {
      cancelled = true
    }
  }, [languageId])

  const terms = useMemo(() => searchTerms(query), [query])
  const index = loaded?.languageId === languageId ? loaded.index : null
  const results = useMemo(() => (index && terms.length > 0 ? index.search(terms) : null), [index, terms])

  if (terms.length === 0) return { status: 'idle' }
  if (failedLanguageId === languageId && !index) return { status: 'error' }
  if (!results) return { status: 'loading' }
  return { status: 'ready', results }
}
