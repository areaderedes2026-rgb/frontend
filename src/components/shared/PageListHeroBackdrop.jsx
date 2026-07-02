import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { heroOverlayGradientStyle, normalizeHeroOverlayOpacity } from '../../utils/heroOverlay.js'
import {
  HydrationHeroDarkBackdrop,
  HydrationPageListHeroSkeleton,
} from '../skeleton/PageHydrationSkeleton.jsx'
import { Container } from '../ui/Container.jsx'

const CONTAINER_CLASS =
  'relative z-10 flex min-h-[44dvh] flex-col items-center justify-center px-4 text-center sm:min-h-[48dvh] lg:min-h-[52dvh]'

export function PageListHeroBackdrop({
  contentReady = true,
  previewMode = false,
  imageUrl = '',
  overlayOpacity = 65,
  className = '',
  containerClassName = '',
  children,
}) {
  const ready = previewMode || contentReady
  const heroImage = imageUrl ? resolveMediaUrl(imageUrl) || imageUrl : ''
  const overlay = normalizeHeroOverlayOpacity(overlayOpacity)

  const paddingClass = previewMode
    ? 'py-12'
    : 'pb-10 pt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-12 sm:pt-[calc(var(--navbar-h,5rem)+2.5rem)] lg:pb-14'

  return (
    <header
      className={`relative overflow-hidden border-b border-white/10 bg-[#171b22] ${className}`.trim()}
      aria-busy={!ready}
    >
      {!ready ? (
        <HydrationHeroDarkBackdrop />
      ) : heroImage ? (
        <img
          src={heroImage}
          alt=""
          width={1920}
          height={1080}
          fetchPriority={previewMode ? undefined : 'high'}
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading={previewMode ? 'lazy' : 'eager'}
          decoding="async"
        />
      ) : (
        <div
          className="absolute inset-0 bg-linear-to-br from-slate-800 via-slate-900 to-[#171b22]"
          aria-hidden
        />
      )}
      {ready ? (
        <div
          className="absolute inset-0"
          style={heroOverlayGradientStyle(overlay)}
          aria-hidden
        />
      ) : null}

      <Container className={`${CONTAINER_CLASS} ${paddingClass} ${containerClassName}`.trim()}>
        {!ready ? (
          <HydrationPageListHeroSkeleton />
        ) : (
          <div className="page-list-hero-enter w-full">{children}</div>
        )}
      </Container>
    </header>
  )
}
