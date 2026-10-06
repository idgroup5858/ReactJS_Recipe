import InlineText from './InlineText'

type Props = {
  items: string[]
  ordered: boolean
}

/** Belgili (•) yoki raqamli (1. 2. ...) ro'yxat. */
export default function ListBlock({ items, ordered }: Props) {
  const List = ordered ? 'ol' : 'ul'
  return (
    <List className="space-y-1.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2.5 text-[15px] leading-7 text-neutral-800">
          <span className="min-w-[18px] shrink-0 font-bold text-brand-700 tabular-nums">{ordered ? `${index + 1}.` : '•'}</span>
          <span className="min-w-0 [overflow-wrap:anywhere]">
            <InlineText text={item} />
          </span>
        </li>
      ))}
    </List>
  )
}
