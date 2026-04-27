import { Component } from 'react'

export class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      errorId: 0,
    }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // Mantiene trazas en consola para diagnóstico sin romper toda la UI.
    console.error('[GlobalErrorBoundary] Render error:', error, info)
  }

  handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      errorId: prev.errorId + 1,
    }))
  }

  handleReload = () => {
    if (typeof window !== 'undefined') window.location.reload()
  }

  render() {
    const { hasError, errorId } = this.state
    const { children } = this.props

    if (!hasError) {
      return <div key={errorId}>{children}</div>
    }

    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
            Municipalidad de Trancas
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            Ocurrió un error inesperado
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            La pantalla no pudo renderizarse correctamente. Podés reintentar sin perder tu sesión.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center justify-center rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-800"
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Recargar página
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-500">Código de intento: {errorId}</p>
        </div>
      </div>
    )
  }
}
