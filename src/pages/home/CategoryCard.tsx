import { BookOpen, ChevronRight, Code } from 'lucide-react'
import { Link } from 'react-router'
import Pill from '@/components/ui/Pill'
import { categoryExampleCount } from '@/domain/counts'
import type { CategorySummary } from '@/domain/types'
import { formatCount } from '@/lib/format'

type Props = {
  languageId: string
  category: CategorySummary
  /** o'rganish tartibidagi o'rni (1 dan) */
  position: number
}

/** Bo'lim kartochkasi: tartib raqami, nom, qisqa izoh va mavzular / misollar soni. */
export default function CategoryCard({ languageId, category, position }: Props) {
  return (
    <Link
      to={`/${languageId}/${category.id}`}
      className="group flex flex-col gap-3 rounded border border-neutral-200 bg-white px-4 py-3.5 transition-colors hover:border-brand-200"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 tabular-nums">
          {String(position).padStart(2, '0')}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-900 transition-colors group-hover:text-brand-700">
          {category.title}
        </span>
        <ChevronRight size={16} className="shrink-0 text-neutral-300 transition-colors group-hover:text-brand-700" />
      </div>
      <p className="line-clamp-2 min-h-10 text-xs leading-5 text-neutral-500">{category.description}</p>
      <div className="flex flex-wrap gap-1.5">
        <Pill icon={BookOpen}>{formatCount(category.topics.length)} ta mavzu</Pill>
        <Pill icon={Code}>{formatCount(categoryExampleCount(category))} ta misol</Pill>
      </div>
    </Link>
  )
}
