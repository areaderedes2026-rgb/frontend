import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { PageCoverModal } from '../../components/admin/PageCoverModal.jsx'
import { SingleImageUploadField } from '../../components/admin/SingleImageUploadField.jsx'
import { FdcFestivalHero } from '../../components/fdc/FdcFestivalHero.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { inputClass, labelClass, textareaClass } from '../../components/ui/formStyles.js'
import {
  DEFAULT_FDC_CONTENT,
  FDC_SCHEDULE_MAX_IMAGES,
  applyHeroCoverToFdcContent,
  fdcContentToHeroCover,
  makeFdcItemId,
  mergeFdcContent,
} from '../../data/fdcContent.js'
import { normalizeHeroToggle } from '../../data/servicesPageContent.js'
import { useContentEditorConcurrencyConflict } from '../../hooks/useContentEditorConcurrencyConflict.jsx'
import { fetchFdcContentAdmin, updateFdcContent } from '../../services/fdcService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { ROUTES } from '../../utils/constants.js'

function cloneContent(c) {
  return JSON.parse(JSON.stringify(c))
}

function normalizeOverlay(value, fallback = 65) {
  const n = Number(value)
  return Number.isFinite(n) ? Math.min(90, Math.max(0, Math.round(n))) : fallback
}

function mapContentToForm(content) {
  const merged = mergeFdcContent(DEFAULT_FDC_CONTENT, content || {})
  return {
    ...merged,
    introParagraphs: [...(merged.introParagraphs || [])],
    highlights: (merged.highlights || []).map((h) => ({ ...h })),
    sectionNav: (merged.sectionNav || []).map((n) => ({ ...n })),
    schedule: {
      ...merged.schedule,
      images: (merged.schedule?.images || []).map((img) => ({ ...img })),
      days: (merged.schedule?.days || []).map((d) => ({
        ...d,
        items: (d.items || []).map((it) => ({ ...it })),
      })),
    },
    artists: {
      ...merged.artists,
      items: (merged.artists?.items || []).map((it) => ({ ...it })),
    },
    tickets: {
      ...merged.tickets,
      bullets: [...(merged.tickets?.bullets || [])],
    },
    news: {
      ...merged.news,
      items: (merged.news?.items || []).map((it) => ({ ...it })),
    },
    gallery: {
      ...merged.gallery,
      items: (merged.gallery?.items || []).map((it) => ({ ...it })),
    },
    sponsors: {
      ...merged.sponsors,
      items: (merged.sponsors?.items || []).map((it) => ({ ...it })),
    },
    usefulInfo: {
      ...merged.usefulInfo,
      items: (merged.usefulInfo?.items || []).map((it) => ({ ...it })),
    },
    overlayOpacity: normalizeOverlay(merged.overlayOpacity, 65),
    showHeroBadge: normalizeHeroToggle(merged.showHeroBadge, true),
    showHeroTitle: normalizeHeroToggle(merged.showHeroTitle, true),
    showHeroSubtitle: normalizeHeroToggle(merged.showHeroSubtitle, true),
    showSearch: normalizeHeroToggle(merged.showSearch, false),
    showPrimaryButton: normalizeHeroToggle(merged.showPrimaryButton, true),
    showSecondaryButton: normalizeHeroToggle(merged.showSecondaryButton, true),
  }
}

const ACTION_BTN =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60'
const ACTION_PRIMARY = `${ACTION_BTN} bg-sky-700 text-white hover:bg-sky-800`
const ACTION_NEUTRAL = `${ACTION_BTN} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`
const ACTION_DANGER =
  'inline-flex min-h-9 items-center justify-center rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60'
const ACTION_ADD =
  'inline-flex min-h-9 items-center justify-center rounded-xl border border-dashed border-sky-300 bg-sky-50/60 px-3 py-2 text-xs font-semibold text-sky-800 transition hover:bg-sky-100 disabled:opacity-60'
const ITEM_CARD = 'rounded-2xl border border-slate-200 bg-slate-50/70 p-4'
const SECTION_CARD = 'rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'

const NAV_ICON_OPTIONS = [
  { value: 'calendar', label: 'Calendario' },
  { value: 'music', label: 'Música' },
  { value: 'ticket', label: 'Entrada' },
  { value: 'news', label: 'Noticias' },
  { value: 'info', label: 'Info' },
  { value: 'store', label: 'Puestos' },
  { value: 'link', label: 'Enlace' },
]

function SectionTitle({ title, description }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
    </div>
  )
}

