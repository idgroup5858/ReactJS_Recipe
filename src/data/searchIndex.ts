import type { Category, CodeExample, ContentBlock, Topic } from '@/domain/types'
import { loadLanguage } from './contentRepository'

export type SearchResult =
  | { kind: 'topic'; category: Category; topic: Topic }
  | { kind: 'example'; category: Category; topic: Topic; example: CodeExample }

interface Entry {
  result: SearchResult
  text: string
}

export const MAX_SEARCH_RESULTS = 100

/**
 * Bitta til uchun qidiruv indeksi (Android'dagi SearchIndex bilan bir xil). Har bir mavzu va misolning kichik
 * harfli matni bir marta tayyorlanadi — keyingi har bir so'rov faqat tayyor satrlar ichidan qidiradi.
 */
export class SearchIndex {
  private readonly topicEntries: Entry[] = []
  private readonly exampleEntries: Entry[] = []

  constructor(categories: Category[]) {
    for (const category of categories) {
      for (const topic of category.topics) {
        this.topicEntries.push({ result: { kind: 'topic', category, topic }, text: topicSearchableText(topic) })
        for (const example of topic.examples) {
          const text = [example.title, example.description, example.code].filter(Boolean).join(' ').toLowerCase()
          this.exampleEntries.push({ result: { kind: 'example', category, topic, example }, text })
        }
      }
    }
  }

  /** Mavzular birinchi chiqadi — foydalanuvchi odatda aynan mavzuni qidiradi. */
  search(terms: string[], limit = MAX_SEARCH_RESULTS): SearchResult[] {
    const results: SearchResult[] = []
    for (const entries of [this.topicEntries, this.exampleEntries]) {
      for (const entry of entries) {
        if (terms.every((term) => entry.text.includes(term))) {
          results.push(entry.result)
          if (results.length === limit) return results
        }
      }
    }
    return results
  }
}

export function searchTerms(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter((term) => term.length > 0)
}

function blockText(block: ContentBlock): string {
  switch (block.type) {
    case 'heading':
    case 'paragraph':
    case 'note':
      return block.text
    case 'list':
      return block.items.join(' ')
    case 'snippet':
      return block.code
    case 'table':
      return block.rows.flat().join(' ')
  }
}

function topicSearchableText(topic: Topic): string {
  return [topic.title, topic.summary, ...topic.blocks.map(blockText)].join(' ').toLowerCase()
}

const indexRequests = new Map<string, Promise<SearchIndex>>()

/** Indeks til bo'yicha bir marta quriladi va keyingi qidiruvlar uchun saqlanadi. */
export function loadSearchIndex(languageId: string): Promise<SearchIndex> {
  let request = indexRequests.get(languageId)
  if (!request) {
    request = loadLanguage(languageId).then((categories) => new SearchIndex(categories))
    request.catch(() => indexRequests.delete(languageId))
    indexRequests.set(languageId, request)
  }
  return request
}
