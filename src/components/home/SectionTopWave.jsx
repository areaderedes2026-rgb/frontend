const TONE_WAVE_COLOR = {
  light: '#f7f7f5',
  accent: '#171b22',
}

export const SECTION_WAVE_PATH =
  'M0 58L60 52C120 46 240 34 360 42C480 50 600 78 720 74C840 70 960 34 1080 30C1200 26 1320 54 1380 68L1440 82V96H0V58Z'

const WAVE_MASK_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 96" preserveAspectRatio="none"><path fill="#fff" d="${SECTION_WAVE_PATH}"/></svg>`,
)

const WAVE_MASK_URL = `url("data:image/svg+xml,${WAVE_MASK_SVG}")`

/** Cuando la sección anterior es oscura, la imagen sube con borde ondulado (sin franja de color). */
export function usesImageWaveEdge(tone = 'light', previousTone = 'light') {
  const current = TONE_WAVE_COLOR[tone] ?? TONE_WAVE_COLOR.light
  const previous = TONE_WAVE_COLOR[previousTone] ?? TONE_WAVE_COLOR.light
  return current === previous && tone === 'accent'
}

/** Color de la onda superior sólida (solo cuando no hay imagen con máscara). */
export function getSectionWaveColor(tone = 'light', previousTone = 'light') {
  if (usesImageWaveEdge(tone, previousTone)) return null
  const current = TONE_WAVE_COLOR[tone] ?? TONE_WAVE_COLOR.light
  const previous = TONE_WAVE_COLOR[previousTone] ?? TONE_WAVE_COLOR.light
  if (current === previous) {
    return tone === 'accent' ? TONE_WAVE_COLOR.light : TONE_WAVE_COLOR.accent
  }
  return current
}

/** Máscara: franja ondulada fija arriba (3rem) + resto rectangular. */
export function getSectionImageWaveMaskStyle() {
  return {
    maskImage: `linear-gradient(#fff,#fff), ${WAVE_MASK_URL}`,
    WebkitMaskImage: `linear-gradient(#fff,#fff), ${WAVE_MASK_URL}`,
    maskSize: '100% calc(100% - 3rem), 100% 3rem',
    WebkitMaskSize: '100% calc(100% - 3rem), 100% 3rem',
    maskPosition: '0 3rem, 0 0',
    WebkitMaskPosition: '0 3rem, 0 0',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
  }
}

export function SectionTopWave({ tone = 'light', previousTone = 'light', className = '' }) {
  const waveColor = getSectionWaveColor(tone, previousTone)
  if (!waveColor) return null

  return (
    <svg
      className={`pointer-events-none absolute inset-x-0 -top-12 z-0 h-12 w-full ${className}`.trim()}
      style={{ color: waveColor }}
      viewBox="0 0 1440 96"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path fill="currentColor" d={SECTION_WAVE_PATH} />
    </svg>
  )
}
