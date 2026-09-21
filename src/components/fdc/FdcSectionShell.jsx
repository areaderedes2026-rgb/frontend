import { Container } from '../ui/Container.jsx'
import { FdcSectionBackgroundLayers } from './FdcSectionBackgroundLayers.jsx'
import { FdcSectionShareButton } from './FdcSectionShareButton.jsx'
import { FdcSectionToneProvider } from './FdcSectionToneContext.jsx'
import { resolveFdcSectionBackground } from '../../utils/fdcSectionBackground.js'

/**
 * Contenedor de sección FDC con fondo (blanco / azul / imagen) y tono de texto coherente.
 */
export function FdcSectionShell({
  id,
  shareId,
  config,
  children,
  className = '',
  pyClass = 'py-14 sm:py-16 lg:py-20',
  scrollMt = true,
  containerClassName = '',
}) {
  const bg = resolveFdcSectionBackground(config)
  const shareTarget = String(shareId || id || '').trim()

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
        {shareTarget ? (
          <div className="relative z-20 mx-auto w-full max-w-[min(100%,90rem)] px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="mb-4 flex justify-end sm:mb-5">
              <FdcSectionShareButton sectionId={shareTarget} usesDarkTone={bg.usesDarkTone} />
            </div>
          </div>
        ) : null}
        <Container className={`relative z-10 ${containerClassName}`.trim()}>{children}</Container>
      </section>
    </FdcSectionToneProvider>
  )
}
