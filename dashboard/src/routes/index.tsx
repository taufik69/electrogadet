import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"

const ProductsPage = lazy(() => import("@/features/product").then((m) => ({ default: m.ProductsPage })))
const CreateProductPage = lazy(() => import("@/features/product").then((m) => ({ default: m.CreateProductPage })))
const EditProductPage = lazy(() => import("@/features/product").then((m) => ({ default: m.EditProductPage })))
const ViewProductPage = lazy(() => import("@/features/product").then((m) => ({ default: m.ViewProductPage })))

const BrandsPage = lazy(() => import("@/features/brand").then((m) => ({ default: m.BrandsPage })))
const CreateBrandPage = lazy(() => import("@/features/brand").then((m) => ({ default: m.CreateBrandPage })))
const EditBrandPage = lazy(() => import("@/features/brand").then((m) => ({ default: m.EditBrandPage })))

const CategoriesPage = lazy(() => import("@/features/category").then((m) => ({ default: m.CategoriesPage })))
const CreateCategoryPage = lazy(() =>
  import("@/features/category").then((m) => ({ default: m.CreateCategoryPage })),
)
const EditCategoryPage = lazy(() => import("@/features/category").then((m) => ({ default: m.EditCategoryPage })))

const BannersPage = lazy(() => import("@/features/banner").then((m) => ({ default: m.BannersPage })))
const CreateBannerPage = lazy(() => import("@/features/banner").then((m) => ({ default: m.CreateBannerPage })))
const EditBannerPage = lazy(() => import("@/features/banner").then((m) => ({ default: m.EditBannerPage })))

const ArticlesPage = lazy(() => import("@/features/article").then((m) => ({ default: m.ArticlesPage })))
const CreateArticlePage = lazy(() =>
  import("@/features/article").then((m) => ({ default: m.CreateArticlePage })),
)
const EditArticlePage = lazy(() => import("@/features/article").then((m) => ({ default: m.EditArticlePage })))

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
          <Route path="/products/new" element={<CreateProductPage />} />
          <Route path="/products/:id" element={<ViewProductPage />} />
          <Route path="/products/:id/edit" element={<EditProductPage />} />

          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/brands/new" element={<CreateBrandPage />} />
          <Route path="/brands/:id/edit" element={<EditBrandPage />} />

          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/new" element={<CreateCategoryPage />} />
          <Route path="/categories/:id/edit" element={<EditCategoryPage />} />

          <Route path="/banners" element={<BannersPage />} />
          <Route path="/banners/new" element={<CreateBannerPage />} />
          <Route path="/banners/:id/edit" element={<EditBannerPage />} />

          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/new" element={<CreateArticlePage />} />
          <Route path="/articles/:id/edit" element={<EditArticlePage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
