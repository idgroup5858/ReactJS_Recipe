import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

/** Kulrang fondagi kichik ma'lumot belgisi: "12 ta misol" (hr-ui dagi pillCls). */
export default function Pill({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700 tabular-nums">
      <Icon size={12} className="text-neutral-400" />
      {children}
    </span>
  )
}
