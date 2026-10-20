import { Circle, CircleCheck, Share2, Star } from 'lucide-react'
import { memo } from 'react'
import CodeBlock from '@/components/content/CodeBlock'
import CodeOutput from '@/components/content/CodeOutput'
import CopyCodeButton from '@/components/content/CopyCodeButton'
import InlineText from '@/components/content/InlineText'
import IconButton from '@/components/ui/IconButton'
import type { CodeExample } from '@/domain/types'
import { shareText } from '@/lib/share'
import { showToast } from '@/lib/toast'
import { exampleShareText } from './exampleShareText'

type Props = {
  number: number
  example: CodeExample
  languageId: string
  isFavorite: boolean
  onToggleFavorite: (exampleId: string) => void
  isLearned: boolean
  onToggleLearned: (exampleId: string) => void
}

/**
 * Bitta amaliy misol (Android'dagi ExampleCard): raqam, nom, "tushunarli" belgisi, sevimli / nusxalash / ulashish
 * tugmalari, izoh, ranglangan kod va natija. `content-visibility` ataylab ishlatilmagan: u taxminiy balandlik beradi va
 * `#ex12` havolasi misolga aniq tushmay qoladi (eng katta mavzu ham ~2000 qator — oddiy chizish yetarli tez).
 */
function ExampleCard({ number, example, languageId, isFavorite, onToggleFavorite, isLearned, onToggleLearned }: Props) {
  const share = async () => {
    const outcome = await shareText(example.title, exampleShareText(example))
    if (outcome === 'copied') showToast('Ulashish matni nusxalandi')
    if (outcome === 'failed') showToast("Ulashib bo'lmadi", 'error')
  }

  return (
    <article id={example.id} className={`scroll-mt-20 rounded border bg-white ${isLearned ? 'border-emerald-200' : 'border-neutral-200'}`}>
      <header className="flex items-center gap-2.5 border-b border-neutral-200 py-2 pr-2.5 pl-4">
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[11px] font-bold tabular-nums ${isLearned ? 'border-emerald-700 text-emerald-700' : 'border-brand-700 text-brand-700'}`}
        >
          {number}
        </span>
        <h3 className="min-w-0 flex-1 text-sm font-semibold text-neutral-900 [overflow-wrap:anywhere]">
          <InlineText text={example.title} />
        </h3>
        <div className="flex shrink-0 items-center gap-1.5">
          {/* telefonda faqat ikonka qoladi — sarlavhaga joy kerak */}
          <button
            type="button"
            onClick={() => onToggleLearned(example.id)}
            aria-pressed={isLearned}
            title={isLearned ? 'Tushunarli belgisini olib tashlash' : 'Tushunarli deb belgilash'}
            className={`flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded border px-2 text-xs font-semibold transition-colors sm:px-2.5 ${
              isLearned
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-neutral-200 text-neutral-500 hover:border-emerald-200 hover:text-emerald-700'
            }`}
          >
            {isLearned ? <CircleCheck size={16} /> : <Circle size={16} />}
            <span className="hidden sm:inline">Tushunarli</span>
          </button>
          <IconButton
            label={isFavorite ? 'Sevimlilardan olib tashlash' : "Sevimlilarga qo'shish"}
            active={isFavorite}
            onClick={() => onToggleFavorite(example.id)}
          >
            <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </IconButton>
          <CopyCodeButton code={example.code} />
          <IconButton label="Ulashish" onClick={share}>
            <Share2 size={16} />
          </IconButton>
        </div>
      </header>

      <div className="space-y-3 p-4">
        {example.description && (
          <p className="text-sm leading-6 text-neutral-600 [overflow-wrap:anywhere]">
            <InlineText text={example.description} />
          </p>
        )}
        <CodeBlock code={example.code} languageId={languageId} />
        {example.output && <CodeOutput output={example.output} />}
      </div>
    </article>
  )
}

export default memo(ExampleCard)
