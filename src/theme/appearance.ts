import { settingsStore, type AppSettings, type ThemeMode } from '@/store/settingsStore'
import { ACCENTS, ACCENT_VAR_NAMES, DEFAULT_ACCENT_ID, accentVars } from './accents'

export const systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)')

export function isDarkMode(mode: ThemeMode, systemDark: boolean = systemDarkQuery.matches): boolean {
  return mode === 'dark' || (mode === 'system' && systemDark)
}

// data-accent + --accent* o'zgaruvchilari; global.css ulardan butun brand-* palitrasini hosil qiladi
function applyAccent(root: HTMLElement, accentId: string): void {
  const accent = ACCENTS.find((item) => item.id === accentId)
  ACCENT_VAR_NAMES.forEach((name) => root.style.removeProperty(name))
  if (!accent || accent.id === DEFAULT_ACCENT_ID) {
    root.removeAttribute('data-accent')
    return
  }
  root.setAttribute('data-accent', accent.id)
  Object.entries(accentVars(accent)).forEach(([name, value]) => root.style.setProperty(name, value))
}

/** themeInit.ts dagi skript bilan bir xil natija beradi — farqi faqat ilova ishlayotganda chaqirilishida. */
export function applyAppearance(settings: AppSettings): void {
  const root = document.documentElement
  root.classList.toggle('dark', isDarkMode(settings.themeMode))
  applyAccent(root, settings.accentId)
  root.style.setProperty('--code-font-size', `${settings.codeFontSize}px`)
  root.toggleAttribute('data-code-wrap', settings.wrapCodeLines)
  root.toggleAttribute('data-line-numbers', settings.showLineNumbers)
}

/** Sozlamalar o'zgarganda va "Tizim" rejimida OS mavzusi almashganda ko'rinishni yangilab turadi. */
export function startAppearanceSync(): void {
  const update = () => applyAppearance(settingsStore.get())
  update()
  settingsStore.subscribe(update)
  systemDarkQuery.addEventListener('change', update)
}
