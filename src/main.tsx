import '@fontsource-variable/inter/index.css'
import '@fontsource-variable/jetbrains-mono/index.css'
import '@fontsource-variable/jetbrains-mono/wght-italic.css'
import './styles/global.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { router } from './app/router'
import { startAppearanceSync } from './theme/appearance'

// router state yangilanganda brauzer manzili allaqachon o'zgargan bo'ladi — til rangi yangi manzildan olinadi
startAppearanceSync((update) => router.subscribe(update))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
