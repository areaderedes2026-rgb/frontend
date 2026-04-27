export function PageHeader({
  title,
  subtitle,
  eyebrow,
  className = '',
  variant = 'default',
  /** Solo `variant="hero"`: entrada lenta al cargar inicio (CSS en index.css). */
  heroAnimated = false,
}) {
  const hero = variant === 'hero'
  const animEyebrow =
    hero && heroAnimated ? 'hero-enter-eyebrow' : ''
  const animTitle = hero && heroAnimated ? 'hero-enter-title' : ''
  const animSubtitle = hero && heroAnimated ? 'hero-enter-subtitle' : ''
  return (
    <header className={`max-w-3xl ${className}`}>
      {eyebrow ? (
        <p
          className={`mb-2 text-xs font-semibold uppercase tracking-[0.2em] ${
            hero ? 'text-white/65' : 'text-sky-600'
          } ${animEyebrow}`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h1
        className={`font-bold tracking-tight ${
          hero
            ? 'text-3xl text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight'
            : 'text-3xl text-slate-900 sm:text-4xl'
        } ${animTitle}`}
      >
        {title}
      </h1>
      {subtitle ? (
        <p
          className={`mt-3 max-w-2xl leading-relaxed ${
            hero
              ? 'text-base text-white/85 sm:text-lg'
              : 'text-base text-slate-600 sm:text-lg'
          } ${animSubtitle}`}
        >
          {subtitle}
        </p>
      ) : null}
    </header>
  )
}