export function AdminFdc() {
  const [form, setForm] = useState(() => mapContentToForm(DEFAULT_FDC_CONTENT))
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [heroCoverOpen, setHeroCoverOpen] = useState(false)
  const [heroCoverDraft, setHeroCoverDraft] = useState(() =>
    fdcContentToHeroCover(DEFAULT_FDC_CONTENT),
  )
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])
  const apiAvailable = isApiConfigured()

  const loadFromServer = useCallback(async () => {
    const remote = await fetchFdcContentAdmin()
    const nextForm = mapContentToForm(remote || {})
    setForm(cloneContent(nextForm))
    setContentUpdatedAt(remote?.updatedAt || null)
    setError('')
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      if (!apiAvailable) {
        if (!cancelled) setLoading(false)
        return
      }
      try {
        await loadFromServer()
      } catch (e) {
        if (!cancelled) setError(e.message || 'No se pudo cargar Fiesta del Caballo.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [apiAvailable, loadFromServer])

  const buildPayload = useCallback(
    (forceOverwrite = false) => ({
      expectedUpdatedAt: contentUpdatedAt,
      forceOverwrite,
      heroEyebrow: String(form.heroEyebrow || '').trim(),
      heroTitle: String(form.heroTitle || '').trim(),
      heroSubtitle: String(form.heroSubtitle || ''),
      heroSlogan: '',
      heroDateBadge: '',
      heroImageUrl: String(form.heroImageUrl || '').trim(),
      overlayOpacity: normalizeOverlay(form.overlayOpacity, 65),
      heroSearchPlaceholder: String(form.heroSearchPlaceholder || ''),
      showHeroBadge: normalizeHeroToggle(form.showHeroBadge, true),
      showHeroTitle: normalizeHeroToggle(form.showHeroTitle, true),
      showHeroSubtitle: normalizeHeroToggle(form.showHeroSubtitle, true),
      showSearch: normalizeHeroToggle(form.showSearch, false),
      showPrimaryButton: normalizeHeroToggle(form.showPrimaryButton, true),
      heroPrimaryLabel: String(form.heroPrimaryLabel || '').trim(),
      heroPrimaryHref: String(form.heroPrimaryHref || '').trim(),
      showSecondaryButton: normalizeHeroToggle(form.showSecondaryButton, true),
      heroSecondaryLabel: String(form.heroSecondaryLabel || '').trim(),
      heroSecondaryHref: String(form.heroSecondaryHref || '').trim(),
      introTitle: String(form.introTitle || '').trim(),
      introParagraphs: (form.introParagraphs || []).map((p) => String(p || '').trim()).filter(Boolean),
      highlights: (form.highlights || [])
        .map((h) => ({
          label: String(h?.label || '').trim(),
          value: String(h?.value || '').trim(),
        }))
        .filter((h) => h.label || h.value),
      sectionNav: (form.sectionNav || [])
        .map((n) => ({
          id: String(n?.id || '').trim() || makeFdcItemId('nav'),
          label: String(n?.label || '').trim(),
          href: String(n?.href || '').trim(),
          icon: String(n?.icon || 'link').trim(),
        }))
        .filter((n) => n.label || n.href),
      schedule: {
        title: String(form.schedule?.title || '').trim(),
        featuredImageUrl: String(
          (form.schedule?.images || []).find((img) => String(img?.imageUrl || '').trim())?.imageUrl ||
            form.schedule?.featuredImageUrl ||
            '',
        ).trim(),
        images: (form.schedule?.images || [])
          .map((img) => ({
            id: String(img?.id || '').trim() || makeFdcItemId('schimg'),
            imageUrl: String(img?.imageUrl || '').trim(),
            caption: String(img?.caption || '').trim(),
          }))
          .filter((img) => img.imageUrl)
          .slice(0, 10),
        ctaLabel: String(form.schedule?.ctaLabel || '').trim(),
        ctaHref: String(form.schedule?.ctaHref || '').trim(),
        days: (form.schedule?.days || [])
          .map((day) => ({
            id: String(day?.id || '').trim() || makeFdcItemId('day'),
            label: String(day?.label || '').trim(),
            items: (day?.items || [])
              .map((it) => ({
                id: String(it?.id || '').trim() || makeFdcItemId('sch'),
                time: String(it?.time || '').trim(),
                text: String(it?.text || '').trim(),
              }))
              .filter((it) => it.time || it.text),
          }))
          .filter((day) => day.label || day.items.length > 0),
      },
      artists: {
        title: String(form.artists?.title || '').trim(),
        ctaLabel: String(form.artists?.ctaLabel || '').trim(),
        ctaHref: String(form.artists?.ctaHref || '').trim(),
        items: (form.artists?.items || [])
          .map((it) => ({
            id: String(it?.id || '').trim() || makeFdcItemId('art'),
            name: String(it?.name || '').trim(),
            photoUrl: String(it?.photoUrl || '').trim(),
            dateTag: String(it?.dateTag || '').trim(),
          }))
          .filter((it) => it.name),
      },
      tickets: {
        title: String(form.tickets?.title || '').trim(),
        body: String(form.tickets?.body || ''),
        bullets: (form.tickets?.bullets || []).map((b) => String(b || '').trim()).filter(Boolean),
        ctaLabel: String(form.tickets?.ctaLabel || '').trim(),
        ctaUrl: String(form.tickets?.ctaUrl || '').trim(),
        imageUrl: String(form.tickets?.imageUrl || '').trim(),
      },
      news: {
        title: String(form.news?.title || '').trim(),
        ctaLabel: String(form.news?.ctaLabel || '').trim(),
        ctaHref: String(form.news?.ctaHref || '').trim(),
        items: (form.news?.items || [])
          .map((it) => ({
            id: String(it?.id || '').trim() || makeFdcItemId('news'),
            title: String(it?.title || '').trim(),
            date: String(it?.date || '').trim(),
            excerpt: String(it?.excerpt || '').trim(),
            link: String(it?.link || '').trim(),
            imageUrl: String(it?.imageUrl || '').trim(),
          }))
          .filter((it) => it.title),
      },
      gallery: {
        title: String(form.gallery?.title || '').trim(),
        items: (form.gallery?.items || [])
          .map((it) => ({
            id: String(it?.id || '').trim() || makeFdcItemId('gal'),
            imageUrl: String(it?.imageUrl || '').trim(),
            caption: String(it?.caption || '').trim(),
          }))
          .filter((it) => it.imageUrl),
      },
      sponsors: {
        title: String(form.sponsors?.title || '').trim(),
        items: (form.sponsors?.items || [])
          .map((it) => ({
            id: String(it?.id || '').trim() || makeFdcItemId('spo'),
            name: String(it?.name || '').trim(),
            logoUrl: String(it?.logoUrl || '').trim(),
            url: String(it?.url || '').trim(),
          }))
          .filter((it) => it.name || it.logoUrl),
      },
      usefulInfo: {
        title: String(form.usefulInfo?.title || '').trim(),
        items: (form.usefulInfo?.items || [])
          .map((it) => ({
            id: String(it?.id || '').trim() || makeFdcItemId('info'),
            title: String(it?.title || '').trim(),
            body: String(it?.body || ''),
          }))
          .filter((it) => it.title || it.body),
      },
      formNotice: String(form.formNotice || ''),
      formOpenFrom: form.formOpenFrom || null,
      formOpenUntil: form.formOpenUntil || null,
      ctaTitle: String(form.ctaTitle || '').trim(),
      ctaBody: String(form.ctaBody || ''),
    }),
    [contentUpdatedAt, form],
  )

  const persistContent = useCallback(
    async ({ forceOverwrite = false } = {}) => {
      const saved = await updateFdcContent(buildPayload(forceOverwrite))
      const nextForm = mapContentToForm(saved || {})
      setForm(cloneContent(nextForm))
      setContentUpdatedAt(saved?.updatedAt || null)
      setError('')
      setToast({ variant: 'success', message: 'Se guardaron los cambios de Fiesta del Caballo.' })
    },
    [buildPayload],
  )

  const { conflictDialog, handleConflict } = useContentEditorConcurrencyConflict({
    reloadFromServer: loadFromServer,
    persistContent,
    entityLabel: 'Fiesta del Caballo',
    onReloadSuccess: () =>
      setToast({ variant: 'success', message: 'Se cargó la última versión del servidor.' }),
    onReloadError: (e) =>
      setToast({ variant: 'error', message: e.message || 'No se pudo recargar.' }),
    onForceSaveError: (e) => {
      const msg = e.message || 'No se pudo guardar.'
      setError(msg)
      setToast({ variant: 'error', message: msg })
    },
  })

  async function handleSubmit() {
    if (!apiAvailable) {
      setToast({ variant: 'error', message: 'No hay conexión con el backend.' })
      return
    }
    setSaving(true)
    try {
      await persistContent()
    } catch (e) {
      if (handleConflict(e)) return
      const msg = e.message || 'No se pudo guardar.'
      setError(msg)
      setToast({ variant: 'error', message: msg })
    } finally {
      setSaving(false)
    }
  }

  const heroPrimaryCta =
    form.showPrimaryButton !== false && form.heroPrimaryLabel
      ? { label: form.heroPrimaryLabel, href: form.heroPrimaryHref || '#cronograma' }
      : null
  const heroSecondaryCta =
    form.showSecondaryButton !== false && form.heroSecondaryLabel
      ? { label: form.heroSecondaryLabel, href: form.heroSecondaryHref || '#cronograma' }
      : null

  function updateSchedule(updater) {
    setForm((p) => ({
      ...p,
      schedule: typeof updater === 'function' ? updater(p.schedule) : updater,
    }))
  }

  function updateArtists(updater) {
    setForm((p) => ({
      ...p,
      artists: typeof updater === 'function' ? updater(p.artists) : updater,
    }))
  }

  function updateTickets(updater) {
    setForm((p) => ({
      ...p,
      tickets: typeof updater === 'function' ? updater(p.tickets) : updater,
    }))
  }

  function updateNews(updater) {
    setForm((p) => ({
      ...p,
      news: typeof updater === 'function' ? updater(p.news) : updater,
    }))
  }

  function updateGallery(updater) {
    setForm((p) => ({
      ...p,
      gallery: typeof updater === 'function' ? updater(p.gallery) : updater,
    }))
  }

  function updateSponsors(updater) {
    setForm((p) => ({
      ...p,
      sponsors: typeof updater === 'function' ? updater(p.sponsors) : updater,
    }))
  }

  function updateUsefulInfo(updater) {
    setForm((p) => ({
      ...p,
      usefulInfo: typeof updater === 'function' ? updater(p.usefulInfo) : updater,
    }))
  }

  return (
    <>
      {conflictDialog}
      {toast ? <Toast variant={toast.variant} message={toast.message} onDismiss={dismissToast} /> : null}

      <PageCoverModal
        open={heroCoverOpen}
        title="Portada Fiesta del Caballo"
        description="Imagen, overlay, textos y botones del header público."
        draft={heroCoverDraft}
        onFieldChange={(key, value) => setHeroCoverDraft((prev) => ({ ...prev, [key]: value }))}
        onClose={() => setHeroCoverOpen(false)}
        onSave={() => {
          setForm(cloneContent(mapContentToForm(applyHeroCoverToFdcContent(form, heroCoverDraft))))
          setHeroCoverOpen(false)
          setToast({
            variant: 'success',
            message: 'Portada aplicada al borrador. Guardá para publicarla.',
          })
        }}
        saving={saving}
        disabled={loading || saving}
        saveLabel="Aplicar al borrador"
      />

      <AdminPageShell
        showBackLink={false}
        eyebrow="Nuestra ciudad"
        title="Fiesta del Caballo"
        subtitle="Portada, secciones del festival (cronograma, cartelera, entradas, noticias, galería, auspiciantes, info útil) y preinscripción de puestos."
        maxWidthClass="max-w-5xl"
        variant="plain"
        actions={
          <Link to={ROUTES.adminFdcSolicitudes} className={ACTION_NEUTRAL}>
            Ver solicitudes
          </Link>
        }
      >
        {!apiAvailable ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Esta sección requiere backend activo.
          </div>
        ) : null}
        {error ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="h-64 animate-pulse rounded-3xl bg-slate-100" />
        ) : (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-[#ddd7ca] bg-[#0c1017]">
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-100">
                  Portada pública
                </p>
                <button
                  type="button"
                  className={ACTION_NEUTRAL}
                  onClick={() => {
                    setHeroCoverDraft(fdcContentToHeroCover(form))
                    setHeroCoverOpen(true)
                  }}
                  disabled={saving}
                >
                  Cambiar portada
                </button>
              </div>
              <div className="flex h-[min(70vh,36rem)] flex-col">
                <FdcFestivalHero
                  previewMode
                  contentReady
                  imageUrl={form.heroImageUrl || ''}
                  overlayOpacity={form.overlayOpacity}
                  eyebrow={form.showHeroBadge !== false ? form.heroEyebrow : ''}
                  title={form.showHeroTitle !== false ? form.heroTitle : ''}
                  subtitle={form.showHeroSubtitle !== false ? form.heroSubtitle : ''}
                  primaryCta={heroPrimaryCta}
                  secondaryCta={heroSecondaryCta}
                />
              </div>
            </div>

            <section className={SECTION_CARD}>
              <SectionTitle title="Navegación por secciones" description="Enlaces rápidos bajo la portada." />
              <div className="mt-4 space-y-3">
                {(form.sectionNav || []).map((item, idx) => (
                  <div key={item.id || idx} className={`${ITEM_CARD} grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]`}>
                    <label className={labelClass}>
                      Etiqueta
                      <input
                        className={inputClass}
                        value={item.label || ''}
                        disabled={saving}
                        onChange={(e) =>
                          setForm((p) => {
                            const next = [...(p.sectionNav || [])]
                            next[idx] = { ...next[idx], label: e.target.value }
                            return { ...p, sectionNav: next }
                          })
                        }
                      />
                    </label>
                    <label className={labelClass}>
                      Enlace (#ancla o URL)
                      <input
                        className={inputClass}
                        value={item.href || ''}
                        disabled={saving}
                        onChange={(e) =>
                          setForm((p) => {
                            const next = [...(p.sectionNav || [])]
                            next[idx] = { ...next[idx], href: e.target.value }
                            return { ...p, sectionNav: next }
                          })
                        }
                      />
                    </label>
                    <label className={labelClass}>
                      Ícono
                      <select
                        className={inputClass}
                        value={item.icon || 'link'}
                        disabled={saving}
                        onChange={(e) =>
                          setForm((p) => {
                            const next = [...(p.sectionNav || [])]
                            next[idx] = { ...next[idx], icon: e.target.value }
                            return { ...p, sectionNav: next }
                          })
                        }
                      >
                        {NAV_ICON_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="flex items-end">
                      <button
                        type="button"
                        className={ACTION_DANGER}
                        disabled={saving}
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            sectionNav: (p.sectionNav || []).filter((_, i) => i !== idx),
                          }))
                        }
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className={ACTION_ADD}
                  disabled={saving}
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      sectionNav: [
                        ...(p.sectionNav || []),
                        { id: makeFdcItemId('nav'), label: '', href: '#', icon: 'link' },
                      ],
                    }))
                  }
                >
                  + Agregar enlace
                </button>
              </div>
            </section>

            <section className={SECTION_CARD}>
              <SectionTitle title="Introducción" />
              <div className="mt-4 grid gap-4">
                <label className={labelClass}>
                  Título
                  <input
                    className={inputClass}
                    value={form.introTitle}
                    onChange={(e) => setForm((p) => ({ ...p, introTitle: e.target.value }))}
                    disabled={saving}
                  />
                </label>
                <label className={labelClass}>
                  Párrafos (uno por línea)
                  <textarea
                    className={textareaClass}
                    value={(form.introParagraphs || []).join('\n\n')}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        introParagraphs: e.target.value
                          .split(/\n\s*\n/)
                          .map((x) => x.trim())
                          .filter(Boolean),
                      }))
                    }
                    disabled={saving}
                  />
                </label>
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-800">Destacados</p>
                  <div className="space-y-2">
                    {(form.highlights || []).map((h, idx) => (
                      <div key={idx} className={`${ITEM_CARD} grid gap-3 sm:grid-cols-2`}>
                        <label className={labelClass}>
                          Etiqueta
                          <input
                            className={inputClass}
                            value={h.label || ''}
                            disabled={saving}
                            onChange={(e) =>
                              setForm((p) => {
                                const next = [...(p.highlights || [])]
                                next[idx] = { ...next[idx], label: e.target.value }
                                return { ...p, highlights: next }
                              })
                            }
                          />
                        </label>
                        <label className={labelClass}>
                          Valor
                          <input
                            className={inputClass}
                            value={h.value || ''}
                            disabled={saving}
                            onChange={(e) =>
                              setForm((p) => {
                                const next = [...(p.highlights || [])]
                                next[idx] = { ...next[idx], value: e.target.value }
                                return { ...p, highlights: next }
                              })
                            }
                          />
                        </label>
                      </div>
                    ))}
                    <button
                      type="button"
                      className={ACTION_ADD}
                      disabled={saving}
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          highlights: [...(p.highlights || []), { label: '', value: '' }],
                        }))
                      }
                    >
                      + Agregar destacado
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className={SECTION_CARD}>
              <SectionTitle
                title="Cronograma"
                description="Programación por días y carrusel de hasta 10 fotos."
              />
              <div className="mt-4 grid gap-4">
                <label className={labelClass}>
                  Título de sección
                  <input
                    className={inputClass}
                    value={form.schedule?.title || ''}
                    disabled={saving}
                    onChange={(e) => updateSchedule((s) => ({ ...s, title: e.target.value }))}
                    placeholder="Cronograma de actividades"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className={labelClass}>
                    Texto del botón
                    <input
                      className={inputClass}
                      value={form.schedule?.ctaLabel || ''}
                      disabled={saving}
                      onChange={(e) => updateSchedule((s) => ({ ...s, ctaLabel: e.target.value }))}
                      placeholder="Ver cronograma completo"
                    />
                  </label>
                  <label className={labelClass}>
                    Enlace del botón (opcional)
                    <input
                      className={inputClass}
                      value={form.schedule?.ctaHref || ''}
                      disabled={saving}
                      onChange={(e) => updateSchedule((s) => ({ ...s, ctaHref: e.target.value }))}
                      placeholder="Vacío = expandir todos los días en la página"
                    />
                  </label>
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-700">
                      Fotos del carrusel{' '}
                      <span className="font-normal text-slate-500">
                        ({(form.schedule?.images || []).length}/{FDC_SCHEDULE_MAX_IMAGES})
                      </span>
                    </p>
                    <button
                      type="button"
                      className={ACTION_ADD}
                      disabled={saving || (form.schedule?.images || []).length >= FDC_SCHEDULE_MAX_IMAGES}
                      onClick={() =>
                        updateSchedule((s) => ({
                          ...s,
                          images: [
                            ...(s.images || []),
                            { id: makeFdcItemId('schimg'), imageUrl: '', caption: '' },
                          ].slice(0, FDC_SCHEDULE_MAX_IMAGES),
                        }))
                      }
                    >
                      + Agregar foto
                    </button>
                  </div>
                  <div className="mt-3 space-y-3">
                    {(form.schedule?.images || []).length === 0 ? (
                      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                        Todavía no hay fotos. Agregá hasta {FDC_SCHEDULE_MAX_IMAGES} para el carrusel.
                      </p>
                    ) : null}
                    {(form.schedule?.images || []).map((img, imgIdx) => (
                      <div key={img.id || imgIdx} className={ITEM_CARD}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Foto {imgIdx + 1}
                          </p>
                          <button
                            type="button"
                            className={ACTION_DANGER}
                            disabled={saving}
                            onClick={() =>
                              updateSchedule((s) => ({
                                ...s,
                                images: (s.images || []).filter((_, i) => i !== imgIdx),
                              }))
                            }
                          >
                            Quitar
                          </button>
                        </div>
                        <div className="mt-3">
                          <SingleImageUploadField
                            label="Imagen"
                            value={img.imageUrl || ''}
                            disabled={saving}
                            kind="cover"
                            onChange={(url) =>
                              updateSchedule((s) => {
                                const images = [...(s.images || [])]
                                images[imgIdx] = { ...images[imgIdx], imageUrl: url }
                                return { ...s, images }
                              })
                            }
                            onNotify={setToast}
                          />
                        </div>
                        <label className={`${labelClass} mt-3`}>
                          Epígrafe (opcional)
                          <input
                            className={inputClass}
                            value={img.caption || ''}
                            disabled={saving}
                            onChange={(e) =>
                              updateSchedule((s) => {
                                const images = [...(s.images || [])]
                                images[imgIdx] = { ...images[imgIdx], caption: e.target.value }
                                return { ...s, images }
                              })
                            }
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {(form.schedule?.days || []).map((day, dayIdx) => (
                    <div key={day.id || dayIdx} className={ITEM_CARD}>
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <label className={`${labelClass} flex-1 min-w-[12rem]`}>
                          Día
                          <input
                            className={inputClass}
                            value={day.label || ''}
                            disabled={saving}
                            placeholder="Jueves 9 Jul"
                            onChange={(e) =>
                              updateSchedule((s) => {
                                const days = [...(s.days || [])]
                                days[dayIdx] = { ...days[dayIdx], label: e.target.value }
                                return { ...s, days }
                              })
                            }
                          />
                        </label>
                        <button
                          type="button"
                          className={ACTION_DANGER}
                          disabled={saving}
                          onClick={() =>
                            updateSchedule((s) => ({
                              ...s,
                              days: (s.days || []).filter((_, i) => i !== dayIdx),
                            }))
                          }
                        >
                          Quitar día
                        </button>
                      </div>
                      <div className="mt-3 space-y-2">
                        {(day.items || []).map((it, itemIdx) => (
                          <div key={it.id || itemIdx} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[6rem_1fr_auto]">
                            <label className={labelClass}>
                              Hora
                              <input
                                className={inputClass}
                                value={it.time || ''}
                                disabled={saving}
                                placeholder="18:00"
                                onChange={(e) =>
                                  updateSchedule((s) => {
                                    const days = [...(s.days || [])]
                                    const items = [...(days[dayIdx].items || [])]
                                    items[itemIdx] = { ...items[itemIdx], time: e.target.value }
                                    days[dayIdx] = { ...days[dayIdx], items }
                                    return { ...s, days }
                                  })
                                }
                              />
                            </label>
                            <label className={labelClass}>
                              Actividad
                              <input
                                className={inputClass}
                                value={it.text || ''}
                                disabled={saving}
                                onChange={(e) =>
                                  updateSchedule((s) => {
                                    const days = [...(s.days || [])]
                                    const items = [...(days[dayIdx].items || [])]
                                    items[itemIdx] = { ...items[itemIdx], text: e.target.value }
                                    days[dayIdx] = { ...days[dayIdx], items }
                                    return { ...s, days }
                                  })
                                }
                              />
                            </label>
                            <div className="flex items-end">
                              <button
                                type="button"
                                className={ACTION_DANGER}
                                disabled={saving}
                                onClick={() =>
                                  updateSchedule((s) => {
                                    const days = [...(s.days || [])]
                                    days[dayIdx] = {
                                      ...days[dayIdx],
                                      items: (days[dayIdx].items || []).filter((_, i) => i !== itemIdx),
                                    }
                                    return { ...s, days }
                                  })
                                }
                              >
                                Quitar
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className={ACTION_ADD}
                          disabled={saving}
                          onClick={() =>
                            updateSchedule((s) => {
                              const days = [...(s.days || [])]
                              days[dayIdx] = {
                                ...days[dayIdx],
                                items: [
                                  ...(days[dayIdx].items || []),
                                  { id: makeFdcItemId('sch'), time: '', text: '' },
                                ],
                              }
                              return { ...s, days }
                            })
                          }
                        >
                          + Agregar actividad
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={ACTION_ADD}
                    disabled={saving}
                    onClick={() =>
                      updateSchedule((s) => ({
                        ...s,
                        days: [
                          ...(s.days || []),
                          { id: makeFdcItemId('day'), label: '', items: [] },
                        ],
                      }))
                    }
                  >
                    + Agregar día
                  </button>
                </div>
              </div>
            </section>

            <section className={SECTION_CARD}>
              <SectionTitle title="Cartelera artística" description="Artistas en carrusel horizontal." />
              <div className="mt-4 grid gap-4">
                <label className={labelClass}>
                  Título
                  <input
                    className={inputClass}
                    value={form.artists?.title || ''}
                    disabled={saving}
                    onChange={(e) => updateArtists((a) => ({ ...a, title: e.target.value }))}
                  />
                </label>
                <div className="space-y-3">
                  {(form.artists?.items || []).map((artist, idx) => (
                    <div key={artist.id || idx} className={ITEM_CARD}>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className={labelClass}>
                          Nombre
                          <input
                            className={inputClass}
                            value={artist.name || ''}
                            disabled={saving}
                            onChange={(e) =>
                              updateArtists((a) => {
                                const items = [...(a.items || [])]
                                items[idx] = { ...items[idx], name: e.target.value }
                                return { ...a, items }
                              })
                            }
                          />
                        </label>
                        <label className={labelClass}>
                          Etiqueta de fecha
                          <input
                            className={inputClass}
                            value={artist.dateTag || ''}
                            disabled={saving}
                            placeholder="Viernes 10"
                            onChange={(e) =>
                              updateArtists((a) => {
                                const items = [...(a.items || [])]
                                items[idx] = { ...items[idx], dateTag: e.target.value }
                                return { ...a, items }
                              })
                            }
                          />
                        </label>
                      </div>
                      <div className="mt-3">
                        <SingleImageUploadField
                          label="Foto"
                          value={artist.photoUrl || ''}
                          disabled={saving}
                          kind="cover"
                          compact
                          onChange={(url) =>
                            updateArtists((a) => {
                              const items = [...(a.items || [])]
                              items[idx] = { ...items[idx], photoUrl: url }
                              return { ...a, items }
                            })
                          }
                          onNotify={setToast}
                        />
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          className={ACTION_DANGER}
                          disabled={saving}
                          onClick={() =>
                            updateArtists((a) => ({
                              ...a,
                              items: (a.items || []).filter((_, i) => i !== idx),
                            }))
                          }
                        >
                          Quitar artista
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={ACTION_ADD}
                    disabled={saving}
                    onClick={() =>
                      updateArtists((a) => ({
                        ...a,
                        items: [
                          ...(a.items || []),
                          { id: makeFdcItemId('art'), name: '', dateTag: '', photoUrl: '' },
                        ],
                      }))
                    }
                  >
                    + Agregar artista
                  </button>
                </div>
              </div>
            </section>

            <section className={SECTION_CARD}>
              <SectionTitle title="Entradas" description="Banner oscuro con beneficios y CTA." />
              <div className="mt-4 grid gap-4">
                <label className={labelClass}>
                  Título
                  <input
                    className={inputClass}
                    value={form.tickets?.title || ''}
                    disabled={saving}
                    onChange={(e) => updateTickets((t) => ({ ...t, title: e.target.value }))}
                  />
                </label>
                <label className={labelClass}>
                  Texto
                  <textarea
                    className={textareaClass}
                    value={form.tickets?.body || ''}
                    disabled={saving}
                    onChange={(e) => updateTickets((t) => ({ ...t, body: e.target.value }))}
                  />
                </label>
                <label className={labelClass}>
                  Beneficios (uno por línea)
                  <textarea
                    className={textareaClass}
                    value={(form.tickets?.bullets || []).join('\n')}
                    disabled={saving}
                    onChange={(e) =>
                      updateTickets((t) => ({
                        ...t,
                        bullets: e.target.value
                          .split('\n')
                          .map((x) => x.trim())
                          .filter(Boolean),
                      }))
                    }
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    Texto del botón
                    <input
                      className={inputClass}
                      value={form.tickets?.ctaLabel || ''}
                      disabled={saving}
                      onChange={(e) => updateTickets((t) => ({ ...t, ctaLabel: e.target.value }))}
                    />
                  </label>
                  <label className={labelClass}>
                    URL del botón
                    <input
                      className={inputClass}
                      value={form.tickets?.ctaUrl || ''}
                      disabled={saving}
                      placeholder="https://…"
                      onChange={(e) => updateTickets((t) => ({ ...t, ctaUrl: e.target.value }))}
                    />
                  </label>
                </div>
                <SingleImageUploadField
                  label="Imagen lateral"
                  value={form.tickets?.imageUrl || ''}
                  disabled={saving}
                  kind="cover"
                  onChange={(url) => updateTickets((t) => ({ ...t, imageUrl: url }))}
                  onNotify={setToast}
                />
              </div>
            </section>

            <section className={SECTION_CARD}>
              <SectionTitle title="Noticias del festival" />
              <div className="mt-4 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className={labelClass}>
                    Título sección
                    <input
                      className={inputClass}
                      value={form.news?.title || ''}
                      disabled={saving}
                      onChange={(e) => updateNews((n) => ({ ...n, title: e.target.value }))}
                    />
                  </label>
                  <label className={labelClass}>
                    CTA etiqueta
                    <input
                      className={inputClass}
                      value={form.news?.ctaLabel || ''}
                      disabled={saving}
                      onChange={(e) => updateNews((n) => ({ ...n, ctaLabel: e.target.value }))}
                    />
                  </label>
                  <label className={labelClass}>
                    CTA enlace
                    <input
                      className={inputClass}
                      value={form.news?.ctaHref || ''}
                      disabled={saving}
                      onChange={(e) => updateNews((n) => ({ ...n, ctaHref: e.target.value }))}
                    />
                  </label>
                </div>
                <div className="space-y-3">
                  {(form.news?.items || []).map((item, idx) => (
                    <div key={item.id || idx} className={ITEM_CARD}>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className={labelClass}>
                          Título
                          <input
                            className={inputClass}
                            value={item.title || ''}
                            disabled={saving}
                            onChange={(e) =>
                              updateNews((n) => {
                                const items = [...(n.items || [])]
                                items[idx] = { ...items[idx], title: e.target.value }
                                return { ...n, items }
                              })
                            }
                          />
                        </label>
                        <label className={labelClass}>
                          Fecha
                          <input
                            className={inputClass}
                            value={item.date || ''}
                            disabled={saving}
                            onChange={(e) =>
                              updateNews((n) => {
                                const items = [...(n.items || [])]
                                items[idx] = { ...items[idx], date: e.target.value }
                                return { ...n, items }
                              })
                            }
                          />
                        </label>
                        <label className={`${labelClass} sm:col-span-2`}>
                          Extracto
                          <textarea
                            className={textareaClass}
                            value={item.excerpt || ''}
                            disabled={saving}
                            onChange={(e) =>
                              updateNews((n) => {
                                const items = [...(n.items || [])]
                                items[idx] = { ...items[idx], excerpt: e.target.value }
                                return { ...n, items }
                              })
                            }
                          />
                        </label>
                        <label className={labelClass}>
                          Enlace
                          <input
                            className={inputClass}
                            value={item.link || ''}
                            disabled={saving}
                            onChange={(e) =>
                              updateNews((n) => {
                                const items = [...(n.items || [])]
                                items[idx] = { ...items[idx], link: e.target.value }
                                return { ...n, items }
                              })
                            }
                          />
                        </label>
                      </div>
                      <div className="mt-3">
                        <SingleImageUploadField
                          label="Imagen"
                          value={item.imageUrl || ''}
                          disabled={saving}
                          kind="cover"
                          compact
                          onChange={(url) =>
                            updateNews((n) => {
                              const items = [...(n.items || [])]
                              items[idx] = { ...items[idx], imageUrl: url }
                              return { ...n, items }
                            })
                          }
                          onNotify={setToast}
                        />
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          className={ACTION_DANGER}
                          disabled={saving}
                          onClick={() =>
                            updateNews((n) => ({
                              ...n,
                              items: (n.items || []).filter((_, i) => i !== idx),
                            }))
                          }
                        >
                          Quitar noticia
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={ACTION_ADD}
                    disabled={saving}
                    onClick={() =>
                      updateNews((n) => ({
                        ...n,
                        items: [
                          ...(n.items || []),
                          {
                            id: makeFdcItemId('news'),
                            title: '',
                            date: '',
                            excerpt: '',
                            link: '',
                            imageUrl: '',
                          },
                        ],
                      }))
                    }
                  >
                    + Agregar noticia
                  </button>
                </div>
              </div>
            </section>

            <section className={SECTION_CARD}>
              <SectionTitle title="Galería" description="Fotos en fila horizontal." />
              <div className="mt-4 grid gap-4">
                <label className={labelClass}>
                  Título
                  <input
                    className={inputClass}
                    value={form.gallery?.title || ''}
                    disabled={saving}
                    onChange={(e) => updateGallery((g) => ({ ...g, title: e.target.value }))}
                  />
                </label>
                <div className="space-y-3">
                  {(form.gallery?.items || []).map((item, idx) => (
                    <div key={item.id || idx} className={ITEM_CARD}>
                      <SingleImageUploadField
                        label="Imagen"
                        value={item.imageUrl || ''}
                        disabled={saving}
                        kind="gallery"
                        compact
                        onChange={(url) =>
                          updateGallery((g) => {
                            const items = [...(g.items || [])]
                            items[idx] = { ...items[idx], imageUrl: url }
                            return { ...g, items }
                          })
                        }
                        onNotify={setToast}
                      />
                      <label className={`${labelClass} mt-3`}>
                        Leyenda
                        <input
                          className={inputClass}
                          value={item.caption || ''}
                          disabled={saving}
                          onChange={(e) =>
                            updateGallery((g) => {
                              const items = [...(g.items || [])]
                              items[idx] = { ...items[idx], caption: e.target.value }
                              return { ...g, items }
                            })
                          }
                        />
                      </label>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          className={ACTION_DANGER}
                          disabled={saving}
                          onClick={() =>
                            updateGallery((g) => ({
                              ...g,
                              items: (g.items || []).filter((_, i) => i !== idx),
                            }))
                          }
                        >
                          Quitar foto
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={ACTION_ADD}
                    disabled={saving}
                    onClick={() =>
                      updateGallery((g) => ({
                        ...g,
                        items: [
                          ...(g.items || []),
                          { id: makeFdcItemId('gal'), imageUrl: '', caption: '' },
                        ],
                      }))
                    }
                  >
                    + Agregar foto
                  </button>
                </div>
              </div>
            </section>

            <section className={SECTION_CARD}>
              <SectionTitle title="Auspiciantes" />
              <div className="mt-4 grid gap-4">
                <label className={labelClass}>
                  Título
                  <input
                    className={inputClass}
                    value={form.sponsors?.title || ''}
                    disabled={saving}
                    onChange={(e) => updateSponsors((s) => ({ ...s, title: e.target.value }))}
                  />
                </label>
                <div className="space-y-3">
                  {(form.sponsors?.items || []).map((item, idx) => (
                    <div key={item.id || idx} className={ITEM_CARD}>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className={labelClass}>
                          Nombre
                          <input
                            className={inputClass}
                            value={item.name || ''}
                            disabled={saving}
                            onChange={(e) =>
                              updateSponsors((s) => {
                                const items = [...(s.items || [])]
                                items[idx] = { ...items[idx], name: e.target.value }
                                return { ...s, items }
                              })
                            }
                          />
                        </label>
                        <label className={labelClass}>
                          Sitio web
                          <input
                            className={inputClass}
                            value={item.url || ''}
                            disabled={saving}
                            placeholder="https://…"
                            onChange={(e) =>
                              updateSponsors((s) => {
                                const items = [...(s.items || [])]
                                items[idx] = { ...items[idx], url: e.target.value }
                                return { ...s, items }
                              })
                            }
                          />
                        </label>
                      </div>
                      <div className="mt-3">
                        <SingleImageUploadField
                          label="Logo"
                          value={item.logoUrl || ''}
                          disabled={saving}
                          kind="cover"
                          compact
                          onChange={(url) =>
                            updateSponsors((s) => {
                              const items = [...(s.items || [])]
                              items[idx] = { ...items[idx], logoUrl: url }
                              return { ...s, items }
                            })
                          }
                          onNotify={setToast}
                        />
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          className={ACTION_DANGER}
                          disabled={saving}
                          onClick={() =>
                            updateSponsors((s) => ({
                              ...s,
                              items: (s.items || []).filter((_, i) => i !== idx),
                            }))
                          }
                        >
                          Quitar auspiciante
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={ACTION_ADD}
                    disabled={saving}
                    onClick={() =>
                      updateSponsors((s) => ({
                        ...s,
                        items: [
                          ...(s.items || []),
                          { id: makeFdcItemId('spo'), name: '', logoUrl: '', url: '' },
                        ],
                      }))
                    }
                  >
                    + Agregar auspiciante
                  </button>
                </div>
              </div>
            </section>

            <section className={SECTION_CARD}>
              <SectionTitle title="Información útil" />
              <div className="mt-4 grid gap-4">
                <label className={labelClass}>
                  Título
                  <input
                    className={inputClass}
                    value={form.usefulInfo?.title || ''}
                    disabled={saving}
                    onChange={(e) => updateUsefulInfo((u) => ({ ...u, title: e.target.value }))}
                  />
                </label>
                <div className="space-y-3">
                  {(form.usefulInfo?.items || []).map((item, idx) => (
                    <div key={item.id || idx} className={ITEM_CARD}>
                      <label className={labelClass}>
                        Título
                        <input
                          className={inputClass}
                          value={item.title || ''}
                          disabled={saving}
                          onChange={(e) =>
                            updateUsefulInfo((u) => {
                              const items = [...(u.items || [])]
                              items[idx] = { ...items[idx], title: e.target.value }
                              return { ...u, items }
                            })
                          }
                        />
                      </label>
                      <label className={`${labelClass} mt-3`}>
                        Texto
                        <textarea
                          className={textareaClass}
                          value={item.body || ''}
                          disabled={saving}
                          onChange={(e) =>
                            updateUsefulInfo((u) => {
                              const items = [...(u.items || [])]
                              items[idx] = { ...items[idx], body: e.target.value }
                              return { ...u, items }
                            })
                          }
                        />
                      </label>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          className={ACTION_DANGER}
                          disabled={saving}
                          onClick={() =>
                            updateUsefulInfo((u) => ({
                              ...u,
                              items: (u.items || []).filter((_, i) => i !== idx),
                            }))
                          }
                        >
                          Quitar ítem
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={ACTION_ADD}
                    disabled={saving}
                    onClick={() =>
                      updateUsefulInfo((u) => ({
                        ...u,
                        items: [
                          ...(u.items || []),
                          { id: makeFdcItemId('info'), title: '', body: '' },
                        ],
                      }))
                    }
                  >
                    + Agregar ítem
                  </button>
                </div>
              </div>
            </section>

            <section className={SECTION_CARD}>
              <SectionTitle title="Preinscripción de puestos" />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Abre el
                  <input
                    type="date"
                    className={inputClass}
                    value={form.formOpenFrom || ''}
                    onChange={(e) => setForm((p) => ({ ...p, formOpenFrom: e.target.value }))}
                    disabled={saving}
                  />
                </label>
                <label className={labelClass}>
                  Cierra el
                  <input
                    type="date"
                    className={inputClass}
                    value={form.formOpenUntil || ''}
                    onChange={(e) => setForm((p) => ({ ...p, formOpenUntil: e.target.value }))}
                    disabled={saving}
                  />
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  Aviso del formulario
                  <textarea
                    className={textareaClass}
                    value={form.formNotice || ''}
                    onChange={(e) => setForm((p) => ({ ...p, formNotice: e.target.value }))}
                    disabled={saving}
                  />
                </label>
                <label className={labelClass}>
                  Título del bloque
                  <input
                    className={inputClass}
                    value={form.ctaTitle || ''}
                    onChange={(e) => setForm((p) => ({ ...p, ctaTitle: e.target.value }))}
                    disabled={saving}
                  />
                </label>
                <label className={labelClass}>
                  Texto del bloque
                  <textarea
                    className={textareaClass}
                    value={form.ctaBody || ''}
                    onChange={(e) => setForm((p) => ({ ...p, ctaBody: e.target.value }))}
                    disabled={saving}
                  />
                </label>
              </div>
            </section>

            <div className="sticky bottom-3 z-20 flex justify-end rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
              <button
                type="button"
                className={ACTION_PRIMARY}
                disabled={saving || !apiAvailable}
                onClick={() => void handleSubmit()}
              >
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        )}
      </AdminPageShell>
    </>
  )
}
