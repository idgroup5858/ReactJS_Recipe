import { memo, useMemo, type CSSProperties } from 'react'
import type { TokenType } from '@/highlight/codeTokenizer'
import { highlightLines } from '@/highlight/highlightLines'
import { cachedTokens } from '@/highlight/tokenCache'
import CopyCodeButton from './CopyCodeButton'

const TOKEN_CLASS: Record<TokenType, string> = {
  keyword: 'tok-keyword',
  declaration: 'tok-declaration',
  type: 'tok-type',
  function: 'tok-function',
  string: 'tok-string',
  number: 'tok-number',
  comment: 'tok-comment',
  punctuation: 'tok-punctuation',
  decorator: 'tok-decorator',
}

type Props = {
  code: string
  languageId: string
  /** burchakda (kursor ustiga kelganda) nusxalash tugmasi — nazariya ichidagi kod parchalari uchun */
  copyable?: boolean
}

/**
 * Ranglangan kod bloki. Har bir qator alohida chiziladi: o'rash o'chiq bo'lsa qatorlar gorizontal skroll qilinadi va
 * qator raqamlari joyida qoladi, yoqilgan bo'lsa raqamlar o'ralgan qatorlar bilan mos keladi (global.css: .code-*).
 */
function CodeBlock({ code, languageId, copyable = false }: Props) {
  const lines = useMemo(() => highlightLines(code, cachedTokens(code, languageId)), [code, languageId])
  const gutterDigits = { '--gutter-digits': String(lines.length).length } as CSSProperties

  return (
    <div className="code-block group relative overflow-hidden rounded border border-neutral-200" style={gutterDigits}>
      <div className="code-scroll">
        <div className="code-rows">
          {lines.map((line, index) => (
            <div key={index} className="code-row">
              <span className="code-gutter" aria-hidden>
                {index + 1}
              </span>
              <span className="code-line">
                {line.map((segment, segmentIndex) =>
                  segment.type ? (
                    <span key={segmentIndex} className={TOKEN_CLASS[segment.type]}>
                      {segment.text}
                    </span>
                  ) : (
                    segment.text
                  ),
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
      {copyable && (
        <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100">
          <CopyCodeButton code={code} />
        </div>
      )}
    </div>
  )
}

export default memo(CodeBlock)
