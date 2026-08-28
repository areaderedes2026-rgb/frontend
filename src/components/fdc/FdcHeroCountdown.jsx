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

function pad2(n) {
  return String(Math.max(0, Number(n) || 0)).padStart(2, '0')
}

function CountdownUnit({ value, reduceMotion, index }) {
  const display = pad2(value)
  return (
    <Motion.div
      className="relative flex min-w-[2.65rem] flex-col items-center sm:min-w-[3.1rem] lg:min-w-[3.45rem]"
      initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: reduceMotion ? 0.15 : 0.75,
        delay: reduceMotion ? 0 : 0.08 + index * 0.07,
        ease: softEase,
      }}
    >
      <div className="relative w-full overflow-hidden rounded-xl border border-[#d4b483]/35 bg-[#0c1017]/72 px-1.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_32px_-18px_rgba(0,0,0,0.65)] backdrop-blur-md sm:rounded-2xl sm:px-2 sm:py-2.5 lg:px-2.5 lg:py-3">
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
    </Motion.div>
  )
}

function Separator({ reduceMotion, index }) {
  return (
    <Motion.span
      className="flex shrink-0 flex-col items-center justify-center gap-1 px-0.5 pb-1 sm:px-1"
      aria-hidden
      initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: reduceMotion ? 0.12 : 0.55,
        delay: reduceMotion ? 0 : 0.2 + index * 0.05,
        ease: softEase,
      }}
    >
      <span className="h-1 w-1 rounded-full bg-[#d4b483]/80 shadow-[0_0_8px_rgba(212,180,131,0.45)]" />
      <span className="h-1 w-1 rounded-full bg-[#d4b483]/45" />
    </Motion.span>
  )
}

/**
 * Contador regresivo FDC (solo números). Flota sobre la portada, justo encima de la navegación.
 */
export function FdcHeroCountdown({ config, className = '', previewMode = false }) {
  const normalized = useMemo(() => normalizeFdcHeroCountdown(config), [config])
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
    { key: 'days', value: remaining.days },
    { key: 'hours', value: remaining.hours },
    { key: 'minutes', value: remaining.minutes },
    { key: 'seconds', value: remaining.seconds },
  ]

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 sm:px-4 lg:px-6 ${className}`.trim()}
      style={{
        '--fdc-countdown-y-mobile': `${normalized.offsetYMobile}px`,
        '--fdc-countdown-y-desktop': `${normalized.offsetYDesktop}px`,
      }}
      aria-hidden={previewMode ? undefined : false}
    >
      <Motion.div
        className="fdc-hero-countdown-offset pointer-events-auto mx-auto flex max-w-full justify-center"
        initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: reduceMotion ? 0.15 : 1.05, ease: softEase }}
      >
        <div
          className="relative flex items-end justify-center rounded-[1.35rem] border border-white/10 bg-[#171b22]/28 px-2 py-2 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.75)] backdrop-blur-sm sm:rounded-[1.5rem] sm:px-3 sm:py-2.5 lg:px-4 lg:py-3"
          role="timer"
          aria-label={
            previewMode
              ? 'Vista previa del contador'
              : `Cuenta regresiva: ${remaining.days} días, ${remaining.hours} horas, ${remaining.minutes} minutos y ${remaining.seconds} segundos`
          }
        >
          <div
            className="pointer-events-none absolute -inset-px rounded-[inherit] bg-linear-to-b from-[#d4b483]/12 via-transparent to-transparent"
            aria-hidden
          />
          <div className="relative flex items-end">
            {units.map((unit, idx) => (
              <span key={unit.key} className="flex items-end">
                <CountdownUnit
                  value={unit.value}
                  reduceMotion={reduceMotion}
                  index={idx}
                />
                {idx < units.length - 1 ? (
                  <Separator reduceMotion={reduceMotion} index={idx} />
                ) : null}
              </span>
            ))}
          </div>
        </div>
      </Motion.div>
    </div>
  )
}
