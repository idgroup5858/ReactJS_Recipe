export type Accent = {
  id: string
  name: string
  /** asosiy tus: yorug' rejimda tugmalar, aksent matn va faol holatlar (ustidagi oq matn o'qilishi kerak) */
  color: string
  /** qorong'i rejimdagi aksent matn uchun och tus */
  ink: string
  /** `color` qorong'i fonda ajralib turmasa, qorong'i rejimdagi tugma rangi */
  fillDark?: string
}

export const DEFAULT_ACCENT_ID = 'bordo'

/**
 * Sozlamalarda taklif qilinadigan asosiy ranglar (hr-ui bilan bir xil palitra). "bordo" — global.css dagi
 * qo'lda tanlangan palitra; qolganlari uchun global.css butun brand-* shkalasini shu qiymatlardan hosil qiladi.
 */
export const ACCENTS: Accent[] = [
  { id: 'bordo', name: 'Bordo', color: '#6b0f2a', ink: '#e58ea6' },
  { id: 'red', name: 'Qizil', color: '#b91c1c', ink: '#fca5a5' },
  { id: 'pink', name: 'Pushti', color: '#be185d', ink: '#f9a8d4' },
  { id: 'purple', name: 'Binafsha', color: '#7e22ce', ink: '#d8b4fe' },
  { id: 'indigo', name: 'Siyohrang', color: '#4338ca', ink: '#a5b4fc' },
  { id: 'blue', name: "Ko'k", color: '#1d4ed8', ink: '#93c5fd' },
  { id: 'sky', name: 'Osmon', color: '#0369a1', ink: '#7dd3fc' },
  { id: 'teal', name: 'Feruza', color: '#0f766e', ink: '#5eead4' },
  { id: 'emerald', name: 'Zumrad', color: '#047857', ink: '#6ee7b7' },
  { id: 'green', name: 'Yashil', color: '#15803d', ink: '#86efac' },
  { id: 'olive', name: 'Zaytun', color: '#4d7c0f', ink: '#bfd88a' },
  { id: 'gold', name: 'Oltin', color: '#a16207', ink: '#f2cc5c' },
  { id: 'orange', name: "To'q sariq", color: '#c2410c', ink: '#fdba74' },
  { id: 'brown', name: 'Jigarrang', color: '#7c4a2b', ink: '#e2bc9b' },
  { id: 'slate', name: 'Grafit', color: '#334155', ink: '#cbd5e1', fillDark: '#475569' },
  { id: 'black', name: 'Qora', color: '#262626', ink: '#e5e5e5', fillDark: '#404040' },
]

/** Standart bo'lmagan rang tanlanganda <html> ga (data-accent bilan birga) qo'yiladigan CSS o'zgaruvchilari. */
export const ACCENT_VAR_NAMES = ['--accent', '--accent-ink', '--accent-fill-dark']

export function accentVars(accent: Accent): Record<string, string> {
  const vars: Record<string, string> = { '--accent': accent.color, '--accent-ink': accent.ink }
  if (accent.fillDark) vars['--accent-fill-dark'] = accent.fillDark
  return vars
}
