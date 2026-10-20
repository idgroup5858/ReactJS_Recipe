# Code Recipes — veb-versiya

Android ilovasi **Code Recipes** (`AndroidStudioProjects/Recipe`) ning veb-nusxasi:

- **Kontent** — 5 til, 93 bo'lim, 454 mavzu, 23 020 misol (o'zbek tilida). Dastlab Kotlin ilovadan eksport qilingan,
  endi to'g'ridan-to'g'ri `public/data` da `scripts/content.mjs` bilan tahrirlanadi (pastda — "Kontentni yangilash");
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

## Kontent

| Til | Bo'limlar | Mavzular | Misollar |
| --- | ---: | ---: | ---: |
| TypeScript | 19 | 87 | 4 835 |
| NestJS | 21 | 85 | 4 780 |
| Next.js | 12 | 58 | 2 815 |
| JavaScript | 20 | 112 | 5 343 |
| Go | 21 | 112 | 5 247 |
| **Jami** | **93** | **454** | **23 020** |

Joriy hajm: `node scripts/content.mjs stats [til]`.

```
public/data/index.json              tillar, bo'limlar va mavzular ro'yxati (ilova ochilganda)
public/data/<til>/<bo'lim>.json     bo'limning to'liq kontenti (kerak bo'lganda yuklanadi)
```

Har bir mavzu: nazariya bloklari (`heading`, `paragraph`, `list`, `note`, `snippet`, `table`) va 40–50 ta misol
(`title`, `description`, `code`, `output`). Matnda faqat `` `kod` `` va `**qalin**` belgilashi ishlaydi.

## Kontentni yangilash

Kontent `public/data` da tahrirlanadi. Yangi yoki o'zgartirilgan mavzular avval `.content-staging/` da tayyorlanadi
(`.gitignore` da), tekshiriladi va keyin import qilinadi:

```bash
node scripts/content.mjs check .content-staging/<til>/<bo'lim>   # format va sifat tekshiruvi
node scripts/content.mjs run <fayl>                              # misollarni ishga tushirib output bilan solishtirish
node scripts/content.mjs import <til> --only=<bo'lim>            # public/data ga qo'shish, index.json ni yangilash
node scripts/content.mjs validate [til]                          # public/data va index.json mosligi
node scripts/content.mjs export <til> <bo'lim> <mavzu> --brief   # mavjud mavzuni ko'rish
```

Tayyorlash papkasi: `<til>/<bo'lim>/_category.json` (sarlavha, tavsif, mavzular tartibi, `position`),
`NN-<mavzu>.json` — yangi mavzu, `NN-<mavzu>.patch.json` — mavjud mavzuga o'zgartirish (to'liq format — `scripts/content.mjs` boshida).

`run` TypeScript, JavaScript (Node 24), Go (1.27, `RECIPE_GO` yoki PATH dagi `go`) va NestJS misollarini haqiqatan ishga
tushiradi; birinchi qatori `// no-run` bo'lgan, ko'p faylli (`// fayl:`) va brauzer misollari o'tkazib yuboriladi.
Next.js misollari ishga tushirilmaydi — ular faqat `check` dan o'tadi.

`npm run sync:data` (Android loyihasidan eksport) endi `--force` siz ishlamaydi: u `public/data` ni Android versiyasi bilan
almashtirib, keyin qo'shilgan kontentni (JavaScript, Go, kengaytirilgan nazariya) o'chirib yuboradi.

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
  store/        sozlamalar, sevimlilar va "tushunarli" belgilari — o'zlashtirish progressi (localStorage)
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
