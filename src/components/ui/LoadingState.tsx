import { LoaderCircle } from 'lucide-react'

export default function LoadingState({ label = 'Yuklanmoqda...' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2.5 py-16 text-sm text-neutral-400">
      <LoaderCircle size={18} className="animate-spin text-brand-700" />
      {label}
    </div>
  )
}
