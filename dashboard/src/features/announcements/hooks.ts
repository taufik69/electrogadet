import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createAnnouncement,
  deleteAnnouncement,
  fetchAnnouncementById,
  fetchAnnouncements,
  updateAnnouncement,
} from "./api"
import type { AnnouncementInput } from "./types"

const ANNOUNCEMENTS_KEY = ["announcements"]

export function useAnnouncements() {
  return useQuery({
    queryKey: ANNOUNCEMENTS_KEY,
    queryFn: fetchAnnouncements,
  })
}

export function useAnnouncement(id: string | undefined) {
  return useQuery({
    queryKey: [...ANNOUNCEMENTS_KEY, id],
    queryFn: () => fetchAnnouncementById(id!),
    enabled: !!id,
  })
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AnnouncementInput) => createAnnouncement(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_KEY })
    },
  })
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<AnnouncementInput> }) =>
      updateAnnouncement(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_KEY })
    },
  })
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_KEY })
    },
  })
}
