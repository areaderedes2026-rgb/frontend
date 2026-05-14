function namedLazy(loader, exportName) {
  return () => loader().then((m) => ({ default: m[exportName] }))
}

export const adminRouteLoaders = {
  dashboard: namedLazy(() => import('../pages/admin/Dashboard.jsx'), 'Dashboard'),
  news: namedLazy(() => import('../pages/admin/AdminNews.jsx'), 'AdminNews'),
  events: namedLazy(() => import('../pages/admin/AdminEvents.jsx'), 'AdminEvents'),
  newsStats: namedLazy(
    () => import('../pages/admin/AdminNewsStats.jsx'),
    'AdminNewsStats',
  ),
  areas: namedLazy(() => import('../pages/admin/AdminAreaProfiles.jsx'), 'AdminAreaProfiles'),
  history: namedLazy(() => import('../pages/admin/AdminHistory.jsx'), 'AdminHistory'),
  citizenAttention: namedLazy(
    () => import('../pages/admin/AdminCitizenAttention.jsx'),
    'AdminCitizenAttention',
  ),
  citizenInquiries: namedLazy(
    () => import('../pages/admin/AdminCitizenInquiries.jsx'),
    'AdminCitizenInquiries',
  ),
  tourismPlaces: namedLazy(
    () => import('../pages/admin/AdminTourismPlaces.jsx'),
    'AdminTourismPlaces',
  ),
  createNews: namedLazy(() => import('../pages/admin/CreateNews.jsx'), 'CreateNews'),
  editNews: namedLazy(() => import('../pages/admin/EditNews.jsx'), 'EditNews'),
  settingsLayout: namedLazy(
    () => import('../pages/admin/AdminSettingsLayout.jsx'),
    'AdminSettingsLayout',
  ),
  settingsHome: namedLazy(
    () => import('../pages/admin/AdminSettingsHome.jsx'),
    'AdminSettingsHome',
  ),
  settingsCategories: namedLazy(
    () => import('../pages/admin/AdminCategories.jsx'),
    'AdminCategories',
  ),
  settingsHomeMap: namedLazy(
    () => import('../pages/admin/AdminSettingsHomeMap.jsx'),
    'AdminSettingsHomeMap',
  ),
  settingsIntendencia: namedLazy(
    () => import('../pages/admin/AdminIntendencia.jsx'),
    'AdminIntendencia',
  ),
  settingsLegisladorEste: namedLazy(
    () => import('../pages/admin/AdminLegisladorEste.jsx'),
    'AdminLegisladorEste',
  ),
  settingsConcejoDeliberante: namedLazy(
    () => import('../pages/admin/AdminConcejoDeliberante.jsx'),
    'AdminConcejoDeliberante',
  ),
  ofertaAcademica: namedLazy(
    () => import('../pages/admin/AdminOfertaAcademica.jsx'),
    'AdminOfertaAcademica',
  ),
  settingsUsers: namedLazy(() => import('../pages/admin/AdminUsers.jsx'), 'AdminUsers'),
}

export function preloadAdminRoute(key) {
  const loader = adminRouteLoaders[key]
  if (!loader) return Promise.resolve()
  return loader().catch(() => null)
}

export function preloadCommonAdminRoutes() {
  return Promise.allSettled([
    preloadAdminRoute('dashboard'),
    preloadAdminRoute('news'),
    preloadAdminRoute('areas'),
    preloadAdminRoute('settingsLayout'),
  ])
}
