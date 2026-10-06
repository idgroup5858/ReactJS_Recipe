import { INVERT_IN_DARK, LANGUAGE_LOGOS } from '@/assets/languages/logos'
import type { ProgrammingLanguage } from '@/domain/types'
import LanguageBadge from './LanguageBadge'

type Props = {
  language: Pick<ProgrammingLanguage, 'id' | 'shortLabel' | 'brandColor'>
  size?: number
  dimmed?: boolean
  /** doim oq fon ustida turadi (bannerdagi oq plitka) — qorong'i rejimda ham teskari qilinmaydi */
  onLight?: boolean
}

/** Tilning haqiqiy logotipi; fayli bo'lmasa — Android'dagi harfli belgi (LanguageBadge). */
export default function LanguageLogo({ language, size = 20, dimmed = false, onLight = false }: Props) {
  const url = LANGUAGE_LOGOS[language.id]
  if (!url) return <LanguageBadge language={language} size={size} dimmed={dimmed} />

  const invert = !onLight && INVERT_IN_DARK.has(language.id)
  return (
    <img
      src={url}
      alt=""
      aria-hidden
      width={size}
      height={size}
      draggable={false}
      className={`shrink-0 object-contain select-none ${invert ? 'dark:invert' : ''} ${dimmed ? 'opacity-40 grayscale' : ''}`}
    />
  )
}
