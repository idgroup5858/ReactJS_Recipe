import { useSyncExternalStore } from 'react'
import { useSettings } from '@/store/settingsStore'
import { isDarkMode, systemDarkQuery } from './appearance'

function subscribeToSystemTheme(onChange: () => void): () => void {
  systemDarkQuery.addEventListener('change', onChange)
  return () => systemDarkQuery.removeEventListener('change', onChange)
}

/** Hozir amalda qorong'i mavzu ishlayaptimi ("Tizim" rejimida OS sozlamasi hisobga olinadi). */
export function useIsDark(): boolean {
  const { themeMode } = useSettings()
  const systemDark = useSyncExternalStore(subscribeToSystemTheme, () => systemDarkQuery.matches)
  return isDarkMode(themeMode, systemDark)
}
