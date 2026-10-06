import { useMemo } from 'react'
import type { ProgrammingLanguage } from '@/domain/types'
import { useSettings } from '@/store/settingsStore'
import { useContentIndex } from './routeData'

/** Sozlamalarda yoqilgan va kontenti tayyor tillar — katalog tartibida (Android'dagi toLanguageTabs). */
export function useEnabledLanguages(): ProgrammingLanguage[] {
  const index = useContentIndex()
  const { enabledLanguageIds } = useSettings()
  return useMemo(
    () => index.availableLanguages.filter((language) => enabledLanguageIds.includes(language.id)),
    [index, enabledLanguageIds],
  )
}
