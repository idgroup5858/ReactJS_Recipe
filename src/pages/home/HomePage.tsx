import { Code, LayoutGrid, List } from 'lucide-react'
import { useLanguageData } from '@/app/routeData'
import EmptyState from '@/components/ui/EmptyState'
import SectionTitle from '@/components/ui/SectionTitle'
import SegmentedControl, { type SegmentOption } from '@/components/ui/SegmentedControl'
import { languageTotals } from '@/domain/counts'
import { categoryProgress, languageProgress } from '@/domain/progress'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { useFavoriteCount } from '@/store/favoritesStore'
import { useLearnedIndex } from '@/store/learnedStore'
import { type CategoryLayout, setCategoryLayout, useSettings } from '@/store/settingsStore'
import CategoryCard from './CategoryCard'
import HomeHero from './HomeHero'
import HomeStats from './HomeStats'

const LAYOUTS: SegmentOption<CategoryLayout>[] = [
  { value: 'grid', label: <LayoutGrid size={14} />, title: 'Kartochkalar' },
  { value: 'list', label: <List size={14} />, title: "Ro'yxat" },
]

/** Tanlangan tilning bo'limlari ro'yxati (Android'dagi HomeScreen). Tillar orasida navbar'dagi panel orqali o'tiladi. */
export default function HomePage() {
  const { language } = useLanguageData()
  const favoriteCount = useFavoriteCount()
  const learned = useLearnedIndex()
  const { categoryLayout } = useSettings()
  useDocumentTitle(language.name)

  const totals = languageTotals(language)
  const hasCategories = language.categories.length > 0

  return (
    <div className="space-y-6">
      <HomeHero language={language} categoryCount={totals.categories} progress={languageProgress(learned, language)} />
      <HomeStats totals={totals} favoriteCount={favoriteCount} />

      <section>
        <SectionTitle
          actions={
            hasCategories && (
              <SegmentedControl label="Bo'limlar ko'rinishi" options={LAYOUTS} value={categoryLayout} onChange={setCategoryLayout} />
            )
          }
        >
          Bo'limlar
        </SectionTitle>
        {!hasCategories ? (
          <EmptyState icon={Code} title="Bu til uchun kontent tayyorlanmoqda" message="Tez orada yangi mavzular qo'shiladi." />
        ) : (
          <div className={categoryLayout === 'list' ? 'flex flex-col gap-2' : 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'}>
            {language.categories.map((category, position) => (
              <CategoryCard
                key={category.id}
                languageId={language.id}
                category={category}
                position={position + 1}
                layout={categoryLayout}
                progress={categoryProgress(learned, language.id, category)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
