import type { CategorySummary, ContentIndexData, ProgrammingLanguage } from '@/domain/types'

/** `index.json` ustidagi qulay so'rovlar: tilni va bo'limni id bo'yicha topish. */
export class ContentIndex {
  /** katalogdagi barcha tillar ("Tez kunda" bo'lganlari ham) — Android'dagi LanguageCatalog tartibida */
  readonly languages: ProgrammingLanguage[]
  /** kontenti tayyor tillar; birinchisi standart til hisoblanadi */
  readonly availableLanguages: ProgrammingLanguage[]
  private readonly languagesById: Map<string, ProgrammingLanguage>

  constructor(data: ContentIndexData) {
    this.languages = data.languages
    this.availableLanguages = data.languages.filter((language) => language.isAvailable)
    this.languagesById = new Map(data.languages.map((language) => [language.id, language]))
  }

  language(languageId: string | undefined): ProgrammingLanguage | undefined {
    return languageId === undefined ? undefined : this.languagesById.get(languageId)
  }

  category(languageId: string | undefined, categoryId: string | undefined): CategorySummary | undefined {
    return this.language(languageId)?.categories.find((category) => category.id === categoryId)
  }
}
