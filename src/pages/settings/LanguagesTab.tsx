import { useContentIndex } from '@/app/routeData'
import { useEnabledLanguages } from '@/app/useEnabledLanguages'
import { Card, CardHeader } from '@/components/ui/Card'
import LanguageLogo from '@/components/ui/LanguageLogo'
import { languageTotals } from '@/domain/counts'
import { formatCount } from '@/lib/format'
import { toggleLanguageEnabled, useSettings } from '@/store/settingsStore'

/** Navbar'dagi tillar panelida qaysi tillar ko'rinishini tanlash. Tayyor bo'lmagan tillar "Tez kunda" deb chiqadi (Android'dagi LanguagesTab). */
export default function LanguagesTab() {
  const index = useContentIndex()
  const { enabledLanguageIds } = useSettings()
  const enabledCount = useEnabledLanguages().length

  return (
    <Card>
      <CardHeader
        title="Tillar"
        hint="Belgilangan tillar navbar'dagi tillar panelida ko'rinadi"
        actions={
          <span className="text-xs font-semibold text-neutral-500 tabular-nums">
            <span className="text-brand-700">{enabledCount}</span> / {index.availableLanguages.length}
          </span>
        }
      />

      <ul className="divide-y divide-neutral-200">
        {index.languages.map((language) => {
          const enabled = language.isAvailable && enabledLanguageIds.includes(language.id)
          const locked = enabled && enabledCount <= 1
          const disabled = !language.isAvailable || locked
          const totals = languageTotals(language)
          return (
            <li key={language.id}>
              <label
                title={locked ? "Kamida bitta til yoqilgan bo'lishi kerak" : undefined}
                className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-neutral-50'}`}
              >
                <input
                  type="checkbox"
                  checked={enabled}
                  disabled={disabled}
                  onChange={() => toggleLanguageEnabled(language.id)}
                  className="h-4 w-4 shrink-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <LanguageLogo language={language} size={28} dimmed={!language.isAvailable} />
                <span className={`min-w-0 flex-1 ${language.isAvailable ? '' : 'opacity-50'}`}>
                  <span className="block truncate text-sm font-medium text-neutral-900">{language.name}</span>
                  {language.isAvailable && (
                    <span className="block truncate text-xs text-neutral-500">
                      {totals.categories} bo'lim · {totals.topics} mavzu · {formatCount(totals.examples)} misol
                    </span>
                  )}
                </span>
                {!language.isAvailable && (
                  <span className="shrink-0 text-[11px] font-semibold tracking-[0.12em] text-neutral-400 uppercase">Tez kunda</span>
                )}
              </label>
            </li>
          )
        })}
      </ul>

      <div className="border-t border-neutral-200 px-4 py-3">
        <p className="text-xs text-neutral-500">Kamida bitta til yoqilgan bo'lishi shart. Kontenti tayyorlanayotgan tillar keyinroq qo'shiladi.</p>
      </div>
    </Card>
  )
}
