/**
 * Tillarning haqiqiy logotiplari (devicon 2.17.0, MIT — LICENSE-devicon.txt). Fayl nomi Android'dagi LanguageCatalog
 * id'si bilan bir xil, shuning uchun yangi til logotipi shu papkaga `<id>.svg` qilib qo'shilsa, o'zi ulanadi.
 */
const files = import.meta.glob<string>('./*.svg', { eager: true, query: '?url', import: 'default' })

export const LANGUAGE_LOGOS: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.replace(/^\.\/|\.svg$/g, ''), url]),
)

/** Qora, bir rangli logotiplar — qorong'i fonda ko'rinishi uchun teskari (oq) chiziladi. */
export const INVERT_IN_DARK: ReadonlySet<string> = new Set(['nextjs', 'rust'])
