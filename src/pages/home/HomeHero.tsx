import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import LanguageLogo from '@/components/ui/LanguageLogo'
import type { ProgrammingLanguage } from '@/domain/types'
import { formatCount } from '@/lib/format'
import HeroEmblem from './HeroEmblem'

type Props = {
  language: ProgrammingLanguage
  categoryCount: number
}

/**
 * Aksent rangli banner (hr-ui bosh sahifasidagi "Xayrli kun!" bloki): kengroq ekranda o'ng tomonda abstrakt emblema
 * (HeroEmblem), telefonda logotip sarlavha yonida.
 * Ranglari tilning o'z aksentidan (theme/languageAccents.ts) keladi; matn rangi `--hero-fg` — odatda oq,
 * sariq JavaScript bannerida qora.
 */
export default function HomeHero({ language, categoryCount }: Props) {
  return (
    <div className="bg-hero relative flex items-center justify-between gap-6 overflow-hidden rounded px-6 py-7 sm:px-8 dark:ring-1 dark:ring-white/10">
      {/* tor ekranda emblema orbitalari matn ostiga kiradi — matn ustida qoladi */}
      <div className="relative z-10 min-w-0">
        <p className="text-[10px] font-semibold tracking-[0.22em] text-(--hero-fg)/60 uppercase">
          Mavzular ro'yxati · {formatCount(categoryCount)} bo'lim
        </p>
        <div className="mt-6 flex items-center gap-3">
          {/* bg-[#fff]: qorong'i rejimda .bg-white yuza rangiga almashadi, doira esa doim oq bo'lishi kerak */}
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff] ring-2 ring-(--hero-fg)/20 sm:hidden">
            <LanguageLogo key={language.id} language={language} size={22} onLight />
          </span>
          <h1 className="text-2xl font-bold">{language.name}</h1>
        </div>
        <p className="mt-1 max-w-xl text-sm text-(--hero-fg)/70">
          Bo'limlar o'rganish tartibida joylashtirilgan: har bir keyingi bo'lim oldingilariga tayanadi. Har bir mavzuda avval
          nazariya, so'ng amaliy misollar va ularning natijasi beriladi.
        </p>
        <Link
          to="/search"
          className="mt-5 inline-flex h-8 items-center gap-2 rounded border border-(--hero-fg)/70 px-4 text-xs font-semibold transition-colors hover:bg-(--hero-fg)/10"
        >
          Qidirish <ArrowRight size={14} />
        </Link>
      </div>

      <HeroEmblem language={language} />
    </div>
  )
}
