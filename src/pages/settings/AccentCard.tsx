import { Check } from 'lucide-react'
import { useContentIndex } from '@/app/routeData'
import { Card, CardHeader } from '@/components/ui/Card'
import LanguageLogo from '@/components/ui/LanguageLogo'
import Switch from '@/components/ui/Switch'
import { setAccent, setLanguageAccent, useSettings } from '@/store/settingsStore'
import { ACCENTS, DEFAULT_ACCENT_ID } from '@/theme/accents'
import { getLanguageAccent } from '@/theme/languageAccents'
import { useIsDark } from '@/theme/useIsDark'

/**
 * Asosiy rang: standart bo'yicha tanlangan tilning o'z rangi (TypeScript — ko'k, NestJS — qizil...), o'chirilsa
 * hr-ui sozlamalaridagi 16 xil palitradan biri. Palitradan rang tanlash til rangini o'chiradi.
 */
export default function AccentCard() {
  const { accentId, languageAccent, selectedLanguageId } = useSettings()
  const language = useContentIndex().language(selectedLanguageId)
  const dark = useIsDark()
  // ro'yxatda rangi yo'q til palitradagi rangda ko'rinadi (theme/appearance.ts)
  const followsLanguage = languageAccent && getLanguageAccent(selectedLanguageId) !== undefined
  const accentName = followsLanguage ? language?.name : ACCENTS.find((accent) => accent.id === accentId)?.name

  return (
    <Card>
      <CardHeader
        title="Asosiy rang"
        hint="Tugmalar, sarlavhalar va faol bo'limlar rangi"
        actions={<span className="text-xs font-semibold text-brand-700">{accentName}</span>}
      />
      <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3">
        {language && <LanguageLogo language={language} size={24} />}
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-neutral-800">Tanlangan til rangi</span>
          <span className="block text-xs text-neutral-500">Til almashtirilganda banner va asosiy rang ham o'sha tilga moslashadi</span>
        </span>
        <Switch checked={languageAccent} onChange={setLanguageAccent} label="Tanlangan til rangi" />
      </div>
      <div className="grid grid-cols-4 gap-1.5 p-4 sm:grid-cols-8" role="radiogroup" aria-label="Asosiy rang">
        {ACCENTS.map((accent) => {
          const active = !followsLanguage && accentId === accent.id
          return (
            <button
              key={accent.id}
              type="button"
              role="radio"
              aria-checked={active}
              title={accent.id === DEFAULT_ACCENT_ID ? `${accent.name} (standart)` : accent.name}
              onClick={() => setAccent(accent.id)}
              className={`flex cursor-pointer flex-col items-center gap-1.5 rounded border px-1 py-2 transition-colors ${active ? 'border-brand-700 bg-brand-50' : 'border-transparent hover:bg-neutral-50'}`}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-white ring-1 ring-black/10 ring-inset dark:ring-white/15"
                style={{ backgroundColor: dark ? (accent.fillDark ?? accent.color) : accent.color }}
              >
                {active && <Check size={15} strokeWidth={3} />}
              </span>
              <span className={`w-full truncate text-center text-[11px] ${active ? 'font-semibold text-brand-700' : 'text-neutral-600'}`}>
                {accent.name}
              </span>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
