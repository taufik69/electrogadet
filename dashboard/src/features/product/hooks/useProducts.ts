import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  attachProductToCategory,
  createProduct,
  deleteProduct,
  detachProductFromCategory,
  fetchProductById,
  fetchProducts,
  updateProduct,
  upsertProductSeo,
} from "../api/product.api"
import { deleteProductImage, uploadProductGalleryImage, uploadProductThumbnail } from "../api/product-image.api"
import type { CreateProductInput, Product, UpdateProductInput, UpsertProductSeoInput } from "../types/product.types"

const PRODUCTS_KEY = ["products"] as const

/** True while the product's thumbnail or any gallery image is still in the worker queue. */
function hasPendingImages(product: Product | undefined) {
  const images = [product?.thumbnail, ...(product?.gallery ?? [])].filter((img) => img != null)
  return images.some((img) => img.status === "pending" || img.status === "processing")
}

export function useProducts(params?: { brandId?: string; includeInactive?: boolean }) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, "list", params?.brandId, params?.includeInactive ?? false],
    queryFn: () => fetchProducts({ brandId: params?.brandId, includeInactive: params?.includeInactive }),
  })
}

/**
 * Polls every 1.5s while the product's thumbnail/gallery has an image still
 * pending/processing, so a mounted view picks up the worker's Cloudinary
 * upload without a manual refresh — uploads resolve fully in the background
 * (see useUploadProductThumbnail), so nothing else would ever refetch this.
 */
export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
    refetchInterval: (query) => (hasPendingImages(query.state.data) ? 1500 : false),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductInput }) => updateProduct(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY })
    },
  })
}

export function useUpsertProductSeo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, input }: { productId: string; input: UpsertProductSeoInput }) =>
      upsertProductSeo(productId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY })
    },
  })
}

export function useAttachProductCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, productId }: { categoryId: string; productId: string }) =>
      attachProductToCategory(categoryId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY })
    },
  })
}

export function useDetachProductCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, productId }: { categoryId: string; productId: string }) =>
      detachProductFromCategory(categoryId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY })
    },
  })
}

/**
 * Invalidates the product detail query on success so a mounted view picks up
 * the new `pending` row immediately — useProduct then polls (see above) until
 * the worker flips it to `uploaded` (or `failed`).
 */
export function useUploadProductThumbnail() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) => uploadProductThumbnail(productId, file),
    onSuccess: (_data, { productId }) => {
      queryClient.invalidateQueries({ queryKey: [...PRODUCTS_KEY, productId] })
    },
  })
}

export function useUploadProductGalleryImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) =>
      uploadProductGalleryImage(productId, file),
    onSuccess: (_data, { productId }) => {
      queryClient.invalidateQueries({ queryKey: [...PRODUCTS_KEY, productId] })
    },
  })
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (imageId: string) => deleteProductImage(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY })
    },
  })
}
