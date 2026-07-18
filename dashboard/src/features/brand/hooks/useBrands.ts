import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createBrand, deleteBrand, fetchBrandById, fetchBrands, updateBrand } from "../api/brand.api"
import { uploadBrandImage } from "../api/brand-image.api"
import type { CreateBrandInput, UpdateBrandInput } from "../types/brand.types"

const BRANDS_KEY = ["brands"] as const

export function useBrands(params?: { includeInactive?: boolean }) {
  return useQuery({
    queryKey: [...BRANDS_KEY, "list", params?.includeInactive ?? false],
    queryFn: () => fetchBrands({ includeInactive: params?.includeInactive }),
  })
}

export function useBrand(id: string | undefined) {
  return useQuery({
    queryKey: [...BRANDS_KEY, id],
    queryFn: () => fetchBrandById(id!),
    enabled: !!id,
  })
}

export function useCreateBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateBrandInput) => createBrand(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANDS_KEY })
    },
  })
}

export function useUpdateBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBrandInput }) => updateBrand(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANDS_KEY })
    },
  })
}

export function useDeleteBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANDS_KEY })
    },
  })
}

/**
 * No onSuccess invalidation here: the upload is processed asynchronously by
 * the backend worker, so Brand.imageUrl isn't populated yet by the time this
 * resolves (it only confirms the job was queued) — invalidating now would
 * just refetch the same "no image yet" state. See brand-image.api.ts.
 */
export function useUploadBrandImage() {
  return useMutation({
    mutationFn: ({ brandId, file }: { brandId: string; file: File }) => uploadBrandImage(brandId, file),
  })
}
