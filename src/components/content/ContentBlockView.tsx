import type { ContentBlock } from '@/domain/types'
import CodeBlock from './CodeBlock'
import InlineText from './InlineText'
import ListBlock from './ListBlock'
import NoteBlock from './NoteBlock'
import TableBlock from './TableBlock'

/** Nazariya blokini turiga qarab chizadi (Android'dagi ContentBlockView). */
export default function ContentBlockView({ block, languageId }: { block: ContentBlock; languageId: string }) {
  switch (block.type) {
    case 'heading':
      return (
        <h3 className="flex items-center gap-2.5 pt-2 text-base font-semibold text-neutral-900">
          <span aria-hidden className="h-5 w-[3px] shrink-0 rounded-sm bg-brand-700" />
          <span className="min-w-0">
            <InlineText text={block.text} />
          </span>
        </h3>
      )
    case 'paragraph':
      return (
        <p className="text-[15px] leading-7 text-neutral-800 [overflow-wrap:anywhere]">
          <InlineText text={block.text} />
        </p>
      )
    case 'list':
      return <ListBlock items={block.items} ordered={block.ordered} />
    case 'note':
      return <NoteBlock kind={block.kind} text={block.text} />
    case 'snippet':
      return <CodeBlock code={block.code} languageId={languageId} copyable />
    case 'table':
      return <TableBlock headers={block.headers} rows={block.rows} />
  }
}
