import { RotateCcw, Trash2 } from 'lucide-react'
import { useContentIndex } from '@/app/routeData'
import { Card, CardHeader } from '@/components/ui/Card'
import LanguageLogo from '@/components/ui/LanguageLogo'
import ProgressBar from '@/components/ui/ProgressBar'
import { languageProgress } from '@/domain/progress'
import { formatCount } from '@/lib/format'
import AppSwal from '@/lib/swal'
import { showToast } from '@/lib/toast'
import { clearLearned, useLearnedIndex } from '@/store/learnedStore'

async function confirmClear(text: string): Promise<boolean> {
  const result = await AppSwal.fire({
    icon: 'warning',
    title: 'Progressni tozalash',
    text: `${text} Buni qaytarib bo'lmaydi.`,
    showCancelButton: true,
    confirmButtonText: 'Tozalash',
  })
  return result.isConfirmed
}

/** "Tushunarli" belgilari bo'yicha har bir tilning o'zlashtirish holati va uni tozalash (shu tilniki yoki hammasi). */
export default function ProgressCard() {
  const index = useContentIndex()
  const learned = useLearnedIndex()
  const rows = index.availableLanguages
    .map((language) => ({ language, progress: languageProgress(learned, language) }))
    .filter((row) => row.progress.done > 0)
  const totalDone = rows.reduce((sum, row) => sum + row.progress.done, 0)

  const clearLanguage = async (languageId: string, name: string, done: number) => {
    if (!(await confirmClear(`${name} bo'yicha ${formatCount(done)} ta "tushunarli" belgisi o'chiriladi.`))) return
    clearLearned(languageId)
    showToast(`${name} progressi tozalandi`)
  }

  const clearAll = async () => {
    if (!(await confirmClear(`Barcha tillar bo'yicha ${formatCount(totalDone)} ta "tushunarli" belgisi o'chiriladi.`))) return
    clearLearned()
    showToast('Barcha progress tozalandi')
  }

  return (
    <Card>
      <CardHeader
        title="O'zlashtirish"
        hint={'Misollardagi "Tushunarli" belgilari shu brauzerda saqlanadi'}
        actions={
          rows.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="btn-icon-danger flex h-8 items-center gap-1.5 rounded px-3 text-xs font-semibold"
            >
              <Trash2 size={14} /> Hammasini tozalash
            </button>
          )
        }
      />
      {rows.length === 0 ? (
        <p className="px-4 py-4 text-sm text-neutral-500">
          Hali hech bir misol tushunarli deb belgilanmagan. Mavzu sahifasida misol yonidagi "Tushunarli" tugmasini bosing.
        </p>
      ) : (
        <ul className="divide-y divide-neutral-200">
          {rows.map(({ language, progress }) => (
            <li key={language.id} className="flex items-center gap-3 px-4 py-3">
              <LanguageLogo language={language} size={28} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-medium text-neutral-900">{language.name}</span>
                  <span className="shrink-0 text-xs text-neutral-500 tabular-nums">
                    {formatCount(progress.done)} / {formatCount(progress.total)} misol
                  </span>
                </div>
                <ProgressBar progress={progress} label={`${language.name} bo'yicha o'zlashtirish`} showPercent className="mt-1.5" />
              </div>
              <button
                type="button"
                onClick={() => clearLanguage(language.id, language.name, progress.done)}
                aria-label={`${language.name} progressini tozalash`}
                title={`${language.name} progressini tozalash`}
                className="btn-icon-danger flex h-8 w-8 shrink-0 items-center justify-center rounded"
              >
                <RotateCcw size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
