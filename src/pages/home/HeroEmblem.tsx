import LanguageLogo from '@/components/ui/LanguageLogo'
import type { ProgrammingLanguage } from '@/domain/types'

type Props = {
  language: Pick<ProgrammingLanguage, 'id' | 'shortLabel' | 'brandColor'>
}

// tashqi orbitadagi kod belgilari: markazdan 135px (orbita radiusi) uzoqlikda, 35° va 145° burchakda
const glyphClass = 'absolute -translate-x-1/2 -translate-y-1/2 font-mono text-[13px] font-semibold text-(--hero-fg)/50'

/**
 * Banner o'ng tomonidagi abstrakt kompozitsiya: markazda kichik oq doirada tilning haqiqiy logotipi, atrofida
 * orbitalar (ikkitasi sekin aylanadi), orqada chetlari so'nib boruvchi nuqtali to'r va yorug'lik dog'i. Joy egallaydigan
 * quti kichik, bezaklar undan chiqib turadi — ularni banner (`overflow-hidden`) qirqadi. Ranglar `--hero-fg` dan,
 * shuning uchun sariq JavaScript bannerida qora.
 */
export default function HeroEmblem({ language }: Props) {
  return (
    <div aria-hidden className="relative mr-6 hidden h-20 w-20 shrink-0 select-none sm:block lg:mr-20">
      <span className="absolute -inset-[120px] bg-[radial-gradient(circle,var(--hero-fg)_1px,transparent_1.5px)] bg-size-[14px_14px] opacity-25 [mask-image:radial-gradient(closest-side,#000_20%,transparent)]" />
      <span className="absolute -inset-16 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.22),transparent)]" />

      <span className="absolute -inset-[95px] rounded-full border border-(--hero-fg)/15" />
      <span className="absolute -inset-[58px] rounded-full border border-dashed border-(--hero-fg)/30 motion-safe:animate-[spin_48s_linear_infinite]">
        <span className="absolute top-0 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--hero-fg)/80" />
        <span className="absolute bottom-[14.6%] left-[14.6%] h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-(--hero-fg)/50" />
      </span>
      <span className="absolute -inset-[26px] rounded-full border border-(--hero-fg)/20 motion-safe:animate-[spin_30s_linear_infinite_reverse]">
        <span className="absolute top-1/2 right-0 h-1.5 w-1.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-(--hero-fg)/60" />
      </span>

      <span className={glyphClass} style={{ left: 151, top: -37 }}>
        {'</>'}
      </span>
      <span className={glyphClass} style={{ left: -71, top: 117 }}>
        {'{ }'}
      </span>

      {/* bg-[#fff]: qorong'i rejimda .bg-white yuza rangiga almashadi, doira esa doim oq — qizil NestJS yoki qora
          Next.js logotipi ham o'z rangidagi bannerda aniq ko'rinadi */}
      <span className="absolute inset-0 flex items-center justify-center rounded-full bg-[#fff] shadow-[0_18px_40px_-14px_rgba(0,0,0,0.55)] ring-4 ring-(--hero-fg)/15">
        <LanguageLogo key={language.id} language={language} size={42} onLight />
      </span>
    </div>
  )
}
