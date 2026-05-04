function namedLazy(loader, exportName) {
  return () => loader().then((m) => ({ default: m[exportName] }))
}

export const publicRouteLoaders = {
  events: namedLazy(() => import('../pages/Events.jsx'), 'Events'),
  history: namedLazy(() => import('../pages/History.jsx'), 'History'),
  tourismPlaceDetail: namedLazy(
    () => import('../pages/history/TourismPlaceDetail.jsx'),
    'TourismPlaceDetail',
  ),
  areasIndex: namedLazy(() => import('../pages/areas/AreasIndex.jsx'), 'AreasIndex'),
  areaDetail: namedLazy(() => import('../pages/areas/AreaDetail.jsx'), 'AreaDetail'),
  governmentIntendencia: namedLazy(
    () => import('../pages/government/Intendencia.jsx'),
    'Intendencia',
  ),
  governmentOfertaAcademica: namedLazy(
    () => import('../pages/government/OfertaAcademica.jsx'),
    'OfertaAcademica',
  ),
  newsList: namedLazy(() => import('../pages/news/NewsList.jsx'), 'NewsList'),
  newsDetail: namedLazy(() => import('../pages/news/NewsDetail.jsx'), 'NewsDetail'),
}

export function preloadPublicRoute(key) {
  const loader = publicRouteLoaders[key]
  if (!loader) return Promise.resolve()
  return loader().catch(() => null)
}

export function preloadCommonPublicRoutes() {
  return Promise.allSettled([
    preloadPublicRoute('events'),
    preloadPublicRoute('history'),
    preloadPublicRoute('areasIndex'),
    preloadPublicRoute('newsList'),
  ])
}
