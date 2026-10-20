import { BookOpen, ChevronRight, Code } from 'lucide-react'
import { Link } from 'react-router'
import Pill from '@/components/ui/Pill'
import ProgressBar from '@/components/ui/ProgressBar'
import { categoryExampleCount } from '@/domain/counts'
import type { Progress } from '@/domain/progress'
import type { CategorySummary } from '@/domain/types'
import { formatCount } from '@/lib/format'
import type { CategoryLayout } from '@/store/settingsStore'

type Props = {
  languageId: string
  category: CategorySummary
  /** o'rganish tartibidagi o'rni (1 dan) */
  position: number
  layout: CategoryLayout
  /** bo'lim bo'yicha tushunarli deb belgilangan misollar */
  progress: Progress
}

const PROGRESS_LABEL = "Bo'lim bo'yicha o'zlashtirish"

/**
 * Bo'lim kartochkasi: tartib raqami, nom, qisqa izoh, mavzular / misollar soni va o'zlashtirish chizig'i.
 * `list` ko'rinishida hammasi bitta qatorda; telefonda sonlar va chiziq izoh ostiga tushadi.
 */
export default function CategoryCard({ languageId, category, position, layout, progress }: Props) {
  const topics = `${formatCount(category.topics.length)} ta mavzu`
  const examples = `${formatCount(categoryExampleCount(category))} ta misol`
  const number = (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 tabular-nums">
      {String(position).padStart(2, '0')}
    </span>
  )
  const title = (
    <span className="min-w-0 truncate text-sm font-semibold text-neutral-900 transition-colors group-hover:text-brand-700">
      {category.title}
    </span>
  )
  const chevron = <ChevronRight size={16} className="shrink-0 text-neutral-300 transition-colors group-hover:text-brand-700" />

  if (layout === 'list') {
    return (
      <Link
        to={`/${languageId}/${category.id}`}
        className="group flex items-center gap-3 rounded border border-neutral-200 bg-white px-4 py-3 transition-colors hover:border-brand-200"
      >
        {number}
        <div className="flex min-w-0 flex-1 flex-col">
          {title}
          <p className="truncate text-xs leading-5 text-neutral-500">{category.description}</p>
          <p className="text-[11px] leading-4 text-neutral-400 tabular-nums md:hidden">
            {topics} · {examples}
          </p>
          <ProgressBar progress={progress} label={PROGRESS_LABEL} showPercent className="mt-1.5 sm:hidden" />
        </div>
        <div className="hidden shrink-0 gap-1.5 md:flex">
          <Pill icon={BookOpen}>{topics}</Pill>
          <Pill icon={Code}>{examples}</Pill>
        </div>
        <ProgressBar progress={progress} label={PROGRESS_LABEL} showPercent className="hidden w-32 shrink-0 sm:flex" />
        {chevron}
      </Link>
    )
  }

  return (
    <Link
      to={`/${languageId}/${category.id}`}
      className="group flex flex-col gap-3 rounded border border-neutral-200 bg-white px-4 py-3.5 transition-colors hover:border-brand-200"
    >
      <div className="flex items-center gap-3">
        {number}
        <span className="flex min-w-0 flex-1">{title}</span>
        {chevron}
      </div>
      <p className="line-clamp-2 min-h-10 text-xs leading-5 text-neutral-500">{category.description}</p>
      <div className="flex flex-wrap gap-1.5">
        <Pill icon={BookOpen}>{topics}</Pill>
        <Pill icon={Code}>{examples}</Pill>
      </div>
      <ProgressBar progress={progress} label={PROGRESS_LABEL} showPercent />
    </Link>
  )
}
