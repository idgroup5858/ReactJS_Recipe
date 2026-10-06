import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import type { Category, Topic } from '@/domain/types'

type PagerLinkProps = {
  to: string
  title: string
  isNext: boolean
}

function PagerLink({ to, title, isNext }: PagerLinkProps) {
  const Icon = isNext ? ChevronRight : ChevronLeft
  return (
    // Android'dagidek joriy mavzu almashtiriladi — tarixda mavzular to'planib qolmaydi
    <Link
      to={to}
      replace
      className={`group flex min-w-0 items-center gap-3 rounded border border-neutral-200 bg-white px-4 py-3 transition-colors hover:border-brand-200 ${isNext ? 'flex-row-reverse text-right sm:col-start-2' : ''}`}
    >
      <Icon size={18} className="shrink-0 text-neutral-400 transition-colors group-hover:text-brand-700" />
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold tracking-[0.14em] text-neutral-500 uppercase">{isNext ? 'Keyingi' : 'Oldingi'}</span>
        <span className="block truncate text-sm font-semibold text-neutral-900 transition-colors group-hover:text-brand-700">{title}</span>
      </span>
    </Link>
  )
}

/** Bo'lim ichidagi oldingi / keyingi mavzuga o'tish (Android'dagi topicPager). */
export default function TopicPager({ languageId, category, topic }: { languageId: string; category: Category; topic: Topic }) {
  const index = category.topics.findIndex((item) => item.id === topic.id)
  const previous = category.topics[index - 1]
  const next = category.topics[index + 1]
  if (!previous && !next) return null

  const topicUrl = (target: Topic) => `/${languageId}/${category.id}/${target.id}`
  return (
    <nav aria-label="Mavzular" className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
      {previous && <PagerLink to={topicUrl(previous)} title={previous.title} isNext={false} />}
      {next && <PagerLink to={topicUrl(next)} title={next.title} isNext />}
    </nav>
  )
}
