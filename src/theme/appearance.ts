import { settingsStore, type AppSettings, type ThemeMode } from '@/store/settingsStore'
import { ACCENTS, ACCENT_VAR_NAMES, DEFAULT_ACCENT_ID, accentVars } from './accents'
import { getLanguageAccent, languageIdFromPath } from './languageAccents'

export const systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)')

export function isDarkMode(mode: ThemeMode, systemDark: boolean = systemDarkQuery.matches): boolean {
  return mode === 'dark' || (mode === 'system' && systemDark)
}

/**
 * Ochiq til: `/:lang/...` sahifalarida manzildagi til, qolganlarida oxirgi tanlangan til (useActiveLanguageId bilan
 * bir xil). Manzil birinchi o'rinda — til almashganda rang sahifa chizilishidan oldin, LanguageScope'ni kutmasdan almashadi.
 */
function activeLanguageId(settings: AppSettings): string {
  return languageIdFromPath(window.location.pathname) ?? settings.selectedLanguageId
}

// data-accent + --accent* (va banner uchun --hero-*) o'zgaruvchilari; global.css ulardan butun brand-* palitrasini hosil qiladi
function applyAccent(root: HTMLElement, settings: AppSettings): void {
  const languageId = activeLanguageId(settings)
  const languageColors = settings.languageAccent ? getLanguageAccent(languageId) : undefined
  // til rangi bo'lmasa (yoki o'chirilgan bo'lsa) — palitradan tanlangan rang
  const accent = languageColors ? { id: languageId, ...languageColors } : ACCENTS.find((item) => item.id === settings.accentId)
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
  applyAccent(root, settings)
  root.style.setProperty('--code-font-size', `${settings.codeFontSize}px`)
  root.toggleAttribute('data-code-wrap', settings.wrapCodeLines)
  root.toggleAttribute('data-line-numbers', settings.showLineNumbers)
}

/**
 * Sozlamalar o'zgarganda, "Tizim" rejimida OS mavzusi almashganda va sahifa manzili o'zgarganda (til rangi uchun)
 * ko'rinishni yangilab turadi. [subscribeToNavigation] — router'ga obuna (router bu moduldan bexabar qolsin).
 */
export function startAppearanceSync(subscribeToNavigation: (onNavigate: () => void) => void): void {
  const update = () => applyAppearance(settingsStore.get())
  update()
  settingsStore.subscribe(update)
  systemDarkQuery.addEventListener('change', update)
  subscribeToNavigation(update)
}
