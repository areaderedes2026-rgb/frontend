import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../../components/ui/Container.jsx'
import { RevealOnScroll } from '../../components/home/RevealOnScroll.jsx'
import {
  DEFAULT_CONCEJO_DELIBERANTE_CONTENT,
  getInitialsFromName,
  mergeConcejoDeliberanteContent,
} from '../../data/concejoDeliberanteContent.js'
import { fetchConcejoDeliberanteContent } from '../../services/concejoDeliberanteService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { ROUTES } from '../../utils/constants.js'

const ALL_BLOCKS = '__all__'

function blockColor(blocks, name) {
  const b = (blocks || []).find((x) => x.name === name)
  return b?.color || '#0369a1'
}

function MemberAvatar({ name, photoUrl, color }) {
  const initials = getInitialsFromName(name)
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        loading="lazy"
        className="h-full w-full object-cover object-center"
      />
    )
  }
  return (
    <div
      className="flex h-full w-full items-center justify-center text-2xl font-bold tracking-wide text-white sm:text-3xl"
      style={{
        backgroundImage: `linear-gradient(135deg, ${color || '#0369a1'} 0%, rgba(15, 23, 42, 0.9) 100%)`,
      }}
      aria-hidden
    >
      {initials}
    </div>
  )
}

function BlockChip({ name, color, active, onClick }) {
  const accent = color || '#0369a1'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex min-h-9 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
        active
          ? 'border-transparent bg-slate-900 text-white shadow-sm'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: accent }}
        aria-hidden
      />
      {name}
    </button>
  )
}

function MemberCard({ member, blocks }) {
  const color = blockColor(blocks, member.block)
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-4/5 w-full overflow-hidden bg-slate-100">
        <MemberAvatar name={member.name} photoUrl={member.photoUrl} color={color} />
        {member.block ? (
          <span
            className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-800 shadow-sm backdrop-blur"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden
            />
            {member.block}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-900">{member.name}</h3>
          {member.role ? (
            <p className="text-sm font-semibold text-sky-700">{member.role}</p>
          ) : null}
          {member.period ? (
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Período {member.period}
            </p>
          ) : null}
        </div>
        {member.bio ? (
          <p className="text-sm leading-relaxed text-slate-700">{member.bio}</p>
        ) : null}
        {(member.email || member.phone) && (
          <ul className="mt-auto space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
            {member.email ? (
              <li className="truncate">
                <span className="font-semibold text-slate-700">Correo:</span>{' '}
                <a
                  className="text-sky-700 transition-colors hover:text-sky-900"
                  href={`mailto:${member.email}`}
                >
                  {member.email}
                </a>
              </li>
            ) : null}
            {member.phone ? (
              <li>
                <span className="font-semibold text-slate-700">Teléfono:</span>{' '}
                {member.phone}
              </li>
            ) : null}
          </ul>
        )}
      </div>
    </article>
  )
}

function MemberCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="aspect-4/5 w-full animate-pulse bg-slate-200/80" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="space-y-2 pt-2">
          <div className="h-3 w-full animate-pulse rounded bg-slate-200/80" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200/80" />
        </div>
      </div>
    </div>
  )
}

