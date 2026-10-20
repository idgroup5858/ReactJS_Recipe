import { BookOpen, CircleCheck, Code } from 'lucide-react'
import { useCategoryData, useLanguageData } from '@/app/routeData'
import BackLink from '@/components/ui/BackLink'
import { Card } from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import Pill from '@/components/ui/Pill'
import { categoryExampleCount } from '@/domain/counts'
import { categoryProgress, progressPercent, topicProgress } from '@/domain/progress'
import { formatCount } from '@/lib/format'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { useLearnedIndex } from '@/store/learnedStore'
import TopicRow from './TopicRow'

/** Bo'lim: qisqa izoh va mavzular ro'yxati o'zlashtirish chiziqlari bilan (Android'dagi CategoryScreen). */
export default function CategoryPage() {
  const { language } = useLanguageData()
  const { category } = useCategoryData()
  const learned = useLearnedIndex()
  useDocumentTitle(`${category.title} · ${language.name}`)

  const progress = categoryProgress(learned, language.id, category)

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <BackLink to={`/${language.id}`} label={`${language.name} bo'limlari`} />
      <PageHeader
        title={category.title}
        description={category.description}
        actions={
          <>
            <Pill icon={BookOpen}>{formatCount(category.topics.length)} ta mavzu</Pill>
            <Pill icon={Code}>{formatCount(categoryExampleCount(category))} ta misol</Pill>
            <Pill icon={CircleCheck}>
              {formatCount(progress.done)} tushunarli · {progressPercent(progress)}%
            </Pill>
          </>
        }
      />
      <Card>
        <ul className="divide-y divide-neutral-200">
          {category.topics.map((topic) => (
            <li key={topic.id}>
              <TopicRow
                to={`/${language.id}/${category.id}/${topic.id}`}
                topic={topic}
                progress={topicProgress(learned, language.id, category.id, topic)}
              />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
