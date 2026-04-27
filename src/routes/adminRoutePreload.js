export const adminRouteLoaders = {
  dashboard: () => import('../pages/admin/Dashboard.jsx'),
  news: () => import('../pages/admin/AdminNews.jsx'),
  areas: () => import('../pages/admin/AdminAreaProfiles.jsx'),
  history: () => import('../pages/admin/AdminHistory.jsx'),
  citizenAttention: () => import('../pages/admin/AdminCitizenAttention.jsx'),
  tourismPlaces: () => import('../pages/admin/AdminTourismPlaces.jsx'),
  createNews: () => import('../pages/admin/CreateNews.jsx'),
  editNews: () => import('../pages/admin/EditNews.jsx'),
  settingsLayout: () => import('../pages/admin/AdminSettingsLayout.jsx'),
  settingsHome: () => import('../pages/admin/AdminSettingsHome.jsx'),
  settingsCategories: () => import('../pages/admin/AdminCategories.jsx'),
  settingsHomeMap: () => import('../pages/admin/AdminSettingsHomeMap.jsx'),
  settingsUsers: () => import('../pages/admin/AdminUsers.jsx'),
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