export function ConcejoDeliberante() {
  const apiEnabled = isApiConfigured()
  const [content, setContent] = useState(() =>
    apiEnabled
      ? {
          ...DEFAULT_CONCEJO_DELIBERANTE_CONTENT,
          heroImageUrl: '',
          presidentPhotoUrl: '',
          presidentName: '',
          presidentRole: '',
          presidentBio: '',
          contactEmail: '',
          contactPhone: '',
          contactAddress: '',
          contactHours: '',
          blocks: [],
          members: [],
          commissions: [],
        }
      : DEFAULT_CONCEJO_DELIBERANTE_CONTENT,
  )
  const [loading, setLoading] = useState(apiEnabled)
  const [selectedBlock, setSelectedBlock] = useState(ALL_BLOCKS)

  useEffect(() => {
    let cancelled = false
    async function loadContent() {
      if (!apiEnabled) return
      try {
        const remote = await fetchConcejoDeliberanteContent()
        if (!remote || cancelled) return
        setContent(
          mergeConcejoDeliberanteContent(DEFAULT_CONCEJO_DELIBERANTE_CONTENT, remote),
        )
      } catch {
        // si falla la API, se conserva el contenido por defecto
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadContent()
    return () => {
      cancelled = true
    }
  }, [apiEnabled])

  const filteredMembers = useMemo(() => {
    const all = content.members || []
    if (selectedBlock === ALL_BLOCKS) return all
    return all.filter((m) => m.block === selectedBlock)
  }, [content.members, selectedBlock])

  const totalMembers = (content.members || []).length
  const totalBlocks = (content.blocks || []).length
  const totalCommissions = (content.commissions || []).length

  return (
    <section className="relative bg-linear-to-b from-[#f7f9fc] via-[#fcfcfa] to-white pb-12 sm:pb-16">
      <Container className="max-w-[min(100%,96rem)]!">
        <p className="pt-1 text-sm font-medium text-sky-700">
          <Link to={ROUTES.home} className="transition-colors hover:text-sky-900">
            ← Volver al inicio
          </Link>
        </p>

        {/* HERO */}
        <RevealOnScroll variant="newsCardSlow" delayMs={60}>
          <div className="relative mt-5 overflow-hidden rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="absolute inset-0">
              {content.heroImageUrl ? (
                <img
                  src={content.heroImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  aria-hidden
                />
              ) : (
                <div className="h-full w-full bg-slate-200" aria-hidden />
              )}
              <div className="absolute inset-0 bg-linear-to-r from-slate-950/85 via-slate-900/70 to-slate-900/40" />
            </div>
            <div className="relative grid gap-6 p-6 sm:p-8 md:grid-cols-12 md:p-10">
              <div className="md:col-span-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200">
                  {content.heroEyebrow || 'Gobierno municipal'}
                </p>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
                  {content.heroTitle || 'Concejo Deliberante'}
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-100/90 sm:text-base">
                  {content.heroSubtitle}
                </p>
              </div>
              <div className="md:col-span-4">
                <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
                  <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white backdrop-blur">
                    <p className="text-2xl font-bold">{totalMembers}</p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-sky-100/90">
                      Concejales
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white backdrop-blur">
                    <p className="text-2xl font-bold">{totalBlocks}</p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-sky-100/90">
                      Bloques
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white backdrop-blur">
                    <p className="text-2xl font-bold">{totalCommissions}</p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-sky-100/90">
                      Comisiones
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>

        {/* INTRO + SESIONES */}
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <RevealOnScroll variant="newsCardSlow" delayMs={100} className="lg:col-span-7">
            <section className="h-full rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {content.introTitle}
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
                {(content.introParagraphs || []).map((p, i) => (
                  <p key={`intro-p-${i}`}>{p}</p>
                ))}
              </div>
            </section>
          </RevealOnScroll>

          <RevealOnScroll variant="slow" delayMs={140} className="lg:col-span-5">
            <aside className="h-full rounded-3xl border border-slate-200/80 bg-slate-900 p-5 text-slate-100 shadow-sm sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
                {content.sessionsTitle || 'Sesiones'}
              </p>
              <div className="mt-4 space-y-2 text-sm leading-relaxed">
                {content.sessionsSchedule ? (
                  <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                    <span className="font-semibold">Día y horario:</span>{' '}
                    {content.sessionsSchedule}
                  </p>
                ) : null}
                {content.sessionsLocation ? (
                  <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                    <span className="font-semibold">Lugar:</span> {content.sessionsLocation}
                  </p>
                ) : null}
              </div>
              {content.sessionsNote ? (
                <div className="mt-5 rounded-xl border border-sky-300/30 bg-sky-500/10 p-3 text-xs text-sky-100">
                  {content.sessionsNote}
                </div>
              ) : null}
            </aside>
          </RevealOnScroll>
        </div>

        {/* PRESIDENCIA */}
        {content.presidentName || content.presidentRole || content.presidentBio ? (
          <RevealOnScroll variant="newsCardSlow" delayMs={160}>
            <section
              id="presidencia"
              className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm"
            >
              <div className="grid gap-0 sm:grid-cols-12">
                <div className="relative aspect-square w-full overflow-hidden bg-slate-100 sm:col-span-4 sm:aspect-auto">
                  <MemberAvatar
                    name={content.presidentName}
                    photoUrl={content.presidentPhotoUrl}
                    color="#0369a1"
                  />
                </div>
                <div className="flex flex-col justify-center gap-3 p-5 sm:col-span-8 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                    Presidencia del Concejo
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {content.presidentName}
                  </h2>
                  {content.presidentRole ? (
                    <p className="-mt-1 text-sm font-semibold text-slate-600">
                      {content.presidentRole}
                    </p>
                  ) : null}
                  {content.presidentBio ? (
                    <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                      {content.presidentBio}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>
          </RevealOnScroll>
        ) : null}

        {/* CONCEJALES */}
        <RevealOnScroll variant="newsCardSlow" delayMs={180}>
          <section
            id="concejales"
            className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Cuerpo de Concejales
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Filtrá por bloque para conocer la composición política del Concejo.
                </p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {filteredMembers.length} de {totalMembers}
              </p>
            </div>

            {(content.blocks || []).length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <BlockChip
                  name={`Todos los bloques`}
                  color="#0f172a"
                  active={selectedBlock === ALL_BLOCKS}
                  onClick={() => setSelectedBlock(ALL_BLOCKS)}
                />
                {(content.blocks || []).map((b) => (
                  <BlockChip
                    key={b.id}
                    name={b.name}
                    color={b.color}
                    active={selectedBlock === b.name}
                    onClick={() => setSelectedBlock(b.name)}
                  />
                ))}
              </div>
            ) : null}

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <MemberCardSkeleton key={`sk-${i}`} />
                  ))
                : filteredMembers.length === 0
                  ? (
                      <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-600">
                        No hay concejales para este bloque por ahora.
                      </div>
                    )
                  : filteredMembers.map((m) => (
                      <MemberCard key={m.id} member={m} blocks={content.blocks} />
                    ))}
            </div>
          </section>
        </RevealOnScroll>

        {/* BLOQUES Y COMISIONES */}
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          {(content.blocks || []).length > 0 ? (
            <RevealOnScroll variant="newsCardSlow" delayMs={200} className="lg:col-span-6">
              <section
                id="bloques"
                className="h-full rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
              >
                <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Bloques políticos
                </h2>
                <ul className="mt-4 space-y-3">
                  {(content.blocks || []).map((b) => (
                    <li
                      key={b.id}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4"
                      style={{ borderLeft: `6px solid ${b.color || '#0369a1'}` }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-slate-900">{b.name}</h3>
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {(content.members || []).filter((m) => m.block === b.name).length}{' '}
                          integrantes
                        </span>
                      </div>
                      {b.description ? (
                        <p className="mt-2 text-sm leading-relaxed text-slate-700">
                          {b.description}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            </RevealOnScroll>
          ) : null}

          {(content.commissions || []).length > 0 ? (
            <RevealOnScroll variant="newsCardSlow" delayMs={240} className="lg:col-span-6">
              <section
                id="comisiones"
                className="h-full rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
              >
                <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Comisiones de trabajo
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Cada comisión analiza temas específicos antes de llevarlos al recinto.
                </p>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {(content.commissions || []).map((c) => (
                    <li
                      key={c.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                    >
                      <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                      {c.description ? (
                        <p className="mt-2 text-sm leading-relaxed text-slate-700">
                          {c.description}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            </RevealOnScroll>
          ) : null}
        </div>

        {/* CONTACTO */}
        <RevealOnScroll variant="newsCardSlow" delayMs={260}>
          <section
            id="contacto-concejo"
            className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-900 p-5 text-slate-100 shadow-sm sm:p-6"
          >
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
                  Contacto institucional
                </p>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Escribinos al Concejo Deliberante
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-100/90 sm:text-base">
                  Si tenés una iniciativa, un reclamo vecinal o querés solicitar una
                  audiencia, podés acercarte a la mesa de entradas o usar los canales
                  oficiales.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    to={ROUTES.atencionCiudadano}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    Mesa de atención al vecino
                  </Link>
                  <Link
                    to={ROUTES.governmentIntendencia}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/30 bg-transparent px-4 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Ir a Intendencia
                  </Link>
                </div>
              </div>
              <div className="space-y-2 text-sm leading-relaxed lg:col-span-5">
                {content.contactEmail ? (
                  <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                    <span className="font-semibold">Correo:</span> {content.contactEmail}
                  </p>
                ) : null}
                {content.contactPhone ? (
                  <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                    <span className="font-semibold">Teléfono:</span> {content.contactPhone}
                  </p>
                ) : null}
                {content.contactAddress ? (
                  <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                    <span className="font-semibold">Dirección:</span> {content.contactAddress}
                  </p>
                ) : null}
                {content.contactHours ? (
                  <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                    <span className="font-semibold">Horario:</span> {content.contactHours}
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        </RevealOnScroll>
      </Container>
    </section>
  )
}
