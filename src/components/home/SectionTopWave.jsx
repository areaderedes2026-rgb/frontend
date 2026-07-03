const TONE_WAVE_COLOR = {
  light: '#f7f7f5',
  accent: '#171b22',
}

export const SECTION_WAVE_PATH =
  'M0 58L60 52C120 46 240 34 360 42C480 50 600 78 720 74C840 70 960 34 1080 30C1200 26 1320 54 1380 68L1440 82V96H0V58Z'

/** Color de la onda superior: tono de la sección actual, con contraste si el anterior coincide. */
export function getSectionWaveColor(tone = 'light', previousTone = 'light') {
  const current = TONE_WAVE_COLOR[tone] ?? TONE_WAVE_COLOR.light
  const previous = TONE_WAVE_COLOR[previousTone] ?? TONE_WAVE_COLOR.light
  if (current === previous) {
    return tone === 'accent' ? TONE_WAVE_COLOR.light : TONE_WAVE_COLOR.accent
  }
  return current
}

export function SectionTopWave({ tone = 'light', previousTone = 'light', className = '' }) {
  const waveColor = getSectionWaveColor(tone, previousTone)

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
