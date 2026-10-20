import type { CategorySummary, ProgrammingLanguage, TopicSummary } from './types'

/** "Tushunarli" deb belgilangan misollar: `til|bo'lim|mavzu` → misol id'lari. */
export type LearnedIndex = ReadonlyMap<string, ReadonlySet<string>>

/** O'zlashtirish holati: nechta misol tushunarli deb belgilangan ([done]) va jami nechta ([total]). */
export interface Progress {
  done: number
  total: number
}

export function topicPath(languageId: string, categoryId: string, topicId: string): string {
  return [languageId, categoryId, topicId].join('|')
}

const EXAMPLE_ID_RE = /^ex(\d+)$/

/** Kontent yangilanib misollar kamaygan bo'lsa, endi mavjud bo'lmagan id'lar hisobga olinmaydi. */
export function topicProgress(index: LearnedIndex, languageId: string, categoryId: string, topic: TopicSummary): Progress {
  let done = 0
  for (const id of index.get(topicPath(languageId, categoryId, topic.id)) ?? []) {
    const number = Number(EXAMPLE_ID_RE.exec(id)?.[1])
    if (number >= 1 && number <= topic.exampleCount) done++
  }
  return { done, total: topic.exampleCount }
}

export function categoryProgress(index: LearnedIndex, languageId: string, category: CategorySummary): Progress {
  return category.topics.reduce<Progress>(
    (sum, topic) => {
      const progress = topicProgress(index, languageId, category.id, topic)
      return { done: sum.done + progress.done, total: sum.total + progress.total }
    },
    { done: 0, total: 0 },
  )
}

export function languageProgress(index: LearnedIndex, language: ProgrammingLanguage): Progress {
  return language.categories.reduce<Progress>(
    (sum, category) => {
      const progress = categoryProgress(index, language.id, category)
      return { done: sum.done + progress.done, total: sum.total + progress.total }
    },
    { done: 0, total: 0 },
  )
}

/** Butun foiz pastga yaxlitlanadi: hammasi belgilanmaguncha 100% ko'rinmaydi. */
export function progressPercent({ done, total }: Progress): number {
  return total === 0 ? 0 : Math.floor((done * 100) / total)
}
