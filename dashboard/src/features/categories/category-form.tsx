import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { API_URL } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Category, CategoryInput } from "./types"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  sortOrder: z.number().int(),
  isClearance: z.boolean(),
  showInMegaMenu: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface CategoryFormProps {
  category?: Category
  parentId?: string
  isPending: boolean
  onSubmit: (input: CategoryInput) => void
  onCancel: () => void
  submitLabel: string
}

export function CategoryForm({ category, parentId, isPending, onSubmit, onCancel, submitLabel }: CategoryFormProps) {
  const isTopLevel = !parentId && !category?.parentId
  const [imageFile, setImageFile] = useState<File | undefined>(undefined)
  const [imagePreview, setImagePreview] = useState<string | null>(
    category?.imageUrl ? `${API_URL}${category.imageUrl}` : null,
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: category
      ? {
          name: category.name,
          slug: category.slug,
          sortOrder: category.sortOrder,
          isClearance: category.isClearance,
          showInMegaMenu: category.showInMegaMenu,
        }
      : { name: "", slug: "", sortOrder: 0, isClearance: false, showInMegaMenu: true },
  })

  const slugTouched = form.formState.dirtyFields.slug

  function handleNameChange(value: string, onChange: (value: string) => void) {
    onChange(value)
    if (!slugTouched && !category) {
      form.setValue("slug", slugify(value))
    }
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setImageFile(file)
    if (file) {
      setImagePreview(URL.createObjectURL(file))
    }
  }

  function handleSubmit(values: FormValues) {
    onSubmit({
      name: values.name,
      slug: values.slug,
      sortOrder: values.sortOrder,
      isClearance: isTopLevel ? values.isClearance : false,
      showInMegaMenu: isTopLevel ? values.showInMegaMenu : true,
      ...(parentId ? { parentId } : {}),
      ...(imageFile ? { image: imageFile } : {}),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-xl space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Computing"
                  {...field}
                  onChange={(event) => handleNameChange(event.target.value, field.onChange)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="computing" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sort order</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(event) => field.onChange(event.target.valueAsNumber || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isTopLevel && (
          <div className="space-y-2">
            <Label>Image</Label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-md border object-cover"
                />
              )}
              <Input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={handleImageChange} />
            </div>
            <p className="text-sm text-muted-foreground">
              Shown next to this category's heading in the storefront's mega navigation.
            </p>
          </div>
        )}
        {isTopLevel && (
          <>
            <FormField
              control={form.control}
              name="showInMegaMenu"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Show in mega menu</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Whether this category heads a column in the storefront's mega navigation.
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isClearance"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Clearance</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Marks this as the standalone "Clearance" link in the storefront nav. Only one category should
                      have this on at a time.
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        )}
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
