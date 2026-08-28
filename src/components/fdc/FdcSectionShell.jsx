import { Container } from '../ui/Container.jsx'
import { FdcSectionBackgroundLayers } from './FdcSectionBackgroundLayers.jsx'
import { FdcSectionToneProvider } from './FdcSectionToneContext.jsx'
import { resolveFdcSectionBackground } from '../../utils/fdcSectionBackground.js'

/**
 * Contenedor de sección FDC con fondo (blanco / azul / imagen) y tono de texto coherente.
 */
export function FdcSectionShell({
  id,
  config,
  children,
  className = '',
  pyClass = 'py-14 sm:py-16 lg:py-20',
  scrollMt = true,
  containerClassName = '',
}) {
  const bg = resolveFdcSectionBackground(config)

  return (
    <FdcSectionToneProvider value={bg}>
      <section
        id={id}
        className={`relative isolate overflow-hidden border-y ${scrollMt ? 'scroll-mt-[calc(var(--navbar-h,5rem)+4rem)]' : ''} ${pyClass} ${bg.sectionClassName} ${className}`.trim()}
      >
        <FdcSectionBackgroundLayers
          style={bg.style}
          imageUrl={bg.imageUrl}
          overlayOpacity={bg.overlayOpacity}
        />
        <Container className={`relative z-10 ${containerClassName}`.trim()}>{children}</Container>
      </section>
    </FdcSectionToneProvider>
  )
}
