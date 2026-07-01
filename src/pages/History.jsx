import { useEffect, useState } from 'react'
import {
  DEFAULT_HISTORY_CONTENT,
  mergeHistoryContent,
} from '../data/historyContent.js'
import { HistoryPublicView } from '../components/history/HistoryPublicView.jsx'
import { fetchHistoryContent } from '../services/historyService.js'
import { isApiConfigured } from '../utils/apiConfig.js'

export function History() {
  const apiEnabled = isApiConfigured()
  const [content, setContent] = useState(DEFAULT_HISTORY_CONTENT)
  const [loadingContent, setLoadingContent] = useState(apiEnabled)

  useEffect(() => {
    let cancelled = false
    async function loadContent() {
      if (!apiEnabled) return
      try {
        const remote = await fetchHistoryContent()
        if (!remote || cancelled) return
        setContent(mergeHistoryContent(DEFAULT_HISTORY_CONTENT, remote))
      } catch {
        // Si falla la API se usa el contenido por defecto.
      } finally {
        if (!cancelled) setLoadingContent(false)
      }
    }
    loadContent()
    return () => {
      cancelled = true
    }
  }, [apiEnabled])

  return (
    <HistoryPublicView
      content={content}
      loading={apiEnabled && loadingContent}
    />
  )
}
