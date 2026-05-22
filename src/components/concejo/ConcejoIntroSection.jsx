import { resolveMediaUrl } from '../../utils/imageUrl.js'

export function ConcejoIntroSection({
  introTitle = '',
  introLogoUrl = '',
  introParagraphs = [],
  className = '',
}) {
  const title = String(introTitle || '').trim()
  const logoSrc = resolveMediaUrl(introLogoUrl)
  const paragraphs = (Array.isArray(introParagraphs) ? introParagraphs : []).filter((p) =>
    String(p || '').trim(),
  )
  const hasLogo = Boolean(logoSrc)
  const hasTitle = Boolean(title)
  const hasBody = paragraphs.length > 0

  if (!hasLogo && !hasTitle && !hasBody) {
    return (
      <div
        className={`rounded-2xl border border-dashed border-[#ddd7ca] bg-[#faf9f6] px-4 py-10 text-center text-sm text-[#5c6169] ${className}`}
      >
        Sin contenido del órgano legislativo.
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        className={
          hasLogo
            ? 'grid grid-cols-1 gap-8 sm:grid-cols-[minmax(11rem,17rem)_1fr] sm:items-start sm:gap-10 lg:grid-cols-[minmax(13rem,19rem)_1fr] lg:gap-12'
            : 'mx-auto max-w-4xl text-center'
        }
      >
        {hasLogo ? (
          <figure className="m-0 flex justify-center sm:justify-start sm:pt-0.5">
            <div className="flex w-full max-w-[17rem] items-center justify-center sm:max-w-none sm:w-full">
              <img
                src={logoSrc}
                alt={hasTitle ? `Logo — ${title}` : 'Logo del Concejo Deliberante'}
                className="h-auto w-full max-h-[11rem] min-h-[7.5rem] object-contain object-center sm:max-h-[13rem] sm:min-h-[9rem] lg:max-h-[15rem] lg:min-h-[10rem]"
                loading="lazy"
                decoding="async"
              />
            </div>
          </figure>
        ) : null}

        <div className={`min-w-0 ${hasLogo ? 'text-left' : ''}`}>
          {hasTitle ? (
            <h2 className="font-serif text-2xl font-bold leading-tight tracking-tight text-[#171b22] sm:text-3xl">
              {title}
            </h2>
          ) : null}
          {hasBody ? (
            <div
              className={`space-y-4 text-sm leading-relaxed text-[#4b505a] sm:text-base ${
                hasTitle ? 'mt-5' : ''
              }`}
            >
              {paragraphs.map((p, i) => (
                <p key={`intro-p-${i}`}>{p}</p>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
