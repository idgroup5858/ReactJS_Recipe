import { Fragment, useMemo } from 'react'
import { parseInlineMarkup } from '@/lib/inlineMarkup'

/** Kontent matni: `kod` — aksent rangli monospace "chip", **matn** — qalin. */
export default function InlineText({ text }: { text: string }) {
  const segments = useMemo(() => parseInlineMarkup(text), [text])
  return segments.map((segment, index) => {
    switch (segment.kind) {
      case 'code':
        return (
          <code
            key={index}
            className="rounded bg-neutral-100 px-1 py-px font-mono text-[0.88em] font-medium tracking-normal text-brand-700 normal-case"
          >
            {segment.text}
          </code>
        )
      case 'bold':
        return (
          <strong key={index} className="font-semibold text-neutral-900">
            {segment.text}
          </strong>
        )
      case 'text':
        return <Fragment key={index}>{segment.text}</Fragment>
    }
  })
}
