import { BookOpen, Code, Star } from 'lucide-react'
import { Link } from 'react-router'
import InlineText from '@/components/content/InlineText'
import { Card } from '@/components/ui/Card'
import Pill from '@/components/ui/Pill'
import type { Category, Topic } from '@/domain/types'
import { formatCount } from '@/lib/format'

type Props = {
  languageId: string
  category: Category
  topic: Topic
  favoriteCount: number
}

/** Mavzu boshi: bo'lim nomi (havola), inglizcha sarlavha, o'zbekcha qisqa izoh (Android'dagi TopicHeader). */
export default function TopicHeader({ languageId, category, topic, favoriteCount }: Props) {
  return (
    <Card className="px-5 py-5 sm:px-6">
      <Link
        to={`/${languageId}/${category.id}`}
        className="text-[11px] font-semibold tracking-[0.16em] text-brand-700 uppercase transition-colors hover:text-brand-900"
      >
        {category.title}
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-neutral-900 [overflow-wrap:anywhere]">{topic.title}</h1>
      <p className="mt-1.5 text-sm leading-6 text-neutral-500">
        <InlineText text={topic.summary} />
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {topic.blocks.length > 0 && <Pill icon={BookOpen}>Nazariya</Pill>}
        <Pill icon={Code}>{formatCount(topic.examples.length)} ta misol</Pill>
        {favoriteCount > 0 && <Pill icon={Star}>{formatCount(favoriteCount)} ta sevimli</Pill>}
      </div>
    </Card>
  )
}
