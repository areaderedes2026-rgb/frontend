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
        className={`flex flex-col gap-6 ${
          hasLogo
            ? 'items-center sm:flex-row sm:items-center sm:justify-center sm:gap-8 lg:gap-10'
            : 'items-center text-center'
        }`}
      >
        {hasLogo ? (
          <div className="flex shrink-0 items-center justify-center rounded-2xl bg-transparent p-1">
            <img
              src={logoSrc}
              alt={hasTitle ? `Logo — ${title}` : 'Logo del Concejo Deliberante'}
              className="h-20 w-auto max-w-[min(100%,200px)] object-contain object-center sm:h-24 sm:max-w-[220px] lg:h-28 lg:max-w-[260px]"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}

        <div
          className={`min-w-0 flex-1 ${hasLogo ? 'text-left sm:max-w-2xl' : 'mx-auto max-w-4xl text-center'}`}
        >
          {hasTitle ? (
            <h2 className="font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
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
