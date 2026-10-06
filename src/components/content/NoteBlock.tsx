import { Info, Lightbulb, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { NoteKind } from '@/domain/types'
import InlineText from './InlineText'

type NoteStyle = {
  label: string
  Icon: LucideIcon
  box: string
  bar: string
  accent: string
}

// Android'dagi rang ma'nolari: eslatma — ko'k, maslahat — yashil, diqqat — sariq
const NOTE_STYLES: Record<NoteKind, NoteStyle> = {
  info: { label: 'Eslatma', Icon: Info, box: 'border-sky-200 bg-sky-50', bar: 'bg-sky-600', accent: 'text-sky-700' },
  tip: { label: 'Maslahat', Icon: Lightbulb, box: 'border-emerald-200 bg-emerald-50', bar: 'bg-emerald-600', accent: 'text-emerald-700' },
  warning: { label: 'Diqqat', Icon: TriangleAlert, box: 'border-amber-200 bg-amber-50', bar: 'bg-amber-500', accent: 'text-amber-700' },
}

/** Rangli ramkadagi eslatma: chap tomonda rangli chiziq, tepada belgi va nom. */
export default function NoteBlock({ kind, text }: { kind: NoteKind; text: string }) {
  const { label, Icon, box, bar, accent } = NOTE_STYLES[kind]
  return (
    <aside className={`relative overflow-hidden rounded border py-3 pr-4 pl-5 ${box}`}>
      <span aria-hidden className={`absolute inset-y-0 left-0 w-[3px] ${bar}`} />
      <p className={`flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] uppercase ${accent}`}>
        <Icon size={14} />
        {label}
      </p>
      <p className="mt-1.5 text-sm leading-6 text-neutral-800 [overflow-wrap:anywhere]">
        <InlineText text={text} />
      </p>
    </aside>
  )
}
