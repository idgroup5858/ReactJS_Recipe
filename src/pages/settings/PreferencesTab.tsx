import AccentCard from './AccentCard'
import CodeStyleCard from './CodeStyleCard'
import ProgressCard from './ProgressCard'
import ThemeCard from './ThemeCard'

/**
 * Ko'rinish sozlamalari (Android'dagi PreferencesTab + hr-ui dagi asosiy rang) va o'zlashtirish progressi.
 * O'zgarishlar darhol qo'llanadi.
 */
export default function PreferencesTab() {
  return (
    <div className="space-y-4">
      <ThemeCard />
      <AccentCard />
      <CodeStyleCard />
      <ProgressCard />
    </div>
  )
}
