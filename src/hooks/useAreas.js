import { useCallback, useEffect, useState } from 'react'
import { fetchPublicAreas } from '../services/areasService.js'

export function useAreas() {
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setError(null)
    try {
      const data = await fetchPublicAreas()
      setAreas(data)
    } catch (e) {
      setError(e.message || 'No se pudieron cargar las áreas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchPublicAreas()
      .then((data) => {
        if (!cancelled) setAreas(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'No se pudieron cargar las áreas.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { areas, loading, error, refetch }
}
