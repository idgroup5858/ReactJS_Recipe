import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import IconButton from '@/components/ui/IconButton'
import { copyText } from '@/lib/clipboard'
import { showToast } from '@/lib/toast'

const COPIED_FEEDBACK_MS = 1500

/** Kodni nusxalaydi; bir lahza ✓ belgisi va "Nusxalandi" xabari ko'rinadi. */
export default function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    const ok = await copyText(code)
    setCopied(ok)
    showToast(ok ? 'Nusxalandi' : "Nusxalab bo'lmadi", ok ? 'success' : 'error')
  }

  return (
    <IconButton label="Nusxalash" onClick={copy} active={copied}>
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </IconButton>
  )
}
