import { CodeXml } from 'lucide-react'
import { APP_NAME } from '@/app/appInfo'

/** Kod belgisi + harflari ochiq yozilgan nom — sidebar va yuklanish ekranida (hr-ui dagi Brand). */
export default function Brand() {
  return (
    <span className="flex items-center gap-2.5 select-none">
      <CodeXml size={20} strokeWidth={2.25} className="shrink-0 text-brand-700" />
      <span className="truncate text-[13px] font-bold tracking-[0.2em] text-brand-900 uppercase">{APP_NAME}</span>
    </span>
  )
}
