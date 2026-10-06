import { useState } from 'react'
import { Outlet, ScrollRestoration, useLocation, type Location } from 'react-router'
import { useSearchShortcut } from '@/app/useSearchShortcut'
import { useMediaQuery } from '@/lib/useMediaQuery'
import Header from './Header'
import Sidebar from './Sidebar'

/**
 * Ilova qobig'i (hr-ui dagi DashboardLayout): kompyuterda sidebar yon tomonda turadi va yashirilishi mumkin,
 * telefonda esa qora fon ustida ochilib, band tanlanganda yopiladi.
 */
export default function AppLayout() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [desktopOpen, setDesktopOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  useSearchShortcut()

  const sidebarOpen = isDesktop ? desktopOpen : mobileOpen
  const toggleSidebar = () => (isDesktop ? setDesktopOpen((open) => !open) : setMobileOpen((open) => !open))
  const closeOnMobile = () => {
    if (!isDesktop) setMobileOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-page text-neutral-900">
      {!isDesktop && mobileOpen && <div onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/30" />}
      {sidebarOpen && <Sidebar onNavigate={closeOnMobile} />}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 sm:p-6">
          {/* har bir sahifa yangidan quriladi: holat (masalan, nusxalash belgisi) mavzular orasida aralashmaydi */}
          <div key={pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      <ScrollRestoration getKey={scrollKey} />
    </div>
  )
}

/**
 * Manzil qo'lda kiritilgan yoki sahifa yangilangan bo'lsa, brauzer tarixidagi yozuvning kaliti doim "default" bo'ladi —
 * shunda boshqa sahifaning saqlangan skroll joyi tiklanib, `#ex12` e'tiborsiz qolardi. Bunday holatda manzilning o'zi kalit.
 */
function scrollKey(location: Location): string {
  return location.key === 'default' ? `${location.pathname}${location.search}${location.hash}` : location.key
}
