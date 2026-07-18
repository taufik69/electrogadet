import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"

const ProductsPage = lazy(() => import("@/pages/Products").then((m) => ({ default: m.ProductsPage })))

const BrandsPage = lazy(() => import("@/features/brand").then((m) => ({ default: m.BrandsPage })))
const CreateBrandPage = lazy(() => import("@/features/brand").then((m) => ({ default: m.CreateBrandPage })))
const EditBrandPage = lazy(() => import("@/features/brand").then((m) => ({ default: m.EditBrandPage })))

const CategoriesPage = lazy(() => import("@/features/category").then((m) => ({ default: m.CategoriesPage })))
const CreateCategoryPage = lazy(() =>
  import("@/features/category").then((m) => ({ default: m.CreateCategoryPage })),
)
const EditCategoryPage = lazy(() => import("@/features/category").then((m) => ({ default: m.EditCategoryPage })))

function RouteFallback() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/brands" replace />} />

          <Route path="/products" element={<ProductsPage />} />

          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/brands/new" element={<CreateBrandPage />} />
          <Route path="/brands/:id/edit" element={<EditBrandPage />} />

          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/new" element={<CreateCategoryPage />} />
          <Route path="/categories/:id/edit" element={<EditCategoryPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
