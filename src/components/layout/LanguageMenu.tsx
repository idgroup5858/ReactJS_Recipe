import { Check, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useActiveLanguageId, useContentIndex } from '@/app/routeData'
import { useEnabledLanguages } from '@/app/useEnabledLanguages'
import { useSwitchLanguage } from '@/app/useSwitchLanguage'
import LanguageLogo from '@/components/ui/LanguageLogo'
import { languageTotals } from '@/domain/counts'
import { useDismiss } from '@/lib/useDismiss'

/**
 * Telefondagi til tanlagich: navbar'da tillar paneli uchun joy bo'lmaganda (md dan kichik ekran) uning o'rnida
 * header'ning o'ng chetida turadi. Ro'yxat — sozlamalarda yoqilgan tillar, katalog tartibida.
 */
export default function LanguageMenu() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const ref = useRef<HTMLDivElement>(null)
  useDismiss(ref, open, close)

  const index = useContentIndex()
  const languages = useEnabledLanguages()
  const activeId = useActiveLanguageId()
  const switchLanguage = useSwitchLanguage()

  const active = index.language(activeId)
  if (!active) return null

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Tilni tanlash"
        className="flex cursor-pointer items-center gap-2.5 rounded py-1 pr-1 pl-1 text-neutral-500 transition-colors hover:text-brand-700"
      >
        <span className="hidden text-[11px] font-semibold tracking-[0.16em] uppercase sm:block">{active.name}</span>
        <LanguageLogo language={active} size={26} />
        <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-50 mt-2 w-64 overflow-hidden rounded border border-neutral-200 bg-white shadow-[0_12px_32px_-16px_rgba(0,0,0,0.3)]"
        >
          <p className="border-b border-neutral-200 px-3 py-2 text-[10px] font-semibold tracking-[0.2em] text-neutral-400 uppercase">
            Tilni tanlang
          </p>
          <ul className="p-1">
            {languages.map((language) => {
              const selected = language.id === activeId
              const totals = languageTotals(language)
              return (
                <li key={language.id}>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    onClick={() => {
                      close()
                      if (!selected) switchLanguage(language.id)
                    }}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded px-2.5 py-2 text-left transition-colors ${selected ? 'bg-brand-50' : 'hover:bg-neutral-100'}`}
                  >
                    <LanguageLogo language={language} size={24} />
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm ${selected ? 'font-semibold text-brand-700' : 'font-medium text-neutral-800'}`}>
                        {language.name}
                      </span>
                      <span className="block truncate text-[11px] text-neutral-500">
                        {totals.categories} bo'lim · {totals.topics} mavzu
                      </span>
                    </span>
                    {selected && <Check size={15} className="shrink-0 text-brand-700" />}
                  </button>
                </li>
              )
            })}
          </ul>
          <Link
            to="/settings?tab=languages"
            onClick={close}
            className="flex items-center gap-2 border-t border-neutral-200 px-3 py-2.5 text-xs font-semibold text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-brand-700"
          >
            <SlidersHorizontal size={14} />
            Tillarni boshqarish
          </Link>
        </div>
      )}
    </div>
  )
}
