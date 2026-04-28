export const APP_NAME = 'Municipalidad de Trancas'

export const ROUTES = {
  home: '/',
  about: '/history',
  history: '/history',
  tourismPlaceDetail: (slug) => `/history/lugares/${slug}`,
  services: '/services',
  events: '/eventos',
  areas: '/areas',
  area: (slug) => `/areas/${slug}`,
  /** Atención al ciudadano (consultas y contacto). */
  atencionCiudadano: '/atencion-ciudadano',
  /** Redirige a `atencionCiudadano` en el router. */
  contact: '/contact',
  news: '/news',
  newsDetail: (id) => `/news/${id}`,
  adminLogin: '/admin/login',
  adminDashboard: '/admin/dashboard',
  adminNews: '/admin/news',
  adminAreas: '/admin/areas',
  adminHistory: '/admin/history',
  adminCitizenAttention: '/admin/citizen-attention',
  adminTourismPlaces: '/admin/tourism-places',
  adminNewsCreate: '/admin/news/create',
  adminNewsEdit: (id) => `/admin/news/edit/${id}`,
  adminUsers: '/admin/settings/users',
  adminSettings: '/admin/settings',
  adminSettingsCategories: '/admin/settings/categories',
  adminSettingsHomeMap: '/admin/settings/home-map',
}

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/municipalidaddetrancas/',
  facebook: 'https://www.facebook.com/profile.php?id=100050317032987',
}
