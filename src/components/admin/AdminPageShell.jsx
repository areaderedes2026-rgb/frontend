import { Link } from 'react-router-dom'

/**
 * Contenedor de página admin: breadcrumb, cabecera editorial ligera al portal, cuerpo en tarjeta o plano.
 */
export function AdminPageShell({
  backTo = '/admin/dashboard',
  backLabel = 'Volver al panel',
  showBackLink = true,
  eyebrow = 'Administración',
  title,
  subtitle,
  actions,
  children,
  maxWidthClass = 'max-w-3xl',
  variant = 'card',
  /** Clases extra en el envoltorio del contenido principal */
  contentClassName = '',
}) {
  const body =
    variant === 'card' ? (
      <div
        className={`admin-fade-up rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 lg:p-9 ${contentClassName}`.trim()}
      >
        {children}
      </div>
    ) : (
      <div className={`admin-fade-up space-y-6 ${contentClassName}`.trim()}>{children}</div>
    )

  return (
    <div className={`mx-auto w-full ${maxWidthClass}`}>
      {showBackLink ? (
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 transition-colors hover:text-sky-900"
        >
          <span aria-hidden className="text-base leading-none">
            ←
          </span>
          {backLabel}
        </Link>
      ) : null}

      <header className={showBackLink ? 'mt-5 sm:mt-6' : ''}>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {subtitle}
          </p>
        ) : null}
      </header>

      {actions ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          {actions}
        </div>
      ) : null}

      <div className="mt-8 sm:mt-10">{body}</div>
    </div>
  )
}
