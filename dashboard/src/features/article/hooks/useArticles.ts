import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"

import { getApiErrorMessage } from "@/lib/api-error"
import {
  createArticle,
  deleteArticle,
  fetchArticleById,
  fetchArticles,
  updateArticle,
  upsertArticleSeo,
} from "../api/article.api"
import { uploadArticleCover } from "../api/article-image.api"
import type {
  Article,
  ArticleStatus,
  CreateArticleInput,
  UpdateArticleInput,
  UpsertArticleSeoInput,
} from "../types/article.types"

const ARTICLES_KEY = ["articles"] as const

/** True while the cover is still in the worker queue — drives the polling below. */
function isCoverPending(cover: Article["coverImage"]) {
  return cover?.status === "pending" || cover?.status === "processing"
}

/**
 * Toasts live in the hooks rather than the pages: every caller then gets
 * consistent feedback, and "this page forgot to show a toast" stops being a
 * possible bug (spec §7.5).
 */
function toastError(err: unknown) {
  toast.error(getApiErrorMessage(err))
}

/**
 * Polls every 1.5s while any article's cover is still pending/processing so the
 * uploaded image appears without a manual refresh — uploads resolve in a
 * separate worker process, so nothing else would ever refetch this (spec §7.4).
 */
export function useArticles(params?: { status?: ArticleStatus }) {
  return useQuery({
    queryKey: [...ARTICLES_KEY, "list", params?.status ?? "all"],
    queryFn: () => fetchArticles({ status: params?.status }),
    refetchInterval: (query) =>
      query.state.data?.data.some((article) => isCoverPending(article.coverImage)) ? 1500 : false,
  })
}

export function useArticle(id: string | undefined) {
  return useQuery({
    queryKey: [...ARTICLES_KEY, id],
    queryFn: () => fetchArticleById(id!),
    enabled: !!id,
    refetchInterval: (query) => (isCoverPending(query.state.data?.coverImage ?? null) ? 1500 : false),
  })
}

export function useCreateArticle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateArticleInput) => createArticle(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARTICLES_KEY })
      toast.success("Article created")
    },
    onError: toastError,
  })
}

export function useUpdateArticle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateArticleInput }) => updateArticle(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARTICLES_KEY })
      toast.success("Article updated")
    },
    onError: toastError,
  })
}

export function useDeleteArticle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARTICLES_KEY })
      toast.success("Article deleted")
    },
    onError: toastError,
  })
}

export function useUpsertArticleSeo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpsertArticleSeoInput }) => upsertArticleSeo(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARTICLES_KEY })
      toast.success("SEO settings saved")
    },
    onError: toastError,
  })
}

/**
 * Invalidates on success so a mounted view picks up the new `pending` row
 * immediately — the queries above then poll until the worker settles it.
 *
 * No success toast on purpose: this resolves as soon as the row is queued,
 * before Cloudinary has been contacted, so there is nothing truthful to
 * announce yet. The cover thumbnail's own pending/uploaded state is the
 * progress indicator. Failures still surface via `toastError`.
 */
export function useUploadArticleCover() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ articleId, file }: { articleId: string; file: File }) => uploadArticleCover(articleId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARTICLES_KEY })
    },
    onError: toastError,
  })
}
