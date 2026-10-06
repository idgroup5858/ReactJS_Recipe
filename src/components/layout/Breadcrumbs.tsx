import { ChevronRight } from 'lucide-react'
import { Link, useMatches } from 'react-router'
import { APP_NAME } from '@/app/appInfo'
import { collectCrumbs } from '@/app/routeHandle'

const labelClass = 'truncate text-xs font-semibold tracking-[0.16em] uppercase'

/** Header'dagi joylashuv: telefonda faqat joriy sahifa, kengroq ekranda to'liq yo'l. */
export default function Breadcrumbs() {
  const crumbs = collectCrumbs(useMatches())
  if (crumbs.length === 0) return <h2 className={`${labelClass} text-neutral-900`}>{APP_NAME}</h2>

  return (
    <nav aria-label="Joylashuv" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <li key={index} className={`min-w-0 items-center gap-1.5 ${isLast ? 'flex' : 'hidden shrink-0 md:flex'}`}>
              {index > 0 && <ChevronRight size={12} className="hidden shrink-0 text-neutral-300 md:block" />}
              {crumb.to && !isLast ? (
                <Link to={crumb.to} className={`${labelClass} text-neutral-500 transition-colors hover:text-brand-700`}>
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className={`${labelClass} text-neutral-900`}>
                  {crumb.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
