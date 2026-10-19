// themeInit.ts orqali vite.config.ts ham import qiladi (Node muhitida), shuning uchun import kengaytma bilan yozilgan
import type { AccentColors } from './accents.ts'

/**
 * Har bir tilning o'z aksenti: "Tanlangan til rangi" yoqilganda (standart) til almashtirilsa, bosh sahifa banneri va
 * butun brand-* palitrasi shu tilning rangiga o'tadi. Kalit — index.json dagi til id'si; katalogdagi hali kontenti
 * yo'q tillar ham shu yerda, kontenti qo'shilishi bilan ranglari o'zi ishlaydi. Ro'yxatda yo'q til sozlamalardagi
 * asosiy rangda ko'rinadi.
 *
 * Rasmiy brend ranglari ko'pincha juda och (oq fonda matn o'qilmaydi), shuning uchun `color` ularning to'qroq tusi
 * (oq va #efefef fonda kontrast ≥ 4.5), bannerda esa asl brend rangi (`heroTo`) ishlatiladi.
 */
export const LANGUAGE_ACCENTS: Readonly<Record<string, AccentColors>> = {
  typescript: { color: '#2b69b0', ink: '#7cb1f0', heroTo: '#3178c6' },
  nestjs: { color: '#c81d45', ink: '#fb7d97', heroTo: '#e0234e' },
  nextjs: { color: '#111111', ink: '#ededed', fillDark: '#3a3a3a', heroFrom: '#000000', heroTo: '#383838' },
  // sariq va qora: yorug' rejimda sariq banner qora matn bilan, qorong'i rejimda sariq aksent
  javascript: { color: '#7a6100', ink: '#f7df1e', heroFrom: '#ebcf0f', heroTo: '#f7df1e', heroFg: '#1a1a1a' },
  kotlin: { color: '#6f42f0', ink: '#b8a1ff', heroFrom: '#5f37e0', heroTo: '#a52fe0' },
  java: { color: '#a64c00', ink: '#ffa95a', heroFrom: '#a14d00', heroTo: '#e76f00' },
  python: { color: '#306a9b', ink: '#80b4e2', heroTo: '#3776ab' },
  swift: { color: '#c0331b', ink: '#ff8f75', heroFrom: '#b8301c', heroTo: '#f05138' },
  golang: { color: '#00708c', ink: '#5dc9e2', heroFrom: '#00708c', heroTo: '#00add8' },
  csharp: { color: '#68217a', ink: '#d6a2e8', fillDark: '#803398' },
  cpp: { color: '#00599c', ink: '#7ab4e8' },
  dart: { color: '#0168ad', ink: '#5cc8fa', heroTo: '#0175c2' },
  rust: { color: '#b7410e', ink: '#f39a72' },
  php: { color: '#4f5b93', ink: '#aeb5e6', heroFrom: '#4f5b93', heroTo: '#777bb4' },
}

export function getLanguageAccent(languageId: string): AccentColors | undefined {
  return Object.hasOwn(LANGUAGE_ACCENTS, languageId) ? LANGUAGE_ACCENTS[languageId] : undefined
}

/** `/:lang/...` manzilidagi til (ranglari bor bo'lsa); qidiruv, sozlamalar kabi sahifalarda — undefined. */
export function languageIdFromPath(pathname: string): string | undefined {
  const segment = pathname.split('/')[1] ?? ''
  return getLanguageAccent(segment) ? segment : undefined
}
