import { RouterProvider } from 'react-router-dom'
import { Toaster } from '@/shared/ui'
import { useApplyTheme } from '@/shared/hooks/useTheme'
import { router } from './router'

export function App() {
  useApplyTheme()
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}
