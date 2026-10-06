import { useEffect, useState } from 'react'

/** Ekran balandligining shu qismidan yuqoriga chiqqan oxirgi bo'lim "joriy" hisoblanadi. */
const ACTIVE_LINE_RATIO = 0.35

/**
 * Hozir o'qilayotgan bo'lim id'si (mundarijada belgilash uchun). [ids] sahifadagi tartibda va
 * barqaror (useMemo) bo'lishi kerak. Skroll har bir kadrda ko'pi bilan bir marta hisoblanadi.
 */
export function useVisibleSection(ids: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const line = window.innerHeight * ACTIVE_LINE_RATIO
      let current: string | null = ids[0] ?? null
      for (const id of ids) {
        const element = document.getElementById(id)
        if (!element) continue
        if (element.getBoundingClientRect().top > line) break
        current = id
      }
      setActiveId(current)
    }
    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame !== 0) window.cancelAnimationFrame(frame)
    }
  }, [ids])

  return activeId
}
