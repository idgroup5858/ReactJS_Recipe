import { useEffect } from 'react'
import { useNavigate } from 'react-router'

export const SEARCH_INPUT_ID = 'search-input'

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

/** Ctrl+K (yoki ⌘K) va "/" — qidiruvga o'tish; qidiruv sahifasida maydonga fokus. */
export function useSearchShortcut(): void {
  const navigate = useNavigate()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isShortcut =
        (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey)) || (event.key === '/' && !isTyping(event.target))
      if (!isShortcut) return
      event.preventDefault()
      const input = document.getElementById(SEARCH_INPUT_ID)
      if (input) input.focus()
      else navigate('/search')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate])
}
