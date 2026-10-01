import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { startAutoTracking } from '@/features/analytics/autoTrack'
import { Toaster } from '@/shared/ui'
import { useApplyTheme } from '@/shared/hooks/useTheme'
import { router } from './router'

export function App() {
  useApplyTheme()
  useEffect(() => startAutoTracking(router), [])
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}
