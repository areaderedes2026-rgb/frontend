/** URL base del backend, sin barra final. Vacío si no está configurada. */
export function getApiBase() {
  return (import.meta.env.VITE_API_URL || '').replace(/\/$/, '').trim()
}

export function isApiConfigured() {
  return Boolean(getApiBase())
}
