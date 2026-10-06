import type { CategorySummary, ProgrammingLanguage } from './types'

export function categoryExampleCount(category: CategorySummary): number {
  return category.topics.reduce((sum, topic) => sum + topic.exampleCount, 0)
}

export interface LanguageTotals {
  categories: number
  topics: number
  examples: number
}

export function languageTotals(language: ProgrammingLanguage): LanguageTotals {
  return language.categories.reduce<LanguageTotals>(
    (totals, category) => ({
      categories: totals.categories + 1,
      topics: totals.topics + category.topics.length,
      examples: totals.examples + categoryExampleCount(category),
    }),
    { categories: 0, topics: 0, examples: 0 },
  )
}
