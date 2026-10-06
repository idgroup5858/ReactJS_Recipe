import { ArrowLeft, FileQuestion } from 'lucide-react'
import { Link } from 'react-router'
import EmptyState from '@/components/ui/EmptyState'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('Sahifa topilmadi')
  return (
    <EmptyState
      icon={FileQuestion}
      title="Sahifa topilmadi"
      message="Manzil noto'g'ri yoki bu sahifa o'chirilgan."
      action={
        <Link to="/" className="btn-primary flex h-9 items-center gap-2 rounded px-5 text-xs font-semibold tracking-[0.12em] uppercase">
          <ArrowLeft size={14} />
          Bosh sahifaga
        </Link>
      }
    />
  )
}
