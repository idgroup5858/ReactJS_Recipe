import { BookOpen, Code } from 'lucide-react'
import { useCategoryData, useLanguageData } from '@/app/routeData'
import { Card } from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import Pill from '@/components/ui/Pill'
import { categoryExampleCount } from '@/domain/counts'
import { formatCount } from '@/lib/format'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import TopicRow from './TopicRow'

/** Bo'lim: qisqa izoh va mavzular ro'yxati (Android'dagi CategoryScreen). */
export default function CategoryPage() {
  const { language } = useLanguageData()
  const { category } = useCategoryData()
  useDocumentTitle(`${category.title} · ${language.name}`)

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        title={category.title}
        description={category.description}
        actions={
          <>
            <Pill icon={BookOpen}>{formatCount(category.topics.length)} ta mavzu</Pill>
            <Pill icon={Code}>{formatCount(categoryExampleCount(category))} ta misol</Pill>
          </>
        }
      />
      <Card>
        <ul className="divide-y divide-neutral-200">
          {category.topics.map((topic) => (
            <li key={topic.id}>
              <TopicRow to={`/${language.id}/${category.id}/${topic.id}`} topic={topic} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
