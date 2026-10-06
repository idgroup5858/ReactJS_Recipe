import ContentBlockView from '@/components/content/ContentBlockView'
import { Card, CardHeader } from '@/components/ui/Card'
import type { ContentBlock } from '@/domain/types'

export const THEORY_SECTION_ID = 'theory'

/** Mavzuning nazariy qismi: sarlavhalar, matn, ro'yxatlar, eslatmalar, kod parchalari va jadvallar. */
export default function TheoryCard({ blocks, languageId }: { blocks: ContentBlock[]; languageId: string }) {
  return (
    <Card id={THEORY_SECTION_ID} className="scroll-mt-20">
      <CardHeader title="Nazariya" />
      <div className="space-y-4 px-5 py-5 sm:px-6">
        {blocks.map((block, index) => (
          <ContentBlockView key={index} block={block} languageId={languageId} />
        ))}
      </div>
    </Card>
  )
}
