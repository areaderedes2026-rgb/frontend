import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import { fetchGlobalSearch } from '../services/siteSearchService.js'

export function useSiteSearch(debounceMs = 280) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const reqId = useRef(0)

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebounced(query.trim())
    }, debounceMs)
    return () => window.clearTimeout(t)
  }, [query, debounceMs])

  useEffect(() => {
    if (debounced.length < 2) {
      const clearId = window.setTimeout(() => {
        setItems([])
        setLoading(false)
      }, 0)
      return () => window.clearTimeout(clearId)
    }

    const ac = new AbortController()
    const id = ++reqId.current
    startTransition(() => {
      setLoading(true)
    })

    fetchGlobalSearch(debounced, ac.signal)
      .then((res) => {
        if (ac.signal.aborted || reqId.current !== id) return
        setItems(res.items || [])
      })
      .catch(() => {
        if (ac.signal.aborted || reqId.current !== id) return
        setItems([])
      })
      .finally(() => {
        if (ac.signal.aborted || reqId.current !== id) return
        setLoading(false)
      })

    return () => ac.abort()
  }, [debounced])

  const reset = useCallback(() => {
    reqId.current += 1
    setQuery('')
    setDebounced('')
    setItems([])
    setLoading(false)
  }, [])

  return { query, setQuery, items, loading, debounced, reset }
}
