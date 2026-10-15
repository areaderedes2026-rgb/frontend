import { useContext } from 'react'
import { FdcPublicContext } from '../context/fdcPublicContext.js'

export function useFdcPublic() {
  const ctx = useContext(FdcPublicContext)
  if (!ctx) {
    return { isPublic: false, ready: true, refresh: async () => false }
  }
  return ctx
}
