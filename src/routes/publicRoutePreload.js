export const publicRouteLoaders = {
  history: () => import('../pages/History.jsx'),
  tourismPlaceDetail: () => import('../pages/history/TourismPlaceDetail.jsx'),
  areasIndex: () => import('../pages/areas/AreasIndex.jsx'),
  areaDetail: () => import('../pages/areas/AreaDetail.jsx'),
  newsList: () => import('../pages/news/NewsList.jsx'),
  newsDetail: () => import('../pages/news/NewsDetail.jsx'),
}

export function preloadPublicRoute(key) {
  const loader = publicRouteLoaders[key]
  if (!loader) return Promise.resolve()
  return loader().catch(() => null)
}

export function preloadCommonPublicRoutes() {
  return Promise.allSettled([
    preloadPublicRoute('history'),
    preloadPublicRoute('areasIndex'),
    preloadPublicRoute('newsList'),
  ])
}
