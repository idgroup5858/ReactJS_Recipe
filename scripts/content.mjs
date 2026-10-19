#!/usr/bin/env node
/**
 * Kontent asboblari — `public/data` dagi JSON kontent ustida ishlash uchun.
 *
 *   node scripts/content.mjs validate [til] [--quality]   public/data dagi JSON'lar va index.json mosligini tekshiradi
 *   node scripts/content.mjs stats [til]                  har bir mavzu bo'yicha nazariya/misol statistikasi
 *   node scripts/content.mjs export <til> <bo'lim> [mavzu] [--brief]
 *                                                         mavzuni o'qish uchun chiroyli JSON qilib
 *                                                         .content-staging/_export/<til>/<bo'lim>/<mavzu>.json ga yozadi
 *                                                         (--brief: faqat nazariya va misollar ro'yxatini konsolga chiqaradi)
 *   node scripts/content.mjs check <fayl|papka>...        .content-staging dagi tayyorlangan fayllarni tekshiradi (import qilmaydi)
 *   node scripts/content.mjs import <til> [--dry] [--keep] [--only=bolim1,bolim2]
 *                                                         .content-staging/<til>/ dagi fayllarni public/data ga qo'shadi,
 *                                                         index.json ni yangilaydi va ishlangan papkani _done/ ga ko'chiradi
 *                                                         (--only: faqat ko'rsatilgan bo'lim papkalari)
 *   node scripts/content.mjs rebuild-index                index.json ni bo'lim fayllaridan qayta yaratadi
 *   node scripts/content.mjs run <fayl> [--only exN] [--topic id] [--update] [--lang til]
 *                                                         misollar kodini haqiqatan ishga tushirib (TypeScript/JavaScript — node,
 *                                                         Go — go run, NestJS — tsc + node va testApp) natijani `output` bilan solishtiradi. Fayl: tayyorlash
 *                                                         papkasidagi mavzu/patch yoki public/data/<til>/<bo'lim>.json (--topic).
 *                                                         --update: dastur muvaffaqiyatli ishlagan bo'lsa, haqiqiy natijani
 *                                                         faylga `output` qilib yozadi (natijani ko'zdan kechiring!).
 *                                                         Ishga tushirilmaydigan misollar: birinchi qatori `// no-run` bo'lsa,
 *                                                         brauzer API'si (document/window/localStorage) ishlatsa yoki
 *                                                         `// fayl:` bilan bir nechta fayldan iborat bo'lsa.
 *
 * Tayyorlash papkasi (.content-staging) tuzilmasi:
 *   <til>/<bo'lim-id>/_category.json           { id, title, description, topics?: [tartiblangan mavzu id'lari], position?: n }
 *   <til>/<bo'lim-id>/NN-<mavzu-id>.json        to'liq mavzu: { id, title, summary, blocks, examples }
 *   <til>/<bo'lim-id>/NN-<mavzu-id>.patch.json  mavjud mavzuga o'zgartirish:
 *                                               { id, title?, summary?, blocks?, replaceExamples?: { exN: misol }, addExamples?: [misol] }
 *   NN — ikki xonali tartib raqami (01, 02, ...). Misol id'lari import paytida ex1..exN qilib qo'yiladi
 *   (patch'da mavjud id'lar saqlanadi, qo'shilganlari davomidan raqamlanadi).
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { basename, join, relative, resolve, sep } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const DATA_DIR = join(ROOT, 'public', 'data')
const STAGING_DIR = join(ROOT, '.content-staging')
const INDEX_FILE = join(DATA_DIR, 'index.json')

const BLOCK_TYPES = new Set(['heading', 'paragraph', 'list', 'note', 'snippet', 'table'])
const NOTE_KINDS = new Set(['info', 'tip', 'warning'])
const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const EXAMPLE_ID_RE = /^ex\d+$/
const TOPIC_FILE_RE = /^(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)(\.patch)?\.json$/

/** Sifat chegaralari — `check` uchun ogohlantirish beradi (xato emas). */
const QUALITY = {
  minBlocks: 16,
  minTheoryChars: 3500,
  minExamples: 35,
  maxCodeLines: 80,
  minOutputRatio: 0.8,
  minDescriptionRatio: 0.5,
}
/** Natija (`output`) deyarli har bir misolda bo'lishi kerak bo'lgan tillar — ishga tushiriladigan kod. */
const RUNNABLE_LANGUAGES = new Set(['typescript', 'javascript', 'golang', 'nestjs'])
/** Kod bloklarida tab ishlatish tabiiy bo'lgan tillar (gofmt). */
const TAB_LANGUAGES = new Set(['golang'])

// ---------------------------------------------------------------------------------------------------------------------
// yordamchilar

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'))
const writeJson = (file, data, pretty = false) =>
  writeFileSync(file, pretty ? `${JSON.stringify(data, null, 2)}\n` : JSON.stringify(data))
const isString = (value) => typeof value === 'string'
const nonEmpty = (value) => isString(value) && value.trim().length > 0
const short = (text, max = 70) => (text.length > max ? `${text.slice(0, max)}…` : text).replace(/\n/g, '⏎')
const normalizeCode = (code) => code.replace(/\s+/g, ' ').trim()

class Report {
  errors = []
  warnings = []
  error(where, message) {
    this.errors.push(`${where}: ${message}`)
  }
  warn(where, message) {
    this.warnings.push(`${where}: ${message}`)
  }
  get ok() {
    return this.errors.length === 0
  }
  print(title) {
    if (title) console.log(`\n== ${title}`)
    for (const warning of this.warnings) console.log(`  ⚠ ${warning}`)
    for (const error of this.errors) console.log(`  ✖ ${error}`)
    console.log(`  xatolar: ${this.errors.length}, ogohlantirishlar: ${this.warnings.length}`)
  }
}

function parseArgs(argv) {
  const flags = new Set()
  const positional = []
  for (const arg of argv) (arg.startsWith('--') ? flags : positional).push?.(arg) ?? flags.add(arg)
  return { positional, flags }
}

// ---------------------------------------------------------------------------------------------------------------------
// tekshirish

