import { Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import LoadingState from '@/components/ui/LoadingState'
import PageHeader from '@/components/ui/PageHeader'
import Pill from '@/components/ui/Pill'
import { encodeFavoriteKey } from '@/domain/favoriteKey'
import { formatCount } from '@/lib/format'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { useFavorites } from '@/store/favoritesStore'
import FavoriteRow from './FavoriteRow'
import { useResolvedFavorites } from './useResolvedFavorites'

/** Barcha tillardagi sevimli misollar — eng oxirgi qo'shilgani tepada (Android'dagi FavoritesScreen). */
export default function FavoritesPage() {
  useDocumentTitle('Sevimlilar')
  const items = useResolvedFavorites(useFavorites())

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        title="Sevimlilar"
        description="Saqlangan misollar — barcha tillar bo'yicha"
        actions={items && items.length > 0 ? <Pill icon={Star}>{formatCount(items.length)} ta misol</Pill> : undefined}
      />

      {items === null ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Sevimlilar ro'yxati bo'sh"
          message="Misol yonidagi ☆ belgisini bosib, uni shu yerga qo'shing."
        />
      ) : (
        <Card>
          <ul className="divide-y divide-neutral-200">
            {items.map((item) => (
              <li key={encodeFavoriteKey(item.key)}>
                <FavoriteRow item={item} />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
