import { Check } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { setAccent, useSettings } from '@/store/settingsStore'
import { ACCENTS, DEFAULT_ACCENT_ID } from '@/theme/accents'
import { useIsDark } from '@/theme/useIsDark'

/** Asosiy rang — hr-ui sozlamalaridagi 16 xil palitra. */
export default function AccentCard() {
  const { accentId } = useSettings()
  const dark = useIsDark()
  const accentName = ACCENTS.find((accent) => accent.id === accentId)?.name

  return (
    <Card>
      <CardHeader
        title="Asosiy rang"
        hint="Tugmalar, sarlavhalar va faol bo'limlar rangi"
        actions={<span className="text-xs font-semibold text-brand-700">{accentName}</span>}
      />
      <div className="grid grid-cols-4 gap-1.5 p-4 sm:grid-cols-8" role="radiogroup" aria-label="Asosiy rang">
        {ACCENTS.map((accent) => {
          const active = accentId === accent.id
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
