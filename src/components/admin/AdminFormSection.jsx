/**
 * Bloque de formulario admin: título de sección + borde suave (misma línea que noticias públicas).
 */
export function AdminFormSection({ title, description, children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 lg:p-7 ${className}`.trim()}
    >
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{description}</p>
        ) : null}
      </div>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  )
}
