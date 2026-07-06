import { Navigate, Route, Routes } from "react-router"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AnnouncementsPage } from "@/features/announcements/AnnouncementsPage"
import { CreateAnnouncementPage } from "@/features/announcements/CreateAnnouncementPage"
import { EditAnnouncementPage } from "@/features/announcements/EditAnnouncementPage"
import { ViewAnnouncementPage } from "@/features/announcements/ViewAnnouncementPage"
import { CategoriesPage } from "@/features/categories/CategoriesPage"
import { CreateCategoryPage } from "@/features/categories/CreateCategoryPage"
import { EditCategoryPage } from "@/features/categories/EditCategoryPage"
import { ProductsPage } from "@/pages/Products"

function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/new" element={<CreateCategoryPage />} />
        <Route path="/categories/:id/edit" element={<EditCategoryPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/announcements/new" element={<CreateAnnouncementPage />} />
        <Route path="/announcements/:id" element={<ViewAnnouncementPage />} />
        <Route path="/announcements/:id/edit" element={<EditAnnouncementPage />} />
      </Route>
    </Routes>
  )
}

export default App
