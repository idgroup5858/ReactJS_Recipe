import { Check, Monitor, Moon, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card, CardHeader } from '@/components/ui/Card'
import { setThemeMode, useSettings, type ThemeMode } from '@/store/settingsStore'

const THEMES: { id: ThemeMode; name: string; hint: string; icon: ReactNode }[] = [
  { id: 'system', name: 'Tizim', hint: 'Qurilma sozlamasiga moslashadi', icon: <Monitor size={16} /> },
  { id: 'light', name: 'Kunduzgi', hint: "Och fon, to'q matn", icon: <Sun size={16} /> },
  { id: 'dark', name: 'Tungi', hint: "Ko'zni kamroq charchatadi", icon: <Moon size={16} /> },
]

/** Mavzu (tema): Tizim / Kunduzgi / Tungi — Android'dagi variantlar, hr-ui kartochkalari uslubida. */
export default function ThemeCard() {
  const { themeMode } = useSettings()
  return (
    <Card>
      <CardHeader title="Mavzu" hint="Tepadagi oy / quyosh tugmasi bilan ham almashtiriladi" />
      <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-3" role="radiogroup" aria-label="Mavzu">
        {THEMES.map((theme) => {
          const active = themeMode === theme.id
          return (
            <button
              key={theme.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setThemeMode(theme.id)}
              className={`flex cursor-pointer items-center gap-3 rounded border px-3.5 py-2.5 text-left transition-colors ${active ? 'border-brand-700 bg-brand-50' : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${active ? 'bg-brand-700 text-white' : 'bg-neutral-100 text-neutral-500'}`}
              >
                {theme.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-sm font-semibold ${active ? 'text-brand-700' : 'text-neutral-900'}`}>{theme.name}</span>
                <span className="block truncate text-xs text-neutral-500">{theme.hint}</span>
              </span>
              {active && <Check size={16} className="shrink-0 text-brand-700" />}
            </button>
          )
        })}
      </div>
    </Card>
  )
}