function checkMarkup(report, where, text) {
  const ticks = (text.match(/`/g) ?? []).length
  if (ticks % 2 !== 0) report.error(where, `juft bo'lmagan \` belgisi: "${short(text)}"`)
  // `kod` ichidagi ** (masalan `2 ** 10`) qalin belgisi emas — kod bo'laklarini olib tashlab sanaymiz
  const outsideCode = text.replace(/`[^`]*`/g, '')
  const bolds = (outsideCode.match(/\*\*/g) ?? []).length
  if (bolds % 2 !== 0) report.warn(where, `juft bo'lmagan ** belgisi (daraja operatori bo'lsa \`...\` ichiga oling): "${short(text)}"`)
  if (text.includes('```')) report.error(where, 'matn ichida ``` ishlatilmasin — kod uchun snippet bloki bor')
  if (/\n/.test(text)) report.warn(where, `matnda yangi qator belgisi bor: "${short(text)}"`)
  if (/\]\(https?:\/\//.test(outsideCode)) report.warn(where, 'markdown havola ([matn](url)) qo\'llab-quvvatlanmaydi')
  if (/^#{1,6}\s/.test(outsideCode)) report.warn(where, 'markdown sarlavha (#) o\'rniga heading bloki ishlatilsin')
  if (/^[-*]\s/.test(outsideCode)) report.warn(where, 'markdown ro\'yxat (- yoki *) o\'rniga list bloki ishlatilsin')
}

function checkCode(report, where, code, lang) {
  if (code.includes('\r')) report.error(where, 'kodda \\r belgisi bor')
  if (code.includes('\t') && !TAB_LANGUAGES.has(lang)) report.warn(where, 'kodda tab belgisi bor — bo\'shliq ishlatilsin')
  const lines = code.split('\n').length
  if (lines > QUALITY.maxCodeLines) report.warn(where, `kod juda uzun: ${lines} qator (maks ${QUALITY.maxCodeLines})`)
  if (/^\s*\n/.test(code) || /\n\s*$/.test(code)) report.warn(where, 'kod boshida/oxirida bo\'sh qator bor')
}

/** Nazariya bloklarini tekshiradi; matn hajmini (belgilar) qaytaradi. */
function validateBlocks(report, where, blocks, lang) {
  if (!Array.isArray(blocks)) {
    report.error(where, 'blocks massiv bo\'lishi kerak')
    return { chars: 0, counts: {} }
  }
  let chars = 0
  const counts = { heading: 0, paragraph: 0, list: 0, note: 0, snippet: 0, table: 0 }
  const text = (w, value) => {
    if (!nonEmpty(value)) report.error(w, 'matn bo\'sh')
    else {
      checkMarkup(report, w, value)
      chars += value.length
    }
  }
  blocks.forEach((block, i) => {
    const w = `${where} blocks[${i}]`
    if (!block || typeof block !== 'object') return report.error(w, 'obyekt emas')
    if (!BLOCK_TYPES.has(block.type)) return report.error(w, `noma'lum blok turi: ${JSON.stringify(block.type)}`)
    counts[block.type]++
    switch (block.type) {
      case 'heading':
        text(w, block.text)
        if (isString(block.text) && block.text.length > 90) report.warn(w, 'sarlavha juda uzun')
        break
      case 'paragraph':
        text(w, block.text)
        break
      case 'note':
        if (!NOTE_KINDS.has(block.kind)) report.error(w, `note.kind noto'g'ri: ${JSON.stringify(block.kind)}`)
        text(w, block.text)
        break
      case 'list':
        if (typeof block.ordered !== 'boolean') report.error(w, 'list.ordered boolean bo\'lishi kerak')
        if (!Array.isArray(block.items) || block.items.length === 0) report.error(w, 'list.items bo\'sh')
        else block.items.forEach((item, j) => text(`${w}.items[${j}]`, item))
        break
      case 'snippet':
        if (!nonEmpty(block.code)) report.error(w, 'snippet.code bo\'sh')
        else {
          checkCode(report, w, block.code, lang)
          chars += block.code.length
        }
        break
      case 'table':
        if (!Array.isArray(block.headers) || block.headers.length === 0) report.error(w, 'table.headers bo\'sh')
        else {
          // birinchi (burchak) ustun sarlavhasi bo'sh bo'lishi mumkin — taqqoslash jadvallarida odatiy
          if (!block.headers.some(nonEmpty)) report.error(w, 'table.headers hammasi bo\'sh')
          block.headers.forEach((header, j) => (isString(header) && header === '' ? null : text(`${w}.headers[${j}]`, header)))
        }
        if (!Array.isArray(block.rows) || block.rows.length === 0) report.error(w, 'table.rows bo\'sh')
        else
          block.rows.forEach((row, j) => {
            if (!Array.isArray(row) || row.length !== (block.headers?.length ?? 0))
              report.error(`${w}.rows[${j}]`, `ustunlar soni ${block.headers?.length} bo'lishi kerak`)
            else row.forEach((cell, k) => (isString(cell) ? text(`${w}.rows[${j}][${k}]`, cell) : report.error(`${w}.rows[${j}][${k}]`, 'satr emas')))
          })
        break
    }
  })
  return { chars, counts }
}

function validateExample(report, where, example, lang, { requireId }) {
  if (!example || typeof example !== 'object') return report.error(where, 'misol obyekt emas')
  if (requireId && !(isString(example.id) && EXAMPLE_ID_RE.test(example.id))) report.error(where, `id noto'g'ri: ${JSON.stringify(example.id)}`)
  if (!nonEmpty(example.title)) report.error(where, 'title bo\'sh')
  else {
    checkMarkup(report, `${where}.title`, example.title)
    if (/^\d+[.)]\s/.test(example.title)) report.warn(`${where}.title`, `raqamli prefiks keraksiz (kartochkada raqam bor): "${short(example.title)}"`)
  }
  if (example.description !== undefined) {
    if (!nonEmpty(example.description)) report.error(where, 'description bo\'sh satr — olib tashlansin')
    else checkMarkup(report, `${where}.description`, example.description)
  }
  if (!nonEmpty(example.code)) report.error(where, 'code bo\'sh')
  else checkCode(report, `${where}.code`, example.code, lang)
  if (example.output !== undefined && !nonEmpty(example.output)) report.error(where, 'output bo\'sh satr — olib tashlansin')
  for (const key of Object.keys(example)) {
    if (!['id', 'title', 'description', 'code', 'output'].includes(key)) report.warn(where, `noma'lum maydon: ${key}`)
  }
}

function topicStats(topic) {
  const examples = Array.isArray(topic.examples) ? topic.examples : []
  const blocks = Array.isArray(topic.blocks) ? topic.blocks : []
  let chars = 0
  for (const block of blocks) {
    if (block.type === 'list') chars += block.items?.join('').length ?? 0
    else if (block.type === 'table') chars += block.rows?.flat().join('').length ?? 0
    else chars += (block.text ?? block.code ?? '').length
  }
  return {
    blocks: blocks.length,
    chars,
    examples: examples.length,
    withOutput: examples.filter((e) => nonEmpty(e.output)).length,
    withDescription: examples.filter((e) => nonEmpty(e.description)).length,
    avgCode: examples.length ? Math.round(examples.reduce((s, e) => s + (e.code?.length ?? 0), 0) / examples.length) : 0,
  }
}

/** To'liq mavzuni tekshiradi. `quality` — sifat chegaralari ogohlantirish sifatida. */
function validateTopic(report, where, topic, lang, { quality, requireExampleIds }) {
  if (!topic || typeof topic !== 'object') return report.error(where, 'mavzu obyekt emas')
  if (!(isString(topic.id) && ID_RE.test(topic.id))) report.error(where, `id noto'g'ri (kebab-case): ${JSON.stringify(topic.id)}`)
  if (!nonEmpty(topic.title)) report.error(where, 'title bo\'sh')
  if (!nonEmpty(topic.summary)) report.error(where, 'summary bo\'sh')
  else {
    checkMarkup(report, `${where}.summary`, topic.summary)
    if (topic.summary.length > 100) report.warn(where, `summary juda uzun (${topic.summary.length} belgi) — ro'yxatda bir qatorda ko'rinishi kerak`)
  }
  const { counts } = validateBlocks(report, where, topic.blocks, lang)
  if (!Array.isArray(topic.examples)) report.error(where, 'examples massiv bo\'lishi kerak')
  else {
    const codes = new Map()
    const titles = new Map()
    topic.examples.forEach((example, i) => {
      const w = `${where} examples[${i}]${example?.id ? ` (${example.id})` : ''}`
      validateExample(report, w, example, lang, { requireId: requireExampleIds })
      if (isString(example?.code)) {
        const key = normalizeCode(example.code)
        if (codes.has(key)) report.error(w, `kod ${codes.get(key)} bilan bir xil (takror misol)`)
        else codes.set(key, `examples[${i}]`)
      }
      if (isString(example?.title)) {
        const key = example.title.trim().toLowerCase()
        if (titles.has(key)) report.warn(w, `sarlavha ${titles.get(key)} bilan bir xil`)
        else titles.set(key, `examples[${i}]`)
      }
    })
    if (requireExampleIds) {
      topic.examples.forEach((example, i) => {
        if (example?.id !== `ex${i + 1}`) report.error(`${where} examples[${i}]`, `id ex${i + 1} bo'lishi kerak, ${JSON.stringify(example?.id)} emas`)
      })
    }
  }
  for (const key of Object.keys(topic)) {
    if (!['id', 'title', 'summary', 'blocks', 'examples'].includes(key)) report.warn(where, `noma'lum maydon: ${key}`)
  }
  if (quality) qualityWarnings(report, where, topic, lang, counts)
}

function qualityWarnings(report, where, topic, lang, counts) {
  const stats = topicStats(topic)
  if (stats.blocks < QUALITY.minBlocks) report.warn(where, `nazariya qisqa: ${stats.blocks} blok (kamida ${QUALITY.minBlocks} kutiladi)`)
  if (stats.chars < QUALITY.minTheoryChars) report.warn(where, `nazariya matni kam: ${stats.chars} belgi (kamida ${QUALITY.minTheoryChars})`)
  if (counts && counts.heading < 3) report.warn(where, 'nazariyada 3 tadan kam sarlavha (heading) — bo\'limlarga ajrating')
  if (counts && counts.snippet === 0) report.warn(where, 'nazariyada kod parchasi (snippet) yo\'q')
  if (counts && counts.note === 0) report.warn(where, 'nazariyada eslatma (note) yo\'q')
  if (counts && counts.list === 0) report.warn(where, 'nazariyada ro\'yxat (list) yo\'q')
  if (stats.examples < QUALITY.minExamples) report.warn(where, `misollar kam: ${stats.examples} (kamida ${QUALITY.minExamples} kutiladi)`)
  if (stats.examples > 0) {
    const outputRatio = stats.withOutput / stats.examples
    const threshold = RUNNABLE_LANGUAGES.has(lang) ? QUALITY.minOutputRatio : 0.5
    if (outputRatio < threshold) report.warn(where, `natijasi (output) bor misollar kam: ${stats.withOutput}/${stats.examples}`)
    if (stats.withDescription / stats.examples < QUALITY.minDescriptionRatio)
      report.warn(where, `izohi (description) bor misollar kam: ${stats.withDescription}/${stats.examples}`)
  }
}

function validateCategory(report, where, category, lang, options) {
  if (!category || typeof category !== 'object') return report.error(where, 'bo\'lim obyekt emas')
  if (!(isString(category.id) && ID_RE.test(category.id))) report.error(where, `id noto'g'ri: ${JSON.stringify(category.id)}`)
  if (!nonEmpty(category.title)) report.error(where, 'title bo\'sh')
  if (!nonEmpty(category.description)) report.error(where, 'description bo\'sh')
  else {
    checkMarkup(report, `${where}.description`, category.description)
    // kategoriya tavsifi kartochka va sarlavhada oddiy matn sifatida chiziladi (InlineText ishlatilmaydi)
    if (/`|\*\*/.test(category.description)) report.error(`${where}.description`, 'kategoriya tavsifida ` yoki ** ishlatilmasin — oddiy matn sifatida chiqadi')
  }
  if (!Array.isArray(category.topics) || category.topics.length === 0) return report.error(where, 'topics bo\'sh')
  const ids = new Set()
  for (const topic of category.topics) {
    if (ids.has(topic?.id)) report.error(where, `mavzu id takrorlangan: ${topic.id}`)
    ids.add(topic?.id)
    validateTopic(report, `${where}/${topic?.id}`, topic, lang, options)
  }
}

function summarizeCategory(category) {
  return {
    id: category.id,
    title: category.title,
    description: category.description,
    topics: category.topics.map((topic) => ({ id: topic.id, title: topic.title, summary: topic.summary, exampleCount: topic.examples.length })),
  }
}

function languageFiles(languageId) {
  const dir = join(DATA_DIR, languageId)
  if (!existsSync(dir)) return new Map()
  return new Map(
    readdirSync(dir)
      .filter((file) => file.endsWith('.json'))
      .map((file) => [basename(file, '.json'), readJson(join(dir, file))]),
  )
}

// ---------------------------------------------------------------------------------------------------------------------
// buyruqlar

function cmdValidate(languageFilter, quality) {
  const index = readJson(INDEX_FILE)
  const report = new Report()
  const seen = new Set()
  for (const language of index.languages) {
    if (seen.has(language.id)) report.error('index.json', `til id takrorlangan: ${language.id}`)
    seen.add(language.id)
    if (languageFilter && language.id !== languageFilter) continue
    const files = languageFiles(language.id)
    if (language.isAvailable !== files.size > 0) report.error(`index.json/${language.id}`, `isAvailable=${language.isAvailable}, lekin ${files.size} ta bo'lim fayli bor`)
    for (const summary of language.categories) {
      const category = files.get(summary.id)
      if (!category) {
        report.error(`index.json/${language.id}`, `bo'lim fayli yo'q: ${summary.id}.json`)
        continue
      }
      validateCategory(report, `${language.id}/${summary.id}`, category, language.id, { quality, requireExampleIds: true })
      if (JSON.stringify(summarizeCategory(category)) !== JSON.stringify(summary))
        report.error(`index.json/${language.id}/${summary.id}`, 'indeks fayl bilan mos emas (rebuild-index kerak)')
    }
    const listed = new Set(language.categories.map((c) => c.id))
    for (const id of files.keys()) if (!listed.has(id)) report.warn(`${language.id}`, `bo'lim fayli indeksda yo'q: ${id}.json (rebuild-index)`)
  }
  report.print('Tekshiruv natijasi')
  return report.ok
}

function cmdStats(languageFilter) {
  const index = readJson(INDEX_FILE)
  for (const language of index.languages) {
    if (!language.isAvailable || (languageFilter && language.id !== languageFilter)) continue
    const files = languageFiles(language.id)
    console.log(`\n##### ${language.id}`)
    console.log('bo\'lim/mavzu | bloklar | matn | misollar | o\'rtacha kod | izohli | natijali')
    let totals = { topics: 0, examples: 0 }
    for (const summary of language.categories) {
      const category = files.get(summary.id)
      if (!category) continue
      for (const topic of category.topics) {
        const s = topicStats(topic)
        totals.topics++
        totals.examples += s.examples
        console.log(`${summary.id}/${topic.id} | ${s.blocks} | ${s.chars} | ${s.examples} | ${s.avgCode} | ${s.withDescription} | ${s.withOutput}`)
      }
    }
    console.log(`jami: ${language.categories.length} bo'lim, ${totals.topics} mavzu, ${totals.examples} misol`)
  }
}

function cmdExport(languageId, categoryId, topicId, brief) {
  const file = join(DATA_DIR, languageId, `${categoryId}.json`)
  if (!existsSync(file)) throw new Error(`Bo'lim topilmadi: ${file}`)
  const category = readJson(file)
  const topics = topicId ? category.topics.filter((t) => t.id === topicId) : category.topics
  if (topics.length === 0) throw new Error(`Mavzu topilmadi: ${topicId}`)
  if (brief) {
    console.log(`# ${category.id} — ${category.title}\n${category.description}\n`)
    console.log(`Mavzular tartibi: ${category.topics.map((t) => t.id).join(', ')}\n`)
    for (const topic of topics) {
      console.log(`\n## ${topic.id} — ${topic.title}\nsummary: ${topic.summary}\n\n### Nazariya (${topic.blocks.length} blok)`)
      console.log(JSON.stringify(topic.blocks, null, 1))
      console.log(`\n### Misollar (${topic.examples.length})`)
      for (const e of topic.examples) {
        const lines = e.code.split('\n').length
        console.log(`- ${e.id} | ${e.title} | ${lines} qator${e.output ? '' : ' | NATIJA YO\'Q'}${e.description ? '' : ' | IZOH YO\'Q'}`)
      }
    }
    return
  }
  const outDir = join(STAGING_DIR, '_export', languageId, categoryId)
  mkdirSync(outDir, { recursive: true })
  for (const topic of topics) {
    const out = join(outDir, `${topic.id}.json`)
    writeJson(out, topic, true)
    console.log(out)
  }
}

/** Fayl yo'lidan til va bo'limni aniqlaydi (.content-staging/<til>/<bo'lim>/fayl). */
function stagingContext(file) {
  const rel = relative(STAGING_DIR, resolve(file)).split(sep)
  if (rel[0]?.startsWith('.') || rel.length < 3) return { lang: undefined, categoryId: undefined }
  return { lang: rel[0], categoryId: rel[1] }
}

function existingTopic(lang, categoryId, topicId) {
  if (!lang || !categoryId) return undefined
  const file = join(DATA_DIR, lang, `${categoryId}.json`)
  if (!existsSync(file)) return undefined
  return readJson(file).topics.find((t) => t.id === topicId)
}

/** Patch'ni mavzuga qo'llaydi (nusxa qaytaradi). */
function applyPatch(report, where, topic, patch) {
  const result = { ...topic, blocks: [...topic.blocks], examples: topic.examples.map((e) => ({ ...e })) }
  for (const key of Object.keys(patch)) {
    if (!['id', 'title', 'summary', 'blocks', 'replaceExamples', 'addExamples'].includes(key)) report.warn(where, `patch'da noma'lum maydon: ${key}`)
  }
  if (patch.title !== undefined) nonEmpty(patch.title) ? (result.title = patch.title) : report.error(where, 'patch.title bo\'sh')
  if (patch.summary !== undefined) nonEmpty(patch.summary) ? (result.summary = patch.summary) : report.error(where, 'patch.summary bo\'sh')
  if (patch.blocks !== undefined) Array.isArray(patch.blocks) ? (result.blocks = patch.blocks) : report.error(where, 'patch.blocks massiv emas')
  if (patch.replaceExamples !== undefined) {
    if (!patch.replaceExamples || typeof patch.replaceExamples !== 'object' || Array.isArray(patch.replaceExamples))
      report.error(where, 'patch.replaceExamples obyekt bo\'lishi kerak ({ "ex3": {...} })')
    else
      for (const [id, example] of Object.entries(patch.replaceExamples)) {
        const index = result.examples.findIndex((e) => e.id === id)
        if (index === -1) report.error(where, `replaceExamples: ${id} mavzuda yo'q`)
        else result.examples[index] = { ...example, id }
      }
  }
  if (patch.addExamples !== undefined) {
    if (!Array.isArray(patch.addExamples)) report.error(where, 'patch.addExamples massiv bo\'lishi kerak')
    else for (const example of patch.addExamples) result.examples.push({ ...example, id: `ex${result.examples.length + 1}` })
  }
  return result
}

function renumberExamples(topic) {
  return { ...topic, examples: topic.examples.map((example, i) => ({ ...example, id: `ex${i + 1}` })) }
}

/** Misol maydonlarini standart tartibda yozadi (id, title, description, code, output). */
function normalizeExample(example) {
  const result = { id: example.id, title: example.title }
  if (example.description !== undefined) result.description = example.description
  result.code = example.code
  if (example.output !== undefined) result.output = example.output
  return result
}

function normalizeTopic(topic) {
  return {
    id: topic.id,
    title: topic.title,
    summary: topic.summary,
    blocks: topic.blocks,
    examples: topic.examples.map(normalizeExample),
  }
}

function checkFile(file, report) {
  const name = basename(file)
  const { lang, categoryId } = stagingContext(file)
  let data
  try {
    data = readJson(file)
  } catch (error) {
    report.error(name, `JSON o'qilmadi: ${error.message}`)
    return
  }
  if (name === '_category.json') {
    if (categoryId && data.id !== categoryId) report.error(name, `id (${data.id}) papka nomi (${categoryId}) bilan bir xil bo'lishi kerak`)
    if (!(isString(data.id) && ID_RE.test(data.id))) report.error(name, 'id kebab-case bo\'lishi kerak')
    if (!nonEmpty(data.title)) report.error(name, 'title bo\'sh')
    if (!nonEmpty(data.description)) report.error(name, 'description bo\'sh')
    else {
      checkMarkup(report, `${name}.description`, data.description)
      if (/`|\*\*/.test(data.description)) report.error(name, 'description da ` yoki ** ishlatilmasin — kategoriya tavsifi oddiy matn sifatida chiqadi')
    }
    if (data.topics !== undefined && !(Array.isArray(data.topics) && data.topics.every((id) => isString(id) && ID_RE.test(id))))
      report.error(name, 'topics — mavzu id\'lari massivi bo\'lishi kerak')
    if (data.position !== undefined && !(Number.isInteger(data.position) && data.position >= 0)) report.error(name, 'position — manfiy bo\'lmagan butun son')
    console.log(`  ${name}: bo'lim "${data.title}"${data.topics ? `, ${data.topics.length} mavzu tartibi` : ''}`)
    return
  }
  const match = TOPIC_FILE_RE.exec(name)
  if (!match) {
    report.error(name, 'fayl nomi NN-<mavzu-id>.json yoki NN-<mavzu-id>.patch.json bo\'lishi kerak')
    return
  }
  const topicId = match[2]
  const isPatch = Boolean(match[3])
  if (data.id !== undefined && data.id !== topicId) report.error(name, `id (${data.id}) fayl nomidagi (${topicId}) bilan bir xil bo'lishi kerak`)
  if (isPatch) {
    const current = existingTopic(lang, categoryId, topicId)
    if (!current) {
      report.error(name, `patch uchun mavjud mavzu topilmadi: ${lang}/${categoryId}/${topicId}`)
      return
    }
    const merged = applyPatch(report, name, current, data)
    validateTopic(report, name, merged, lang, { quality: true, requireExampleIds: true })
    const s = topicStats(merged)
    const added = data.addExamples?.length ?? 0
    const replaced = Object.keys(data.replaceExamples ?? {}).length
    console.log(
      `  ${name}: patch → ${s.blocks} blok, ${s.chars} belgi, ${s.examples} misol (${replaced} almashtirildi, ${added} qo'shildi), natijali ${s.withOutput}, izohli ${s.withDescription}`,
    )
  } else {
    const topic = renumberExamples({ ...data, id: topicId, examples: Array.isArray(data.examples) ? data.examples : [] })
    validateTopic(report, name, topic, lang, { quality: true, requireExampleIds: true })
    const s = topicStats(topic)
    console.log(`  ${name}: ${s.blocks} blok, ${s.chars} belgi, ${s.examples} misol, natijali ${s.withOutput}, izohli ${s.withDescription}, o'rtacha kod ${s.avgCode}`)
  }
}

function collectJsonFiles(path, out = []) {
  const full = resolve(path)
  if (!existsSync(full)) throw new Error(`Topilmadi: ${path}`)
  if (statSync(full).isDirectory()) {
    for (const entry of readdirSync(full)) if (!entry.startsWith('_') || entry === '_category.json') collectJsonFiles(join(full, entry), out)
  } else if (full.endsWith('.json')) out.push(full)
  return out
}

function cmdCheck(paths) {
  const report = new Report()
  const files = paths.flatMap((p) => collectJsonFiles(p))
  if (files.length === 0) throw new Error('Tekshirish uchun JSON fayl topilmadi')
  for (const file of files) checkFile(file, report)
  report.print('Tekshiruv natijasi')
  return report.ok
}

function cmdImport(languageId, { dry, keep, only }) {
  const langDir = join(STAGING_DIR, languageId)
  if (!existsSync(langDir)) throw new Error(`Tayyorlash papkasi yo'q: ${langDir}`)
  const index = readJson(INDEX_FILE)
  const language = index.languages.find((l) => l.id === languageId)
  if (!language) throw new Error(`index.json da til yo'q: ${languageId}`)

  const report = new Report()
  const results = []
  const positions = {}
  const onlyIds = only ? new Set(only.split(',').map((s) => s.trim()).filter(Boolean)) : null
  const categoryDirs = readdirSync(langDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
    .map((entry) => entry.name)
    .filter((name) => !onlyIds || onlyIds.has(name))
    .sort()
  if (categoryDirs.length === 0) throw new Error('Import qilinadigan bo\'lim papkasi topilmadi')

  for (const categoryId of categoryDirs) {
    const dir = join(langDir, categoryId)
    const where = `${languageId}/${categoryId}`
    if (!ID_RE.test(categoryId)) {
      report.error(where, 'bo\'lim papkasi nomi kebab-case bo\'lishi kerak')
      continue
    }
    const metaFile = join(dir, '_category.json')
    const meta = existsSync(metaFile) ? readJson(metaFile) : null
    const categoryFile = join(DATA_DIR, languageId, `${categoryId}.json`)
    let category = existsSync(categoryFile) ? readJson(categoryFile) : null
    if (!category) {
      if (!meta || !nonEmpty(meta.title) || !nonEmpty(meta.description)) {
        report.error(where, 'yangi bo\'lim uchun _category.json (title, description) kerak')
        continue
      }
      category = { id: categoryId, title: meta.title, description: meta.description, topics: [] }
    } else if (meta) {
      if (nonEmpty(meta.title)) category.title = meta.title
      if (nonEmpty(meta.description)) category.description = meta.description
    }
    if (meta && Number.isInteger(meta.position)) positions[categoryId] = meta.position

    const files = readdirSync(dir).filter((file) => file.endsWith('.json') && file !== '_category.json')
    const parsed = []
    for (const file of files) {
      const match = TOPIC_FILE_RE.exec(file)
      if (!match) report.error(`${where}/${file}`, 'fayl nomi NN-<mavzu-id>.json yoki .patch.json bo\'lishi kerak')
      else parsed.push({ file, order: Number(match[1]), topicId: match[2], isPatch: Boolean(match[3]) })
    }
    parsed.sort((a, b) => a.order - b.order || a.file.localeCompare(b.file))
    for (const entry of parsed) {
      const w = `${where}/${entry.file}`
      let data
      try {
        data = readJson(join(dir, entry.file))
      } catch (error) {
        report.error(w, `JSON o'qilmadi: ${error.message}`)
        continue
      }
      if (data.id !== undefined && data.id !== entry.topicId) report.error(w, `id (${data.id}) fayl nomi (${entry.topicId}) bilan mos emas`)
      const index = category.topics.findIndex((t) => t.id === entry.topicId)
      if (entry.isPatch) {
        if (index === -1) report.error(w, 'patch uchun mavjud mavzu topilmadi')
        else category.topics[index] = normalizeTopic(applyPatch(report, w, category.topics[index], data))
      } else {
        const topic = normalizeTopic(renumberExamples({ ...data, id: entry.topicId, examples: Array.isArray(data.examples) ? data.examples : [] }))
        if (index === -1) category.topics.push(topic)
        else category.topics[index] = topic
      }
    }
    if (meta?.topics) {
      const order = meta.topics
      const known = order.map((id) => category.topics.find((t) => t.id === id)).filter(Boolean)
      const unknown = category.topics.filter((t) => !order.includes(t.id))
      for (const id of order) if (!category.topics.some((t) => t.id === id)) report.warn(where, `_category.topics da ko'rsatilgan mavzu hali yo'q: ${id}`)
      for (const t of unknown) report.warn(where, `mavzu _category.topics da yo'q, oxiriga qo'shildi: ${t.id}`)
      category.topics = [...known, ...unknown]
    }
    validateCategory(report, where, category, languageId, { quality: false, requireExampleIds: true })
    results.push({ categoryId, category, isNew: !existsSync(categoryFile), dir })
  }

  report.print(`Import tekshiruvi: ${languageId}`)
  if (!report.ok) {
    console.log('\nXatolar bor — hech narsa yozilmadi.')
    return false
  }
  for (const { categoryId, category, isNew } of results) {
    const topics = category.topics.length
    const examples = category.topics.reduce((s, t) => s + t.examples.length, 0)
    console.log(`  ${isNew ? '+ yangi' : '~ yangilandi'} ${categoryId}: ${topics} mavzu, ${examples} misol`)
  }
  if (dry) {
    console.log('\n--dry: fayllar yozilmadi.')
    return true
  }
  mkdirSync(join(DATA_DIR, languageId), { recursive: true })
  for (const { categoryId, category } of results) writeJson(join(DATA_DIR, languageId, `${categoryId}.json`), category)
  rebuildIndex(index, { [languageId]: positions })
  writeJson(INDEX_FILE, index)
  if (!keep) {
    const doneDir = join(STAGING_DIR, '_done', languageId)
    mkdirSync(doneDir, { recursive: true })
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    for (const { categoryId, dir } of results) renameSync(dir, join(doneDir, `${categoryId}-${stamp}`))
  }
  console.log(`\nYozildi: ${results.length} bo'lim → public/data/${languageId}/, index.json yangilandi.`)
  return true
}

/** index.json ni bo'lim fayllaridan qayta yaratadi: tillar katalogi (nom, rang, tartib) saqlanadi. */
function rebuildIndex(index, positionsByLanguage = {}) {
  for (const language of index.languages) {
    const files = languageFiles(language.id)
    const positions = positionsByLanguage[language.id] ?? {}
    const existingOrder = language.categories.map((c) => c.id).filter((id) => files.has(id) && positions[id] === undefined)
    const positioned = [...files.keys()].filter((id) => positions[id] !== undefined).sort((a, b) => positions[a] - positions[b])
    const appended = [...files.keys()].filter((id) => !existingOrder.includes(id) && positions[id] === undefined).sort()
    const order = [...existingOrder, ...appended]
    for (const id of positioned) order.splice(Math.min(positions[id], order.length), 0, id)
    language.categories = order.map((id) => summarizeCategory(files.get(id)))
    language.isAvailable = language.categories.length > 0
  }
}

function cmdRebuildIndex() {
  const index = readJson(INDEX_FILE)
  rebuildIndex(index)
  writeJson(INDEX_FILE, index)
  for (const language of index.languages) {
    if (!language.isAvailable) continue
    const topics = language.categories.reduce((s, c) => s + c.topics.length, 0)
    const examples = language.categories.reduce((s, c) => s + c.topics.reduce((a, t) => a + t.exampleCount, 0), 0)
    console.log(`  ${language.id}: ${language.categories.length} bo'lim, ${topics} mavzu, ${examples} misol`)
  }
  console.log('index.json yangilandi.')
}

// ---------------------------------------------------------------------------------------------------------------------
// misollarni ishga tushirish

/** Portativ Go (go.dev/dl zip'idan ochilgan). RECIPE_GO muhit o'zgaruvchisi yoki PATH dagi `go` ustun turadi. */
const GO_FALLBACK = 'C:/Users/iD_GROUP/sdk/go1.27.2/bin/go.exe'
// faqat brauzer API'sidan foydalanish belgilari (oddiy so'z yoki `typeof window` emas): document., window., localStorage. ..., alert(
const BROWSER_ONLY_RE = /\b(?:document|window|localStorage|sessionStorage|navigator)\s*[.[]|\b(?:alert|prompt|confirm)\s*\(/
const RUN_TIMEOUT_MS = 30_000

/**
 * NestJS misollari uchun ish papkasi: NestJS 12 + testApp yordamchisi o'rnatilgan papka (node_modules, src/test-app.ts).
 * RECIPE_NEST_DIR bilan o'zgartiriladi. Qayta yaratish: bo'sh papkada `npm i @nestjs/common @nestjs/core
 * @nestjs/platform-express @nestjs/testing @nestjs/config @nestjs/cache-manager cache-manager class-validator
 * class-transformer reflect-metadata rxjs typescript @types/node @types/express` va src/test-app.ts
 * (nestjs-intro/running-examples mavzusidagi yordamchi).
 */
const NEST_DIR =
  process.env.RECIPE_NEST_DIR ??
  'C:/Users/PR2077/AppData/Local/Temp/claude/d--BACKEND-APPS-ReactJS-Recipe/7a1ec37b-1906-44dc-8be2-5994f18c7c41/scratchpad/nestrun'

const NEST_TSCONFIG = {
  compilerOptions: {
    target: 'ES2022',
    module: 'nodenext',
    moduleResolution: 'nodenext',
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    strict: false,
    skipLibCheck: true,
    esModuleInterop: true,
    noEmitOnError: false,
    outDir: 'out',
    rootDir: '.',
    types: ['node'],
  },
  include: ['*.ts'],
}

function goBinary() {
  if (process.env.RECIPE_GO) return process.env.RECIPE_GO
  const probe = spawnSync('go', ['version'], { encoding: 'utf8' })
  if (probe.status === 0) return 'go'
  return GO_FALLBACK
}

const normalizeOutput = (text) =>
  text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
    .replace(/^\n+|\n+$/g, '')

/** Misolni ishga tushirib bo'lmasligi sababi yoki null (ishga tushirish mumkin). */
function skipReason(lang, code) {
  if (/^\s*\/\/\s*no-run\b/.test(code)) return 'no-run belgisi'
  const files = (code.match(/^\/\/ fayl:/gm) ?? []).length
  if (files > 1) return "bir nechta fayl (// fayl:)"
  if (lang === 'golang') {
    if ((code.match(/^package /gm) ?? []).length !== 1) return "bitta `package main` bo'lishi kerak"
    if (!/^package main\b/m.test(code)) return 'package main emas'
  } else if (lang === 'nestjs') {
    if (/Terminalda:|^\s*\$ /m.test(code)) return 'terminal buyruqlari'
    if (!/\btestApp\b/.test(code) && !/\bNestFactory\b|\bTest\.createTestingModule\b/.test(code)) return 'testApp/NestFactory ishlatilmagan (ishga tushiriladigan kod emas)'
  } else if (BROWSER_ONLY_RE.test(code.replace(/\/\/.*$/gm, ''))) return 'brauzer API (document/window/...)'
  return null
}

/** NestJS misolini alohida papkada kompilyatsiya qilib (tsc), ishga tushiradi. workDir NEST_DIR ichida bo'lishi shart. */
function runNestCode(code, workDir) {
  const helper = join(NEST_DIR, 'src', 'test-app.ts')
  if (!existsSync(helper) || !existsSync(join(NEST_DIR, 'node_modules', '@nestjs', 'core'))) {
    return { error: `NestJS ish papkasi tayyor emas: ${NEST_DIR} (RECIPE_NEST_DIR yoki content.mjs dagi izohga qarang)` }
  }
  writeFileSync(join(workDir, 'test-app.ts'), readFileSync(helper, 'utf8'))
  writeFileSync(join(workDir, 'main.ts'), `import { testApp } from "./test-app"\n${code}\n`)
  writeFileSync(join(workDir, 'tsconfig.json'), JSON.stringify(NEST_TSCONFIG))
  const env = { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0', TZ: 'Asia/Tashkent' }
  const tsc = spawnSync(process.execPath, [join(NEST_DIR, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', 'tsconfig.json'], {
    cwd: workDir, encoding: 'utf8', timeout: RUN_TIMEOUT_MS, env,
  })
  if (!existsSync(join(workDir, 'out', 'main.js'))) {
    return { stdout: '', stderr: `tsc: main.js yaratilmadi\n${tsc.stdout ?? ''}${tsc.stderr ?? ''}`, status: 1 }
  }
  const run = spawnSync(process.execPath, ['--no-warnings', 'out/main.js'], {
    cwd: workDir, encoding: 'utf8', timeout: RUN_TIMEOUT_MS, maxBuffer: 16 * 1024 * 1024, env,
  })
  return {
    stdout: run.stdout ?? '',
    stderr: run.stderr ?? '',
    status: run.status,
    timedOut: run.error?.code === 'ETIMEDOUT',
    error: run.error && run.error.code !== 'ETIMEDOUT' ? run.error.message : undefined,
  }
}

function runCode(lang, code, workDir) {
  if (lang === 'nestjs') return runNestCode(code, workDir)
  const options = {
    cwd: workDir,
    encoding: 'utf8',
    timeout: RUN_TIMEOUT_MS,
    maxBuffer: 16 * 1024 * 1024,
    env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0', TZ: 'Asia/Tashkent', LANG: 'en_US.UTF-8' },
  }
  let result
  if (lang === 'golang') {
    writeFileSync(join(workDir, 'go.mod'), 'module example\n\ngo 1.27\n')
    writeFileSync(join(workDir, 'main.go'), code)
    result = spawnSync(goBinary(), ['run', '.'], { ...options, env: { ...options.env, GOTOOLCHAIN: 'local', GOFLAGS: '-mod=mod' } })
  } else if (lang === 'typescript') {
    writeFileSync(join(workDir, 'main.mts'), code)
    result = spawnSync(process.execPath, ['--experimental-transform-types', '--no-warnings', 'main.mts'], options)
  } else if (lang === 'javascript') {
    const commonJs = /\brequire\s*\(/.test(code) && !/^\s*import\s/m.test(code)
    const file = commonJs ? 'main.cjs' : 'main.mjs'
    writeFileSync(join(workDir, file), code)
    result = spawnSync(process.execPath, ['--no-warnings', file], options)
  } else {
    return { unsupported: true }
  }
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    status: result.status,
    timedOut: result.error?.code === 'ETIMEDOUT',
    error: result.error && result.error.code !== 'ETIMEDOUT' ? result.error.message : undefined,
  }
}

function diffPreview(expected, actual) {
  const a = expected.split('\n')
  const b = actual.split('\n')
  const lines = []
  for (let i = 0; i < Math.max(a.length, b.length) && lines.length < 6; i++) {
    if (a[i] !== b[i]) lines.push(`      kutilgan[${i + 1}]: ${a[i] === undefined ? '(yo\'q)' : short(a[i], 100)}\n      aslida  [${i + 1}]: ${b[i] === undefined ? '(yo\'q)' : short(b[i], 100)}`)
  }
  return lines.join('\n')
}

/** Faylni (mavzu, patch yoki bo'lim) ishga tushiriladigan misollar ro'yxatiga aylantiradi. */
function collectRunnableExamples(file, data, topicFilter) {
  const name = basename(file)
  if (name.endsWith('.patch.json')) {
    const list = []
    for (const [id, example] of Object.entries(data.replaceExamples ?? {})) list.push({ label: `${id} (almashtirish)`, example })
    ;(data.addExamples ?? []).forEach((example, i) => list.push({ label: `qo'shimcha #${i + 1}`, example }))
    return list
  }
  if (Array.isArray(data.topics)) {
    const topics = topicFilter ? data.topics.filter((t) => t.id === topicFilter) : data.topics
    return topics.flatMap((topic) => topic.examples.map((example) => ({ label: `${topic.id}/${example.id}`, example })))
  }
  return (data.examples ?? []).map((example, i) => ({ label: example.id ?? `#${i + 1}`, example }))
}

function cmdRun(file, { only, topic, update, lang: langFlag }) {
  const full = resolve(file)
  if (!existsSync(full)) throw new Error(`Fayl topilmadi: ${file}`)
  const relData = relative(DATA_DIR, full).split(sep)
  const lang = langFlag ?? (!relData[0].startsWith('.') && relData.length === 2 ? relData[0] : stagingContext(full).lang)
  if (!lang) throw new Error("Til aniqlanmadi — --lang typescript|javascript|golang ko'rsating")
  if (!RUNNABLE_LANGUAGES.has(lang)) throw new Error(`${lang} misollarini ishga tushirish qo'llab-quvvatlanmaydi (faqat ${[...RUNNABLE_LANGUAGES].join(', ')})`)
  const data = readJson(full)
  const entries = collectRunnableExamples(full, data, topic).filter((entry) => !only || entry.label.startsWith(only) || entry.label.endsWith(`/${only}`))
  if (entries.length === 0) throw new Error('Ishga tushiriladigan misol topilmadi')

  // NestJS: node_modules ni topish uchun ish papkasi NEST_DIR ichida bo'lishi kerak
  const runRoot = lang === 'nestjs' ? join(NEST_DIR, '_work') : join(STAGING_DIR, '_run')
  mkdirSync(runRoot, { recursive: true })
  const summary = { ok: 0, mismatch: 0, failed: 0, skipped: 0, updated: 0 }
  const startedAt = Date.now()
  entries.forEach((entry, i) => {
    const { label, example } = entry
    const reason = skipReason(lang, example.code)
    if (reason) {
      summary.skipped++
      console.log(`  • ${label} — o'tkazib yuborildi (${reason})${example.output ? '' : ' — natija yo\'q'}`)
      return
    }
    const workDir = join(runRoot, `${process.pid}-${i}`)
    mkdirSync(workDir, { recursive: true })
    try {
      const result = runCode(lang, example.code, workDir)
      const actual = normalizeOutput(`${result.stdout}${result.status === 0 ? '' : result.stderr}`)
      if (result.timedOut) {
        summary.failed++
        console.log(`  ✖ ${label} — vaqt tugadi (${RUN_TIMEOUT_MS / 1000}s): dastur tugamadi (server/sikl?)`)
      } else if (result.error || result.status !== 0) {
        summary.failed++
        const expectsError = nonEmpty(example.output) && normalizeOutput(example.output) === actual
        if (expectsError) {
          summary.failed--
          summary.ok++
          console.log(`  ✔ ${label} (xato bilan tugaydi — natija mos)`)
        } else {
          console.log(`  ✖ ${label} — dastur xato bilan tugadi (status ${result.status ?? '?'}):\n      ${short(normalizeOutput(result.stderr || result.stdout || result.error || ''), 400).split('\n').slice(0, 6).join('\n      ')}`)
        }
      } else {
        const expected = nonEmpty(example.output) ? normalizeOutput(example.output) : ''
        if (expected === actual) {
          summary.ok++
          console.log(`  ✔ ${label}`)
        } else if (update) {
          example.output = actual.length > 0 ? actual : undefined
          if (actual.length === 0) delete example.output
          summary.updated++
          console.log(`  ↻ ${label} — natija yangilandi${expected ? ' (oldingisi boshqa edi)' : ' (bo\'sh edi)'}`)
        } else {
          summary.mismatch++
          console.log(`  ✖ ${label} — natija mos emas:\n${diffPreview(expected, actual)}`)
        }
      }
    } finally {
      rmSync(workDir, { recursive: true, force: true })
    }
  })
  if (update && summary.updated > 0) {
    writeJson(full, data, !relData[0].startsWith('.') ? false : true)
    console.log(`\n${summary.updated} ta natija faylga yozildi: ${file}`)
  }
  console.log(
    `\nJami ${entries.length}: ✔ ${summary.ok} mos, ✖ ${summary.mismatch} mos emas, ✖ ${summary.failed} xato/tugamadi, • ${summary.skipped} o'tkazildi${update ? `, ↻ ${summary.updated} yangilandi` : ''} (${Math.round((Date.now() - startedAt) / 1000)}s)`,
  )
  return summary.mismatch === 0 && summary.failed === 0
}

// ---------------------------------------------------------------------------------------------------------------------

function flagValue(flags, name) {
  for (const flag of flags) if (flag.startsWith(`${name}=`)) return flag.slice(name.length + 1)
  return undefined
}

const { positional, flags } = parseArgs(process.argv.slice(2))
const [command, ...rest] = positional
try {
  let ok = true
  switch (command) {
    case 'validate':
      ok = cmdValidate(rest[0], flags.has('--quality'))
      break
    case 'stats':
      cmdStats(rest[0])
      break
    case 'export':
      if (!rest[0] || !rest[1]) throw new Error('export <til> <bo\'lim> [mavzu] [--brief]')
      cmdExport(rest[0], rest[1], rest[2], flags.has('--brief'))
      break
    case 'check':
      if (rest.length === 0) throw new Error('check <fayl|papka>...')
      ok = cmdCheck(rest)
      break
    case 'import':
      if (!rest[0]) throw new Error('import <til> [--dry] [--keep] [--only=bolim1,bolim2]')
      ok = cmdImport(rest[0], { dry: flags.has('--dry'), keep: flags.has('--keep'), only: flagValue(flags, '--only') })
      break
    case 'rebuild-index':
      cmdRebuildIndex()
      break
    case 'run':
      if (!rest[0]) throw new Error('run <fayl> [--only=exN] [--topic=id] [--update] [--lang=til]')
      ok = cmdRun(rest[0], {
        only: flagValue(flags, '--only'),
        topic: flagValue(flags, '--topic'),
        update: flags.has('--update'),
        lang: flagValue(flags, '--lang'),
      })
      break
    default:
      console.log(readFileSync(new URL(import.meta.url), 'utf8').split('*/')[0].replace(/^\/\*\*\n|^ \* ?/gm, ''))
      ok = command === undefined
  }
  process.exit(ok ? 0 : 1)
} catch (error) {
  console.error(`Xato: ${error.message}`)
  process.exit(1)
}
