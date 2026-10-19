# Kod retseptlari — veb-versiya

Android ilovasi **Kod retseptlari** (`AndroidStudioProjects/Recipe`) ning veb-nusxasi:

- **Kontent** — Kotlin ilovadan bir-ga-bir eksport qilinadi (TypeScript, NestJS, Next.js: 47 bo'lim, 182 mavzu, 9 123 misol);
- **Dizayn** — `FaceID_HR_System/hr-ui` uslubida: 3px burchaklar, chap sidebar + sticky header, qorong'i rejim.
  Asosiy rang tanlangan tilga moslashadi (TypeScript — ko'k, NestJS — qizil, JavaScript — sariq-qora...,
  `src/theme/languageAccents.ts`); sozlamalarda o'chirib, 16 xil palitradan birini tanlash mumkin.

Stek: React 19, Vite 8, TypeScript 6, Tailwind CSS 4, react-router 8, lucide-react, SweetAlert2.

## Ishga tushirish

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/ — statik fayllar
npm run preview    # build natijasini ko'rish
npm run lint
```

## Kontentni yangilash

Android ilovada mavzu yoki misol qo'shilgandan keyin:

```bash
npm run sync:data
```

Skript Android loyihasida `WebContentExportTest` ni ishga tushiradi (u kontentni `app/build/web-export` ga JSON qilib
yozadi) va natijani `public/data` ga ko'chiradi. Android loyihasi boshqa joyda bo'lsa: `ANDROID_RECIPE_DIR=... npm run sync:data`.

```
public/data/index.json              tillar, bo'limlar va mavzular ro'yxati (ilova ochilganda)
public/data/<til>/<bo'lim>.json     bo'limning to'liq kontenti (kerak bo'lganda yuklanadi)
```

Yangi til qo'shilsa, uni Android'dagi `WebContentExportTest.contents` ro'yxatiga ham qo'shing.

## Tuzilma

```
src/
  app/          router, loader'lar (Android'dagi ViewModel o'rnida), route ma'lumotlari
  assets/languages/  tillarning haqiqiy logotiplari (devicon, MIT) — fayl nomi = til id'si, yangisi o'zi ulanadi
  components/
    layout/     sidebar, header, navbar'dagi tillar paneli (telefonda — ochiladigan menyu), mavzu tugmasi
    content/    nazariya bloklari, ranglangan kod bloki, natija
    ui/         kartochka, sarlavha, badge, tugmalar, switch, qidiruv maydoni
  data/         JSON yuklash va kesh, qidiruv indeksi
  domain/       kontent modellari (Kotlin domain/model bilan bir xil)
  highlight/    sintaksis ranglash (Kotlin CodeTokenizer'ning aynan ko'chirmasi)
  pages/        home, category, topic, search, favorites, settings
  store/        sozlamalar va sevimlilar (localStorage)
  theme/        aksent ranglar, mavzuni qo'llash, birinchi chizishdan oldingi skript
  styles/       global.css — hr-ui dizayn tokenlari + kod ranglari
```

## Sahifalar

| Manzil | Sahifa |
| --- | --- |
| `/` | oxirgi tanlangan tilga yo'naltiradi |
| `/:til` | bo'limlar ro'yxati |
| `/:til/:bolim` | bo'lim mavzulari |
| `/:til/:bolim/:mavzu#ex5` | mavzu (ixtiyoriy ravishda aniq misolgacha) |
| `/search?q=` | qidiruv (`Ctrl+K` yoki `/`) |
| `/favorites` | sevimli misollar |
| `/settings?tab=` | tillar, ko'rinish, ilova haqida |

Ilova bitta sahifali (SPA): serverda noma'lum manzillar `index.html` ga qaytarilishi kerak
(nginx: `try_files $uri /index.html;`).
