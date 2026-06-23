/**
 * Bloques de skeleton reutilizables para transiciones de hidratación (API → contenido real).
 * Mantienen la misma gramática visual (animate-pulse, radios, jerarquía de anchos) en todo el sitio.
 */

/** Capa de fondo sobre hero oscuro (Historia, Atención al ciudadano). */
export function HydrationHeroDarkBackdrop({ className = '' }) {
  return (
    <div
      className={`absolute inset-0 animate-pulse bg-slate-700 ${className}`.trim()}
      aria-hidden
    />
  )
}

/**
 * Títulos sobre imagen con overlay oscuro (texto claro simulado).
 * Usado en: detalle de área, historia, atención ciudadana.
 */
export function HydrationHeroLightTextBlock({ className = '' }) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`.trim()} aria-hidden>
      <div className="h-3 w-36 rounded bg-white/40 sm:w-40" />
      <div className="h-10 w-80 max-w-full rounded bg-white/45" />
      <div className="h-4 w-full max-w-3xl rounded bg-white/35" />
      <div className="h-4 w-10/12 max-w-3xl rounded bg-white/30" />
    </div>
  )
}

/** Franja de portada antes de cargar imagen (detalle de área). */
export function HydrationAreaCoverBand({ className = '' }) {
  return (
    <div
      className={`h-56 w-full animate-pulse bg-slate-200 sm:h-64 lg:h-72 ${className}`.trim()}
      aria-hidden
    />
  )
}

/** Placeholder de foto de director/a en grilla. */
export function HydrationDirectorPhoto({ className = '' }) {
  return (
    <div
      className={`aspect-4/5 w-full max-w-72 animate-pulse self-start rounded-2xl bg-slate-100 ring-1 ring-slate-200/80 sm:aspect-auto sm:h-full sm:max-w-none ${className}`.trim()}
      aria-hidden
    />
  )
}

/** Columna de nombre, rol, bio y tarjetas de contacto (detalle de área). */
export function HydrationDirectorCopyBlock({ className = '' }) {
  return (
    <div className={`mt-2 animate-pulse space-y-3 ${className}`.trim()} aria-hidden>
      <div className="h-8 w-56 rounded bg-slate-200" />
      <div className="h-4 w-44 rounded bg-slate-200" />
      <div className="h-4 w-full rounded bg-slate-100" />
      <div className="h-4 w-11/12 rounded bg-slate-100" />
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <div className="h-10 rounded-xl bg-slate-100" />
        <div className="h-10 rounded-xl bg-slate-100" />
        <div className="h-10 rounded-xl bg-slate-100 sm:col-span-2" />
      </div>
    </div>
  )
}

/** Retrato intendencia (altura fija institucional). */
export function HydrationIntendenciaPortrait({ className = '' }) {
  return (
    <div
      className={`h-120 w-full shrink-0 animate-pulse rounded-2xl bg-slate-100 ring-1 ring-slate-200/80 sm:w-52 lg:w-56 ${className}`.trim()}
      aria-hidden
    />
  )
}

/** Bio intendente: título + párrafos. */
export function HydrationIntendenciaBioLines({ className = '' }) {
  return (
    <div className={`mt-2 animate-pulse space-y-3 ${className}`.trim()} aria-hidden>
      <div className="h-8 w-56 rounded bg-slate-200" />
      <div className="h-4 w-44 rounded bg-slate-200" />
      <div className="h-4 w-full rounded bg-slate-100" />
      <div className="h-4 w-11/12 rounded bg-slate-100" />
    </div>
  )
}

/** Filas en panel oscuro (contacto intendencia). */
export function HydrationDarkPanelRows({ rows = 3, className = '' }) {
  return (
    <div className={`mt-4 animate-pulse space-y-2 ${className}`.trim()} aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={`dark-row-${i}`} className="h-10 rounded-xl bg-white/10" />
      ))}
    </div>
  )
}

/** Párrafos tipo cuerpo (resumen historia). */
export function HydrationBodyParagraphLines({ lines = 3, className = '' }) {
  return (
    <div className={`animate-pulse space-y-2 ${className}`.trim()} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={`pline-${i}`}
          className={`h-4 rounded bg-slate-200 ${i === lines - 1 ? 'w-11/12' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

/** Tarjeta legado / bloque con título + texto. */
export function HydrationLegacyCardBlock({ className = '' }) {
  return (
    <div className={`animate-pulse space-y-2 ${className}`.trim()} aria-hidden>
      <div className="h-6 w-2/3 rounded bg-slate-200" />
      <div className="h-4 w-full rounded bg-slate-100" />
      <div className="h-4 w-5/6 rounded bg-slate-100" />
    </div>
  )
}

/** Cierre historia (título + dos líneas). */
export function HydrationSectionHeadingBlock({ className = '' }) {
  return (
    <div className={`animate-pulse space-y-2 ${className}`.trim()} aria-hidden>
      <div className="h-8 w-72 rounded bg-slate-200" />
      <div className="h-4 w-full max-w-3xl rounded bg-slate-100" />
      <div className="h-4 w-5/6 max-w-3xl rounded bg-slate-100" />
    </div>
  )
}

/** Tarjeta canal atención ciudadana (icono + líneas). */
export function HydrationCitizenChannelCard({ className = '' }) {
  return (
    <article
      className={`rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm sm:p-6 ${className}`.trim()}
    >
      <div className="animate-pulse space-y-3" aria-hidden>
        <div className="h-12 w-12 rounded-2xl bg-slate-200" />
        <div className="h-5 w-2/3 rounded bg-slate-200" />
        <div className="h-3 w-1/2 rounded bg-slate-100" />
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-4 w-5/6 rounded bg-slate-100" />
      </div>
    </article>
  )
}

/** Ficha legislador (retrato + bio) mientras hidrata la API. */
export function HydrationLegisladorProfileCard({ className = '' }) {
  return (
    <article
      className={`overflow-hidden rounded-[1.75rem] border border-[#ddd7ca] bg-white shadow-[0_24px_80px_-54px_rgba(15,23,42,0.35)] ${className}`.trim()}
      aria-busy="true"
      aria-label="Cargando información del legislador"
    >
      <div className="grid gap-0 lg:grid-cols-[300px_1fr] lg:items-stretch">
        <div
          className="aspect-square w-full animate-pulse bg-slate-200 lg:aspect-auto lg:min-h-[300px]"
          aria-hidden
        />
        <div className="flex flex-col justify-center p-5 pb-8 sm:p-7 sm:pb-10 lg:p-8 lg:pb-12">
          <div className="h-7 w-28 animate-pulse rounded-full bg-sky-100" aria-hidden />
          <HydrationIntendenciaBioLines className="mt-4" />
          <div className="mt-6 flex flex-wrap gap-2.5" aria-hidden>
            <div className="h-11 w-40 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    </article>
  )
}

/** Bloques de estadísticas de proyectos (contadores). */
export function HydrationLegisladorProjectStats({ count = 3, className = '' }) {
  return (
    <div
      className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 ${className}`.trim()}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`leg-proj-sk-${i}`}
          className="h-[11.5rem] animate-pulse rounded-2xl bg-slate-200 sm:h-44"
        />
      ))}
    </div>
  )
}

export function HydrationCitizenChannelGrid({ count = 4, className = '' }) {
  return (
    <div
      className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5 ${className}`.trim()}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <HydrationCitizenChannelCard key={`citizen-ch-${idx}`} />
      ))}
    </div>
  )
}
