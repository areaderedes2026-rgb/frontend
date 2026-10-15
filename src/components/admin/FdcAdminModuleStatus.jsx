export function FdcAdminInactiveBadge({ onDark = false }) {
  return (
    <span
      className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        onDark ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
      }`}
    >
      Inactiva
    </span>
  )
}

export function FdcAdminModuleStatusBanner({ isPublic }) {
  if (isPublic) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-950">
        El módulo está <strong>activo</strong> y visible en el sitio público (menú, pie y búsqueda).
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
      El módulo está <strong>inactivo</strong>: no aparece en el sitio público. El contenido, las
      solicitudes de puestos y las consultas se conservan para la próxima edición.
    </div>
  )
}
