import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RevealOnScroll } from '../home/RevealOnScroll.jsx'
import { Container } from '../ui/Container.jsx'
import { ServicesHeroHeader } from './ServicesHeroHeader.jsx'
import {
  MunicipalServiceCard,
  MunicipalServiceDetailModal,
} from './MunicipalServiceDirectory.jsx'
import { ServiceCategoryIconBadge } from './ServiceCategoryIcons.jsx'
import {
  findServiceCategory,
  normalizeServiceCategories,
  serviceBelongsToCategory,
} from '../../data/serviceCategoriesContent.js'
import {
  filterMunicipalServicesByQuery,
  normalizeMunicipalService,
} from '../../data/servicesPageContent.js'
import { ROUTES } from '../../utils/constants.js'

export function ServicesCategoryView({
  content,
  services = [],
  categorySlug,
  previewMode = false,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [detailService, setDetailService] = useState(null)

  useEffect(() => {
    setSearchQuery('')
    setDetailService(null)
  }, [categorySlug])

  const categories = useMemo(
    () => normalizeServiceCategories(content?.categories),
    [content?.categories],
  )

  const category = useMemo(
    () => findServiceCategory(categories, { slug: categorySlug }),
    [categories, categorySlug],
  )

  const activeServices = useMemo(
    () =>
      [...services]
        .filter((item) => item.isActive !== false)
        .map((item, index) => normalizeMunicipalService(item, index + 1, categories))
        .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)),
    [services, categories],
  )

  const categoryServices = useMemo(() => {
    if (!category) return []
    return activeServices.filter((service) => serviceBelongsToCategory(service, category, categories))
  }, [activeServices, category, categories])

  const trimmedSearch = searchQuery.trim()
  const visible = useMemo(() => {
    if (!trimmedSearch) return categoryServices
    return filterMunicipalServicesByQuery(categoryServices, trimmedSearch)
  }, [categoryServices, trimmedSearch])

  if (!category) {
    return (
      <section className="bg-[#f7f7f5] py-16">
        <Container className="text-center">
          <h1 className="font-serif text-2xl font-bold text-[#171b22]">Categoría no encontrada</h1>
          <p className="mt-3 text-sm text-[#4b505a]">La categoría solicitada no existe o no está publicada.</p>
          <Link
            to={ROUTES.services}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#171b22] px-5 text-sm font-semibold text-white"
          >
            Volver a servicios
          </Link>
        </Container>
      </section>
    )
  }

  return (
    <section
      key={categorySlug}
      className={`services-category-enter relative overflow-hidden bg-linear-to-b from-[#f1eee8] via-[#f7f7f5] to-[#fcfcfa] ${
        previewMode
          ? ''
          : '-mt-[calc(var(--navbar-h,5rem)+1.5rem)] pb-12 sm:-mt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-16'
      }`}
    >
      <MunicipalServiceDetailModal
        open={Boolean(detailService)}
        service={detailService}
        onClose={() => setDetailService(null)}
      />

      <ServicesHeroHeader
        title={category.name}
        imageUrl={content?.heroImageUrl || ''}
        searchPlaceholder={`Buscar en ${category.name}…`}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={() => {
          document.getElementById('tramites-categoria')?.scrollIntoView({ behavior: 'smooth' })
        }}
        previewMode={previewMode}
      />

      <Container className="relative">
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          <Link
            to={ROUTES.services}
            className="font-semibold text-sky-800 transition hover:text-sky-950"
          >
            ← Volver a categorías
          </Link>
        </div>

        <RevealOnScroll variant="slow">
          <div className="mt-8 flex flex-col items-center text-center">
            <ServiceCategoryIconBadge icon={category.icon} className="h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-sky-800">
              Trámites de la categoría
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-[#171b22] sm:text-3xl">{category.name}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#4b505a]">
              Consultá los trámites disponibles en esta área. Tocá «Ver más» en cada tarjeta para ver requisitos y
              documentación.
            </p>
          </div>
        </RevealOnScroll>

        <section id="tramites-categoria" className="mt-10 scroll-mt-[calc(var(--navbar-h,5rem)+1rem)] sm:mt-12">
          {trimmedSearch ? (
            <p className="mb-4 text-sm text-[#4b505a]">
              {visible.length === 0 ? (
                <>No hay resultados para «{trimmedSearch}» en esta categoría.</>
              ) : (
                <>
                  {visible.length} resultado{visible.length === 1 ? '' : 's'} en {category.name}.
                </>
              )}
            </p>
          ) : (
            <p className="mb-4 text-sm font-medium text-[#4b505a]">
              {categoryServices.length} trámite{categoryServices.length === 1 ? '' : 's'} publicado
              {categoryServices.length === 1 ? '' : 's'}.
            </p>
          )}

          {visible.length === 0 ? (
            <div className="rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-6 text-center text-sm text-[#4b505a]">
              {trimmedSearch
                ? 'Probá con otra palabra o limpiá la búsqueda.'
                : 'Todavía no hay trámites cargados en esta categoría.'}
            </div>
          ) : (
            <ul className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((item, idx) => (
                <li key={item.id || item.slug} className="h-full">
                  <RevealOnScroll variant="newsCardSlow" delayMs={previewMode ? 0 : idx * 70} className="h-full">
                    <MunicipalServiceCard
                      service={item}
                      onVerMas={setDetailService}
                      className="h-full"
                    />
                  </RevealOnScroll>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Container>
    </section>
  )
}
