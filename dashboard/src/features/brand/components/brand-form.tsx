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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { BRAND_ICON_KEYS } from "../types/brand.types"
import { resolveBrandIcon } from "../utils/brand-icons"
import type { Brand, CreateBrandInput, UpdateBrandInput } from "../types/brand.types"

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// slug is required only on create — the backend rejects it on update (spec
// §9.4: slug is immutable once created, part of the sidebar URL contract).
const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().regex(slugPattern, "Lowercase letters, numbers, and hyphens only"),
  iconKey: z.string().optional(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof createSchema>

interface BrandFormProps {
  brand?: Brand
  isPending: boolean
  onSubmit: (input: CreateBrandInput | UpdateBrandInput) => void
  onCancel: () => void
  submitLabel: string
}

export function BrandForm({ brand, isPending, onSubmit, onCancel, submitLabel }: BrandFormProps) {
  const isEditing = !!brand

  const form = useForm<FormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: brand
      ? { name: brand.name, slug: brand.slug, iconKey: brand.iconKey ?? undefined, isActive: brand.isActive }
      : { name: "", slug: "", iconKey: undefined, isActive: true },
  })

  function handleSubmit(values: FormValues) {
    if (isEditing) {
      onSubmit({ name: values.name, iconKey: values.iconKey, isActive: values.isActive })
    } else {
      onSubmit(values)
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
                <Input placeholder="Apple products" {...field} />
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
                <Input placeholder="apple" disabled={isEditing} {...field} />
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
          name="iconKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BRAND_ICON_KEYS.map((key) => {
                    const Icon = resolveBrandIcon(key)
                    return (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          {Icon && <Icon className="size-4" />}
                          {key}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <FormDescription>
                Only these brand marks are wired up on the storefront — an unlisted icon can&apos;t render there.
              </FormDescription>
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
