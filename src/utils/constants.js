export const APP_NAME = 'Municipalidad de Trancas'

export const ROUTES = {
  home: '/',
  about: '/history',
  history: '/history',
  turismo: '/turismo',
  tourismPlaceDetail: (slug) => `/turismo/lugares/${slug}`,
  services: '/services',
  events: '/eventos',
  government: '/gobierno/intendencia',
  governmentIntendencia: '/gobierno/intendencia',
  legisladorEste: '/gobierno/legislador-este',
  concejoDeliberante: '/gobierno/concejo-deliberante',
  ofertaAcademica: '/gobierno/oferta-academica',
  areas: '/areas',
  area: (slug) => `/areas/${slug}`,
  areaServiceDetail: (areaSlug, serviceId) =>
    `/areas/${areaSlug}/servicios/${serviceId}`,
  /** Atención al ciudadano (consultas y contacto). */
  atencionCiudadano: '/atencion-ciudadano',
  /** Redirige a `atencionCiudadano` en el router. */
  contact: '/contact',
  news: '/news',
  newsDetail: (id) => `/news/${id}`,
  adminLogin: '/admin/login',
  adminDashboard: '/admin/dashboard',
  adminNews: '/admin/news',
  adminEvents: '/admin/events',
  adminNewsStats: '/admin/news/stats',
  adminAreas: '/admin/areas',
  adminHistory: '/admin/history',
  adminCitizenAttention: '/admin/citizen-attention',
  adminCitizenInquiries: '/admin/citizen-inquiries',
  adminServices: '/admin/services',
  adminTourismPlaces: '/admin/tourism-places',
  adminOfertaAcademica: '/admin/oferta-academica',
  adminNewsCreate: '/admin/news/create',
  adminNewsEdit: (id) => `/admin/news/edit/${id}`,
  adminUsers: '/admin/settings/users',
  adminSettings: '/admin/settings',
  adminSettingsCategories: '/admin/settings/categories',
  adminSettingsHomeBanners: '/admin/settings/home-banners',
  adminSettingsHomeMap: '/admin/settings/home-map',
  adminSettingsIntendencia: '/admin/settings/intendencia',
  adminSettingsLegisladorEste: '/admin/settings/legislador-este',
  adminSettingsConcejoDeliberante: '/admin/settings/concejo-deliberante',
  adminMyAreaServices: '/admin/my-area-services',
  adminAreaServiceEditor: (areaSlug, serviceId) =>
    `/admin/area-services/${areaSlug}/${serviceId}`,
}

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/municipalidaddetrancas/',
  facebook: 'https://www.facebook.com/profile.php?id=100050317032987',
  youtube: 'https://www.youtube.com/@canal6municipal-trancas888',
}

/** WhatsApp institucional (+54 9 3816 396406). */
export const MUNICIPAL_WHATSAPP = {
  phone: '5493816396406',
  display: '+54 9 3816 396406',
}
