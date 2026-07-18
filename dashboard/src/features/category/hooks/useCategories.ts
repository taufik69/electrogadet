import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createCategory, deleteCategory, fetchCategories, fetchCategoryById, updateCategory } from "../api/category.api"
import type { CreateCategoryInput, UpdateCategoryInput } from "../types/category.types"

const CATEGORIES_KEY = ["categories"] as const

export function useCategories(brandId: string | undefined, params?: { includeInactive?: boolean }) {
  return useQuery({
    queryKey: [...CATEGORIES_KEY, "list", brandId, params?.includeInactive ?? false],
    queryFn: () => fetchCategories({ brandId: brandId!, includeInactive: params?.includeInactive }),
    enabled: !!brandId,
  })
}

export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: [...CATEGORIES_KEY, id],
    queryFn: () => fetchCategoryById(id!),
    enabled: !!id,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) => updateCategory(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
    },
  })
}
