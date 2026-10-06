/**
 * Kontent modellari. Android ilovadagi `domain/model` bilan bir xil va `public/data` dagi JSON tuzilmasiga mos
 * (JSON Android loyihasidagi `WebContentExportTest` tomonidan yaratiladi — `npm run sync:data`).
 */

export type NoteKind = 'info' | 'tip' | 'warning'

/**
 * Mavzuning nazariy qismini tashkil qiluvchi bloklar. Matnli bloklarda yengil belgilash ishlatiladi:
 * `kod` — monospace, **qalin** — qalin matn.
 */
export type ContentBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'note'; kind: NoteKind; text: string }
  | { type: 'snippet'; code: string }
  | { type: 'table'; headers: string[]; rows: string[][] }

export interface CodeExample {
  /** mavzu ichidagi tartib raqamidan olinadi ("ex1", "ex2", ...) — sevimlilar shu id bilan saqlanadi */
  id: string
  title: string
  description?: string
  code: string
  output?: string
}

/** Bitta mavzu: avval nazariy qism ([blocks]), keyin amaliy misollar ([examples]). */
export interface Topic {
  id: string
  title: string
  summary: string
  blocks: ContentBlock[]
  examples: CodeExample[]
}

/** Bo'limning to'liq kontenti — `public/data/<til>/<bo'lim>.json`. */
export interface Category {
  id: string
  title: string
  description: string
  topics: Topic[]
}

/** Indeksdagi mavzu: nazariya va kodlarsiz, faqat ro'yxatlar uchun. */
export interface TopicSummary {
  id: string
  title: string
  summary: string
  exampleCount: number
}

export interface CategorySummary {
  id: string
  title: string
  description: string
  topics: TopicSummary[]
}

/**
 * Dasturlash tili. `isAvailable = false` bo'lsa, til sozlamalarda "Tez kunda" sifatida ko'rinadi.
 * `brandColor` — tilning rasmiy rangi, belgisi foni uchun.
 */
export interface ProgrammingLanguage {
  id: string
  name: string
  shortLabel: string
  brandColor: string
  isAvailable: boolean
  categories: CategorySummary[]
}

/** `public/data/index.json` */
export interface ContentIndexData {
  languages: ProgrammingLanguage[]
}
