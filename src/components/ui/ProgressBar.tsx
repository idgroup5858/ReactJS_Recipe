import { type Progress, progressPercent } from '@/domain/progress'

type Props = {
  progress: Progress
  /** ekran o'quvchi uchun nom, masalan "Bo'lim bo'yicha o'zlashtirish" */
  label: string
  /** o'ng tomonda foizni ko'rsatish */
  showPercent?: boolean
  /** `hero` — aksent rangli banner ustida (matn rangi `--hero-fg`) */
  tone?: 'default' | 'hero'
  className?: string
}

/** Ingichka o'zlashtirish chizig'i: aksent rangda, hammasi tushunarli bo'lganda yashil. */
export default function ProgressBar({ progress, label, showPercent = false, tone = 'default', className = '' }: Props) {
  const percent = progressPercent(progress)
  const complete = progress.total > 0 && progress.done >= progress.total
  // chiziq aniq nisbatda: 5 247 tadan 1 tasi ham ko'rinsin (foiz yozuvi esa pastga yaxlitlangan)
  const width = progress.total === 0 ? 0 : (progress.done * 100) / progress.total

  const track = tone === 'hero' ? 'bg-(--hero-fg)/20' : 'bg-neutral-100'
  const fill = tone === 'hero' ? 'bg-(--hero-fg)' : complete ? 'bg-emerald-700' : 'bg-brand-500'
  const text = tone === 'hero' ? 'text-(--hero-fg)/80' : complete ? 'text-emerald-700' : 'text-neutral-500'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className={`h-1.5 min-w-0 flex-1 overflow-hidden rounded-full ${track}`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${fill}`}
          style={{ width: `${width > 0 ? Math.max(width, 1.5) : 0}%` }}
        />
      </div>
      {showPercent && <span className={`w-9 shrink-0 text-right text-[11px] font-semibold tabular-nums ${text}`}>{percent}%</span>}
    </div>
  )
}
