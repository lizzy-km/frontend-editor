import { useEffect } from 'react'
import { Link, useRouteError } from 'react-router-dom'
import { trackCrash } from '@/features/analytics/autoTrack'
import { EmptyState } from '@/shared/ui'

/** Shown when a page crashes, instead of a blank screen. */
export function RouteError() {
  const error = useRouteError()
  useEffect(() => {
    console.error(error)
    trackCrash(error)
  }, [error])
  return (
    <EmptyState
      icon="help"
      title="Something went wrong"
      text="This page hit an unexpected problem. Your saved work is safe."
      action={<Link to="/">Go back home</Link>}
    />
  )
}
