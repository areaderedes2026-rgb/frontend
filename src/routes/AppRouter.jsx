import { Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from '../components/layout/MainLayout.jsx'
import { AdminLayout } from '../components/layout/AdminLayout.jsx'
import { ProtectedRoute } from './ProtectedRoute.jsx'
import { Home } from '../pages/Home.jsx'
import { History } from '../pages/History.jsx'
import { Services } from '../pages/Services.jsx'
import { AtencionCiudadano } from '../pages/AtencionCiudadano.jsx'
import { NewsList } from '../pages/news/NewsList.jsx'
import { NewsDetail } from '../pages/news/NewsDetail.jsx'
import { Login } from '../pages/admin/Login.jsx'
import { Dashboard } from '../pages/admin/Dashboard.jsx'
import { AdminNews } from '../pages/admin/AdminNews.jsx'
import { CreateNews } from '../pages/admin/CreateNews.jsx'
import { EditNews } from '../pages/admin/EditNews.jsx'
import { AdminUsers } from '../pages/admin/AdminUsers.jsx'
import { AdminSettingsLayout } from '../pages/admin/AdminSettingsLayout.jsx'
import { AdminSettingsHome } from '../pages/admin/AdminSettingsHome.jsx'
import { AdminCategories } from '../pages/admin/AdminCategories.jsx'
import { AdminSettingsHomeMap } from '../pages/admin/AdminSettingsHomeMap.jsx'
import { AdminHistory } from '../pages/admin/AdminHistory.jsx'
import { AdminTourismPlaces } from '../pages/admin/AdminTourismPlaces.jsx'
import { AdminAreaProfiles } from '../pages/admin/AdminAreaProfiles.jsx'
import { AdminCitizenAttention } from '../pages/admin/AdminCitizenAttention.jsx'
import { RequireAdminOutlet } from './RequireAdminOutlet.jsx'
import { NotFound } from '../pages/NotFound.jsx'
import { AreasIndex } from '../pages/areas/AreasIndex.jsx'
import { AreaDetail } from '../pages/areas/AreaDetail.jsx'
import { TourismPlaceDetail } from '../pages/history/TourismPlaceDetail.jsx'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />

      <Route path="/admin" element={<ProtectedRoute />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="news" element={<AdminNews />} />
          <Route path="areas" element={<AdminAreaProfiles />} />
          <Route path="history" element={<AdminHistory />} />
          <Route path="citizen-attention" element={<AdminCitizenAttention />} />
          <Route path="tourism-places" element={<AdminTourismPlaces />} />
          <Route path="news/create" element={<CreateNews />} />
          <Route path="news/edit/:id" element={<EditNews />} />
          <Route path="settings" element={<AdminSettingsLayout />}>
            <Route index element={<AdminSettingsHome />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="home-map" element={<AdminSettingsHomeMap />} />
            <Route path="history" element={<Navigate to="/admin/history" replace />} />
            <Route element={<RequireAdminOutlet />}>
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/history/lugares/:slug" element={<TourismPlaceDetail />} />
        <Route path="/about" element={<Navigate to="/history" replace />} />
        <Route path="/services" element={<Services />} />
        <Route path="/areas" element={<AreasIndex />} />
        <Route path="/areas/:slug" element={<AreaDetail />} />
        <Route path="/atencion-ciudadano" element={<AtencionCiudadano />} />
        <Route path="/contact" element={<Navigate to="/atencion-ciudadano" replace />} />
        <Route path="/news" element={<NewsList />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
