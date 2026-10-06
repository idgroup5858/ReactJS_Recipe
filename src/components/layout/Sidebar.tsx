import { LayoutGrid, Search, Settings, Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { useActiveLanguageId, useContentIndex } from '@/app/routeData'
import { useFavoriteCount } from '@/store/favoritesStore'
import Brand from './Brand'
import SidebarLink from './SidebarLink'

function SidebarSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 truncate px-3 text-[10px] font-semibold tracking-[0.2em] text-neutral-400 uppercase">{title}</p>
      <nav className="space-y-0.5">{children}</nav>
    </div>
  )
}

/**
 * Chap panel: asosiy bo'limlar va tanlangan tilning barcha bo'limlari o'rganish tartibida.
 * Telefonda ustma-ust ochiladi va band tanlanganda yopiladi ([onNavigate]).
 */
export default function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const index = useContentIndex()
  const languageId = useActiveLanguageId()
  const language = index.language(languageId)
  const favoriteCount = useFavoriteCount()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex h-screen w-[248px] shrink-0 flex-col border-r border-neutral-200 bg-white lg:sticky lg:top-0">
      <Link to="/" onClick={onNavigate} className="flex h-14 shrink-0 items-center border-b border-neutral-200 px-5">
        <Brand />
      </Link>

      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        <SidebarSection title="Asosiy">
          <SidebarLink to={`/${languageId}`} end label="Bo'limlar" icon={<LayoutGrid size={18} />} onNavigate={onNavigate} />
          <SidebarLink to="/search" label="Qidiruv" icon={<Search size={18} />} onNavigate={onNavigate} />
          <SidebarLink to="/favorites" label="Sevimlilar" icon={<Star size={18} />} badge={favoriteCount} onNavigate={onNavigate} />
        </SidebarSection>

        {language && language.categories.length > 0 && (
          <SidebarSection title={`${language.name} · bo'limlar`}>
            {language.categories.map((category, position) => (
              <SidebarLink
                key={category.id}
                to={`/${language.id}/${category.id}`}
                label={category.title}
                icon={<span className="text-[11px] font-semibold tabular-nums">{String(position + 1).padStart(2, '0')}</span>}
                onNavigate={onNavigate}
              />
            ))}
          </SidebarSection>
        )}
      </div>

      <div className="shrink-0 border-t border-neutral-200 p-3">
        <SidebarLink to="/settings" label="Sozlamalar" icon={<Settings size={18} />} onNavigate={onNavigate} />
      </div>
    </aside>
  )
}
