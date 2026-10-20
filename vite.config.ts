import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { buildThemeInitScript } from './src/theme/themeInit.ts'

/**
 * Saqlangan mavzu, asosiy rang va kod sozlamalarini birinchi chizishdan oldin <html> ga qo'yadi,
 * shunda sahifa standart ranglarda "lip" etib ko'rinmaydi (hr-ui dagi theme-init bilan bir xil yondashuv).
 */
function themeInit(base: string): Plugin {
  return {
    name: 'recipe-theme-init',
    // index.html dagi belgining o'rniga — <meta charset> dan keyin, CSS va JS dan oldin
    transformIndexHtml: (html) => html.replace('<!--theme-init-->', `<script>${buildThemeInitScript(base)}</script>`),
  }
}

/**
 * Sayt ochiladigan yo'l. Odatda `/`; GitHub Pages'da repo nomi bilan (`/ReactJS_Recipe/`) —
 * uni .github/workflows/deploy.yml `BASE_PATH` orqali beradi.
 */
const base = process.env.BASE_PATH ?? '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), themeInit(base)],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
