import { BookOpen } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { Card, CardHeader } from '@/components/ui/Card'
import type { CodeExample } from '@/domain/types'
import { THEORY_SECTION_ID } from './TheoryCard'

type Props = {
  examples: CodeExample[]
  hasTheory: boolean
  activeId: string | null
}

const itemClass = 'flex items-start gap-2.5 rounded px-2.5 py-1.5 text-left text-xs leading-5 transition-colors'

/**
 * O'ng tomondagi mundarija (keng ekranlarda): 20-50 ta misol orasida tez yurish uchun.
 * Joriy misol belgilanadi va ro'yxat o'zi unga qarab suriladi.
 */
export default function TopicOutline({ examples, hasTheory, activeId }: Props) {
  const listRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const list = listRef.current
    const item = activeId ? list?.querySelector<HTMLElement>(`[data-outline-id="${activeId}"]`) : null
    if (!list || !item) return
    // scrollIntoView butun sahifani ham surib yuborishi mumkin — faqat ro'yxatning o'zini suramiz
    const listBox = list.getBoundingClientRect()
    const itemBox = item.getBoundingClientRect()
    if (itemBox.top < listBox.top) list.scrollTop -= listBox.top - itemBox.top + 8
    else if (itemBox.bottom > listBox.bottom) list.scrollTop += itemBox.bottom - listBox.bottom + 8
  }, [activeId])

  const stateClass = (id: string) =>
    id === activeId ? 'bg-brand-50 font-semibold text-brand-700' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'

  return (
    <aside className="sticky top-20 hidden w-64 shrink-0 xl:block">
      <Card>
        <CardHeader title="Mundarija" hint={`${examples.length} ta misol`} />
        <nav ref={listRef} aria-label="Mundarija" className="max-h-[calc(100vh-11rem)] space-y-0.5 overflow-y-auto p-1.5">
          {hasTheory && (
            <Link to={{ hash: THEORY_SECTION_ID }} replace data-outline-id={THEORY_SECTION_ID} className={`${itemClass} ${stateClass(THEORY_SECTION_ID)}`}>
              <BookOpen size={13} className="mt-1 shrink-0" />
              <span>Nazariya</span>
            </Link>
          )}
          {examples.map((example, index) => (
            <Link
              key={example.id}
              to={{ hash: example.id }}
              replace
              data-outline-id={example.id}
              className={`${itemClass} ${stateClass(example.id)}`}
            >
              <span className="w-5 shrink-0 text-right font-semibold text-neutral-400 tabular-nums">{index + 1}</span>
              <span className="line-clamp-2 min-w-0">{example.title.replaceAll('`', '')}</span>
            </Link>
          ))}
        </nav>
      </Card>
    </aside>
  )
}
