import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { PageCoverModal } from '../../components/admin/PageCoverModal.jsx'
import { SingleImageUploadField } from '../../components/admin/SingleImageUploadField.jsx'
import { FdcFestivalHero } from '../../components/fdc/FdcFestivalHero.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { inputClass, labelClass, textareaClass } from '../../components/ui/formStyles.js'
import {
  DEFAULT_FDC_CONTENT,
  FDC_SCHEDULE_MAX_IMAGES,
  applyHeroCoverToFdcContent,
  ensureFdcFormRubros,
  fdcContentToHeroCover,
  isFdcOtherRubro,
  makeFdcItemId,
  mergeFdcContent,
} from '../../data/fdcContent.js'
import { normalizeHeroToggle } from '../../data/servicesPageContent.js'
import { useContentEditorConcurrencyConflict } from '../../hooks/useContentEditorConcurrencyConflict.jsx'
import { fetchFdcContentAdmin, updateFdcContent } from '../../services/fdcService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { ROUTES } from '../../utils/constants.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'

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
    sectionNav: (merged.sectionNav || [])
      .map((n) => ({ ...n }))
      .filter((n) => String(n?.href || '').trim().toLowerCase() !== '#info-util'),
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
      overlayOpacity: normalizeOverlay(merged.tickets?.overlayOpacity, 55),
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
    usefulInfo: { title: '', items: [] },
    overlayOpacity: normalizeOverlay(merged.overlayOpacity, 65),
    showHeroBadge: normalizeHeroToggle(merged.showHeroBadge, true),
    showHeroTitle: normalizeHeroToggle(merged.showHeroTitle, true),
    showHeroSubtitle: normalizeHeroToggle(merged.showHeroSubtitle, true),
    showSearch: normalizeHeroToggle(merged.showSearch, false),
    showPrimaryButton: normalizeHeroToggle(merged.showPrimaryButton, true),
    showSecondaryButton: normalizeHeroToggle(merged.showSecondaryButton, true),
    formRubros: ensureFdcFormRubros(merged.formRubros),
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

const TABS = [
  { id: 'portada', label: 'Portada' },
  { id: 'navegacion', label: 'Navegación' },
  { id: 'cartelera', label: 'Cartelera' },
  { id: 'cronograma', label: 'Cronograma' },
  { id: 'entradas', label: 'Entradas' },
  { id: 'noticias', label: 'Noticias' },
  { id: 'galeria', label: 'Galería' },
  { id: 'auspiciantes', label: 'Auspiciantes' },
  { id: 'preinscripcion', label: 'Preinscripción' },
]

function ModalFooter({ onCancel, onApply, applyLabel = 'Aplicar', applyDisabled = false, saving = false }) {
  return (
    <div className="flex justify-end gap-2">
      <button type="button" className={ACTION_NEUTRAL} onClick={onCancel} disabled={saving}>
        Cancelar
      </button>
      <button type="button" className={ACTION_PRIMARY} onClick={onApply} disabled={applyDisabled || saving}>
        {applyLabel}
      </button>
    </div>
  )
}

function ThumbCell({ src, alt, className = 'h-12 w-12' }) {
  const resolved = src ? resolveMediaUrl(src) || src : ''
  return (
    <div
      className={`${className} shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100`}
    >
      {resolved ? (
        <img src={resolved} alt={alt || ''} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">Sin foto</div>
      )}
    </div>
  )
}

