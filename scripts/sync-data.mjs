/**
 * Kotlin (Android) ilovadagi kontentni veb-ilovaga bir-ga-bir ko'chiradi:
 *   1. Android loyihasida `WebContentExportTest` ishga tushadi — kontent `app/build/web-export` ga JSON bo'lib yoziladi;
 *   2. tayyor fayllar `public/data` ga ko'chiriladi (eski fayllar o'chiriladi).
 *
 * Android loyihasi boshqa joyda bo'lsa: ANDROID_RECIPE_DIR=... npm run sync:data
 */
import { execSync } from 'node:child_process'
import { cpSync, existsSync, readdirSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'

const androidDir = resolve(process.env.ANDROID_RECIPE_DIR ?? 'C:/Users/iD_GROUP/AndroidStudioProjects/Recipe')
const exportDir = join(androidDir, 'app', 'build', 'web-export')
const targetDir = resolve(import.meta.dirname, '..', 'public', 'data')

if (!existsSync(androidDir)) {
  console.error(`Android loyihasi topilmadi: ${androidDir}`)
  process.exit(1)
}

// .bat faylni Windows'da faqat shell orqali ishga tushirish mumkin; yo'ldagi bo'shliqlar uchun qo'shtirnoq
const gradlew = join(androidDir, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew')
execSync(
  `"${gradlew}" :app:testDebugUnitTest --tests pr.com.recipe.export.WebContentExportTest --rerun --console=plain`,
  { cwd: androidDir, stdio: 'inherit' },
)

if (!existsSync(join(exportDir, 'index.json'))) {
  console.error(`Eksport natijasi topilmadi: ${exportDir}`)
  process.exit(1)
}

rmSync(targetDir, { recursive: true, force: true })
cpSync(exportDir, targetDir, { recursive: true })

const languages = readdirSync(targetDir, { withFileTypes: true }).filter((entry) => entry.isDirectory())
for (const language of languages) {
  const files = readdirSync(join(targetDir, language.name)).length
  console.log(`  ${language.name}: ${files} ta bo'lim`)
}
console.log(`Kontent ko'chirildi: ${targetDir}`)
