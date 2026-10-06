import { useEffect } from 'react'
import { Outlet } from 'react-router'
import { useLanguageData } from '@/app/routeData'
import { selectLanguage } from '@/store/settingsStore'

/** `/:lang/...` sahifalari: URL'dagi til sozlamalarda ham tanlanadi (qidiruv va `/` shu tilni ishlatadi). */
export default function LanguageScope() {
  const { language } = useLanguageData()

  useEffect(() => {
    selectLanguage(language.id)
  }, [language.id])

  return <Outlet />
}
