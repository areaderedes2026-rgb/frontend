/** Normaliza opacidad de overlay de hero (0–90 %), igual que banners de Inicio. */
export function normalizeHeroOverlayOpacity(value, fallback = 65) {
  const n = Number(value)
  const base = Number.isFinite(n) ? n : Number(fallback) || 65
  return Math.min(90, Math.max(0, Math.round(base)))
}

/** Gradiente vertical usado en portadas con imagen (Inicio, Áreas, etc.). */
export function heroOverlayGradientStyle(opacityPercent, fallback = 65) {
  const overlay = normalizeHeroOverlayOpacity(opacityPercent, fallback) / 100
  return {
    background: `linear-gradient(to top, rgba(0,0,0,${Math.min(0.92, overlay + 0.18)}), rgba(0,0,0,${overlay}), rgba(0,0,0,${Math.max(0, overlay - 0.25)}))`,
  }
}
