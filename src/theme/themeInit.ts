// vite.config.ts ham shu faylni import qiladi (Node muhitida), shuning uchun importlar kengaytma bilan yozilgan
import { SETTINGS_STORAGE_KEY } from '../store/storageKeys.ts'
import { ACCENTS, DEFAULT_ACCENT_ID, accentVars } from './accents.ts'

/**
 * index.html <head> iga qo'yiladigan kichik skript. Saqlangan sozlamalardan mavzu (`.dark`), asosiy rang
 * (`data-accent` + `--accent*`) va kod ko'rinishini React yuklanishidan oldin qo'llaydi.
 * Ilova ishlayotgandagi ekvivalenti — theme/appearance.ts; ikkalasi bir xil natija berishi shart.
 */
export function buildThemeInitScript(): string {
  const customAccents = Object.fromEntries(
    ACCENTS.filter((accent) => accent.id !== DEFAULT_ACCENT_ID).map((accent) => [accent.id, accentVars(accent)]),
  )
  return [
    'try{',
    `var d=document.documentElement,p=JSON.parse(localStorage.getItem(${JSON.stringify(SETTINGS_STORAGE_KEY)})||"{}")||{},t=p.themeMode;`,
    'if(t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches))d.classList.add("dark");',
    `var m=${JSON.stringify(customAccents)},a=p.accentId;`,
    'if(a&&Object.prototype.hasOwnProperty.call(m,a)){d.setAttribute("data-accent",a);for(var k in m[a])d.style.setProperty(k,m[a][k])}',
    'if(p.wrapCodeLines===true)d.setAttribute("data-code-wrap","");',
    'if(p.showLineNumbers!==false)d.setAttribute("data-line-numbers","");',
    'if(typeof p.codeFontSize==="number")d.style.setProperty("--code-font-size",p.codeFontSize+"px");',
    '}catch(e){}',
  ].join('')
}
