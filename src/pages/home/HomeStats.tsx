import { BookOpen, ChevronRight, Code, Layers, Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { LanguageTotals } from '@/domain/counts'
import { formatCount } from '@/lib/format'

type Stat = {
  title: string
  value: number
  icon: ReactNode
  tint: string
  to?: string
}

const tileClass = 'group flex items-center gap-3 rounded border border-neutral-200 bg-white px-4 py-3 text-left transition-colors'

/** Ko'rsatkichlar qatori (hr-ui dagi "Bugungi holat" kartochkalari). */
export default function HomeStats({ totals, favoriteCount }: { totals: LanguageTotals; favoriteCount: number }) {
  const stats: Stat[] = [
    { title: "Bo'limlar", value: totals.categories, icon: <Layers size={18} />, tint: 'bg-brand-50 text-brand-700' },
    { title: 'Mavzular', value: totals.topics, icon: <BookOpen size={18} />, tint: 'bg-sky-50 text-sky-700' },
    { title: 'Misollar', value: totals.examples, icon: <Code size={18} />, tint: 'bg-emerald-50 text-emerald-700' },
    { title: 'Sevimlilar', value: favoriteCount, icon: <Star size={18} />, tint: 'bg-amber-50 text-amber-700', to: '/favorites' },
  ]

  // telefonda 2×2: son nom ostiga tushadi, kengroq ekranda hr-ui dagidek bitta qatorda
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => {
        const value = formatCount(stat.value)
        const content = (
          <>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${stat.tint}`}>{stat.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-semibold tracking-[0.14em] text-neutral-500 uppercase">{stat.title}</span>
              <span className="block text-xl font-bold text-neutral-900 tabular-nums sm:hidden">{value}</span>
            </span>
            <span className="hidden text-2xl font-bold text-neutral-900 tabular-nums sm:block">{value}</span>
          </>
        )
        return stat.to ? (
          <Link key={stat.title} to={stat.to} className={`${tileClass} hover:border-brand-200`}>
            {content}
            <ChevronRight size={16} className="hidden shrink-0 text-neutral-300 transition-colors group-hover:text-brand-700 sm:block" />
          </Link>
        ) : (
          <div key={stat.title} className={tileClass}>
            {content}
          </div>
        )
      })}
    </div>
  )
}
