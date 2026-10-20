import { ChevronLeft } from 'lucide-react'
import { useLocation, useMatches, useNavigate } from 'react-router'
import { collectCrumbs } from '@/app/routeHandle'
import { HeaderButton } from './HeaderButton'

/**
 * Header'dagi "orqaga" tugmasi — sahifa qancha pastga surilsa ham ko'rinib turadi. Joylashuvdagi yuqori darajaga
 * qaytaradi (mavzudan bo'limga, bo'limdan tilning bosh sahifasiga); qidiruv, sevimlilar va sozlamalarda — oldingi
 * sahifaga (ilova shu sahifadan ochilgan bo'lsa, bosh sahifaga). Tilning bosh sahifasida tugma yo'q.
 */
export default function BackButton() {
  const crumbs = collectCrumbs(useMatches())
  const navigate = useNavigate()
  // "default" — ilova shu sahifadan ochilgan, tarixda ilovaning oldingi sahifasi yo'q
  const canGoBack = useLocation().key !== 'default'

  const parent = crumbs.length >= 2 ? crumbs[crumbs.length - 2] : null
  if (parent?.to) {
    const to = parent.to
    return (
      <HeaderButton label={`Orqaga: ${parent.label}`} onClick={() => navigate(to)}>
        <ChevronLeft size={18} />
      </HeaderButton>
    )
  }
  // bitta bo'lak va uning havolasi bor — bu tilning bosh sahifasi, undan yuqori daraja yo'q
  if (crumbs.length === 0 || crumbs[0].to) return null
  return (
    <HeaderButton label="Orqaga" onClick={() => (canGoBack ? navigate(-1) : navigate('/'))}>
      <ChevronLeft size={18} />
    </HeaderButton>
  )
}
