import type { ProgrammingLanguage } from '@/domain/types'
import { readableTextColor } from '@/lib/color'

type Props = {
  language: Pick<ProgrammingLanguage, 'shortLabel' | 'brandColor'>
  size?: number
  dimmed?: boolean
}

/** Til logotipi o'rnida: brend rangidagi kvadrat ichida qisqa belgi ("TS", "Nest"...) — Android'dagi LanguageBadge. */
export default function LanguageBadge({ language, size = 32, dimmed = false }: Props) {
  const label = language.shortLabel
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-end justify-end rounded font-bold ring-1 ring-black/10 ring-inset select-none dark:ring-white/15"
      style={{
        width: size,
        height: size,
        backgroundColor: language.brandColor,
        color: readableTextColor(language.brandColor),
        fontSize: size * (label.length > 2 ? 0.3 : 0.4),
        lineHeight: 1,
        padding: `0 ${size * 0.08}px ${size * 0.08}px 0`,
        opacity: dimmed ? 0.4 : 1,
      }}
    >
      {label}
    </span>
  )
}
