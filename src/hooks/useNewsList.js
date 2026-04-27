import { useCallback, useEffect, useState } from 'react'
import { fetchNewsList } from '../services/newsService.js'

export function useNewsList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setError(null)
    try {
      const data = await fetchNewsList()
      setItems(data)
    } catch (e) {
      setError(e.message || 'Error al cargar')
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchNewsList()
      .then((data) => {
        if (!cancelled) setItems(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Error al cargar')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { items, loading, error, refetch }
}
