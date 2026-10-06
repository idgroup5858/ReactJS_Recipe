import type { CodeExample } from '@/domain/types'

/** Ulashiladigan matn — Android'dagi CodeExample.shareText() bilan bir xil: natija izoh sifatida qo'shiladi. */
export function exampleShareText(example: CodeExample): string {
  let text = `// ${example.title}\n\n${example.code}`
  if (example.output) {
    const outputLines = example.output.split('\n').map((line) => `// ${line}`)
    text += `\n\n// Natija:\n${outputLines.join('\n')}`
  }
  return text
}
