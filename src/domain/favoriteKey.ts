/** Sevimli misolning noyob manzili. Saqlash uchun bitta satrga aylantiriladi (Android'dagi FavoriteKey bilan bir xil). */
export interface FavoriteKey {
  languageId: string
  categoryId: string
  topicId: string
  exampleId: string
}

const SEPARATOR = '|'

export function encodeFavoriteKey(key: FavoriteKey): string {
  return [key.languageId, key.categoryId, key.topicId, key.exampleId].join(SEPARATOR)
}

export function decodeFavoriteKey(raw: string): FavoriteKey | null {
  const parts = raw.split(SEPARATOR)
  if (parts.length !== 4) return null
  const [languageId, categoryId, topicId, exampleId] = parts
  return { languageId, categoryId, topicId, exampleId }
}
