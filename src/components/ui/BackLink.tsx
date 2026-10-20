import { ChevronLeft } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router'

const linkClass = 'inline-flex max-w-full items-center gap-1 text-[13px] font-semibold text-neutral-500 transition-colors hover:text-brand-700'

type Props = {
  /** qaytiladigan sahifa (yuqori daraja) */
  to: string
  label: string
  /**
   * true — ilova ichida oldingi sahifa bo'lsa, brauzerning "orqaga"si kabi unga qaytadi (yorliq "Orqaga");
   * sahifa to'g'ridan-to'g'ri ochilgan bo'lsa — [to] ga
   */
  history?: boolean
}

/** Sahifa tepasidagi "‹ Orqaga" havolasi (ReactJS_Holy dagidek): mavzudan bo'limga, bo'limdan bosh sahifaga. */
export default function BackLink({ to, label, history = false }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  // "default" — ilova shu sahifadan ochilgan, tarixda ilovaning oldingi sahifasi yo'q
  const canGoBack = history && location.key !== 'default'

  if (canGoBack) {
    return (
      <button type="button" onClick={() => navigate(-1)} className={`${linkClass} cursor-pointer`}>
        <ChevronLeft size={16} className="shrink-0" />
        Orqaga
      </button>
    )
  }
  return (
    <Link to={to} className={linkClass}>
      <ChevronLeft size={16} className="shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  )
}
