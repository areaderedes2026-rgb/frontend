import { useCallback, useEffect, useMemo, useState } from 'react'
import { FdcPublicContext } from './fdcPublicContext.js'
import {
  fetchFdcPublicStatus,
  subscribeFdcPublicStatus,
} from '../services/fdcService.js'

export function FdcPublicProvider({ children }) {
  const [isPublic, setIsPublic] = useState(false)
  const [ready, setReady] = useState(false)

  const refresh = useCallback(async () => {
    const next = await fetchFdcPublicStatus()
    setIsPublic(next === true)
    setReady(true)
    return next === true
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchFdcPublicStatus().then((next) => {
      if (cancelled) return
      setIsPublic(next === true)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => subscribeFdcPublicStatus((next) => setIsPublic(next === true)), [])

  const value = useMemo(() => ({ isPublic, ready, refresh }), [isPublic, ready, refresh])

  return <FdcPublicContext.Provider value={value}>{children}</FdcPublicContext.Provider>
}
