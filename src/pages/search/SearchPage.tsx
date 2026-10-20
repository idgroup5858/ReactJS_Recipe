import { Search, TriangleAlert } from 'lucide-react'
import { useDeferredValue } from 'react'
import { useSearchParams } from 'react-router'
import { useContentIndex } from '@/app/routeData'
import { SEARCH_INPUT_ID } from '@/app/useSearchShortcut'
import BackLink from '@/components/ui/BackLink'
import EmptyState from '@/components/ui/EmptyState'
import LoadingState from '@/components/ui/LoadingState'
import PageHeader from '@/components/ui/PageHeader'
import SearchInput from '@/components/ui/SearchInput'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { useSettings } from '@/store/settingsStore'
import SearchResults from './SearchResults'
import { useLanguageSearch } from './useLanguageSearch'

/**
 * Mavzu va kod bo'yicha qidiruv (Android'dagi SearchScreen) — tanlangan til ichida. So'rov manzilda (`?q=`)
 * saqlanadi, shuning uchun natijadan orqaga qaytilganda ro'yxat joyida turadi.
 */
export default function SearchPage() {
  useDocumentTitle('Qidiruv')
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const deferredQuery = useDeferredValue(query)

  const { selectedLanguageId } = useSettings()
  const language = useContentIndex().language(selectedLanguageId)
  const search = useLanguageSearch(selectedLanguageId, deferredQuery)

  const setQuery = (value: string) => setParams(value ? { q: value } : {}, { replace: true, preventScrollReset: true })

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <BackLink to="/" label="Bo'limlar" history />
      <PageHeader
        title="Qidiruv"
        description={`${language?.name ?? ''} bo'yicha mavzular, nazariya va kodlar ichidan qidirish`}
      />
      <SearchInput
        inputId={SEARCH_INPUT_ID}
        value={query}
        onChange={setQuery}
        placeholder="Qidirish..."
        autoFocus
      />

      {search.status === 'idle' && (
        <EmptyState icon={Search} title="Mavzu yoki kod bo'yicha qidiring" message='Masalan: "interface", "massiv", "Promise", "switch"' />
      )}
      {search.status === 'loading' && <LoadingState label="Kontent tayyorlanmoqda..." />}
      {search.status === 'error' && (
        <EmptyState icon={TriangleAlert} title="Kontentni yuklab bo'lmadi" message="Internet aloqasini tekshirib, sahifani yangilang." />
      )}
      {search.status === 'ready' &&
        (search.results.length === 0 ? (
          <EmptyState icon={Search} title="Hech narsa topilmadi" />
        ) : (
          <SearchResults languageId={selectedLanguageId} results={search.results} />
        ))}
    </div>
  )
}
