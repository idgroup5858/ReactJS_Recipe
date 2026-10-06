import { useLoaderData, useMatches, useRouteLoaderData, type Params } from 'react-router'
import type { ContentIndex } from '@/data/contentIndex'
import { useSettings } from '@/store/settingsStore'
import type { CategoryData, LanguageData, RootData, TopicData } from './loaders'

/*
 * Loader ma'lumotlarini tiplangan holda o'qish. ContentIndex sinf bo'lgani uchun react-router'ning
 * serializatsiya tiplari o'rniga aniq tiplar ishlatiladi.
 */

export const ROOT_ROUTE_ID = 'root'
export const LANGUAGE_ROUTE_ID = 'language'

export function useContentIndex(): ContentIndex {
  return (useRouteLoaderData(ROOT_ROUTE_ID) as RootData).index
}

/** `/:lang/...` ichidagi sahifalar uchun. */
export function useLanguageData(): LanguageData {
  return useRouteLoaderData(LANGUAGE_ROUTE_ID) as LanguageData
}

export const useCategoryData = () => useLoaderData() as CategoryData

export const useTopicData = () => useLoaderData() as TopicData

/** Eng chuqur mos kelgan route parametrlari — layout komponentlari ham bola route parametrlarini ko'radi. */
export function useCurrentParams(): Params {
  const matches = useMatches()
  return matches[matches.length - 1]?.params ?? {}
}

/** Kontent sahifalarida URL'dagi til, qolganlarida (qidiruv, sevimlilar...) sozlamalarda tanlangan til. */
export function useActiveLanguageId(): string {
  const { lang } = useCurrentParams()
  const { selectedLanguageId } = useSettings()
  return lang ?? selectedLanguageId
}
