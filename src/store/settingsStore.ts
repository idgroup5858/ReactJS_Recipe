import { ACCENTS, DEFAULT_ACCENT_ID } from '@/theme/accents'
import { createStore, useStore } from './createStore'
import { onStorageChange, readJson, writeJson } from './storage'
import { SETTINGS_STORAGE_KEY } from './storageKeys'

export type ThemeMode = 'system' | 'light' | 'dark'

export const THEME_MODES: ThemeMode[] = ['system', 'light', 'dark']

export const MIN_CODE_FONT_SIZE = 11
export const MAX_CODE_FONT_SIZE = 22
export const DEFAULT_CODE_FONT_SIZE = 14

/** Android'dagi AppSettings + hr-ui'dagi asosiy rang. */
export interface AppSettings {
  themeMode: ThemeMode
  accentId: string
  codeFontSize: number
  wrapCodeLines: boolean
  showLineNumbers: boolean
  selectedLanguageId: string
  /** tablar panelida ko'rinadigan tillar (kamida bittasi doim yoqilgan) */
  enabledLanguageIds: string[]
  /** foydalanuvchi ko'rgan tayyor tillar — yangi til qo'shilsa, u avtomatik yoqiladi */
  seenLanguageIds: string[]
}

/**
 * Kontenti tayyor tillar `index.json` dan keladi, shuning uchun til sozlamalari [configureLanguages]
 * chaqirilgandan keyin tekshiriladi (ilova ochilganda, birinchi chizishdan oldin).
 */
let availableLanguageIds: string[] = []

const clampFontSize = (size: number) => Math.min(MAX_CODE_FONT_SIZE, Math.max(MIN_CODE_FONT_SIZE, Math.round(size)))

function sanitize(raw: unknown): AppSettings {
  const value = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof AppSettings, unknown>>

  const themeMode = THEME_MODES.find((mode) => mode === value.themeMode) ?? 'light'
  const accentId = ACCENTS.find((accent) => accent.id === value.accentId)?.id ?? DEFAULT_ACCENT_ID
  const codeFontSize = typeof value.codeFontSize === 'number' ? clampFontSize(value.codeFontSize) : DEFAULT_CODE_FONT_SIZE

  let enabled = Array.isArray(value.enabledLanguageIds)
    ? [...new Set(value.enabledLanguageIds.filter((id): id is string => typeof id === 'string'))]
    : []
  let selected = typeof value.selectedLanguageId === 'string' ? value.selectedLanguageId : ''
  // `null` — eski sozlamalar (maydon bo'lmagan): barcha tayyor tillar yangi hisoblanadi
  let seen = Array.isArray(value.seenLanguageIds)
    ? value.seenLanguageIds.filter((id): id is string => typeof id === 'string')
    : null
  if (availableLanguageIds.length > 0) {
    enabled = enabled.filter((id) => availableLanguageIds.includes(id))
    // yangi qo'shilgan til (oldin ko'rilmagan) avtomatik yoqiladi — kontent qo'shilganda til menyusida darhol chiqadi
    const seenIds = seen // closure ichida narrowing saqlanishi uchun const nusxa
    const newlyAvailable = seenIds === null ? availableLanguageIds : availableLanguageIds.filter((id) => !seenIds.includes(id))
    for (const id of newlyAvailable) if (!enabled.includes(id)) enabled.push(id)
    if (enabled.length === 0) enabled = [...availableLanguageIds]
    if (!enabled.includes(selected)) selected = enabled[0]
    seen = [...availableLanguageIds]
  }

  return {
    themeMode,
    accentId,
    codeFontSize,
    wrapCodeLines: value.wrapCodeLines === true,
    showLineNumbers: value.showLineNumbers !== false,
    selectedLanguageId: selected,
    enabledLanguageIds: enabled,
    seenLanguageIds: seen ?? [],
  }
}

export const settingsStore = createStore<AppSettings>(sanitize(readJson(SETTINGS_STORAGE_KEY)))

// boshqa tabda o'zgartirilgan sozlamalar shu tabda ham darhol qo'llanadi
onStorageChange(SETTINGS_STORAGE_KEY, () => settingsStore.set(sanitize(readJson(SETTINGS_STORAGE_KEY))))

export function useSettings(): AppSettings {
  return useStore(settingsStore)
}

/** [availableIds] — kontenti tayyor tillar; birinchisi standart til (TypeScript). */
export function configureLanguages(availableIds: string[]): void {
  availableLanguageIds = availableIds
  settingsStore.set(sanitize(settingsStore.get()))
  // ko'rilgan tillar ro'yxati saqlanadi — keyingi safar faqat haqiqatan yangi til avtomatik yoqiladi
  writeJson(SETTINGS_STORAGE_KEY, settingsStore.get())
}

function save(transform: (current: AppSettings) => AppSettings): void {
  const current = settingsStore.get()
  const next = transform(current)
  if (next === current) return
  settingsStore.set(next)
  writeJson(SETTINGS_STORAGE_KEY, next)
}

export const setThemeMode = (themeMode: ThemeMode) => save((s) => ({ ...s, themeMode }))

export const setAccent = (accentId: string) => save((s) => ({ ...s, accentId }))

export const setCodeFontSize = (size: number) => save((s) => ({ ...s, codeFontSize: clampFontSize(size) }))

export const setWrapCodeLines = (wrapCodeLines: boolean) => save((s) => ({ ...s, wrapCodeLines }))

export const setShowLineNumbers = (showLineNumbers: boolean) => save((s) => ({ ...s, showLineNumbers }))

/** Tanlangan til tablar panelida ham yoqiladi. */
export function selectLanguage(languageId: string): void {
  save((current) => {
    if (!availableLanguageIds.includes(languageId)) return current
    if (current.selectedLanguageId === languageId && current.enabledLanguageIds.includes(languageId)) return current
    const enabled = current.enabledLanguageIds.includes(languageId)
      ? current.enabledLanguageIds
      : [...current.enabledLanguageIds, languageId]
    return { ...current, selectedLanguageId: languageId, enabledLanguageIds: enabled }
  })
}

/** Kamida bitta til yoqilgan bo'lishi shart; o'chirilgan til tanlangan bo'lsa, qolganlarining birinchisi tanlanadi. */
export function toggleLanguageEnabled(languageId: string): void {
  save((current) => {
    if (!availableLanguageIds.includes(languageId)) return current
    const enabled = current.enabledLanguageIds
    if (!enabled.includes(languageId)) return { ...current, enabledLanguageIds: [...enabled, languageId] }
    if (enabled.length === 1) return current
    const remaining = enabled.filter((id) => id !== languageId)
    const selected = remaining.includes(current.selectedLanguageId) ? current.selectedLanguageId : remaining[0]
    return { ...current, enabledLanguageIds: remaining, selectedLanguageId: selected }
  })
}
