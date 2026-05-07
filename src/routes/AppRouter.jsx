import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from '../components/layout/MainLayout.jsx'
import { AdminLayout } from '../components/layout/AdminLayout.jsx'
import { ProtectedRoute } from './ProtectedRoute.jsx'
import { Home } from '../pages/Home.jsx'
import { Services } from '../pages/Services.jsx'
import { AtencionCiudadano } from '../pages/AtencionCiudadano.jsx'
import { Login } from '../pages/admin/Login.jsx'
import { RequireAdminOutlet } from './RequireAdminOutlet.jsx'
import { NotFound } from '../pages/NotFound.jsx'
import { adminRouteLoaders } from './adminRoutePreload.js'
import { publicRouteLoaders } from './publicRoutePreload.js'

const Dashboard = lazy(adminRouteLoaders.dashboard)
const AdminNews = lazy(adminRouteLoaders.news)
const AdminEvents = lazy(adminRouteLoaders.events)
const AdminNewsStats = lazy(adminRouteLoaders.newsStats)
const AdminAreaProfiles = lazy(adminRouteLoaders.areas)
const AdminHistory = lazy(adminRouteLoaders.history)
const AdminCitizenAttention = lazy(adminRouteLoaders.citizenAttention)
const AdminTourismPlaces = lazy(adminRouteLoaders.tourismPlaces)
const CreateNews = lazy(adminRouteLoaders.createNews)
const EditNews = lazy(adminRouteLoaders.editNews)
const AdminSettingsLayout = lazy(adminRouteLoaders.settingsLayout)
const AdminSettingsHome = lazy(adminRouteLoaders.settingsHome)
const AdminCategories = lazy(adminRouteLoaders.settingsCategories)
const AdminSettingsHomeMap = lazy(adminRouteLoaders.settingsHomeMap)
const AdminIntendencia = lazy(adminRouteLoaders.settingsIntendencia)
const AdminLegisladorEste = lazy(adminRouteLoaders.settingsLegisladorEste)
const AdminConcejoDeliberante = lazy(adminRouteLoaders.settingsConcejoDeliberante)
const AdminOfertaAcademica = lazy(adminRouteLoaders.settingsOfertaAcademica)
const AdminUsers = lazy(adminRouteLoaders.settingsUsers)
const History = lazy(publicRouteLoaders.history)
const Events = lazy(publicRouteLoaders.events)
const TourismPlaceDetail = lazy(publicRouteLoaders.tourismPlaceDetail)
const AreasIndex = lazy(publicRouteLoaders.areasIndex)
const AreaDetail = lazy(publicRouteLoaders.areaDetail)
const Intendencia = lazy(publicRouteLoaders.governmentIntendencia)
const LegisladorEste = lazy(publicRouteLoaders.governmentLegisladorEste)
const ConcejoDeliberante = lazy(publicRouteLoaders.governmentConcejoDeliberante)
const OfertaAcademica = lazy(publicRouteLoaders.governmentOfertaAcademica)
const NewsList = lazy(publicRouteLoaders.newsList)
const NewsDetail = lazy(publicRouteLoaders.newsDetail)

function AdminRouteFallback() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
      Cargando sección...
    </div>
  )
}

