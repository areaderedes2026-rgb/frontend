import { useCallback } from 'react'

/**
 * Acciones flotantes propias de la página (no solapan los botones sociales a la derecha).
 */
export function CitizenPageFloats() {
  const scrollToForm = useCallback(() => {
    document.getElementById('consulta-ciudadano')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div
      className="pointer-events-none fixed bottom-6 left-3 z-30 flex flex-col gap-2 sm:bottom-8 sm:left-5"
      aria-label="Accesos rápidos atención al ciudadano"
    >
      <button
        type="button"
        onClick={scrollToForm}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-2xl border border-[#2a313b] bg-[#171b22] px-3.5 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:bg-[#222831] hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/45 sm:px-4 sm:text-sm"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15"
          aria-hidden
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
        </span>
        <span className="hidden min-w-0 leading-tight sm:inline">Consulta web</span>
      </button>
    </div>
  )
}
