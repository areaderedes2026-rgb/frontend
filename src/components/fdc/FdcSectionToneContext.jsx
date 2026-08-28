import { createContext, useContext } from 'react'
import { resolveFdcSectionBackground } from '../../utils/fdcSectionBackground.js'

const defaultTone = {
  style: 'light',
  titleTone: 'light',
  usesDarkTone: false,
  sectionClassName: 'border-[#e8e5dd] bg-[#f7f7f5]',
  imageUrl: '',
  overlayOpacity: 55,
}

const FdcSectionToneContext = createContext(null)

export function FdcSectionToneProvider({ config, value, children }) {
  const resolved = value || (config ? resolveFdcSectionBackground(config) : defaultTone)
  return (
    <FdcSectionToneContext.Provider value={resolved}>{children}</FdcSectionToneContext.Provider>
  )
}

/** Tono de la sección FDC (claro/oscuro según fondo blanco, azul o imagen). */
export function useFdcSectionTone(fallbackConfig = null) {
  const ctx = useContext(FdcSectionToneContext)
  if (ctx) return ctx
  if (fallbackConfig) return resolveFdcSectionBackground(fallbackConfig)
  return defaultTone
}