function PublicRouteFallback() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-slate-600 sm:px-6">
      Cargando contenido...
    </div>
  )
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />

      <Route path="/admin" element={<ProtectedRoute />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route element={<AdminLayout />}>
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<AdminRouteFallback />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="news"
            element={
              <Suspense fallback={<AdminRouteFallback />}>
                <AdminNews />
              </Suspense>
            }
          />
          <Route
            path="events"
            element={
              <Suspense fallback={<AdminRouteFallback />}>
                <AdminEvents />
              </Suspense>
            }
          />
          <Route
            path="news/stats"
            element={
              <Suspense fallback={<AdminRouteFallback />}>
                <AdminNewsStats />
              </Suspense>
            }
          />
          <Route
            path="areas"
            element={
              <Suspense fallback={<AdminRouteFallback />}>
                <AdminAreaProfiles />
              </Suspense>
            }
          />
          <Route
            path="history"
            element={
              <Suspense fallback={<AdminRouteFallback />}>
                <AdminHistory />
              </Suspense>
            }
          />
          <Route
            path="citizen-attention"
            element={
              <Suspense fallback={<AdminRouteFallback />}>
                <AdminCitizenAttention />
              </Suspense>
            }
          />
          <Route
            path="tourism-places"
            element={
              <Suspense fallback={<AdminRouteFallback />}>
                <AdminTourismPlaces />
              </Suspense>
            }
          />
          <Route
            path="news/create"
            element={
              <Suspense fallback={<AdminRouteFallback />}>
                <CreateNews />
              </Suspense>
            }
          />
          <Route
            path="news/edit/:id"
            element={
              <Suspense fallback={<AdminRouteFallback />}>
                <EditNews />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<AdminRouteFallback />}>
                <AdminSettingsLayout />
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<AdminRouteFallback />}>
                  <AdminSettingsHome />
                </Suspense>
              }
            />
            <Route
              path="categories"
              element={
                <Suspense fallback={<AdminRouteFallback />}>
                  <AdminCategories />
                </Suspense>
              }
            />
            <Route
              path="home-map"
              element={
                <Suspense fallback={<AdminRouteFallback />}>
                  <AdminSettingsHomeMap />
                </Suspense>
              }
            />
            <Route
              path="intendencia"
              element={
                <Suspense fallback={<AdminRouteFallback />}>
                  <AdminIntendencia />
                </Suspense>
              }
            />
            <Route
              path="legislador-este"
              element={
                <Suspense fallback={<AdminRouteFallback />}>
                  <AdminLegisladorEste />
                </Suspense>
              }
            />
            <Route
              path="concejo-deliberante"
              element={
                <Suspense fallback={<AdminRouteFallback />}>
                  <AdminConcejoDeliberante />
                </Suspense>
              }
            />
            <Route
              path="oferta-academica"
              element={
                <Suspense fallback={<AdminRouteFallback />}>
                  <AdminOfertaAcademica />
                </Suspense>
              }
            />
            <Route path="history" element={<Navigate to="/admin/history" replace />} />
            <Route element={<RequireAdminOutlet />}>
              <Route
                path="users"
                element={
                  <Suspense fallback={<AdminRouteFallback />}>
                    <AdminUsers />
                  </Suspense>
                }
              />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/history"
          element={
            <Suspense fallback={<PublicRouteFallback />}>
              <History />
            </Suspense>
          }
        />
        <Route
          path="/history/lugares/:slug"
          element={
            <Suspense fallback={<PublicRouteFallback />}>
              <TourismPlaceDetail />
            </Suspense>
          }
        />
        <Route path="/about" element={<Navigate to="/history" replace />} />
        <Route path="/services" element={<Services />} />
        <Route
          path="/eventos"
          element={
            <Suspense fallback={<PublicRouteFallback />}>
              <Events />
            </Suspense>
          }
        />
        <Route
          path="/gobierno/intendencia"
          element={
            <Suspense fallback={<PublicRouteFallback />}>
              <Intendencia />
            </Suspense>
          }
        />
        <Route
          path="/gobierno/legislador-este"
          element={
            <Suspense fallback={<PublicRouteFallback />}>
              <LegisladorEste />
            </Suspense>
          }
        />
        <Route
          path="/gobierno/concejo-deliberante"
          element={
            <Suspense fallback={<PublicRouteFallback />}>
              <ConcejoDeliberante />
            </Suspense>
          }
        />
        <Route
          path="/gobierno/oferta-academica"
          element={
            <Suspense fallback={<PublicRouteFallback />}>
              <OfertaAcademica />
            </Suspense>
          }
        />
        <Route
          path="/areas"
          element={
            <Suspense fallback={<PublicRouteFallback />}>
              <AreasIndex />
            </Suspense>
          }
        />
        <Route
          path="/areas/:slug"
          element={
            <Suspense fallback={<PublicRouteFallback />}>
              <AreaDetail />
            </Suspense>
          }
        />
        <Route path="/atencion-ciudadano" element={<AtencionCiudadano />} />
        <Route path="/contact" element={<Navigate to="/atencion-ciudadano" replace />} />
        <Route
          path="/news"
          element={
            <Suspense fallback={<PublicRouteFallback />}>
              <NewsList />
            </Suspense>
          }
        />
        <Route
          path="/news/:id"
          element={
            <Suspense fallback={<PublicRouteFallback />}>
              <NewsDetail />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
