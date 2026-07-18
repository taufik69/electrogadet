import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  attachProductToCategory,
  createProduct,
  deleteProduct,
  detachProductFromCategory,
  fetchProductById,
  fetchProducts,
  updateProduct,
} from "../api/product.api"
import {
  deleteProductImage,
  fetchProductGallery,
  fetchProductThumbnail,
  uploadProductGalleryImage,
  uploadProductThumbnail,
} from "../api/product-image.api"
import type { CreateProductInput, UpdateProductInput } from "../types/product.types"

const PRODUCTS_KEY = ["products"] as const

export function useProducts(params?: { brandId?: string; includeInactive?: boolean }) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, "list", params?.brandId, params?.includeInactive ?? false],
    queryFn: () => fetchProducts({ brandId: params?.brandId, includeInactive: params?.includeInactive }),
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
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
 * No onSuccess invalidation — same reasoning as brand/category image uploads:
 * the worker processes uploads asynchronously, so the image isn't `uploaded`
 * by the time this resolves and refetching now would just show "pending" again.
 */
export function useUploadProductThumbnail() {
  return useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) => uploadProductThumbnail(productId, file),
  })
}

export function useUploadProductGalleryImage() {
  return useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) =>
      uploadProductGalleryImage(productId, file),
  })
}

export function useProductThumbnail(productId: string | undefined) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, productId, "thumbnail"],
    queryFn: () => fetchProductThumbnail(productId!),
    enabled: !!productId,
  })
}

export function useProductGallery(productId: string | undefined) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, productId, "gallery"],
    queryFn: () => fetchProductGallery(productId!),
    enabled: !!productId,
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