export function AdminFdc() {
  const [form, setForm] = useState(() => mapContentToForm(DEFAULT_FDC_CONTENT))
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('portada')
  const [heroCoverOpen, setHeroCoverOpen] = useState(false)
  const [heroCoverDraft, setHeroCoverDraft] = useState(() =>
    fdcContentToHeroCover(DEFAULT_FDC_CONTENT),
  )
  const [toast, setToast] = useState(null)
  const [artistModal, setArtistModal] = useState({ open: false, index: null, draft: null })
  const [dayModal, setDayModal] = useState({ open: false, index: null, draft: null })
  const [scheduleImageModal, setScheduleImageModal] = useState({ open: false, index: null, draft: null })
  const [newsModal, setNewsModal] = useState({ open: false, index: null, draft: null })
  const [galleryModal, setGalleryModal] = useState({ open: false, index: null, draft: null })
  const [sponsorModal, setSponsorModal] = useState({ open: false, index: null, draft: null })

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
      introTitle: '',
      introParagraphs: [],
      highlights: [],
      sectionNav: (form.sectionNav || [])
        .map((n) => ({
          id: String(n?.id || '').trim() || makeFdcItemId('nav'),
          label: String(n?.label || '').trim(),
          href: String(n?.href || '').trim(),
          icon: String(n?.icon || 'link').trim(),
        }))
        .filter((n) => (n.label || n.href) && String(n.href || '').toLowerCase() !== '#info-util'),
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
        overlayOpacity: normalizeOverlay(form.tickets?.overlayOpacity, 55),
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
      usefulInfo: { title: '', items: [] },
      formNotice: String(form.formNotice || ''),
      formRubros: ensureFdcFormRubros(form.formRubros),
      formEyebrow: String(form.formEyebrow || '').trim(),
      formHeading: String(form.formHeading || '').trim(),
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

  function openArtistModal(index = null) {
    const draft =
      index != null
        ? { ...(form.artists?.items || [])[index] }
        : { id: makeFdcItemId('art'), name: '', dateTag: '', photoUrl: '', sortOrder: (form.artists?.items || []).length }
    setArtistModal({ open: true, index, draft })
  }

  function applyArtistModal() {
    const name = String(artistModal.draft?.name || '').trim()
    if (!name) return
    updateArtists((a) => {
      const items = [...(a.items || [])]
      const entry = { ...artistModal.draft, name }
      if (artistModal.index == null) items.push(entry)
      else items[artistModal.index] = entry
      return { ...a, items }
    })
    setArtistModal({ open: false, index: null, draft: null })
  }

  function openDayModal(index = null) {
    const draft =
      index != null
        ? cloneContent((form.schedule?.days || [])[index])
        : { id: makeFdcItemId('day'), label: '', items: [] }
    setDayModal({ open: true, index, draft })
  }

  function applyDayModal() {
    updateSchedule((s) => {
      const days = [...(s.days || [])]
      const entry = {
        ...dayModal.draft,
        label: String(dayModal.draft?.label || '').trim(),
        items: (dayModal.draft?.items || []).map((it) => ({ ...it })),
      }
      if (dayModal.index == null) days.push(entry)
      else days[dayModal.index] = entry
      return { ...s, days }
    })
    setDayModal({ open: false, index: null, draft: null })
  }

  function openScheduleImageModal(index = null) {
    const draft =
      index != null
        ? { ...(form.schedule?.images || [])[index] }
        : { id: makeFdcItemId('schimg'), imageUrl: '', caption: '' }
    setScheduleImageModal({ open: true, index, draft })
  }

  function applyScheduleImageModal() {
    const imageUrl = String(scheduleImageModal.draft?.imageUrl || '').trim()
    if (!imageUrl) return
    updateSchedule((s) => {
      const images = [...(s.images || [])]
      const entry = { ...scheduleImageModal.draft, imageUrl }
      if (scheduleImageModal.index == null) images.push(entry)
      else images[scheduleImageModal.index] = entry
      return { ...s, images: images.slice(0, FDC_SCHEDULE_MAX_IMAGES) }
    })
    setScheduleImageModal({ open: false, index: null, draft: null })
  }

  function openNewsModal(index = null) {
    const draft =
      index != null
        ? { ...(form.news?.items || [])[index] }
        : { id: makeFdcItemId('news'), title: '', date: '', excerpt: '', link: '', imageUrl: '' }
    setNewsModal({ open: true, index, draft })
  }

  function applyNewsModal() {
    const title = String(newsModal.draft?.title || '').trim()
    if (!title) return
    updateNews((n) => {
      const items = [...(n.items || [])]
      const entry = { ...newsModal.draft, title }
      if (newsModal.index == null) items.push(entry)
      else items[newsModal.index] = entry
      return { ...n, items }
    })
    setNewsModal({ open: false, index: null, draft: null })
  }

  function openGalleryModal(index = null) {
    const draft =
      index != null
        ? { ...(form.gallery?.items || [])[index] }
        : { id: makeFdcItemId('gal'), imageUrl: '', caption: '' }
    setGalleryModal({ open: true, index, draft })
  }

  function applyGalleryModal() {
    const imageUrl = String(galleryModal.draft?.imageUrl || '').trim()
    if (!imageUrl) return
    updateGallery((g) => {
      const items = [...(g.items || [])]
      const entry = { ...galleryModal.draft, imageUrl }
      if (galleryModal.index == null) items.push(entry)
      else items[galleryModal.index] = entry
      return { ...g, items }
    })
    setGalleryModal({ open: false, index: null, draft: null })
  }

  function openSponsorModal(index = null) {
    const draft =
      index != null
        ? { ...(form.sponsors?.items || [])[index] }
        : { id: makeFdcItemId('spo'), name: '', logoUrl: '', url: '' }
    setSponsorModal({ open: true, index, draft })
  }

  function applySponsorModal() {
    const name = String(sponsorModal.draft?.name || '').trim()
    const logoUrl = String(sponsorModal.draft?.logoUrl || '').trim()
    if (!name && !logoUrl) return
    updateSponsors((s) => {
      const items = [...(s.items || [])]
      const entry = { ...sponsorModal.draft }
      if (sponsorModal.index == null) items.push(entry)
      else items[sponsorModal.index] = entry
      return { ...s, items }
    })
    setSponsorModal({ open: false, index: null, draft: null })
  }

  const scheduleImages = form.schedule?.images || []
  const scheduleDays = form.schedule?.days || []
  const artistItems = form.artists?.items || []
  const newsItems = form.news?.items || []
  const galleryItems = form.gallery?.items || []
  const sponsorItems = form.sponsors?.items || []

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

      {/* Artist modal */}
      <Modal
        open={artistModal.open}
        onClose={() => setArtistModal({ open: false, index: null, draft: null })}
        title={artistModal.index == null ? 'Agregar artista' : 'Editar artista'}
        size="default"
        footer={
          <ModalFooter
            saving={saving}
            applyDisabled={!String(artistModal.draft?.name || '').trim()}
            onCancel={() => setArtistModal({ open: false, index: null, draft: null })}
            onApply={applyArtistModal}
          />
        }
      >
        {artistModal.draft ? (
          <div className="grid gap-4">
            <label className={labelClass}>
              Nombre
              <input
                className={inputClass}
                value={artistModal.draft.name || ''}
                disabled={saving}
                onChange={(e) =>
                  setArtistModal((m) => ({ ...m, draft: { ...m.draft, name: e.target.value } }))
                }
              />
            </label>
            <label className={labelClass}>
              Badge de fecha
              <input
                className={inputClass}
                value={artistModal.draft.dateTag || ''}
                disabled={saving}
                placeholder="JUE 9"
                onChange={(e) =>
                  setArtistModal((m) => ({ ...m, draft: { ...m.draft, dateTag: e.target.value } }))
                }
              />
              <span className="mt-1 text-xs font-normal text-slate-500">
                Formato sugerido: día + número (ej. JUE 9, VIE 10).
              </span>
            </label>
            <SingleImageUploadField
              label="Foto del artista"
              value={artistModal.draft.photoUrl || ''}
              disabled={saving}
              kind="cover"
              onChange={(url) =>
                setArtistModal((m) => ({ ...m, draft: { ...m.draft, photoUrl: url } }))
              }
              onNotify={setToast}
            />
          </div>
        ) : null}
      </Modal>

      {/* Day modal */}
      <Modal
        open={dayModal.open}
        onClose={() => setDayModal({ open: false, index: null, draft: null })}
        title={dayModal.index == null ? 'Agregar día' : 'Editar día'}
        size="wide"
        footer={
          <ModalFooter
            saving={saving}
            onCancel={() => setDayModal({ open: false, index: null, draft: null })}
            onApply={applyDayModal}
          />
        }
      >
        {dayModal.draft ? (
          <div className="grid gap-4">
            <label className={labelClass}>
              Etiqueta del día
              <input
                className={inputClass}
                value={dayModal.draft.label || ''}
                disabled={saving}
                placeholder="Jueves 9 Jul"
                onChange={(e) =>
                  setDayModal((m) => ({ ...m, draft: { ...m.draft, label: e.target.value } }))
                }
              />
            </label>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Actividades</p>
              <div className="space-y-2">
                {(dayModal.draft.items || []).map((it, itemIdx) => (
                  <div
                    key={it.id || itemIdx}
                    className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:grid-cols-[6rem_1fr_auto]"
                  >
                    <label className={labelClass}>
                      Hora
                      <input
                        className={inputClass}
                        value={it.time || ''}
                        disabled={saving}
                        placeholder="18:00"
                        onChange={(e) =>
                          setDayModal((m) => {
                            const items = [...(m.draft.items || [])]
                            items[itemIdx] = { ...items[itemIdx], time: e.target.value }
                            return { ...m, draft: { ...m.draft, items } }
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
                          setDayModal((m) => {
                            const items = [...(m.draft.items || [])]
                            items[itemIdx] = { ...items[itemIdx], text: e.target.value }
                            return { ...m, draft: { ...m.draft, items } }
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
                          setDayModal((m) => ({
                            ...m,
                            draft: {
                              ...m.draft,
                              items: (m.draft.items || []).filter((_, i) => i !== itemIdx),
                            },
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
                    setDayModal((m) => ({
                      ...m,
                      draft: {
                        ...m.draft,
                        items: [
                          ...(m.draft.items || []),
                          { id: makeFdcItemId('sch'), time: '', text: '' },
                        ],
                      },
                    }))
                  }
                >
                  + Agregar actividad
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Schedule image modal */}
      <Modal
        open={scheduleImageModal.open}
        onClose={() => setScheduleImageModal({ open: false, index: null, draft: null })}
        title={scheduleImageModal.index == null ? 'Agregar foto al carrusel' : 'Editar foto del carrusel'}
        size="default"
        footer={
          <ModalFooter
            saving={saving}
            applyDisabled={!String(scheduleImageModal.draft?.imageUrl || '').trim()}
            onCancel={() => setScheduleImageModal({ open: false, index: null, draft: null })}
            onApply={applyScheduleImageModal}
          />
        }
      >
        {scheduleImageModal.draft ? (
          <div className="grid gap-4">
            <SingleImageUploadField
              label="Imagen"
              value={scheduleImageModal.draft.imageUrl || ''}
              disabled={saving}
              kind="cover"
              onChange={(url) =>
                setScheduleImageModal((m) => ({ ...m, draft: { ...m.draft, imageUrl: url } }))
              }
              onNotify={setToast}
            />
            <label className={labelClass}>
              Epígrafe (opcional)
              <input
                className={inputClass}
                value={scheduleImageModal.draft.caption || ''}
                disabled={saving}
                onChange={(e) =>
                  setScheduleImageModal((m) => ({
                    ...m,
                    draft: { ...m.draft, caption: e.target.value },
                  }))
                }
              />
            </label>
          </div>
        ) : null}
      </Modal>

      {/* News modal */}
      <Modal
        open={newsModal.open}
        onClose={() => setNewsModal({ open: false, index: null, draft: null })}
        title={newsModal.index == null ? 'Agregar noticia' : 'Editar noticia'}
        size="wide"
        footer={
          <ModalFooter
            saving={saving}
            applyDisabled={!String(newsModal.draft?.title || '').trim()}
            onCancel={() => setNewsModal({ open: false, index: null, draft: null })}
            onApply={applyNewsModal}
          />
        }
      >
        {newsModal.draft ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Título
              <input
                className={inputClass}
                value={newsModal.draft.title || ''}
                disabled={saving}
                onChange={(e) =>
                  setNewsModal((m) => ({ ...m, draft: { ...m.draft, title: e.target.value } }))
                }
              />
            </label>
            <label className={labelClass}>
              Fecha (badge)
              <input
                className={inputClass}
                value={newsModal.draft.date || ''}
                disabled={saving}
                placeholder="15 MAY"
                onChange={(e) =>
                  setNewsModal((m) => ({ ...m, draft: { ...m.draft, date: e.target.value } }))
                }
              />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Enlace «Leer más»
              <input
                className={inputClass}
                value={newsModal.draft.link || ''}
                disabled={saving}
                placeholder="/noticias/... o URL"
                onChange={(e) =>
                  setNewsModal((m) => ({ ...m, draft: { ...m.draft, link: e.target.value } }))
                }
              />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Extracto (opcional)
              <textarea
                className={textareaClass}
                value={newsModal.draft.excerpt || ''}
                disabled={saving}
                onChange={(e) =>
                  setNewsModal((m) => ({ ...m, draft: { ...m.draft, excerpt: e.target.value } }))
                }
              />
            </label>
            <div className="sm:col-span-2">
              <SingleImageUploadField
                label="Imagen"
                value={newsModal.draft.imageUrl || ''}
                disabled={saving}
                kind="cover"
                onChange={(url) =>
                  setNewsModal((m) => ({ ...m, draft: { ...m.draft, imageUrl: url } }))
                }
                onNotify={setToast}
              />
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Gallery modal */}
      <Modal
        open={galleryModal.open}
        onClose={() => setGalleryModal({ open: false, index: null, draft: null })}
        title={galleryModal.index == null ? 'Agregar foto' : 'Editar foto'}
        size="default"
        footer={
          <ModalFooter
            saving={saving}
            applyDisabled={!String(galleryModal.draft?.imageUrl || '').trim()}
            onCancel={() => setGalleryModal({ open: false, index: null, draft: null })}
            onApply={applyGalleryModal}
          />
        }
      >
        {galleryModal.draft ? (
          <div className="grid gap-4">
            <SingleImageUploadField
              label="Imagen"
              value={galleryModal.draft.imageUrl || ''}
              disabled={saving}
              kind="gallery"
              onChange={(url) =>
                setGalleryModal((m) => ({ ...m, draft: { ...m.draft, imageUrl: url } }))
              }
              onNotify={setToast}
            />
            <label className={labelClass}>
              Leyenda
              <input
                className={inputClass}
                value={galleryModal.draft.caption || ''}
                disabled={saving}
                onChange={(e) =>
                  setGalleryModal((m) => ({ ...m, draft: { ...m.draft, caption: e.target.value } }))
                }
              />
            </label>
          </div>
        ) : null}
      </Modal>

      {/* Sponsor modal */}
      <Modal
        open={sponsorModal.open}
        onClose={() => setSponsorModal({ open: false, index: null, draft: null })}
        title={sponsorModal.index == null ? 'Agregar auspiciante' : 'Editar auspiciante'}
        size="default"
        footer={
          <ModalFooter
            saving={saving}
            applyDisabled={
              !String(sponsorModal.draft?.name || '').trim() &&
              !String(sponsorModal.draft?.logoUrl || '').trim()
            }
            onCancel={() => setSponsorModal({ open: false, index: null, draft: null })}
            onApply={applySponsorModal}
          />
        }
      >
        {sponsorModal.draft ? (
          <div className="grid gap-4">
            <label className={labelClass}>
              Nombre
              <input
                className={inputClass}
                value={sponsorModal.draft.name || ''}
                disabled={saving}
                onChange={(e) =>
                  setSponsorModal((m) => ({ ...m, draft: { ...m.draft, name: e.target.value } }))
                }
              />
            </label>
            <label className={labelClass}>
              Sitio web
              <input
                className={inputClass}
                value={sponsorModal.draft.url || ''}
                disabled={saving}
                placeholder="https://…"
                onChange={(e) =>
                  setSponsorModal((m) => ({ ...m, draft: { ...m.draft, url: e.target.value } }))
                }
              />
            </label>
            <SingleImageUploadField
              label="Logo"
              value={sponsorModal.draft.logoUrl || ''}
              disabled={saving}
              kind="cover"
              onChange={(url) =>
                setSponsorModal((m) => ({ ...m, draft: { ...m.draft, logoUrl: url } }))
              }
              onNotify={setToast}
            />
          </div>
        ) : null}
      </Modal>

      <AdminPageShell
        showBackLink={false}
        maxWidthClass="max-w-7xl"
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
          <div className="space-y-4">
            {/* Horizontal tabs */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
              <div className="flex min-w-max gap-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                      activeTab === tab.id
                        ? 'bg-sky-700 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Portada */}
            {activeTab === 'portada' ? (
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
            ) : null}

            {/* Navegación */}
            {activeTab === 'navegacion' ? (
              <section className={SECTION_CARD}>
                <h2 className="text-lg font-bold text-slate-900">Navegación por secciones</h2>
                <p className="mt-1 text-sm text-slate-600">Enlaces rápidos bajo la portada.</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {(form.sectionNav || []).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className={`${ITEM_CARD} grid gap-2 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end`}
                    >
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
                        Enlace
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
                      <div className="flex items-end gap-2">
                        <label className={`${labelClass} min-w-[5.5rem] flex-1`}>
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
                </div>
                <button
                  type="button"
                  className={`${ACTION_ADD} mt-3`}
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
                  + Agregar
                </button>
              </section>
            ) : null}

            {/* Cartelera */}
            {activeTab === 'cartelera' ? (
              <section className={SECTION_CARD}>
                <h2 className="text-lg font-bold text-slate-900">Cartelera artística</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <label className={labelClass}>
                    Título de sección
                    <input
                      className={inputClass}
                      value={form.artists?.title || ''}
                      disabled={saving}
                      onChange={(e) => updateArtists((a) => ({ ...a, title: e.target.value }))}
                      placeholder="Cartelera artística"
                    />
                  </label>
                  <label className={labelClass}>
                    Texto del botón
                    <input
                      className={inputClass}
                      value={form.artists?.ctaLabel || ''}
                      disabled={saving}
                      onChange={(e) => updateArtists((a) => ({ ...a, ctaLabel: e.target.value }))}
                      placeholder="Ver cartelera completa"
                    />
                  </label>
                  <label className={labelClass}>
                    Enlace del botón
                    <input
                      className={inputClass}
                      value={form.artists?.ctaHref || ''}
                      disabled={saving}
                      onChange={(e) => updateArtists((a) => ({ ...a, ctaHref: e.target.value }))}
                      placeholder="#cronograma o URL"
                    />
                  </label>
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Foto</th>
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {artistItems.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                            Todavía no hay artistas.
                          </td>
                        </tr>
                      ) : (
                        artistItems.map((artist, idx) => (
                          <tr key={artist.id || idx} className="hover:bg-slate-50/80">
                            <td className="px-4 py-3">
                              <ThumbCell src={artist.photoUrl} alt={artist.name} />
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900">
                              {artist.name || '—'}
                            </td>
                            <td className="px-4 py-3 text-slate-600">{artist.dateTag || '—'}</td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  className={ACTION_NEUTRAL}
                                  disabled={saving}
                                  onClick={() => openArtistModal(idx)}
                                >
                                  Editar
                                </button>
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
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  className={`${ACTION_ADD} mt-3`}
                  disabled={saving}
                  onClick={() => openArtistModal(null)}
                >
                  + Agregar artista
                </button>
              </section>
            ) : null}

            {/* Cronograma */}
            {activeTab === 'cronograma' ? (
              <section className={SECTION_CARD}>
                <h2 className="text-lg font-bold text-slate-900">Cronograma</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
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
                    Enlace del botón
                    <input
                      className={inputClass}
                      value={form.schedule?.ctaHref || ''}
                      disabled={saving}
                      onChange={(e) => updateSchedule((s) => ({ ...s, ctaHref: e.target.value }))}
                      placeholder="Vacío = expandir días"
                    />
                  </label>
                </div>

                <div className="mt-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-700">
                      Carrusel de fotos{' '}
                      <span className="font-normal text-slate-500">
                        ({scheduleImages.length}/{FDC_SCHEDULE_MAX_IMAGES})
                      </span>
                    </p>
                    <button
                      type="button"
                      className={ACTION_ADD}
                      disabled={saving || scheduleImages.length >= FDC_SCHEDULE_MAX_IMAGES}
                      onClick={() => openScheduleImageModal(null)}
                    >
                      Agregar foto
                    </button>
                  </div>
                  {scheduleImages.length === 0 ? (
                    <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      Todavía no hay fotos. Agregá hasta {FDC_SCHEDULE_MAX_IMAGES} para el carrusel.
                    </p>
                  ) : (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                      {scheduleImages.map((img, imgIdx) => (
                        <div key={img.id || imgIdx} className="group relative shrink-0">
                          <button
                            type="button"
                            className="block overflow-hidden rounded-xl border border-slate-200 transition hover:border-sky-400 hover:ring-2 hover:ring-sky-200"
                            disabled={saving}
                            onClick={() => openScheduleImageModal(imgIdx)}
                          >
                            <ThumbCell
                              src={img.imageUrl}
                              alt={img.caption || `Foto ${imgIdx + 1}`}
                              className="h-20 w-28"
                            />
                          </button>
                          <button
                            type="button"
                            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100"
                            disabled={saving}
                            aria-label="Quitar foto"
                            onClick={() =>
                              updateSchedule((s) => ({
                                ...s,
                                images: (s.images || []).filter((_, i) => i !== imgIdx),
                              }))
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-700">Días del cronograma</p>
                    <button
                      type="button"
                      className={ACTION_ADD}
                      disabled={saving}
                      onClick={() => openDayModal(null)}
                    >
                      Agregar día
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {scheduleDays.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                        Todavía no hay días configurados.
                      </p>
                    ) : (
                      scheduleDays.map((day, dayIdx) => (
                        <div
                          key={day.id || dayIdx}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3"
                        >
                          <button
                            type="button"
                            className="min-w-0 flex-1 text-left"
                            disabled={saving}
                            onClick={() => openDayModal(dayIdx)}
                          >
                            <p className="font-medium text-slate-900">
                              {day.label || `Día ${dayIdx + 1}`}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(day.items || []).length}{' '}
                              {(day.items || []).length === 1 ? 'actividad' : 'actividades'}
                            </p>
                          </button>
                          <div className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              className={ACTION_NEUTRAL}
                              disabled={saving}
                              onClick={() => openDayModal(dayIdx)}
                            >
                              Editar
                            </button>
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
                              Quitar
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>
            ) : null}

            {/* Entradas */}
            {activeTab === 'entradas' ? (
              <section className={SECTION_CARD}>
                <h2 className="text-lg font-bold text-slate-900">Entradas</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    Título
                    <input
                      className={inputClass}
                      value={form.tickets?.title || ''}
                      disabled={saving}
                      onChange={(e) => updateTickets((t) => ({ ...t, title: e.target.value }))}
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>
                      Texto
                      <textarea
                        className={textareaClass}
                        value={form.tickets?.body || ''}
                        disabled={saving}
                        onChange={(e) => updateTickets((t) => ({ ...t, body: e.target.value }))}
                      />
                    </label>
                  </div>
                  <div className="sm:col-span-2">
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
                  </div>
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
                  <div className="sm:col-span-2">
                    <SingleImageUploadField
                      label="Imagen de fondo"
                      value={form.tickets?.imageUrl || ''}
                      disabled={saving}
                      kind="cover"
                      onChange={(url) => updateTickets((t) => ({ ...t, imageUrl: url }))}
                      onNotify={setToast}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>
                      Opacidad del overlay: {normalizeOverlay(form.tickets?.overlayOpacity, 55)}%
                      <input
                        type="range"
                        min={0}
                        max={90}
                        step={1}
                        className="mt-2 w-full accent-sky-700"
                        value={normalizeOverlay(form.tickets?.overlayOpacity, 55)}
                        disabled={saving || !String(form.tickets?.imageUrl || '').trim()}
                        onChange={(e) =>
                          updateTickets((t) => ({
                            ...t,
                            overlayOpacity: normalizeOverlay(e.target.value, 55),
                          }))
                        }
                      />
                      <span className="mt-1 block text-xs font-normal text-slate-500">
                        Más alto = fondo más oscuro y texto más legible.
                      </span>
                    </label>
                  </div>
                </div>
              </section>
            ) : null}

            {/* Noticias */}
            {activeTab === 'noticias' ? (
              <section className={SECTION_CARD}>
                <h2 className="text-lg font-bold text-slate-900">Noticias del festival</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <label className={labelClass}>
                    Título sección
                    <input
                      className={inputClass}
                      value={form.news?.title || ''}
                      disabled={saving}
                      onChange={(e) => updateNews((n) => ({ ...n, title: e.target.value }))}
                      placeholder="Noticias del festival"
                    />
                  </label>
                  <label className={labelClass}>
                    Texto del botón
                    <input
                      className={inputClass}
                      value={form.news?.ctaLabel || ''}
                      disabled={saving}
                      onChange={(e) => updateNews((n) => ({ ...n, ctaLabel: e.target.value }))}
                      placeholder="Ver todas las noticias"
                    />
                  </label>
                  <label className={labelClass}>
                    Enlace del botón
                    <input
                      className={inputClass}
                      value={form.news?.ctaHref || ''}
                      disabled={saving}
                      onChange={(e) => updateNews((n) => ({ ...n, ctaHref: e.target.value }))}
                      placeholder="/noticias"
                    />
                  </label>
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Imagen</th>
                        <th className="px-4 py-3">Título</th>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {newsItems.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                            Todavía no hay noticias.
                          </td>
                        </tr>
                      ) : (
                        newsItems.map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-slate-50/80">
                            <td className="px-4 py-3">
                              <ThumbCell src={item.imageUrl} alt={item.title} />
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900">
                              {item.title || '—'}
                            </td>
                            <td className="px-4 py-3 text-slate-600">{item.date || '—'}</td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  className={ACTION_NEUTRAL}
                                  disabled={saving}
                                  onClick={() => openNewsModal(idx)}
                                >
                                  Editar
                                </button>
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
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  className={`${ACTION_ADD} mt-3`}
                  disabled={saving}
                  onClick={() => openNewsModal(null)}
                >
                  + Agregar noticia
                </button>
              </section>
            ) : null}

            {/* Galería */}
            {activeTab === 'galeria' ? (
              <section className={SECTION_CARD}>
                <h2 className="text-lg font-bold text-slate-900">Galería</h2>
                <label className={`${labelClass} mt-4 block max-w-md`}>
                  Título
                  <input
                    className={inputClass}
                    value={form.gallery?.title || ''}
                    disabled={saving}
                    onChange={(e) => updateGallery((g) => ({ ...g, title: e.target.value }))}
                  />
                </label>

                {galleryItems.length === 0 ? (
                  <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    Todavía no hay fotos en la galería.
                  </p>
                ) : (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {galleryItems.map((item, idx) => (
                      <div key={item.id || idx} className="group relative">
                        <button
                          type="button"
                          className="block w-full overflow-hidden rounded-xl border border-slate-200 transition hover:border-sky-400 hover:ring-2 hover:ring-sky-200"
                          disabled={saving}
                          onClick={() => openGalleryModal(idx)}
                        >
                          <ThumbCell
                            src={item.imageUrl}
                            alt={item.caption || `Foto ${idx + 1}`}
                            className="aspect-square h-auto w-full"
                          />
                          {item.caption ? (
                            <p className="truncate px-2 py-1.5 text-xs text-slate-600">
                              {item.caption}
                            </p>
                          ) : null}
                        </button>
                        <button
                          type="button"
                          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100"
                          disabled={saving}
                          aria-label="Quitar foto"
                          onClick={() =>
                            updateGallery((g) => ({
                              ...g,
                              items: (g.items || []).filter((_, i) => i !== idx),
                            }))
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  className={`${ACTION_ADD} mt-4`}
                  disabled={saving}
                  onClick={() => openGalleryModal(null)}
                >
                  + Agregar foto
                </button>
              </section>
            ) : null}

            {/* Auspiciantes */}
            {activeTab === 'auspiciantes' ? (
              <section className={SECTION_CARD}>
                <h2 className="text-lg font-bold text-slate-900">Auspiciantes</h2>
                <label className={`${labelClass} mt-4 block max-w-md`}>
                  Título
                  <input
                    className={inputClass}
                    value={form.sponsors?.title || ''}
                    disabled={saving}
                    onChange={(e) => updateSponsors((s) => ({ ...s, title: e.target.value }))}
                  />
                </label>

                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Logo</th>
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3">Sitio web</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sponsorItems.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                            Todavía no hay auspiciantes.
                          </td>
                        </tr>
                      ) : (
                        sponsorItems.map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-slate-50/80">
                            <td className="px-4 py-3">
                              <ThumbCell src={item.logoUrl} alt={item.name} />
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900">
                              {item.name || '—'}
                            </td>
                            <td className="max-w-[12rem] truncate px-4 py-3 text-slate-600">
                              {item.url || '—'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  className={ACTION_NEUTRAL}
                                  disabled={saving}
                                  onClick={() => openSponsorModal(idx)}
                                >
                                  Editar
                                </button>
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
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  className={`${ACTION_ADD} mt-3`}
                  disabled={saving}
                  onClick={() => openSponsorModal(null)}
                >
                  + Agregar auspiciante
                </button>
              </section>
            ) : null}

            {/* Preinscripción */}
            {activeTab === 'preinscripcion' ? (
              <section className={SECTION_CARD}>
                <h2 className="text-lg font-bold text-slate-900">Preinscripción de puestos</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Ventana, textos del formulario y opciones del select de rubro.
                </p>
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
                  <label className={labelClass}>
                    Etiqueta superior del formulario
                    <input
                      className={inputClass}
                      value={form.formEyebrow || ''}
                      onChange={(e) => setForm((p) => ({ ...p, formEyebrow: e.target.value }))}
                      disabled={saving}
                      placeholder="Preinscripción 2026"
                    />
                  </label>
                  <label className={labelClass}>
                    Título del formulario
                    <input
                      className={inputClass}
                      value={form.formHeading || ''}
                      onChange={(e) => setForm((p) => ({ ...p, formHeading: e.target.value }))}
                      disabled={saving}
                      placeholder="Completá tus datos"
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
                    Título del bloque (CTA)
                    <input
                      className={inputClass}
                      value={form.ctaTitle || ''}
                      onChange={(e) => setForm((p) => ({ ...p, ctaTitle: e.target.value }))}
                      disabled={saving}
                    />
                  </label>
                  <label className={labelClass}>
                    Texto del bloque (CTA)
                    <textarea
                      className={textareaClass}
                      value={form.ctaBody || ''}
                      onChange={(e) => setForm((p) => ({ ...p, ctaBody: e.target.value }))}
                      disabled={saving}
                    />
                  </label>
                </div>

                <div className="mt-8 border-t border-slate-200 pt-6">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Opciones de rubro</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Aparecen en el select del formulario público. La opción «Otro» es fija: permite
                        ingresar un rubro libre y no se puede quitar.
                      </p>
                    </div>
                    <button
                      type="button"
                      className={ACTION_ADD}
                      disabled={saving}
                      onClick={() =>
                        setForm((p) => {
                          const current = ensureFdcFormRubros(p.formRubros)
                          const withoutOtro = current.filter((r) => !isFdcOtherRubro(r))
                          return {
                            ...p,
                            formRubros: ensureFdcFormRubros([...withoutOtro, 'Nuevo rubro']),
                          }
                        })
                      }
                    >
                      + Agregar rubro
                    </button>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {(form.formRubros || []).map((rubro, idx) => {
                      const isOtro = isFdcOtherRubro(rubro)
                      return (
                        <li
                          key={`rubro-${idx}`}
                          className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 sm:flex-nowrap"
                        >
                          <span className="w-7 shrink-0 text-center text-xs font-semibold text-slate-400">
                            {idx + 1}
                          </span>
                          <input
                            className={`${inputClass} min-w-0 flex-1`}
                            value={rubro}
                            disabled={saving || isOtro}
                            readOnly={isOtro}
                            placeholder="Nombre del rubro"
                            onChange={(e) =>
                              setForm((p) => {
                                const next = [...(p.formRubros || [])]
                                next[idx] = e.target.value
                                return { ...p, formRubros: ensureFdcFormRubros(next) }
                              })
                            }
                          />
                          {isOtro ? (
                            <span className="shrink-0 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-900">
                              Fijo
                            </span>
                          ) : (
                            <div className="flex shrink-0 gap-1.5">
                              <button
                                type="button"
                                className={ACTION_NEUTRAL}
                                disabled={saving || idx === 0}
                                aria-label="Subir"
                                onClick={() =>
                                  setForm((p) => {
                                    const next = [...(p.formRubros || [])]
                                    if (idx <= 0 || isFdcOtherRubro(next[idx])) return p
                                    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
                                    return { ...p, formRubros: ensureFdcFormRubros(next) }
                                  })
                                }
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                className={ACTION_NEUTRAL}
                                disabled={
                                  saving ||
                                  idx >= (form.formRubros || []).length - 2
                                }
                                aria-label="Bajar"
                                onClick={() =>
                                  setForm((p) => {
                                    const next = [...(p.formRubros || [])]
                                    if (idx >= next.length - 1 || isFdcOtherRubro(next[idx])) return p
                                    if (isFdcOtherRubro(next[idx + 1])) return p
                                    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
                                    return { ...p, formRubros: ensureFdcFormRubros(next) }
                                  })
                                }
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                className={ACTION_DANGER}
                                disabled={saving}
                                onClick={() =>
                                  setForm((p) => ({
                                    ...p,
                                    formRubros: ensureFdcFormRubros(
                                      (p.formRubros || []).filter((_, i) => i !== idx),
                                    ),
                                  }))
                                }
                              >
                                Quitar
                              </button>
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </section>
            ) : null}

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
