import { resolveMediaUrl } from '../../utils/imageUrl.js'

function PhotoPlaceholderIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.35}
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <rect x="3" y="4.5" width="18" height="15" rx="1.75" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 16.5 10.25 13l1.75 2 4.25-5.5L16.5 16.5"
      />
      <circle cx="9" cy="9.5" r="1.35" fill="currentColor" stroke="none" />
    </svg>
  )
}

/**
 * Portada de noticia: imagen o marcador con icono cuando no hay foto.
 * El contenedor debe definir proporción (p. ej. `aspect-video`, `aspect-16/10`).
 *
 * @param {'lazy'|'eager'} [props.loading]
 * @param {'sm'|'md'|'lg'} [props.iconScale] — tamaño del icono en modo sin foto
 */
export function NewsCoverMedia({
  imageUrl,
  className = '',
  imgClassName = '',
  loading = 'lazy',
  iconScale = 'md',
}) {
  const resolved = imageUrl ? resolveMediaUrl(imageUrl) : ''
  const src = resolved && resolved.trim() ? resolved : null

  const iconSize =
    iconScale === 'sm'
      ? 'h-6 w-6 sm:h-7 sm:w-7'
      : iconScale === 'lg'
        ? 'h-12 w-12 sm:h-14 sm:w-14'
        : 'h-9 w-9 sm:h-10 sm:w-10'

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`.trim()}>
      {src ? (
        <img
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`.trim()}
          loading={loading}
          decoding="async"
        />
      ) : (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-linear-to-br from-slate-100 via-slate-50 to-slate-200/95 px-2 text-slate-400"
          role="img"
          aria-label="Sin portada: no hay imagen"
        >
          <PhotoPlaceholderIcon className={`${iconSize} shrink-0`} />
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400/95 sm:text-[11px]">
            Sin foto
          </span>
        </div>
      )}
    </div>
  )
}
