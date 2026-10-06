import CodeBlock from '@/components/content/CodeBlock'
import { Card, CardHeader } from '@/components/ui/Card'
import Switch from '@/components/ui/Switch'
import {
  MAX_CODE_FONT_SIZE,
  MIN_CODE_FONT_SIZE,
  setCodeFontSize,
  setShowLineNumbers,
  setWrapCodeLines,
  useSettings,
} from '@/store/settingsStore'

// Android'dagi PreviewCode bilan bir xil
const PREVIEW_CODE = `// Kod namunasi
function greet(name: string): string {
    return \`Salom, \${name}!\`
}
console.log(greet("TypeScript")) // juda uzun izoh qatori — o'ralishni tekshirish uchun`

function SwitchRow({ title, checked, onChange }: { title: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="text-sm text-neutral-800">{title}</span>
      <Switch checked={checked} onChange={onChange} label={title} />
    </div>
  )
}

/** Kod bloklari ko'rinishi: shrift o'lchami, qatorlarni o'rash, qator raqamlari va jonli namuna. */
export default function CodeStyleCard() {
  const settings = useSettings()
  return (
    <Card>
      <CardHeader title="Kod ko'rinishi" hint="Barcha misollar va kod parchalariga darhol qo'llanadi" />
      <div className="divide-y divide-neutral-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="code-font-size" className="text-sm text-neutral-800">
              Kod shrifti o'lchami
            </label>
            <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-brand-700 tabular-nums">{settings.codeFontSize} px</span>
          </div>
          <input
            id="code-font-size"
            type="range"
            min={MIN_CODE_FONT_SIZE}
            max={MAX_CODE_FONT_SIZE}
            step={1}
            value={settings.codeFontSize}
            onChange={(event) => setCodeFontSize(Number(event.target.value))}
            className="mt-3 w-full cursor-pointer"
          />
        </div>
        <SwitchRow title="Uzun qatorlarni o'rash" checked={settings.wrapCodeLines} onChange={setWrapCodeLines} />
        <SwitchRow title="Qator raqamlarini ko'rsatish" checked={settings.showLineNumbers} onChange={setShowLineNumbers} />
        <div className="space-y-2 px-4 py-4">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-neutral-500 uppercase">Ko'rinish namunasi</p>
          <CodeBlock code={PREVIEW_CODE} languageId={settings.selectedLanguageId} />
        </div>
      </div>
    </Card>
  )
}
