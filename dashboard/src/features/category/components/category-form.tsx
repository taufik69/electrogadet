import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "../types/category.types"

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().regex(slugPattern, "Lowercase letters, numbers, and hyphens only"),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface CategoryFormProps {
  category?: Category
  /** Required on create — a category always belongs to the brand the admin is currently browsing. */
  brandId?: string
  isPending: boolean
  onSubmit: (input: CreateCategoryInput | UpdateCategoryInput) => void
  onCancel: () => void
  submitLabel: string
}

export function CategoryForm({ category, brandId, isPending, onSubmit, onCancel, submitLabel }: CategoryFormProps) {
  const isEditing = !!category

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: category
      ? { name: category.name, slug: category.slug, isActive: category.isActive }
      : { name: "", slug: "", isActive: true },
  })

  function handleSubmit(values: FormValues) {
    if (isEditing) {
      onSubmit({ name: values.name, isActive: values.isActive })
    } else {
      onSubmit({ ...values, brandId: brandId! })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-2xl space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Apple iPad" {...field} />
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
                <Input placeholder="ipad" disabled={isEditing} {...field} />
              </FormControl>
              {isEditing && (
                <FormDescription>
                  Slug can&apos;t be changed after creation — it&apos;s part of the storefront URL.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
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
