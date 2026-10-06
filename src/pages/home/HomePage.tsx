import { Code } from 'lucide-react'
import { useLanguageData } from '@/app/routeData'
import EmptyState from '@/components/ui/EmptyState'
import SectionTitle from '@/components/ui/SectionTitle'
import { languageTotals } from '@/domain/counts'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { useFavoriteCount } from '@/store/favoritesStore'
import CategoryCard from './CategoryCard'
import HomeHero from './HomeHero'
import HomeStats from './HomeStats'

/** Tanlangan tilning bo'limlari ro'yxati (Android'dagi HomeScreen). Tillar orasida navbar'dagi panel orqali o'tiladi. */
export default function HomePage() {
  const { language } = useLanguageData()
  const favoriteCount = useFavoriteCount()
  useDocumentTitle(language.name)

  const totals = languageTotals(language)

  return (
    <div className="space-y-6">
      <HomeHero language={language} categoryCount={totals.categories} />
      <HomeStats totals={totals} favoriteCount={favoriteCount} />

      <section>
        <SectionTitle>Bo'limlar</SectionTitle>
        {language.categories.length === 0 ? (
          <EmptyState icon={Code} title="Bu til uchun kontent tayyorlanmoqda" message="Tez orada yangi mavzular qo'shiladi." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {language.categories.map((category, position) => (
              <CategoryCard key={category.id} languageId={language.id} category={category} position={position + 1} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
