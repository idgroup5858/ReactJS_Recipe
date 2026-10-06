import { formatCount } from '@/lib/format'

/** Ichida son yozilgan "varaq" belgisi (Android'dagi CountBadge): ro'yxat qatorlarida misollar sonini ko'rsatadi. */
export default function CountBadge({ count, title }: { count: number; title?: string }) {
  return (
    <span
      title={title}
      className="flex h-10 w-9 shrink-0 items-center justify-center rounded border-[1.5px] border-neutral-300 text-[13px] font-semibold tabular-nums text-neutral-600"
    >
      {formatCount(count)}
    </span>
  )
}
