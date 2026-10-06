import { ChevronRight, Code, Lightbulb } from 'lucide-react'
import { Link } from 'react-router'
import type { SearchResult } from '@/data/searchIndex'

/** Natija manzili: misol bo'lsa `#ex12` bilan — mavzu ochilganda o'sha misolga o'tiladi. */
function resultUrl(languageId: string, result: SearchResult): string {
  const topicUrl = `/${languageId}/${result.category.id}/${result.topic.id}`
  return result.kind === 'example' ? `${topicUrl}#${result.example.id}` : topicUrl
}

/** Qidiruv natijasi: mavzu — chiroqcha, misol — kod belgisi; ostida joylashuvi (Android'dagi SearchResultRow). */
export default function SearchResultRow({ languageId, result }: { languageId: string; result: SearchResult }) {
  const isTopic = result.kind === 'topic'
  const title = isTopic ? result.topic.title : result.example.title.replaceAll('`', '')
  const subtitle = isTopic ? result.category.title : `${result.category.title} → ${result.topic.title}`

  return (
    <Link to={resultUrl(languageId, result)} className="group flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-neutral-50">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isTopic ? 'bg-brand-50 text-brand-700' : 'bg-emerald-50 text-emerald-700'}`}
      >
        {isTopic ? <Lightbulb size={17} /> : <Code size={17} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-neutral-900 transition-colors group-hover:text-brand-700">{title}</span>
        <span className="block truncate text-xs text-neutral-500">{subtitle}</span>
      </span>
      <ChevronRight size={16} className="shrink-0 text-neutral-300 transition-colors group-hover:text-brand-700" />
    </Link>
  )
}
