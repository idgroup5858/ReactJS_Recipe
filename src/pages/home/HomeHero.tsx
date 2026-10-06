import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import LanguageLogo from '@/components/ui/LanguageLogo'
import type { ProgrammingLanguage } from '@/domain/types'
import { formatCount } from '@/lib/format'

type Props = {
  language: ProgrammingLanguage
  categoryCount: number
}

// bg-[#fff]: qorong'i rejimda .bg-white yuza rangiga almashtiriladi, plitka esa doim oq bo'lishi kerak —
// shunda qizil NestJS yoki qora Next.js logotipi ham aksent fonda aniq ko'rinadi
const tileClass = 'flex shrink-0 items-center justify-center rounded bg-[#fff] ring-1 ring-white/40'

/**
 * Aksent rangli banner (hr-ui bosh sahifasidagi "Xayrli kun!" bloki) va tanlangan tilning haqiqiy logotipi:
 * kengroq ekranda o'ng tomonda katta plitkada, telefonda sarlavha yonida.
 */
export default function HomeHero({ language, categoryCount }: Props) {
  return (
    <div className="bg-hero flex items-center justify-between gap-6 rounded px-6 py-7 text-white sm:px-8">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-[0.22em] text-white/60 uppercase">
          Mavzular ro'yxati · {formatCount(categoryCount)} bo'lim
        </p>
        <div className="mt-6 flex items-center gap-3">
          <span className={`${tileClass} h-10 w-10 sm:hidden`}>
            <LanguageLogo key={language.id} language={language} size={26} onLight />
          </span>
          <h1 className="text-2xl font-bold">{language.name}</h1>
        </div>
        <p className="mt-1 max-w-xl text-sm text-white/70">
          Bo'limlar o'rganish tartibida joylashtirilgan: har bir keyingi bo'lim oldingilariga tayanadi. Har bir mavzuda avval
          nazariya, so'ng amaliy misollar va ularning natijasi beriladi.
        </p>
        <Link
          to="/search"
          className="mt-5 inline-flex h-8 items-center gap-2 rounded border border-white/70 px-4 text-xs font-semibold text-white transition-colors hover:bg-white/10"
        >
          Qidirish <ArrowRight size={14} />
        </Link>
      </div>

      <div className={`${tileClass} mr-2 hidden h-28 w-28 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.55)] sm:flex lg:mr-6 lg:h-32 lg:w-32`}>
        <LanguageLogo key={language.id} language={language} size={72} onLight />
      </div>
    </div>
  )
}
