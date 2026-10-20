import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import InlineText from '@/components/content/InlineText'
import CountBadge from '@/components/ui/CountBadge'
import ProgressBar from '@/components/ui/ProgressBar'
import type { Progress } from '@/domain/progress'
import type { TopicSummary } from '@/domain/types'

type Props = {
  to: string
  topic: TopicSummary
  progress: Progress
}

/**
 * Mavzu qatori: chapda misollar soni, o'rtada inglizcha nom va o'zbekcha izoh, o'ngda o'zlashtirish chizig'i va strelka
 * (Android'dagi NavigationRow). Telefonda chiziq izoh ostiga tushadi.
 */
export default function TopicRow({ to, topic, progress }: Props) {
  return (
    <Link to={to} className="group flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-neutral-50">
      <CountBadge count={topic.exampleCount} title={`${topic.exampleCount} ta misol`} />
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-sm font-semibold text-neutral-900 transition-colors group-hover:text-brand-700">{topic.title}</span>
        <span className="mt-0.5 line-clamp-2 text-xs leading-5 text-neutral-500">
          <InlineText text={topic.summary} />
        </span>
        <ProgressBar progress={progress} label="Mavzu bo'yicha o'zlashtirish" showPercent className="mt-1.5 sm:hidden" />
      </span>
      <ProgressBar progress={progress} label="Mavzu bo'yicha o'zlashtirish" showPercent className="hidden w-32 shrink-0 sm:flex" />
      <ChevronRight size={16} className="shrink-0 text-neutral-300 transition-colors group-hover:text-brand-700" />
    </Link>
  )
}
