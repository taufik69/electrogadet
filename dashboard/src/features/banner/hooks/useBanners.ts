import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createBanner, deleteBanner, fetchBannerById, fetchBanners, updateBanner } from "../api/banner.api"
import { deleteBannerImage, uploadBannerImage } from "../api/banner-image.api"
import type { Banner, CreateBannerInput, UpdateBannerInput } from "../types/banner.types"

const BANNERS_KEY = ["banners"] as const

/** True while an image is still in the worker queue — drives the polling below. */
function isImagePending(image: Banner["image"]) {
  return image?.status === "pending" || image?.status === "processing"
}

/**
 * Polls every 1.5s while any banner's image is still pending/processing so the
 * uploaded image appears without a manual refresh — uploads resolve in the
 * background worker, so nothing else would ever refetch this (spec §7.4).
 */
export function useBanners(params?: { includeInactive?: boolean }) {
  return useQuery({
    queryKey: [...BANNERS_KEY, "list", params?.includeInactive ?? false],
    queryFn: () => fetchBanners({ includeInactive: params?.includeInactive }),
    refetchInterval: (query) =>
      query.state.data?.data.some((banner) => isImagePending(banner.image)) ? 1500 : false,
  })
}

export function useBanner(id: string | undefined) {
  return useQuery({
    queryKey: [...BANNERS_KEY, id],
    queryFn: () => fetchBannerById(id!),
    enabled: !!id,
    refetchInterval: (query) => (isImagePending(query.state.data?.image ?? null) ? 1500 : false),
  })
}

export function useCreateBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateBannerInput) => createBanner(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNERS_KEY })
    },
  })
}

export function useUpdateBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBannerInput }) => updateBanner(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNERS_KEY })
    },
  })
}

export function useDeleteBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNERS_KEY })
    },
  })
}

/**
 * Invalidates on success so a mounted view picks up the new `pending` row
 * immediately — the queries above then poll until the worker settles it.
 */
export function useUploadBannerImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bannerId, file }: { bannerId: string; file: File }) => uploadBannerImage(bannerId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNERS_KEY })
    },
  })
}

export function useDeleteBannerImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (imageId: string) => deleteBannerImage(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNERS_KEY })
    },
  })
}
