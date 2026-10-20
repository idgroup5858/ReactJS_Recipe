import { decodeFavoriteKey, encodeFavoriteKey, type FavoriteKey } from '@/domain/favoriteKey'
import { type LearnedIndex, topicPath } from '@/domain/progress'
import { createStore, useStore } from './createStore'
import { onStorageChange, readJson, writeJson } from './storage'
import { LEARNED_STORAGE_KEY } from './storageKeys'

/** "Tushunarli" deb belgilangan misollar — sevimlilar kabi kodlangan kalitlar ro'yxati sifatida saqlanadi. */
function read(): string[] {
  const raw = readJson(LEARNED_STORAGE_KEY)
  if (!Array.isArray(raw)) return []
  const valid = raw.filter((item): item is string => typeof item === 'string' && decodeFavoriteKey(item) !== null)
  return [...new Set(valid)]
}

const learnedStore = createStore<string[]>(read())

onStorageChange(LEARNED_STORAGE_KEY, () => learnedStore.set(read()))

function save(next: string[]): void {
  learnedStore.set(next)
  writeJson(LEARNED_STORAGE_KEY, next)
}

export function toggleLearned(key: FavoriteKey): void {
  const encoded = encodeFavoriteKey(key)
  const current = learnedStore.get()
  save(current.includes(encoded) ? current.filter((item) => item !== encoded) : [...current, encoded])
}

/** Mavzudagi misollarni birdaniga tushunarli deb belgilaydi ([learned] = true) yoki belgilarni olib tashlaydi. */
export function setTopicLearned(
  languageId: string,
  categoryId: string,
  topicId: string,
  exampleIds: readonly string[],
  learned: boolean,
): void {
  const keys = exampleIds.map((exampleId) => encodeFavoriteKey({ languageId, categoryId, topicId, exampleId }))
  const current = learnedStore.get()
  if (learned) {
    const existing = new Set(current)
    const added = keys.filter((key) => !existing.has(key))
    if (added.length > 0) save([...current, ...added])
  } else {
    const removed = new Set(keys)
    const next = current.filter((item) => !removed.has(item))
    if (next.length !== current.length) save(next)
  }
}

/** Barcha "tushunarli" belgilarini o'chiradi; [languageId] berilsa — faqat shu tilnikini. */
export function clearLearned(languageId?: string): void {
  const current = learnedStore.get()
  const next = languageId === undefined ? [] : current.filter((item) => decodeFavoriteKey(item)?.languageId !== languageId)
  if (next.length !== current.length) save(next)
}

// indeks holat o'zgargandagina bir marta quriladi — bosh sahifadagi o'nlab kartochka uni birgalikda ishlatadi
const indexCache = new WeakMap<string[], LearnedIndex>()

function indexOf(encoded: string[]): LearnedIndex {
  const cached = indexCache.get(encoded)
  if (cached) return cached
  const index = new Map<string, Set<string>>()
  for (const item of encoded) {
    const key = decodeFavoriteKey(item)
    if (!key) continue
    const path = topicPath(key.languageId, key.categoryId, key.topicId)
    const ids = index.get(path) ?? new Set<string>()
    ids.add(key.exampleId)
    index.set(path, ids)
  }
  indexCache.set(encoded, index)
  return index
}

export function useLearnedIndex(): LearnedIndex {
  return indexOf(useStore(learnedStore))
}

const EMPTY: ReadonlySet<string> = new Set()

/** Bitta mavzudagi tushunarli deb belgilangan misollar id'lari. */
export function useTopicLearnedIds(languageId: string, categoryId: string, topicId: string): ReadonlySet<string> {
  return useLearnedIndex().get(topicPath(languageId, categoryId, topicId)) ?? EMPTY
}
