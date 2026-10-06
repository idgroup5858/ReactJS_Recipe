import { Trash2 } from 'lucide-react'
import { Link } from 'react-router'
import IconButton from '@/components/ui/IconButton'
import LanguageLogo from '@/components/ui/LanguageLogo'
import { removeFavorite } from '@/store/favoritesStore'
import type { FavoriteItem } from './useResolvedFavorites'

/** Sevimli misol qatori: tili, nomi, joylashuvi va o'chirish tugmasi. */
export default function FavoriteRow({ item }: { item: FavoriteItem }) {
  return (
    <div className="flex items-center gap-2 pr-3 transition-colors hover:bg-neutral-50">
      <Link to={item.to} className="group flex min-w-0 flex-1 items-center gap-3.5 py-3 pl-4">
        <LanguageLogo language={item.language} size={30} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-neutral-900 transition-colors group-hover:text-brand-700">
            {item.exampleTitle}
          </span>
          <span className="block truncate text-xs text-neutral-500">{item.path}</span>
        </span>
      </Link>
      <IconButton tone="danger" label="O'chirish" onClick={() => removeFavorite(item.key)}>
        <Trash2 size={16} />
      </IconButton>
    </div>
  )
}
