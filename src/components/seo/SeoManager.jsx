import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

const DEFAULT_TITLE = 'Municipalidad de Trancas'
const DEFAULT_DESCRIPTION =
  'Portal oficial de la Municipalidad de Trancas: noticias, servicios, areas municipales, eventos y atencion al ciudadano.'

function ensureMetaByName(name) {
  let node = document.head.querySelector(`meta[name="${name}"]`)
  if (!node) {
    node = document.createElement('meta')
    node.setAttribute('name', name)
    document.head.appendChild(node)
  }
  return node
}

function ensureMetaByProperty(property) {
  let node = document.head.querySelector(`meta[property="${property}"]`)
  if (!node) {
    node = document.createElement('meta')
    node.setAttribute('property', property)
    document.head.appendChild(node)
  }
  return node
}

function ensureCanonical() {
  let node = document.head.querySelector('link[rel="canonical"]')
  if (!node) {
    node = document.createElement('link')
    node.setAttribute('rel', 'canonical')
    document.head.appendChild(node)
  }
  return node
}

function routeSeo(pathname) {
  if (pathname === '/') {
    return {
      title: 'Municipalidad de Trancas | Portal Oficial',
      description:
        'Sitio oficial de la Municipalidad de Trancas. Informate sobre tramites, noticias, eventos y servicios municipales.',
    }
  }
  if (pathname.startsWith('/areas/')) {
    return {
      title: 'Detalle de area | Municipalidad de Trancas',
      description:
        'Conoce la informacion institucional del area municipal: autoridades, servicios y canales de contacto.',
    }
  }
  if (pathname === '/areas') {
    return {
      title: 'Areas municipales | Municipalidad de Trancas',
      description:
        'Directorio de areas de la Municipalidad de Trancas con informacion de funciones, programas y contacto.',
    }
  }
  if (pathname === '/eventos') {
    return {
      title: 'Eventos en Trancas | Municipalidad de Trancas',
      description:
        'Agenda de eventos culturales, deportivos e institucionales de la Municipalidad de Trancas.',
    }
  }
  if (pathname.startsWith('/news/')) {
    return {
      title: 'Noticia | Municipalidad de Trancas',
      description:
        'Lee comunicados y noticias oficiales de la Municipalidad de Trancas.',
    }
  }
  if (pathname === '/news') {
    return {
      title: 'Noticias | Municipalidad de Trancas',
      description:
        'Noticias y comunicados oficiales de la Municipalidad de Trancas.',
    }
  }
  if (pathname === '/services') {
    return {
      title: 'Tramites y servicios | Municipalidad de Trancas',
      description:
        'Consulta tramites, requisitos y servicios municipales de Trancas.',
    }
  }
  if (pathname === '/atencion-ciudadano') {
    return {
      title: 'Atencion al ciudadano | Municipalidad de Trancas',
      description:
        'Canal oficial para consultas y contacto con la Municipalidad de Trancas.',
    }
  }
  if (pathname === '/gobierno/intendencia') {
    return {
      title: 'Intendencia | Municipalidad de Trancas',
      description:
        'Informacion institucional de la Intendencia de Trancas: gestion, contacto y articulacion con las areas.',
    }
  }
  if (pathname === '/gobierno/oferta-academica') {
    return {
      title: 'Oferta academica | Municipalidad de Trancas',
      description:
        'Oferta academica y formativa en Trancas: terciaria, cursos, idiomas y articulacion universitaria. Informacion orientativa para vecinos.',
    }
  }
  if (pathname === '/history') {
    return {
      title: 'Historia y patrimonio | Municipalidad de Trancas',
      description:
        'Historia local, identidad cultural y patrimonio del departamento de Trancas, Tucuman.',
    }
  }
  if (pathname === '/turismo') {
    return {
      title: 'Turismo en Trancas | Municipalidad de Trancas',
      description:
        'Puntos turisticos y destinos para descubrir en Trancas y la region.',
    }
  }
  if (pathname.startsWith('/turismo/lugares/')) {
    return {
      title: 'Lugar turistico | Municipalidad de Trancas',
      description:
        'Informacion, ubicacion y detalles de un punto turistico de Trancas.',
    }
  }
  return { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION }
}

function setJsonLd(baseUrl) {
  const id = 'seo-local-government-jsonld'
  let node = document.getElementById(id)
  if (!node) {
    node = document.createElement('script')
    node.type = 'application/ld+json'
    node.id = id
    document.head.appendChild(node)
  }
  node.text = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: 'Municipalidad de Trancas',
    url: baseUrl,
    areaServed: 'Trancas, Tucuman, Argentina',
    sameAs: [
      'https://www.instagram.com/municipalidaddetrancas/',
      'https://www.facebook.com/profile.php?id=100050317032987',
      'https://www.youtube.com/@canal6municipal-trancas888',
    ],
  })
}

export function SeoManager() {
  const { pathname } = useLocation()
  const seo = useMemo(() => routeSeo(pathname), [pathname])

  useEffect(() => {
    const baseUrl = window.location.origin
    const canonicalUrl = `${baseUrl}${pathname || '/'}`
    const imageUrl = `${baseUrl}/favicon.png?v=2`

    document.title = seo.title || DEFAULT_TITLE

    ensureMetaByName('description').setAttribute(
      'content',
      seo.description || DEFAULT_DESCRIPTION,
    )
    ensureMetaByName('robots').setAttribute('content', 'index, follow, max-image-preview:large')

    ensureMetaByProperty('og:type').setAttribute('content', 'website')
    ensureMetaByProperty('og:site_name').setAttribute('content', 'Municipalidad de Trancas')
    ensureMetaByProperty('og:title').setAttribute('content', seo.title || DEFAULT_TITLE)
    ensureMetaByProperty('og:description').setAttribute(
      'content',
      seo.description || DEFAULT_DESCRIPTION,
    )
    ensureMetaByProperty('og:url').setAttribute('content', canonicalUrl)
    ensureMetaByProperty('og:image').setAttribute('content', imageUrl)

    ensureMetaByName('twitter:card').setAttribute('content', 'summary_large_image')
    ensureMetaByName('twitter:title').setAttribute('content', seo.title || DEFAULT_TITLE)
    ensureMetaByName('twitter:description').setAttribute(
      'content',
      seo.description || DEFAULT_DESCRIPTION,
    )
    ensureMetaByName('twitter:image').setAttribute('content', imageUrl)

    ensureCanonical().setAttribute('href', canonicalUrl)
    setJsonLd(baseUrl)
  }, [pathname, seo])

  return null
}
