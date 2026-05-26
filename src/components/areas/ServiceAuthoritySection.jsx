import { resolveMediaUrl } from '../../utils/imageUrl.js'
import {
  isServiceAuthoritySectionVisible,
  normalizeServiceAuthoritySection,
} from '../../utils/serviceAuthority.js'

function AuthorityCard({ person }) {
  const name = String(person.name || '').trim()
  const role = String(person.role || '').trim()
  const bio = String(person.bio || '').trim()
  const photo = person.photoUrl ? resolveMediaUrl(person.photoUrl) : ''

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm sm:flex-row">
      {photo ? (
        <div className="shrink-0 sm:w-36 md:w-44">
          <img
            src={photo}
            alt=""
            className="aspect-square h-full w-full object-cover sm:aspect-auto sm:min-h-full"
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : (
        <div
          className="flex aspect-square shrink-0 items-center justify-center bg-linear-to-br from-amber-50 to-slate-100 text-xs font-bold uppercase tracking-wide text-slate-400 sm:w-36 sm:aspect-auto sm:min-h-[9rem] md:w-44"
          aria-hidden
        >
          Foto
        </div>
      )}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {role ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-800">{role}</p>
        ) : null}
        {name ? (
          <h3
            className={`font-serif text-xl font-bold tracking-tight text-[#171b22] ${role ? 'mt-1' : ''}`}
          >
            {name}
          </h3>
        ) : null}
        {bio ? (
          <p className="mt-3 flex-1 whitespace-pre-line text-sm leading-relaxed text-[#4b505a] sm:text-[15px]">
            {bio}
          </p>
        ) : null}
      </div>
    </article>
  )
}

export function ServiceAuthoritySection({ authoritySection, className = '' }) {
  const section = normalizeServiceAuthoritySection(authoritySection)
  if (!isServiceAuthoritySectionVisible(section)) return null

  return (
    <section className={className}>
      <div className="border-b border-[#e8e4dc] pb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-800">
          Equipo
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-[#171b22] sm:text-2xl">
          {section.title}
        </h2>
        {section.intro ? (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#4b505a] sm:text-[15px]">
            {section.intro}
          </p>
        ) : null}
      </div>
      <ul className="mt-6 space-y-5">
        {section.people.map((person, idx) => (
          <li key={person.id || `auth-${idx}`}>
            <AuthorityCard person={person} />
          </li>
        ))}
      </ul>
    </section>
  )
}
