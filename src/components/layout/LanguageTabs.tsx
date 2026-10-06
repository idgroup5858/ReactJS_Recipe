import { useActiveLanguageId } from '@/app/routeData'
import { useEnabledLanguages } from '@/app/useEnabledLanguages'
import { useSwitchLanguage } from '@/app/useSwitchLanguage'
import LanguageLogo from '@/components/ui/LanguageLogo'
import SegmentedControl from '@/components/ui/SegmentedControl'

/**
 * Navbar o'rtasidagi tillar paneli (Android'dagi LanguageTabs): sozlamalarda yoqilgan tillar katalog tartibida.
 * Header tor bo'lsa faqat logotip (joylashuv yo'li uchun joy qoladi), keng bo'lsa nomi ham ko'rinadi.
 */
export default function LanguageTabs() {
  const languages = useEnabledLanguages()
  const activeId = useActiveLanguageId()
  const switchLanguage = useSwitchLanguage()
  if (languages.length === 0) return null

  return (
    <SegmentedControl
      label="Tillar"
      value={activeId}
      onChange={(languageId) => {
        if (languageId !== activeId) switchLanguage(languageId)
      }}
      options={languages.map((language) => ({
        value: language.id,
        title: language.name,
        label: (
          <>
            <LanguageLogo language={language} size={16} />
            <span className="hidden @min-[68rem]:inline">{language.name}</span>
          </>
        ),
      }))}
    />
  )
}
