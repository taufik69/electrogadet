import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, X } from "lucide-react"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { useBrands } from "@/features/brand"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "../types/category.types"

const schema = z.object({
  brandId: z.string().min(1, "Please select a brand"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface CategoryFormProps {
  category?: Category
  isPending: boolean
  onSubmit: (input: CreateCategoryInput | UpdateCategoryInput, imageFile: File | null) => void
  onCancel: () => void
  submitLabel: string
}

export function CategoryForm({ category, isPending, onSubmit, onCancel, submitLabel }: CategoryFormProps) {
  const isEditing = !!category
  const { data: brandsData, isLoading: brandsLoading } = useBrands({ includeInactive: true })
  const brands = brandsData?.data

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: category
      ? {
          brandId: category.brandId,
          name: category.name,
          description: category.description ?? "",
          isActive: category.isActive,
        }
      : {
          brandId: "",
          name: "",
          description: "",
          isActive: true,
        },
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
    if (isEditing) {
      onSubmit({ name: values.name, description: values.description || undefined, isActive: values.isActive }, imageFile)
    } else {
      onSubmit(
        {
          brandId: values.brandId,
          name: values.name,
          description: values.description || undefined,
          isActive: values.isActive,
        },
        imageFile,
      )
    }
  }

  const currentImageUrl = imagePreviewUrl ?? category?.imageUrl ?? null

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full space-y-4">
        <FormField
          control={form.control}
          name="brandId"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Brand</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isEditing || brandsLoading}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={brandsLoading ? "Loading..." : "Select a brand"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {brands?.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isEditing && (
                <FormDescription>
                  Brand can&apos;t be changed after creation — move this category by recreating it under a different brand.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input className="w-full" placeholder="Apple iPad" {...field} />
              </FormControl>
              <FormDescription>
                The storefront slug and URL are generated from this automatically.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="w-full space-y-2">
          {/* Not a FormField — imageFile/imagePreviewUrl are plain useState, not
              react-hook-form fields, so shadcn's FormLabel (which requires a
              useFormField context from an enclosing FormField) doesn't apply
              here. A plain <label> avoids the "useFormField should be used
              within <FormField>" crash. */}
          <label className="text-sm font-medium leading-none">Category Image</label>

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
              <div className="relative p-4">
                <img
                  src={currentImageUrl}
                  alt="Category preview"
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
              : "Uploaded after the category is created. Processing happens in the background."}
          </p>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea className="w-full" placeholder="Tablets and accessories." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex w-full flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Inactive categories are hidden from the storefront sidebar entirely.
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
