import { PanelLeft, Search, Settings, Star } from 'lucide-react'
import BackButton from './BackButton'
import Breadcrumbs from './Breadcrumbs'
import { HeaderButton, HeaderLink } from './HeaderButton'
import LanguageMenu from './LanguageMenu'
import LanguageTabs from './LanguageTabs'
import ThemeToggle from './ThemeToggle'

/**
 * Yuqoridagi sticky panel (hr-ui header): chapda menyu, "orqaga" tugmasi va joylashuv, o'rtada sozlamalarda yoqilgan
 * tillar, o'ngda amallar. Telefonda tillar uchun joy yo'q — ular o'ngdagi ochiladigan menyuda.
 */
export default function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  return (
    // @container: tillar paneli nomlarni ekran emas, header kengligiga qarab ko'rsatadi (sidebar ochiq/yopiqligi hisobga olinadi)
    <header className="@container sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-4 sm:px-6">
      {/* chap va o'ng qismlar teng kenglikda — tillar paneli aynan o'rtada turadi */}
      <div className="flex min-w-0 flex-1 items-center gap-3 md:basis-0">
        <HeaderButton label="Menyu" onClick={onToggleSidebar}>
          <PanelLeft size={18} />
        </HeaderButton>
        <div className="flex min-w-0 items-center gap-1.5">
          <BackButton />
          <Breadcrumbs />
        </div>
      </div>

      <div className="hidden shrink-0 md:block">
        <LanguageTabs />
      </div>

      <div className="flex shrink-0 items-center justify-end gap-1 md:flex-1 md:basis-0">
        <HeaderLink to="/search" label="Qidirish (Ctrl+K)">
          <Search size={18} />
        </HeaderLink>
        <HeaderLink to="/favorites" label="Sevimlilar" className="hidden sm:flex">
          <Star size={18} />
        </HeaderLink>
        <ThemeToggle />
        {/* telefonda sozlamalar sidebar pastida turadi — sarlavhaga joy qolsin */}
        <HeaderLink to="/settings" label="Sozlamalar" className="hidden sm:flex">
          <Settings size={18} />
        </HeaderLink>
        <span className="mx-2 hidden h-6 w-px bg-neutral-200 sm:block md:hidden" />
        <div className="md:hidden">
          <LanguageMenu />
        </div>
      </div>
    </header>
  )
}
