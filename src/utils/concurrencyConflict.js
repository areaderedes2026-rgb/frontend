export function isConcurrencyConflictError(error) {
  const message = String(error?.message || '').toLowerCase()
  return message.includes('otro usuario modificó') || message.includes('conflict_stale_write')
}

export function concurrencyConflictMessage() {
  return 'Otro usuario guardó cambios antes que vos. Recargá la última versión y reintentá.'
}

