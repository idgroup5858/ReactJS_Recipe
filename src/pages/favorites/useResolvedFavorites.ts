import { useEffect, useState } from 'react'
import { useContentIndex } from '@/app/routeData'
import type { ContentIndex } from '@/data/contentIndex'
import { loadCategory } from '@/data/contentRepository'
import { encodeFavoriteKey, type FavoriteKey } from '@/domain/favoriteKey'
import type { ProgrammingLanguage } from '@/domain/types'

export interface FavoriteItem {
  key: FavoriteKey
  language: ProgrammingLanguage
  exampleTitle: string
  /** "Bo'lim → Mavzu" */
  path: string
  to: string
}

/** Kontentda endi mavjud bo'lmagan misollar ro'yxatdan tushib qoladi (Android'dagi FavoritesViewModel.resolve). */
async function resolveFavorites(index: ContentIndex, keys: FavoriteKey[]): Promise<FavoriteItem[]> {
  const items = await Promise.all(
    keys.map(async (key): Promise<FavoriteItem | null> => {
      const language = index.language(key.languageId)
      if (!language?.isAvailable || !index.category(key.languageId, key.categoryId)) return null
      try {
        const category = await loadCategory(key.languageId, key.categoryId)
        const topic = category.topics.find((item) => item.id === key.topicId)
        const example = topic?.examples.find((item) => item.id === key.exampleId)
        if (!topic || !example) return null
        return {
          key,
          language,
          exampleTitle: example.title.replaceAll('`', ''),
          path: `${category.title} → ${topic.title}`,
          to: `/${key.languageId}/${key.categoryId}/${key.topicId}#${key.exampleId}`,
        }
      } catch {
        return null
      }
    }),
  )
  return items.filter((item) => item !== null)
}

/**
 * Sevimlilarni ko'rsatish uchun kerakli bo'limlarni yuklaydi. `null` — birinchi marta yuklanmoqda.
 * Biror misol o'chirilganda ro'yxat qayta yuklanguncha eski natijadan darhol olib tashlanadi.
 */
export function useResolvedFavorites(keys: FavoriteKey[]): FavoriteItem[] | null {
  const index = useContentIndex()
  const [resolved, setResolved] = useState<{ keys: FavoriteKey[]; items: FavoriteItem[] } | null>(null)

  useEffect(() => {
    let cancelled = false
    void resolveFavorites(index, keys).then((items) => {
      if (!cancelled) setResolved({ keys, items })
    })
    return () => {
      cancelled = true
    }
  }, [index, keys])

  if (!resolved) return null
  if (resolved.keys === keys) return resolved.items
  const current = new Set(keys.map(encodeFavoriteKey))
  return resolved.items.filter((item) => current.has(encodeFavoriteKey(item.key)))
}
