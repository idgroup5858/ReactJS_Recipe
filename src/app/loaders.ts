import { redirect, type LoaderFunctionArgs } from 'react-router'
import type { ContentIndex } from '@/data/contentIndex'
import { loadCategory, loadIndex } from '@/data/contentRepository'
import { configureLanguages, settingsStore } from '@/store/settingsStore'

/*
 * Route loader'lari — Android'dagi ViewModel'lar vazifasini bajaradi: sahifa chizilishidan oldin kerakli kontentni
 * tayyorlaydi. Bo'lim yoki mavzu tanlangan tilda bo'lmasa, Android'dagidek bosh sahifaga qaytariladi.
 * Loader'lar parallel ishlaydi, shuning uchun har biri indeksni o'zi kutadi.
 */

let configuredIndex: ContentIndex | undefined

/** Indeks + til sozlamalarini tekshirish (bir marta). */
async function contentIndex(): Promise<ContentIndex> {
  const index = await loadIndex()
  if (configuredIndex !== index) {
    configuredIndex = index
    configureLanguages(index.availableLanguages.map((language) => language.id))
  }
  return index
}

export async function rootLoader() {
  return { index: await contentIndex() }
}

/** `/` — oxirgi tanlangan til sahifasiga. */
export async function homeRedirectLoader() {
  await contentIndex()
  return redirect(`/${settingsStore.get().selectedLanguageId}`)
}

export async function languageLoader({ params }: LoaderFunctionArgs) {
  const language = (await contentIndex()).language(params.lang)
  if (!language?.isAvailable) throw redirect('/')
  return { language }
}

export async function categoryLoader({ params }: LoaderFunctionArgs) {
  const category = (await contentIndex()).category(params.lang, params.categoryId)
  if (!category) throw redirect(`/${params.lang}`)
  return { category }
}

export async function topicLoader({ params }: LoaderFunctionArgs) {
  const { lang = '', categoryId = '', topicId } = params
  const summary = (await contentIndex()).category(lang, categoryId)
  if (!summary?.topics.some((topic) => topic.id === topicId)) throw redirect(`/${lang}`)
  const category = await loadCategory(lang, categoryId)
  const topic = category.topics.find((item) => item.id === topicId)
  if (!topic) throw redirect(`/${lang}`)
  return { category, topic }
}

export type RootData = Awaited<ReturnType<typeof rootLoader>>
export type LanguageData = Awaited<ReturnType<typeof languageLoader>>
export type CategoryData = Awaited<ReturnType<typeof categoryLoader>>
export type TopicData = Awaited<ReturnType<typeof topicLoader>>
