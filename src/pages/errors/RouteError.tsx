import { RotateCcw, TriangleAlert } from 'lucide-react'
import { isRouteErrorResponse, useRouteError } from 'react-router'
import EmptyState from '@/components/ui/EmptyState'

function describe(error: unknown): string {
  if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText}`
  if (error instanceof Error) return error.message
  return "Noma'lum xatolik"
}

/** Sahifa ma'lumotini yuklab bo'lmaganda (masalan, server ishlamayotganda) — layout joyida qoladi. */
export default function RouteError() {
  const error = useRouteError()
  return (
    <EmptyState
      icon={TriangleAlert}
      title="Ma'lumotni yuklab bo'lmadi"
      message={describe(error)}
      action={
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-primary flex h-9 items-center gap-2 rounded px-5 text-xs font-semibold tracking-[0.12em] uppercase"
        >
          <RotateCcw size={14} />
          Qayta urinish
        </button>
      }
    />
  )
}
