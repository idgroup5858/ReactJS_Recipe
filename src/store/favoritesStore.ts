import { useMemo } from 'react'
import { decodeFavoriteKey, encodeFavoriteKey, type FavoriteKey } from '@/domain/favoriteKey'
import { createStore, useStore } from './createStore'
import { onStorageChange, readJson, writeJson } from './storage'
import { FAVORITES_STORAGE_KEY } from './storageKeys'

/** Sevimlilar qo'shilish tartibida (eskisi birinchi) kodlangan kalitlar ro'yxati sifatida saqlanadi. */
function read(): string[] {
  const raw = readJson(FAVORITES_STORAGE_KEY)
  if (!Array.isArray(raw)) return []
  const valid = raw.filter((item): item is string => typeof item === 'string' && decodeFavoriteKey(item) !== null)
  return [...new Set(valid)]
}

const favoritesStore = createStore<string[]>(read())

onStorageChange(FAVORITES_STORAGE_KEY, () => favoritesStore.set(read()))

function save(next: string[]): void {
  favoritesStore.set(next)
  writeJson(FAVORITES_STORAGE_KEY, next)
}

export function toggleFavorite(key: FavoriteKey): void {
  const encoded = encodeFavoriteKey(key)
  const current = favoritesStore.get()
  save(current.includes(encoded) ? current.filter((item) => item !== encoded) : [...current, encoded])
}

export function removeFavorite(key: FavoriteKey): void {
  const encoded = encodeFavoriteKey(key)
  save(favoritesStore.get().filter((item) => item !== encoded))
}

/** Barcha sevimlilar — eng oxirgi qo'shilgani birinchi. */
export function useFavorites(): FavoriteKey[] {
  const encoded = useStore(favoritesStore)
  return useMemo(
    () => encoded.toReversed().flatMap((item) => decodeFavoriteKey(item) ?? []),
    [encoded],
  )
}

export function useFavoriteCount(): number {
  return useStore(favoritesStore).length
}

/** Bitta mavzudagi sevimli misollar id'lari. */
export function useTopicFavoriteIds(languageId: string, categoryId: string, topicId: string): ReadonlySet<string> {
  const encoded = useStore(favoritesStore)
  return useMemo(() => {
    const ids = new Set<string>()
    for (const item of encoded) {
      const key = decodeFavoriteKey(item)
      if (key && key.languageId === languageId && key.categoryId === categoryId && key.topicId === topicId) {
        ids.add(key.exampleId)
      }
    }
    return ids
  }, [encoded, languageId, categoryId, topicId])
}
