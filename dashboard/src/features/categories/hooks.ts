import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createCategory, deleteCategory, fetchCategories, fetchCategoryById, fetchCategoryTree, updateCategory } from "./api"
import type { CategoryInput } from "./types"

const CATEGORIES_KEY = ["categories"]
const CATEGORY_TREE_KEY = ["categories", "tree"]

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: fetchCategories,
  })
}

export function useCategoryTree() {
  return useQuery({
    queryKey: CATEGORY_TREE_KEY,
    queryFn: fetchCategoryTree,
  })
}

export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: [...CATEGORIES_KEY, id],
    queryFn: () => fetchCategoryById(id!),
    enabled: !!id,
  })
}

function useInvalidateCategories() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
    queryClient.invalidateQueries({ queryKey: CATEGORY_TREE_KEY })
  }
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: (input: CategoryInput) => createCategory(input),
    onSuccess: invalidate,
  })
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CategoryInput> }) => updateCategory(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: invalidate,
  })
}
