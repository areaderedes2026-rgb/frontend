import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion as Motion } from 'motion/react'
import {
  computeFdcCountdownRemaining,
  normalizeFdcHeroCountdown,
} from '../../data/fdcContent.js'

const softEase = [0.22, 1, 0.36, 1]

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduce(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduce
}

function useResponsiveCountdownOffset(offsetYMobile, offsetYDesktop) {
  const [offsetY, setOffsetY] = useState(offsetYMobile)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setOffsetY(mq.matches ? offsetYDesktop : offsetYMobile)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [offsetYMobile, offsetYDesktop])

  return offsetY
}

function pad2(n) {
  return String(Math.max(0, Number(n) || 0)).padStart(2, '0')
}

function CountdownUnit({ value, label, reduceMotion, index }) {
  const display = pad2(value)
  return (
    <Motion.div
      className="flex min-w-[2.65rem] flex-col items-center gap-1 sm:min-w-[3.1rem] sm:gap-1.5 lg:min-w-[3.45rem]"
      initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: reduceMotion ? 0.15 : 0.75,
        delay: reduceMotion ? 0 : 0.08 + index * 0.07,
        ease: softEase,
      }}
    >
      <div className="relative w-full overflow-hidden rounded-xl border border-[#d4b483]/40 bg-[#171b22] px-1.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_32px_-18px_rgba(0,0,0,0.7)] sm:rounded-2xl sm:px-2 sm:py-2.5 lg:px-2.5 lg:py-3">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#d4b483]/55 to-transparent"
          aria-hidden
        />
        <AnimatePresence mode="popLayout" initial={false}>
          <Motion.span
            key={display}
            className="block text-center font-serif text-2xl font-bold tabular-nums leading-none tracking-tight text-white sm:text-3xl lg:text-[2.15rem]"
            initial={reduceMotion ? false : { opacity: 0, y: -10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 10, filter: 'blur(3px)' }}
            transition={{ duration: reduceMotion ? 0.12 : 0.42, ease: softEase }}
          >
            {display}
          </Motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#171b22]/75 sm:text-[10px] sm:tracking-[0.22em]">
        {label}
      </span>
    </Motion.div>
  )
}

/** Centrado vertical con la caja numérica (no con la etiqueta inferior). */
const SEPARATOR_ALIGN =
  'mt-[1.05rem] sm:mt-[1.3rem] lg:mt-[1.45rem]'

function Separator({ reduceMotion, index }) {
  return (
    <Motion.span
      className={`flex shrink-0 items-center justify-center self-start px-1 sm:px-1.5 ${SEPARATOR_ALIGN}`}
      aria-hidden
      initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: reduceMotion ? 0.12 : 0.55,
        delay: reduceMotion ? 0 : 0.2 + index * 0.05,
        ease: softEase,
      }}
    >
      <span className="flex flex-col items-center justify-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#171b22]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#171b22]" />
      </span>
    </Motion.span>
  )
}

/**
 * Contador regresivo FDC. Flota sobre la portada, justo encima de la navegación.
 */
export function FdcHeroCountdown({ config, className = '', previewMode = false }) {
  const normalized = useMemo(
    () => normalizeFdcHeroCountdown(config),
    [
      config?.enabled,
      config?.targetAt,
      config?.offsetYMobile,
      config?.offsetYDesktop,
      config?.labelColor,
    ],
  )
  const offsetY = useResponsiveCountdownOffset(
    normalized.offsetYMobile,
    normalized.offsetYDesktop,
  )
  const reduceMotion = usePrefersReducedMotion()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!normalized.enabled || !normalized.targetAt) return undefined
    const tick = () => setNow(Date.now())
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [normalized.enabled, normalized.targetAt])

  if (!normalized.enabled || !normalized.targetAt) return null

  const remaining = computeFdcCountdownRemaining(normalized.targetAt, now)
  if (!remaining) return null

  const units = [
    { key: 'days', value: remaining.days, label: 'Días' },
    { key: 'hours', value: remaining.hours, label: 'Horas' },
    { key: 'minutes', value: remaining.minutes, label: 'Min' },
    { key: 'seconds', value: remaining.seconds, label: 'Seg' },
  ]

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 sm:px-4 lg:px-6 ${className}`.trim()}
      style={{ transform: `translateY(${offsetY}px)` }}
    >
      <Motion.div
        className="pointer-events-auto mx-auto flex max-w-full flex-col items-center"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduceMotion ? 0.15 : 1.05, ease: softEase }}
      >
        <p
          className="mb-2.5 text-center font-serif text-xs font-semibold uppercase tracking-[0.42em] sm:mb-3 sm:text-sm sm:tracking-[0.5em]"
          style={{ color: normalized.labelColor }}
        >
          Faltan
        </p>

        <div
          className="flex items-start justify-center"
          role="timer"
          aria-label={
            previewMode
              ? 'Vista previa del contador'
              : `Faltan ${remaining.days} días, ${remaining.hours} horas, ${remaining.minutes} minutos y ${remaining.seconds} segundos`
          }
        >
          {units.map((unit, idx) => (
            <span key={unit.key} className="flex items-start">
              <CountdownUnit
                value={unit.value}
                label={unit.label}
                reduceMotion={reduceMotion}
                index={idx}
              />
              {idx < units.length - 1 ? (
                <Separator reduceMotion={reduceMotion} index={idx} />
              ) : null}
            </span>
          ))}
        </div>
      </Motion.div>
    </div>
  )
}
