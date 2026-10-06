import LoadingState from '@/components/ui/LoadingState'
import Brand from './Brand'

/** Ilova birinchi ochilganda, kontent indeksi yuklanguncha. */
export default function AppLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-page">
      <Brand />
      <LoadingState label="Kontent yuklanmoqda..." />
    </div>
  )
}
