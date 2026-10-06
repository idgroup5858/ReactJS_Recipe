import type { Category, ContentIndexData } from '@/domain/types'
import { ContentIndex } from './contentIndex'

/**
 * Kontent statik JSON fayllardan olinadi (`public/data`, Android ilovadan eksport qilingan):
 * - `index.json` — tillar, bo'limlar va mavzular ro'yxati (ilova ochilganda bir marta);
 * - `<til>/<bo'lim>.json` — bo'limning to'liq kontenti, birinchi kerak bo'lganda.
 * Har bir fayl bir marta yuklanadi va xotirada qoladi (Android'dagi InMemoryContentRepository kabi).
 */

const DATA_URL = `${import.meta.env.BASE_URL}data`

let indexRequest: Promise<ContentIndex> | undefined
const categoryRequests = new Map<string, Promise<Category>>()

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${DATA_URL}/${path}`)
  if (!response.ok) throw new Error(`Ma'lumotni yuklab bo'lmadi: ${path} (${response.status})`)
  return (await response.json()) as T
}

/** Muvaffaqiyatsiz so'rov keshda qolmaydi — keyingi urinish faylni qayta so'raydi. */
function remember<T>(request: Promise<T>, forget: () => void): Promise<T> {
  request.catch(forget)
  return request
}

export function loadIndex(): Promise<ContentIndex> {
  indexRequest ??= remember(
    fetchJson<ContentIndexData>('index.json').then((data) => new ContentIndex(data)),
    () => (indexRequest = undefined),
  )
  return indexRequest
}

export function loadCategory(languageId: string, categoryId: string): Promise<Category> {
  const key = `${languageId}/${categoryId}`
  let request = categoryRequests.get(key)
  if (!request) {
    request = remember(fetchJson<Category>(`${key}.json`), () => categoryRequests.delete(key))
    categoryRequests.set(key, request)
  }
  return request
}

/** Tilning barcha bo'limlari (qidiruv uchun). Bo'limlar parallel yuklanadi. */
export async function loadLanguage(languageId: string): Promise<Category[]> {
  const language = (await loadIndex()).language(languageId)
  if (!language) return []
  return Promise.all(language.categories.map((category) => loadCategory(languageId, category.id)))
}
