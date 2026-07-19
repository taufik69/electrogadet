import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, X } from "lucide-react"
import { useRef, useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { Brand, CreateBrandInput, UpdateBrandInput } from "../types/brand.types"

/** Red asterisk suffix for labels of fields the backend actually requires. */
function Required() {
  return <span className="text-destructive"> *</span>
}

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface BrandFormProps {
  brand?: Brand
  isPending: boolean
  /** File is handled separately from the JSON fields — see CreateBrandPage/EditBrandPage: the brand must exist before an image can be uploaded for it. */
  onSubmit: (input: CreateBrandInput | UpdateBrandInput, imageFile: File | null) => void
  onCancel: () => void
  submitLabel: string
}

export function BrandForm({ brand, isPending, onSubmit, onCancel, submitLabel }: BrandFormProps) {
  const isEditing = !!brand
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: brand
      ? { name: brand.name, description: brand.description ?? "", isActive: brand.isActive }
      : { name: "", description: "", isActive: true },
  })

  function setFile(file: File | null) {
    setImageFile(file)
    setImagePreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return file ? URL.createObjectURL(file) : null
    })
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
    onSubmit({ name: values.name, description: values.description || undefined, isActive: values.isActive }, imageFile)
  }

  const currentImageUrl = imagePreviewUrl ?? brand?.imageUrl ?? null

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-2xl space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name
                <Required />
              </FormLabel>
              <FormControl>
                <Input placeholder="Apple products" {...field} />
              </FormControl>
              <FormDescription>
                The storefront slug and URL are generated from this automatically.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Premium electronics from Apple." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          {/* Not a FormField — imageFile/imagePreviewUrl are plain useState, not
              react-hook-form fields, so shadcn's FormLabel (which requires a
              useFormField context from an enclosing FormField) doesn't apply
              here. A plain <label> avoids the "useFormField should be used
              within <FormField>" crash. */}
          <label className="text-sm font-medium leading-none">Brand Logo</label>

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
              "flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center transition-colors",
              isDragOver ? "border-foreground bg-accent" : "border-input hover:bg-accent/50",
            )}
          >
            {currentImageUrl ? (
              <div className="relative p-4">
                <img
                  src={currentImageUrl}
                  alt="Brand preview"
                  className="mx-auto size-24 rounded-md border object-cover"
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
                <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (Max: 5MB)</p>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <p className="text-xs text-muted-foreground">
            {isEditing
              ? "Uploading replaces the current image. Processing happens in the background — refresh in a moment to see it."
              : "Uploaded after the brand is created. Processing happens in the background."}
          </p>
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Inactive brands are hidden from the storefront sidebar entirely.
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
