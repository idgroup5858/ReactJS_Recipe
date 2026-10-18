import { Fragment, useMemo } from 'react'
import { parseInlineMarkup, type MarkupSegment } from '@/lib/inlineMarkup'

const CODE_CLASS =
  'rounded bg-neutral-100 px-1 py-px font-mono text-[0.88em] font-medium tracking-normal text-brand-700 normal-case'

function renderSegment(segment: MarkupSegment, index: number) {
  switch (segment.kind) {
    case 'code':
      return (
        <code key={index} className={CODE_CLASS}>
          {segment.text}
        </code>
      )
    case 'bold':
      return (
        <strong key={index} className="font-semibold text-neutral-900">
          {(segment.children ?? [{ kind: 'text' as const, text: segment.text }]).map(renderSegment)}
        </strong>
      )
    case 'text':
      return <Fragment key={index}>{segment.text}</Fragment>
  }
}

/** Kontent matni: `kod` — aksent rangli monospace "chip", **matn** — qalin (ichida `kod` bo'lishi mumkin). */
export default function InlineText({ text }: { text: string }) {
  const segments = useMemo(() => parseInlineMarkup(text), [text])
  return segments.map(renderSegment)
}
