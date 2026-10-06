import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  actions?: ReactNode
  id?: string
}

/** Kartochkalar guruhi ustidagi sarlavha ("BUGUNGI HOLAT" uslubida). */
export default function SectionTitle({ children, actions, id }: Props) {
  return (
    <div id={id} className="mb-3 flex scroll-mt-20 items-center justify-between gap-4">
      <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-brand-800">{children}</h2>
      {actions}
    </div>
  )
}
