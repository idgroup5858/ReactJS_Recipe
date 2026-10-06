import { SquareTerminal } from 'lucide-react'

/** Misol natijasi (konsol chiqishi) — Android'dagi "Natija" bloki. */
export default function CodeOutput({ output }: { output: string }) {
  return (
    <div className="overflow-hidden rounded border border-neutral-200">
      <div className="flex items-center gap-1.5 border-b border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-neutral-500 uppercase">
        <SquareTerminal size={13} />
        Natija
      </div>
      <pre className="code-output px-4 py-3">{output}</pre>
    </div>
  )
}
