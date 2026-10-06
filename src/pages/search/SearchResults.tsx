import { Card, CardHeader } from '@/components/ui/Card'
import { MAX_SEARCH_RESULTS, type SearchResult } from '@/data/searchIndex'
import SearchResultRow from './SearchResultRow'

function ResultGroup({ title, languageId, results }: { title: string; languageId: string; results: SearchResult[] }) {
  return (
    <Card>
      <CardHeader title={title} />
      <ul className="divide-y divide-neutral-200">
        {results.map((result) => (
          <li key={result.kind === 'topic' ? `t/${result.category.id}/${result.topic.id}` : `e/${result.category.id}/${result.topic.id}/${result.example.id}`}>
            <SearchResultRow languageId={languageId} result={result} />
          </li>
        ))}
      </ul>
    </Card>
  )
}

/** Natijalar ikki guruhda: avval mavzular, keyin misollar (Android'dagi tartib). */
export default function SearchResults({ languageId, results }: { languageId: string; results: SearchResult[] }) {
  const topics = results.filter((result) => result.kind === 'topic')
  const examples = results.filter((result) => result.kind === 'example')
  const isTruncated = results.length >= MAX_SEARCH_RESULTS

  return (
    <div className="space-y-4">
      {topics.length > 0 && <ResultGroup title={`Mavzular (${topics.length})`} languageId={languageId} results={topics} />}
      {examples.length > 0 && <ResultGroup title={`Misollar (${examples.length})`} languageId={languageId} results={examples} />}
      {isTruncated && (
        <p className="text-center text-xs text-neutral-500">
          Faqat birinchi {MAX_SEARCH_RESULTS} ta natija ko'rsatildi — so'rovni aniqroq yozing.
        </p>
      )}
    </div>
  )
}
