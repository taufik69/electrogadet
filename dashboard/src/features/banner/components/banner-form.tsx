import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { Banner, CreateBannerInput, UpdateBannerInput } from "../types/banner.types"

// Caps mirror the backend's zod schema (banner.validation.ts) — they're
// display-driven: the overlay sits in a fixed 4/3 card over the image.
const schema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Max 120 characters"),
  description: z.string().min(1, "Description is required").max(200, "Max 200 characters"),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

/** Red asterisk suffix for labels of required fields. */
function Required() {
  return <span className="text-destructive"> *</span>
}

export interface BannerFormSubmitValues {
  input: CreateBannerInput | UpdateBannerInput
  imageFile: File | null
}

interface BannerFormProps {
  banner?: Banner
  isPending: boolean
  onSubmit: (values: BannerFormSubmitValues) => void
  onCancel: () => void
  submitLabel: string
  /** Bump this after a successful create to blank the form for the next entry. */
  resetSignal?: number
}

export function BannerForm({ banner, isPending, onSubmit, onCancel, submitLabel, resetSignal }: BannerFormProps) {
  const isEditing = !!banner
  const hasExistingImage = banner?.image != null

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: banner
      ? { title: banner.title, description: banner.description, isActive: banner.isActive }
      : { title: "", description: "", isActive: true },
  })

  useEffect(() => {
    if (resetSignal === undefined) return
    form.reset()
    setFile(null)
    setImageError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal])

  function setFile(file: File | null) {
    setImageFile(file)
    setImagePreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return file ? URL.createObjectURL(file) : null
    })
    if (file) setImageError(null)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file?.type.startsWith("image/")) setFile(file)
  }

  function clearFile(e: React.MouseEvent) {
    e.stopPropagation()
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handleSubmit(values: FormValues) {
    // The image isn't an RHF field, so its required check can't live in the
    // zod schema — gate the submit here instead (spec §7.3).
    if (!imageFile && !hasExistingImage) {
      setImageError("Image is required")
      return
    }

    onSubmit({
      input: { title: values.title, description: values.description, isActive: values.isActive },
      imageFile,
    })
  }

  // An uploaded-but-not-yet-replaced image still shows the existing one.
  const currentImageUrl =
    imagePreviewUrl ?? (banner?.image?.status === "uploaded" ? banner.image.url : null)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="mb-2">
                Title
                <Required />
              </FormLabel>
              <FormControl>
                {/* Textarea, not Input: the storefront renders the title with
                    `whitespace-pre-line`, so a newline is a meaningful line
                    break in the carousel overlay (spec §1.2). */}
                <Textarea
                  className="w-full rounded-lg"
                  placeholder={"Premium sound,\nengineered for calm."}
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormDescription>Line breaks are preserved in the carousel. Max 120 characters.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="mb-2">
                Description
                <Required />
              </FormLabel>
              <FormControl>
                <Textarea
                  className="w-full rounded-lg"
                  placeholder="Precision audio built to last."
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormDescription>Shown under the title. Max 200 characters.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="w-full space-y-2">
          {/* Plain <label>, not FormLabel — imageFile/previewUrl are useState,
              not react-hook-form fields, so there's no useFormField context. */}
          <label className="mb-2 block text-sm font-medium leading-none">
            Banner Image
            <Required />
          </label>

          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              "flex min-h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center transition-colors",
              isDragOver ? "border-foreground bg-accent" : "border-input hover:bg-accent/50",
            )}
          >
            {currentImageUrl ? (
              <div className="relative w-full p-4">
                <img
                  src={currentImageUrl}
                  alt="Banner preview"
                  className="mx-auto aspect-[4/3] max-h-48 rounded-md border object-cover"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 size-6"
                  onClick={clearFile}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex size-10 items-center justify-center rounded-full bg-accent">
                  <Plus className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">PNG, JPG or WEBP — recommended 1200×900 (4:3)</p>
              </>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

          {imageError && <p className="text-sm font-medium text-destructive">{imageError}</p>}

          <p className="text-xs text-muted-foreground">
            {isEditing
              ? "A banner holds one image — uploading a new one replaces it. Processing happens in the background."
              : "Uploaded after the banner is created. Processing happens in the background."}
          </p>
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex w-full flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Inactive banners are hidden from the storefront carousel entirely.
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2">
          <Button type="submit" className="h-12 w-full rounded-lg text-base" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? "Saving..." : submitLabel}
          </Button>
          <Button type="button" variant="outline" className="h-11 w-full rounded-lg" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
