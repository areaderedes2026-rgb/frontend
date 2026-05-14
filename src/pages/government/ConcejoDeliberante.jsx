import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../../components/ui/Container.jsx'
import { RevealOnScroll } from '../../components/home/RevealOnScroll.jsx'
import { LinkButton } from '../../components/ui/LinkButton.jsx'
import { HydrationHeroDarkBackdrop } from '../../components/skeleton/PageHydrationSkeleton.jsx'
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

  const resolvedHeroImage = useMemo(() => {
    const u = String(content.heroImageUrl || '').trim()
    if (u) return u
    return String(DEFAULT_CONCEJO_DELIBERANTE_CONTENT.heroImageUrl || '').trim()
  }, [content.heroImageUrl])

  const showHeroBackdrop = apiEnabled && loading && !String(content.heroImageUrl || '').trim()

  return (
    <section className="relative -mt-[calc(var(--navbar-h,5rem)+1.5rem)] overflow-hidden bg-linear-to-b from-[#f1eee8] via-[#f7f7f5] to-[#fcfcfa] pb-10 sm:-mt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-14">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_45%_at_20%_-10%,rgba(56,189,248,0.12),transparent_60%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_100%_10%,rgba(15,23,42,0.12),transparent_70%)]"
        aria-hidden
      />

      <div className="relative min-h-[52dvh] overflow-hidden border-b border-white/10 bg-[#171b22] sm:min-h-[56dvh] lg:min-h-[58dvh]">
        {showHeroBackdrop ? (
          <HydrationHeroDarkBackdrop />
        ) : (
          <img
            src={resolvedHeroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/76 via-black/62 to-black/36" />
        <Container className="relative z-10 flex min-h-[52dvh] flex-col justify-center pt-[calc(var(--navbar-h,5rem)+1rem)] pb-8 sm:min-h-[56dvh] sm:pt-[calc(var(--navbar-h,5rem)+1.5rem)] sm:pb-10 lg:min-h-[58dvh] lg:pb-12">
          <p className="mb-5 text-sm">
            <Link to={ROUTES.home} className="font-medium text-white/85 transition hover:text-white">
              ← Volver al inicio
            </Link>
          </p>
          <div className="max-w-4xl">
            <p className="hero-enter-eyebrow text-[11px] font-bold uppercase tracking-[0.28em] text-sky-200/95 sm:text-xs sm:tracking-[0.32em]">
              {content.heroEyebrow || 'Gobierno municipal'}
            </p>
            <h1 className="hero-enter-title mt-2 max-w-3xl font-serif text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.85rem]">
              {content.heroTitle || 'Concejo Deliberante'}
            </h1>
            <p className="hero-enter-subtitle mt-3 max-w-2xl text-sm leading-relaxed text-slate-100 sm:text-base">
              {content.heroSubtitle}
            </p>
            <div className="hero-enter-actions mt-6 flex flex-wrap items-center gap-3">
              <LinkButton to={ROUTES.atencionCiudadano}>Atención al vecino</LinkButton>
              <a
                href="#concejales"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/70 hover:bg-white/15"
              >
                Ver concejales
              </a>
            </div>
          </div>
        </Container>
      </div>

      <Container className="relative max-w-[min(100%,96rem)]!">
        <RevealOnScroll variant="slow">
          <section className="mt-8 rounded-2xl border border-[#e8e4dc] bg-[#fcfcfa] p-6 shadow-[0_1px_0_rgba(255,255,255,0.85)_inset,0_12px_40px_-28px_rgba(15,23,42,0.12)] sm:p-8 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-800">
              Concejo Deliberante
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
              {content.introTitle}
            </h2>
            <div className="mt-5 max-w-4xl space-y-4 text-sm leading-relaxed text-[#4b505a] sm:text-base">
              {(content.introParagraphs || []).map((p, i) => (
                <p key={`intro-p-${i}`}>{p}</p>
              ))}
            </div>
          </section>
        </RevealOnScroll>

        {content.presidentName || content.presidentRole || content.presidentBio ? (
          <RevealOnScroll variant="newsCardSlow" delayMs={80}>
            <section
              id="presidencia"
              className="mt-8 overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm"
            >
              <div className="grid gap-0 sm:grid-cols-12">
                <div className="relative aspect-square w-full overflow-hidden bg-[#ece8df] sm:col-span-4 sm:aspect-auto sm:min-h-[220px]">
                  <MemberAvatar
                    name={content.presidentName}
                    photoUrl={content.presidentPhotoUrl}
                    color="#0369a1"
                  />
                </div>
                <div className="flex flex-col justify-center gap-3 p-5 sm:col-span-8 sm:p-7 lg:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                    Presidencia del Concejo
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                    {content.presidentName}
                  </h2>
                  {content.presidentRole ? (
                    <p className="-mt-1 text-sm font-semibold text-[#5c6169]">{content.presidentRole}</p>
                  ) : null}
                  {content.presidentBio ? (
                    <p className="text-sm leading-relaxed text-[#4b505a] sm:text-base">
                      {content.presidentBio}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>
          </RevealOnScroll>
        ) : null}

        <RevealOnScroll variant="newsCardSlow" delayMs={100}>
          <section
            id="concejales"
            className="mt-8 rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm sm:p-6 lg:p-8"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-800">
                  Representación
                </p>
                <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                  Cuerpo de Concejales
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-[#5c6169]">
                  Filtrá por bloque para ver la composición política del Concejo.
                </p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                {filteredMembers.length} de {totalMembers}
              </p>
            </div>

            {(content.blocks || []).length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                <BlockChip
                  name="Todos los bloques"
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

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <MemberCardSkeleton key={`sk-${i}`} />
                  ))
                : filteredMembers.length === 0
                  ? (
                      <div className="col-span-full rounded-2xl border border-dashed border-[#ddd7ca] bg-[#faf9f6] px-4 py-10 text-center text-sm text-[#5c6169]">
                        No hay concejales para este bloque por ahora.
                      </div>
                    )
                  : filteredMembers.map((m) => (
                      <MemberCard key={m.id} member={m} blocks={content.blocks} />
                    ))}
            </div>
          </section>
        </RevealOnScroll>

        <div className="mt-8 grid gap-6 pb-2 lg:grid-cols-12 lg:gap-8">
          {(content.blocks || []).length > 0 ? (
            <RevealOnScroll variant="newsCardSlow" delayMs={120} className="lg:col-span-6">
              <section
                id="bloques"
                className="h-full rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm sm:p-6"
              >
                <h2 className="font-serif text-xl font-bold tracking-tight text-[#171b22] sm:text-2xl">
                  Bloques políticos
                </h2>
                <ul className="mt-4 space-y-3">
                  {(content.blocks || []).map((b) => (
                    <li
                      key={b.id}
                      className="rounded-2xl border border-[#e5e2da] bg-white/80 p-4"
                      style={{ borderLeft: `6px solid ${b.color || '#0369a1'}` }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-[#171b22]">{b.name}</h3>
                        <span className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                          {(content.members || []).filter((m) => m.block === b.name).length}{' '}
                          integrantes
                        </span>
                      </div>
                      {b.description ? (
                        <p className="mt-2 text-sm leading-relaxed text-[#4b505a]">{b.description}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            </RevealOnScroll>
          ) : null}

          {(content.commissions || []).length > 0 ? (
            <RevealOnScroll variant="newsCardSlow" delayMs={140} className="lg:col-span-6">
              <section
                id="comisiones"
                className="h-full rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm sm:p-6"
              >
                <h2 className="font-serif text-xl font-bold tracking-tight text-[#171b22] sm:text-2xl">
                  Comisiones de trabajo
                </h2>
                <p className="mt-2 text-sm text-[#5c6169]">
                  Cada comisión analiza temas específicos antes de llevarlos al recinto.
                </p>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {(content.commissions || []).map((c) => (
                    <li
                      key={c.id}
                      className="rounded-2xl border border-[#e5e2da] bg-white/80 p-4"
                    >
                      <h3 className="text-sm font-bold text-[#171b22]">{c.name}</h3>
                      {c.description ? (
                        <p className="mt-2 text-sm leading-relaxed text-[#4b505a]">{c.description}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            </RevealOnScroll>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
