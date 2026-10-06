import Brand from '@/components/layout/Brand'
import RouteError from './RouteError'

/** Kontent indeksining o'zi yuklanmasa — layout'siz, butun ekran markazida. */
export default function RootError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-page p-4">
      <Brand />
      <div className="w-full max-w-lg">
        <RouteError />
      </div>
    </div>
  )
}
