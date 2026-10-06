import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { selectLanguage } from '@/store/settingsStore'
import { useCurrentParams } from './routeData'

/**
 * Tilni almashtirish. Kontent sahifasida ochiq bo'lim/mavzu yangi tilda ham ochilishga urinadi —
 * u yerda bo'lmasa loader bosh sahifaga qaytaradi (Android'dagi xatti-harakat). Boshqa sahifalarda faqat tanlanadi.
 */
export function useSwitchLanguage(): (languageId: string) => void {
  const navigate = useNavigate()
  const { lang, categoryId, topicId } = useCurrentParams()

  return useCallback(
    (languageId: string) => {
      if (lang === undefined) {
        selectLanguage(languageId)
        return
      }
      navigate(`/${[languageId, categoryId, topicId].filter(Boolean).join('/')}`)
    },
    [navigate, lang, categoryId, topicId],
  )
}
