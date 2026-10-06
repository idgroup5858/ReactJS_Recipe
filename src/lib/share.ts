import { copyText } from './clipboard'

export type ShareOutcome = 'shared' | 'cancelled' | 'copied' | 'failed'

/** Tizimning "Ulashish" oynasi (telefonlarda); u yo'q bo'lsa, matn buferga nusxalanadi. */
export async function shareText(title: string, text: string): Promise<ShareOutcome> {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text })
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
    }
  }
  return (await copyText(text)) ? 'copied' : 'failed'
}
