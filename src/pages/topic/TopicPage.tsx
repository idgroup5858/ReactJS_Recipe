import { useCallback, useMemo } from 'react'
import { useLanguageData, useTopicData } from '@/app/routeData'
import BackLink from '@/components/ui/BackLink'
import SectionTitle from '@/components/ui/SectionTitle'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { toggleFavorite, useTopicFavoriteIds } from '@/store/favoritesStore'
import { setTopicLearned, toggleLearned, useTopicLearnedIds } from '@/store/learnedStore'
import ExampleCard from './ExampleCard'
import TheoryCard, { THEORY_SECTION_ID } from './TheoryCard'
import TopicHeader from './TopicHeader'
import TopicOutline from './TopicOutline'
import TopicPager from './TopicPager'
import { useVisibleSection } from './useVisibleSection'

/**
 * Mavzu sahifasi (Android'dagi TopicScreen): avval nazariya, keyin amaliy misollar, oxirida oldingi/keyingi mavzu.
 * `#ex12` kabi manzil bilan ochilsa (qidiruv, sevimlilar) o'sha misolga o'tiladi — buni ScrollRestoration bajaradi.
 */
export default function TopicPage() {
  const { language } = useLanguageData()
  const { category, topic } = useTopicData()
  useDocumentTitle(`${topic.title} · ${language.name}`)

  const favoriteIds = useTopicFavoriteIds(language.id, category.id, topic.id)
  const onToggleFavorite = useCallback(
    (exampleId: string) => toggleFavorite({ languageId: language.id, categoryId: category.id, topicId: topic.id, exampleId }),
    [language.id, category.id, topic.id],
  )
  const learnedIds = useTopicLearnedIds(language.id, category.id, topic.id)
  const onToggleLearned = useCallback(
    (exampleId: string) => toggleLearned({ languageId: language.id, categoryId: category.id, topicId: topic.id, exampleId }),
    [language.id, category.id, topic.id],
  )
  // kontentda yo'q (eski) id'lar hisobga olinmaydi
  const learnedCount = topic.examples.filter((example) => learnedIds.has(example.id)).length
  const onSetAllLearned = (learned: boolean) =>
    setTopicLearned(
      language.id,
      category.id,
      topic.id,
      topic.examples.map((example) => example.id),
      learned,
    )

  const hasTheory = topic.blocks.length > 0
  const sectionIds = useMemo(
    () => [...(hasTheory ? [THEORY_SECTION_ID] : []), ...topic.examples.map((example) => example.id)],
    [hasTheory, topic.examples],
  )
  const activeSectionId = useVisibleSection(sectionIds)

  return (
    <div className="mx-auto flex max-w-[1240px] items-start gap-6">
      <article className="min-w-0 flex-1 space-y-5">
        <BackLink to={`/${language.id}/${category.id}`} label={category.title} />
        <TopicHeader
          languageId={language.id}
          category={category}
          topic={topic}
          favoriteCount={favoriteIds.size}
          learnedCount={learnedCount}
          onSetAllLearned={onSetAllLearned}
        />
        {hasTheory && <TheoryCard blocks={topic.blocks} languageId={language.id} />}

        {topic.examples.length > 0 && (
          <section>
            <SectionTitle>Misollar ({topic.examples.length})</SectionTitle>
            <div className="space-y-4">
              {topic.examples.map((example, index) => (
                <ExampleCard
                  key={example.id}
                  number={index + 1}
                  example={example}
                  languageId={language.id}
                  isFavorite={favoriteIds.has(example.id)}
                  onToggleFavorite={onToggleFavorite}
                  isLearned={learnedIds.has(example.id)}
                  onToggleLearned={onToggleLearned}
                />
              ))}
            </div>
          </section>
        )}

        <TopicPager languageId={language.id} category={category} topic={topic} />
      </article>

      {topic.examples.length > 0 && (
        <TopicOutline examples={topic.examples} hasTheory={hasTheory} activeId={activeSectionId} learnedIds={learnedIds} />
      )}
    </div>
  )
}
