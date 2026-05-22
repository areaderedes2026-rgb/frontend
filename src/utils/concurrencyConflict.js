export function isConcurrencyConflictError(error) {
  if (!error) return false
  if (error.code === 'CONFLICT_STALE_WRITE' || error.code === 'CONCURRENCY_CONFLICT') {
    return true
  }
  const message = String(error?.message || '').toLowerCase()
  return (
    message.includes('otro usuario modificó') || message.includes('conflict_stale_write')
  )
}

export function concurrencyConflictMessage(entityLabel = 'este contenido') {
  return `Otro usuario guardó cambios en ${entityLabel} antes que vos. Podés recargar la última versión del servidor o guardar tus cambios de todos modos (reemplazarán lo que haya en el servidor).`
}

export async function errorFromApiResponse(res, fallbackMessage) {
  const data = await res.json().catch(() => ({}))
  const message =
    typeof data.error === 'string' && data.error.trim()
      ? data.error
      : fallbackMessage
  const err = new Error(message || fallbackMessage)
  if (res.status === 409) {
    err.code = 'CONFLICT_STALE_WRITE'
    if (data.currentUpdatedAt) err.currentUpdatedAt = data.currentUpdatedAt
  }
  return err
}
