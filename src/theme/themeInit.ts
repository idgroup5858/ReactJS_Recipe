// vite.config.ts ham shu faylni import qiladi (Node muhitida), shuning uchun importlar kengaytma bilan yozilgan
import { SETTINGS_STORAGE_KEY } from '../store/storageKeys.ts'
import { ACCENTS, DEFAULT_ACCENT_ID, accentVars } from './accents.ts'
import { LANGUAGE_ACCENTS } from './languageAccents.ts'

/**
 * index.html <head> iga qo'yiladigan kichik skript. Saqlangan sozlamalardan mavzu (`.dark`), asosiy rang
 * (`data-accent` + `--accent*`: ochiq tilning rangi yoki palitradan tanlangani) va kod ko'rinishini React
 * yuklanishidan oldin qo'llaydi. Ilova ishlayotgandagi ekvivalenti — theme/appearance.ts; ikkalasi bir xil natija berishi shart.
 * [base] — sayt ochiladigan yo'l (vite `base`, masalan `/ReactJS_Recipe/`): til manzilda undan keyin keladi.
 */
export function buildThemeInitScript(base = '/'): string {
  const customAccents = Object.fromEntries(
    ACCENTS.filter((accent) => accent.id !== DEFAULT_ACCENT_ID).map((accent) => [accent.id, accentVars(accent)]),
  )
  const languageAccents = Object.fromEntries(Object.entries(LANGUAGE_ACCENTS).map(([id, colors]) => [id, accentVars(colors)]))
  return [
    'try{',
    `var d=document.documentElement,p=JSON.parse(localStorage.getItem(${JSON.stringify(SETTINGS_STORAGE_KEY)})||"{}")||{},t=p.themeMode;`,
    'if(t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches))d.classList.add("dark");',
    'var h=function(o,k){return Object.prototype.hasOwnProperty.call(o,k)};',
    // ochiq til: manzildagi `/:lang`, bo'lmasa oxirgi tanlangan til (appearance.ts dagi activeLanguageId)
    `var m=${JSON.stringify(customAccents)},L=${JSON.stringify(languageAccents)},s=location.pathname.slice(${base.length - 1}).split("/")[1],l=h(L,s)?s:p.selectedLanguageId,a=p.accentId,v;`,
    'if(p.languageAccent!==false&&h(L,l)){a=l;v=L[l]}else if(h(m,a))v=m[a];',
    'if(v){d.setAttribute("data-accent",a);for(var k in v)d.style.setProperty(k,v[k])}',
    'if(p.wrapCodeLines===true)d.setAttribute("data-code-wrap","");',
    'if(p.showLineNumbers!==false)d.setAttribute("data-line-numbers","");',
    'if(typeof p.codeFontSize==="number")d.style.setProperty("--code-font-size",p.codeFontSize+"px");',
    '}catch(e){}',
  ].join('')
}
