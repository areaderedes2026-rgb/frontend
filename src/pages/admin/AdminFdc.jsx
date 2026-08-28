import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { PageCoverModal } from '../../components/admin/PageCoverModal.jsx'
import { SingleImageUploadField } from '../../components/admin/SingleImageUploadField.jsx'
import { FdcFestivalHero } from '../../components/fdc/FdcFestivalHero.jsx'
import { FdcStatIcon, FdcFestivalStatsSection } from '../../components/fdc/FdcFestivalStatsSection.jsx'
import { FdcHeroCountdown } from '../../components/fdc/FdcHeroCountdown.jsx'
import { FdcSectionNav } from '../../components/fdc/FdcFestivalSections.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { inputClass, labelClass, textareaClass } from '../../components/ui/formStyles.js'
import {
  DEFAULT_FDC_CONTENT,
  DEFAULT_FDC_HERO_COUNTDOWN,
  FDC_ARTISTS_MAX_DAY_POSTERS,
  FDC_SCHEDULE_MAX_IMAGES,
  FDC_STAT_ICON_OPTIONS,
  FDC_HERO_COUNTDOWN_LABEL_COLORS,
  applyHeroCoverToFdcContent,
  ensureFdcFormRubros,
  fdcContentToHeroCover,
  fdcCountdownToDatetimeLocal,
  isFdcOtherRubro,
  makeFdcItemId,
  mergeFdcContent,
  normalizeFdcFestivalStats,
  normalizeFdcHeroCountdown,
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

/** Mantiene «Otro» al final sin trim (para editar con espacios). */
function pinFdcOtroRubro(list) {
  const without = (Array.isArray(list) ? list : []).filter((r) => !isFdcOtherRubro(r))
  return [...without, 'Otro']
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
      dayPosters: (merged.artists?.dayPosters || []).map((it) => ({ ...it })),
      overlayOpacity: normalizeOverlay(merged.artists?.overlayOpacity, 55),
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
    festivalStats: {
      ...normalizeFdcFestivalStats(merged.festivalStats),
      items: (normalizeFdcFestivalStats(merged.festivalStats).items || []).map((it) => ({ ...it })),
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
    heroCountdown: normalizeFdcHeroCountdown(merged.heroCountdown),
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
  { id: 'estadisticas', label: 'Estadísticas' },
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
  const [dayPosterModal, setDayPosterModal] = useState({ open: false, index: null, draft: null })
  const [dayModal, setDayModal] = useState({ open: false, index: null, draft: null })
  const [scheduleImageModal, setScheduleImageModal] = useState({ open: false, index: null, draft: null })
  const [newsModal, setNewsModal] = useState({ open: false, index: null, draft: null })
  const [galleryModal, setGalleryModal] = useState({ open: false, index: null, draft: null })
  const [sponsorModal, setSponsorModal] = useState({ open: false, index: null, draft: null })
  const [statModal, setStatModal] = useState({ open: false, index: null, draft: null })

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
      heroImageUrlMobile: String(form.heroImageUrlMobile || '').trim(),
      heroCountdown: normalizeFdcHeroCountdown(
        form.heroCountdown,
        DEFAULT_FDC_HERO_COUNTDOWN,
      ),
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
        backgroundImageUrl: String(form.artists?.backgroundImageUrl || '').trim(),
        overlayOpacity: normalizeOverlay(form.artists?.overlayOpacity, 55),
        dayPosters: (form.artists?.dayPosters || [])
          .map((it, idx) => ({
            id: String(it?.id || '').trim() || makeFdcItemId('dp'),
            label: String(it?.label || '').trim(),
            imageUrl: String(it?.imageUrl || '').trim(),
            sortOrder: Number.isFinite(Number(it?.sortOrder)) ? Number(it.sortOrder) : idx,
          }))
          .filter((it) => it.imageUrl)
          .slice(0, FDC_ARTISTS_MAX_DAY_POSTERS),
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
      festivalStats: normalizeFdcFestivalStats(form.festivalStats),
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

  function updateFestivalStats(updater) {
    setForm((p) => ({
      ...p,
      festivalStats: typeof updater === 'function' ? updater(p.festivalStats) : updater,
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

  function openDayPosterModal(index = null) {
    const list = form.artists?.dayPosters || []
    const draft =
      index != null
        ? { ...list[index] }
        : {
            id: makeFdcItemId('dp'),
            label: '',
            imageUrl: '',
            sortOrder: list.length,
          }
    setDayPosterModal({ open: true, index, draft })
  }

  function applyDayPosterModal() {
    const imageUrl = String(dayPosterModal.draft?.imageUrl || '').trim()
    if (!imageUrl) return
    updateArtists((a) => {
      const dayPosters = [...(a.dayPosters || [])]
      const entry = {
        ...dayPosterModal.draft,
        imageUrl,
        label: String(dayPosterModal.draft?.label || '').trim(),
      }
      if (dayPosterModal.index == null) {
        if (dayPosters.length >= FDC_ARTISTS_MAX_DAY_POSTERS) return a
        dayPosters.push(entry)
      } else {
        dayPosters[dayPosterModal.index] = entry
      }
      return { ...a, dayPosters }
    })
    setDayPosterModal({ open: false, index: null, draft: null })
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

  function openStatModal(index = null) {
    const draft =
      index != null
        ? { ...(form.festivalStats?.items || [])[index] }
        : {
            id: makeFdcItemId('stat'),
            icon: 'horse',
            prefix: '+',
            value: 0,
            label: '',
            sortOrder: (form.festivalStats?.items || []).length,
          }
    setStatModal({ open: true, index, draft })
  }

  function applyStatModal() {
    const draft = statModal.draft || {}
    const value = Math.max(0, Math.round(Number(draft.value) || 0))
    const label = String(draft.label || '').trim()
    if (!label || value <= 0) return
    updateFestivalStats((s) => {
      const items = [...(s.items || [])]
      const entry = {
        ...draft,
        value,
        label,
        prefix: String(draft.prefix || '').trim(),
        icon: String(draft.icon || 'horse').trim(),
      }
      if (statModal.index == null) items.push(entry)
      else items[statModal.index] = entry
      return { ...s, items }
    })
    setStatModal({ open: false, index: null, draft: null })
  }

  const scheduleImages = form.schedule?.images || []
  const scheduleDays = form.schedule?.days || []
  const artistItems = form.artists?.items || []
  const dayPosterItems = form.artists?.dayPosters || []
  const newsItems = form.news?.items || []
  const galleryItems = form.gallery?.items || []
  const sponsorItems = form.sponsors?.items || []
  const statItems = form.festivalStats?.items || []

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

      {/* Day poster modal */}
      <Modal
        open={dayPosterModal.open}
        onClose={() => setDayPosterModal({ open: false, index: null, draft: null })}
        title={dayPosterModal.index == null ? 'Agregar afiche del día' : 'Editar afiche del día'}
        footer={
          <ModalFooter
            saving={saving}
            applyDisabled={!String(dayPosterModal.draft?.imageUrl || '').trim()}
            onCancel={() => setDayPosterModal({ open: false, index: null, draft: null })}
            onApply={applyDayPosterModal}
          />
        }
      >
        {dayPosterModal.draft ? (
          <div className="grid gap-4">
            <label className={labelClass}>
              Etiqueta del día
              <input
                className={inputClass}
                value={dayPosterModal.draft.label || ''}
                disabled={saving}
                placeholder="Jueves 9"
                onChange={(e) =>
                  setDayPosterModal((m) => ({ ...m, draft: { ...m.draft, label: e.target.value } }))
                }
              />
              <span className="mt-1 text-xs font-normal text-slate-500">
                Se muestra en la tarjeta y al ampliar el afiche.
              </span>
            </label>
            <SingleImageUploadField
              label="Imagen de la cartelera del día"
              value={dayPosterModal.draft.imageUrl || ''}
              disabled={saving}
              kind="cover"
              onChange={(url) =>
                setDayPosterModal((m) => ({ ...m, draft: { ...m.draft, imageUrl: url } }))
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

      {/* Estadística modal */}
      <Modal
        open={statModal.open}
        onClose={() => setStatModal({ open: false, index: null, draft: null })}
        title={statModal.index == null ? 'Agregar dato' : 'Editar dato'}
        size="default"
        footer={
          <ModalFooter
            saving={saving}
            applyDisabled={
              !(Number(statModal.draft?.value) > 0) ||
              !String(statModal.draft?.label || '').trim()
            }
            onCancel={() => setStatModal({ open: false, index: null, draft: null })}
            onApply={applyStatModal}
          />
        }
      >
        {statModal.draft ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={`${labelClass} sm:col-span-2`}>
              Ícono
              <select
                className={inputClass}
                value={statModal.draft.icon || 'horse'}
                disabled={saving}
                onChange={(e) =>
                  setStatModal((m) => ({ ...m, draft: { ...m.draft, icon: e.target.value } }))
                }
              >
                {FDC_STAT_ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Prefijo (opcional)
              <input
                className={inputClass}
                value={statModal.draft.prefix || ''}
                disabled={saving}
                placeholder="+"
                onChange={(e) =>
                  setStatModal((m) => ({ ...m, draft: { ...m.draft, prefix: e.target.value } }))
                }
              />
            </label>
            <label className={labelClass}>
              Número
              <input
                type="number"
                min={0}
                max={999999}
                className={inputClass}
                value={Number(statModal.draft.value) || 0}
                disabled={saving}
                onChange={(e) =>
                  setStatModal((m) => ({
                    ...m,
                    draft: { ...m.draft, value: Number(e.target.value) || 0 },
                  }))
                }
              />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Etiqueta (arriba del número)
              <input
                className={inputClass}
                value={statModal.draft.label || ''}
                disabled={saving}
                placeholder="Jinetes, Caballos, Puestos…"
                onChange={(e) =>
                  setStatModal((m) => ({ ...m, draft: { ...m.draft, label: e.target.value } }))
                }
              />
            </label>
            <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-[#f7f7f5] px-4 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Vista previa
              </p>
              <div className="mt-3 flex flex-col items-center text-center">
                <FdcStatIcon name={statModal.draft.icon || 'horse'} className="mb-2.5 h-9 w-9" />
                {String(statModal.draft.label || '').trim() ? (
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#171b22]/88">
                    {String(statModal.draft.label || '').trim()}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400">Etiqueta</p>
                )}
                <p className="mt-1.5 font-serif text-2xl font-bold tabular-nums text-[#171b22]">
                  {`${statModal.draft.prefix || ''}${Number(statModal.draft.value || 0).toLocaleString('es-AR')}`}
                </p>
              </div>
            </div>
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
              <div className="space-y-4">
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
                      Cambiar portada (escritorio)
                    </button>
                  </div>
                  <div className="flex h-[min(70vh,36rem)] flex-col">
                    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
                      <FdcFestivalHero
                        previewMode
                        contentReady
                        imageUrl={form.heroImageUrl || ''}
                        imageUrlMobile={form.heroImageUrlMobile || ''}
                        overlayOpacity={0}
                        eyebrow={form.showHeroBadge !== false ? form.heroEyebrow : ''}
                        title={form.showHeroTitle !== false ? form.heroTitle : ''}
                        subtitle={form.showHeroSubtitle !== false ? form.heroSubtitle : ''}
                        primaryCta={heroPrimaryCta}
                        secondaryCta={heroSecondaryCta}
                      />
                      <FdcHeroCountdown config={form.heroCountdown} previewMode />
                    </div>
                    <FdcSectionNav
                      items={(form.sectionNav || []).slice(0, 5)}
                      onHashNavigate={() => {}}
                    />
                  </div>
                </div>

                <section className={SECTION_CARD}>
                  <h2 className="text-base font-bold text-slate-900">Contador regresivo</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Solo números (días, horas, minutos y segundos), flotando sobre la portada justo
                    encima de la navegación. Ajustá la posición vertical por separado en móvil y
                    escritorio sin cortar la imagen.
                  </p>
                  <div className="mt-4 space-y-4">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-600"
                        checked={form.heroCountdown?.enabled === true}
                        disabled={saving}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            heroCountdown: {
                              ...normalizeFdcHeroCountdown(p.heroCountdown),
                              enabled: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span className="text-sm font-medium text-slate-800">Activar contador</span>
                    </label>
                    <label className={labelClass}>
                      Fecha y hora objetivo
                      <input
                        type="datetime-local"
                        className={inputClass}
                        value={fdcCountdownToDatetimeLocal(form.heroCountdown?.targetAt)}
                        disabled={saving || form.heroCountdown?.enabled !== true}
                        onChange={(e) => {
                          const raw = String(e.target.value || '').trim()
                          const targetAt = raw ? (raw.length === 16 ? `${raw}:00` : raw.slice(0, 19)) : ''
                          setForm((p) => ({
                            ...p,
                            heroCountdown: {
                              ...normalizeFdcHeroCountdown(p.heroCountdown),
                              targetAt,
                            },
                          }))
                        }}
                      />
                    </label>
                    <label className={labelClass}>
                      Color de «Faltan»
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <input
                          type="color"
                          className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                          value={normalizeFdcHeroCountdown(form.heroCountdown).labelColor}
                          disabled={saving || form.heroCountdown?.enabled !== true}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              heroCountdown: {
                                ...normalizeFdcHeroCountdown(p.heroCountdown),
                                labelColor: e.target.value,
                              },
                            }))
                          }
                        />
                        <input
                          type="text"
                          className={`${inputClass} max-w-[8.5rem] font-mono text-sm`}
                          value={normalizeFdcHeroCountdown(form.heroCountdown).labelColor}
                          disabled={saving || form.heroCountdown?.enabled !== true}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              heroCountdown: {
                                ...normalizeFdcHeroCountdown(p.heroCountdown),
                                labelColor: e.target.value,
                              },
                            }))
                          }
                          placeholder="#ffffff"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {FDC_HERO_COUNTDOWN_LABEL_COLORS.map((preset) => (
                            <button
                              key={preset.value}
                              type="button"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 disabled:opacity-50"
                              disabled={saving || form.heroCountdown?.enabled !== true}
                              onClick={() =>
                                setForm((p) => ({
                                  ...p,
                                  heroCountdown: {
                                    ...normalizeFdcHeroCountdown(p.heroCountdown),
                                    labelColor: preset.value,
                                  },
                                }))
                              }
                            >
                              <span
                                className="h-3.5 w-3.5 rounded-full border border-slate-200"
                                style={{ backgroundColor: preset.value }}
                                aria-hidden
                              />
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className={labelClass}>
                        Posición vertical (móvil):{' '}
                        {normalizeFdcHeroCountdown(form.heroCountdown).offsetYMobile}px
                        <input
                          type="range"
                          min={-160}
                          max={160}
                          step={1}
                          className="mt-2 w-full accent-sky-700"
                          value={normalizeFdcHeroCountdown(form.heroCountdown).offsetYMobile}
                          disabled={saving || form.heroCountdown?.enabled !== true}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              heroCountdown: {
                                ...normalizeFdcHeroCountdown(p.heroCountdown),
                                offsetYMobile: Number(e.target.value),
                              },
                            }))
                          }
                        />
                        <span className="mt-1 block text-xs font-normal text-slate-500">
                          Valores negativos lo suben sobre la imagen; positivos lo bajan hacia la
                          navegación.
                        </span>
                      </label>
                      <label className={labelClass}>
                        Posición vertical (escritorio):{' '}
                        {normalizeFdcHeroCountdown(form.heroCountdown).offsetYDesktop}px
                        <input
                          type="range"
                          min={-160}
                          max={160}
                          step={1}
                          className="mt-2 w-full accent-sky-700"
                          value={normalizeFdcHeroCountdown(form.heroCountdown).offsetYDesktop}
                          disabled={saving || form.heroCountdown?.enabled !== true}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              heroCountdown: {
                                ...normalizeFdcHeroCountdown(p.heroCountdown),
                                offsetYDesktop: Number(e.target.value),
                              },
                            }))
                          }
                        />
                        <span className="mt-1 block text-xs font-normal text-slate-500">
                          Independiente del ajuste en celular; se aplica desde 1024px de ancho.
                        </span>
                      </label>
                    </div>
                  </div>
                </section>

                <section className={SECTION_CARD}>
                  <h2 className="text-base font-bold text-slate-900">Imagen para celular</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Subí un recorte vertical u optimizado para pantallas chicas. Si lo dejás vacío, se
                    usa la portada de escritorio.
                  </p>
                  <div className="mt-4 max-w-xl">
                    <SingleImageUploadField
                      label="Afiche móvil"
                      value={form.heroImageUrlMobile || ''}
                      onChange={(value) =>
                        setForm((p) => ({ ...p, heroImageUrlMobile: value }))
                      }
                      disabled={saving}
                      helpText="Recomendado: proporción más alta (portrait) con logo y texto centrados."
                    />
                  </div>
                </section>
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
                    <span className="mt-1 text-xs font-normal text-slate-500">
                      Si cargás afiches por día abajo, el botón alterna la vista (carrusel ↔ cartelera)
                      y este enlace no se usa.
                    </span>
                  </label>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                  <h3 className="text-base font-bold text-slate-900">Fondo de la sección</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Sin imagen se usa el fondo claro actual. Si subís una imagen, podés oscurecerla con
                    el overlay para que el título y las tarjetas sigan legibles.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <SingleImageUploadField
                        label="Imagen de fondo (opcional)"
                        value={form.artists?.backgroundImageUrl || ''}
                        disabled={saving}
                        kind="cover"
                        onChange={(url) =>
                          updateArtists((a) => ({ ...a, backgroundImageUrl: url }))
                        }
                        onNotify={setToast}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>
                        Opacidad del overlay: {normalizeOverlay(form.artists?.overlayOpacity, 55)}%
                        <input
                          type="range"
                          min={0}
                          max={90}
                          step={1}
                          className="mt-2 w-full accent-sky-700"
                          value={normalizeOverlay(form.artists?.overlayOpacity, 55)}
                          disabled={saving || !String(form.artists?.backgroundImageUrl || '').trim()}
                          onChange={(e) =>
                            updateArtists((a) => ({
                              ...a,
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

                <div className="mt-8 border-t border-slate-200 pt-6">
                  <h3 className="text-base font-bold text-slate-900">Cartelera completa por día</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Hasta {FDC_ARTISTS_MAX_DAY_POSTERS} afiches (uno por día). En el sitio público, el
                    botón «{form.artists?.ctaLabel || 'Ver cartelera completa'}» oculta el carrusel y
                    muestra estas tarjetas grandes.
                  </p>
                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Afiche</th>
                          <th className="px-4 py-3">Día / etiqueta</th>
                          <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dayPosterItems.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                              Todavía no hay afiches por día.
                            </td>
                          </tr>
                        ) : (
                          dayPosterItems.map((poster, idx) => (
                            <tr key={poster.id || idx} className="hover:bg-slate-50/80">
                              <td className="px-4 py-3">
                                <ThumbCell src={poster.imageUrl} alt={poster.label || 'Afiche'} />
                              </td>
                              <td className="px-4 py-3 font-medium text-slate-900">
                                {poster.label || `Día ${idx + 1}`}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    className={ACTION_NEUTRAL}
                                    disabled={saving}
                                    onClick={() => openDayPosterModal(idx)}
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
                                        dayPosters: (a.dayPosters || []).filter((_, i) => i !== idx),
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
                    disabled={saving || dayPosterItems.length >= FDC_ARTISTS_MAX_DAY_POSTERS}
                    onClick={() => openDayPosterModal(null)}
                  >
                    + Agregar afiche del día
                    {dayPosterItems.length >= FDC_ARTISTS_MAX_DAY_POSTERS
                      ? ` (máx. ${FDC_ARTISTS_MAX_DAY_POSTERS})`
                      : ''}
                  </button>
                </div>
              </section>
            ) : null}

            {/* Estadísticas */}
            {activeTab === 'estadisticas' ? (
              <section className={SECTION_CARD}>
                <h2 className="text-lg font-bold text-slate-900">La fiesta en números</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Bloques con ícono, etiqueta y número animado. Se muestran entre la portada y la
                  cartelera. Podés ocultar el título de sección si preferís solo los datos.
                </p>
                <label className="mt-4 flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-600"
                    checked={form.festivalStats?.showTitle === true}
                    disabled={saving}
                    onChange={(e) =>
                      updateFestivalStats((s) => ({ ...s, showTitle: e.target.checked }))
                    }
                  />
                  <span className="text-sm font-medium text-slate-800">Mostrar título de sección</span>
                </label>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className={labelClass}>
                    Título de sección
                    <input
                      className={inputClass}
                      value={form.festivalStats?.title || ''}
                      disabled={saving || form.festivalStats?.showTitle !== true}
                      onChange={(e) =>
                        updateFestivalStats((s) => ({ ...s, title: e.target.value }))
                      }
                      placeholder="La fiesta en números"
                    />
                  </label>
                  <label className={labelClass}>
                    Subtítulo (opcional)
                    <input
                      className={inputClass}
                      value={form.festivalStats?.subtitle || ''}
                      disabled={saving || form.festivalStats?.showTitle !== true}
                      onChange={(e) =>
                        updateFestivalStats((s) => ({ ...s, subtitle: e.target.value }))
                      }
                    />
                  </label>
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Ícono</th>
                        <th className="px-4 py-3">Etiqueta</th>
                        <th className="px-4 py-3">Número</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {statItems.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                            Todavía no hay datos. Agregá al menos uno para mostrar la sección.
                          </td>
                        </tr>
                      ) : (
                        statItems.map((item, idx) => {
                          const displayValue = `${item.prefix || ''}${Number(item.value || 0).toLocaleString('es-AR')}`
                          const label = String(item.label || '').trim() || '—'
                          return (
                            <tr key={item.id || idx} className="hover:bg-slate-50/80">
                              <td className="px-4 py-3">
                                <FdcStatIcon name={item.icon || 'horse'} className="h-7 w-7" />
                              </td>
                              <td className="px-4 py-3 text-slate-700">{label}</td>
                              <td className="px-4 py-3 font-semibold tabular-nums text-slate-900">
                                {displayValue}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    className={ACTION_NEUTRAL}
                                    disabled={saving}
                                    onClick={() => openStatModal(idx)}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    className={ACTION_DANGER}
                                    disabled={saving}
                                    onClick={() =>
                                      updateFestivalStats((s) => ({
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
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  className={`${ACTION_ADD} mt-3`}
                  disabled={saving || statItems.length >= 8}
                  onClick={() => openStatModal(null)}
                >
                  + Agregar dato
                  {statItems.length >= 8 ? ' (máx. 8)' : ''}
                </button>

                <div className="mt-8 overflow-hidden rounded-3xl border border-[#ddd7ca] bg-[#f7f7f5] p-4 sm:p-6">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Vista previa
                  </p>
                  <FdcFestivalStatsSection stats={form.festivalStats} />
                </div>
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
                          const withoutOtro = (p.formRubros || []).filter((r) => !isFdcOtherRubro(r))
                          return {
                            ...p,
                            formRubros: pinFdcOtroRubro([...withoutOtro, '']),
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
                            placeholder="Ej. Stand Comercial"
                            onChange={(e) => {
                              const value = e.target.value
                              setForm((p) => {
                                const next = [...(p.formRubros || [])]
                                if (isFdcOtherRubro(next[idx])) return p
                                next[idx] = value
                                return { ...p, formRubros: pinFdcOtroRubro(next) }
                              })
                            }}
                            onBlur={() =>
                              setForm((p) => ({
                                ...p,
                                formRubros: ensureFdcFormRubros(p.formRubros),
                              }))
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
                                    return { ...p, formRubros: pinFdcOtroRubro(next) }
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
                                    return { ...p, formRubros: pinFdcOtroRubro(next) }
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
