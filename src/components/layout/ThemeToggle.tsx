import { Moon, Sun } from 'lucide-react'
import { setThemeMode } from '@/store/settingsStore'
import { useIsDark } from '@/theme/useIsDark'
import { HeaderButton } from './HeaderButton'

/** Header'dagi oy / quyosh tugmasi: yorug' va qorong'i mavzu orasida almashtiradi. */
export default function ThemeToggle() {
  const dark = useIsDark()
  return (
    <HeaderButton
      label={dark ? "Yorug' rejimga o'tish" : "Qorong'i rejimga o'tish"}
      onClick={() => setThemeMode(dark ? 'light' : 'dark')}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </HeaderButton>
  )
}
