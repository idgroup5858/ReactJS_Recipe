import { Info, List, SlidersHorizontal } from 'lucide-react'
import { useSearchParams } from 'react-router'
import BackLink from '@/components/ui/BackLink'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl, { type SegmentOption } from '@/components/ui/SegmentedControl'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import AboutTab from './AboutTab'
import LanguagesTab from './LanguagesTab'
import PreferencesTab from './PreferencesTab'

type SettingsTab = 'languages' | 'preferences' | 'about'

const TABS: SegmentOption<SettingsTab>[] = [
  { value: 'languages', label: <><List size={14} /> Tillar</> },
  { value: 'preferences', label: <><SlidersHorizontal size={14} /> Sozlamalar</> },
  { value: 'about', label: <><Info size={14} /> Ilova haqida</> },
]

/** Sozlamalar: Android'dagi uchta tab, tanlangan tab manzilda (`?tab=`) saqlanadi. */
export default function SettingsPage() {
  useDocumentTitle('Sozlamalar')
  const [params, setParams] = useSearchParams()
  const tab = TABS.find((option) => option.value === params.get('tab'))?.value ?? 'languages'

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <BackLink to="/" label="Bo'limlar" history />
      <PageHeader title="Sozlamalar" description="Interfeys ko'rinishini o'zingizga moslang" />
      <SegmentedControl
        label="Sozlamalar bo'limlari"
        options={TABS}
        value={tab}
        onChange={(value) => setParams({ tab: value }, { replace: true, preventScrollReset: true })}
      />
      {tab === 'languages' && <LanguagesTab />}
      {tab === 'preferences' && <PreferencesTab />}
      {tab === 'about' && <AboutTab />}
    </div>
  )
}
