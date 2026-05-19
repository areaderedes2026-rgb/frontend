import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { Button } from '../../components/ui/Button.jsx'
import { APP_NAME } from '../../utils/constants.js'
import {
  formErrorClass,
  inputClass,
  labelClass,
} from '../../components/ui/formStyles.js'

export function Login() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/admin/dashboard'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const result = await login(username, password)
    setSubmitting(false)
    if (result.ok) {
      navigate(from, { replace: true })
    } else {
      setError(result.error || 'No se pudo iniciar sesión.')
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(14,165,233,0.25),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl"
        aria-hidden
      />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl shadow-slate-900/40 backdrop-blur-xl sm:p-10">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-sky-600">
            {APP_NAME}
          </p>
          <h1 className="mt-3 text-center text-2xl font-bold tracking-tight text-slate-900">
            Acceso administración
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">
            Ingresá con tu usuario y contraseña para administrar el portal municipal.
          </p>
          <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
            {error ? (
              <p className={formErrorClass} role="alert">
                {error}
              </p>
            ) : null}
            <label className={labelClass}>
              Nombre de usuario
              <input
                className={inputClass}
                type="text"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoCapitalize="none"
                spellCheck={false}
              />
            </label>
            <label className={labelClass}>
              Contraseña
              <div className="relative">
                <input
                  className={`${inputClass} pr-24`}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-1 right-1 inline-flex items-center justify-center rounded-lg px-3 text-xs font-bold uppercase tracking-wide text-slate-500 transition hover:bg-slate-100 hover:text-sky-700 focus:outline-none focus:ring-3 focus:ring-sky-500/15"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </label>
            <Button type="submit" className="mt-1 w-full sm:w-auto" disabled={submitting}>
              {submitting ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </form>
          <p className="mt-8 border-t border-slate-200/80 pt-6 text-center text-sm text-slate-500">
            ¿Solo querés navegar el sitio?{' '}
            <Link
              to="/"
              className="font-semibold text-sky-700 transition-colors hover:text-sky-900"
            >
              Ir al inicio ciudadano
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
