import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { useBrands } from "@/features/brand"
import { useCategories } from "@/features/category"

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
import type { CreateProductInput, Product, UpdateProductInput } from "../types/product.types"

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const availabilityStatusSchema = z.enum(["in_stock", "out_of_stock", "preorder"])

const schema = z.object({
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().regex(slugPattern, "Lowercase letters, numbers and hyphens only"),
  description: z.string().optional(),
  priceCents: z
    .string()
    .min(1, "Price is required")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, "Price must be a whole number, 0 or more"),
  compareAtCents: z
    .string()
    .optional()
    .refine((v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 0), "Must be a whole number, 0 or more"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  stock: z
    .string()
    .min(1, "Stock is required")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, "Stock must be a whole number, 0 or more"),
  availabilityStatus: availabilityStatusSchema,
  warrantyInformation: z.string().optional(),
  shippingInformation: z.string().optional(),
  manufactureCountry: z.string().optional(),
  tags: z.string().optional(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export interface ProductFormSubmitValues {
  input: CreateProductInput | UpdateProductInput
  categoryId: string | undefined
  thumbnailFile: File | null
}

interface ProductFormProps {
  product?: Product
  isPending: boolean
  onSubmit: (values: ProductFormSubmitValues) => void
  onCancel: () => void
  submitLabel: string
}

export function ProductForm({ product, isPending, onSubmit, onCancel, submitLabel }: ProductFormProps) {
  const isEditing = !!product
  const existingCategory = product?.categories?.[0]?.category

  const { data: brandsData, isLoading: brandsLoading } = useBrands({ includeInactive: true })
  const brands = brandsData?.data

  const [selectedBrandId, setSelectedBrandId] = useState<string | undefined>(
    product?.brandId ?? existingCategory?.brandId ?? undefined,
  )
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories(selectedBrandId, {
    includeInactive: true,
  })
  const categories = categoriesData?.data

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          brandId: product.brandId ?? "",
          categoryId: existingCategory?.id ?? "",
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          priceCents: String(product.priceCents),
          compareAtCents: product.compareAtCents != null ? String(product.compareAtCents) : "",
          sku: product.sku ?? "",
          barcode: product.barcode ?? "",
          stock: String(product.stock),
          availabilityStatus: product.availabilityStatus,
          warrantyInformation: product.warrantyInformation ?? "",
          shippingInformation: product.shippingInformation ?? "",
          manufactureCountry: product.manufactureCountry ?? "",
          tags: product.tags.join(", "),
          isActive: product.isActive,
        }
      : {
          brandId: "",
          categoryId: "",
          name: "",
          slug: "",
          description: "",
          priceCents: "",
          compareAtCents: "",
          sku: "",
          barcode: "",
          stock: "",
          availabilityStatus: "in_stock",
          warrantyInformation: "",
          shippingInformation: "",
          manufactureCountry: "",
          tags: "",
          isActive: true,
        },
  })

  function handleBrandChange(value: string) {
    setSelectedBrandId(value)
    form.setValue("brandId", value)
    // Categories belong to exactly one brand — switching brand invalidates
    // whatever category was previously chosen.
    form.setValue("categoryId", "")
  }

  useEffect(() => {
    // If categories finish loading and the previously-selected category
    // isn't among them (e.g. edit page loaded before brand resolved), clear it.
    if (!categoriesLoading && categories && form.getValues("categoryId")) {
      const stillValid = categories.some((c) => c.id === form.getValues("categoryId"))
      if (!stillValid) form.setValue("categoryId", "")
    }
  }, [categoriesLoading, categories, form])

  function setFile(file: File | null) {
    setThumbnailFile(file)
    setThumbnailPreviewUrl((previous) => {
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
    const tags = values.tags
      ? values.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : []

    const shared = {
      name: values.name,
      description: values.description || undefined,
      priceCents: Number(values.priceCents),
      compareAtCents: values.compareAtCents ? Number(values.compareAtCents) : undefined,
      sku: values.sku || undefined,
      barcode: values.barcode || undefined,
      stock: Number(values.stock),
      availabilityStatus: values.availabilityStatus,
      warrantyInformation: values.warrantyInformation || undefined,
      shippingInformation: values.shippingInformation || undefined,
      manufactureCountry: values.manufactureCountry || undefined,
      tags,
      isActive: values.isActive,
      brandId: values.brandId || undefined,
    }

    if (isEditing) {
      onSubmit({ input: shared, categoryId: values.categoryId || undefined, thumbnailFile })
    } else {
      onSubmit({
        input: { ...shared, slug: values.slug },
        categoryId: values.categoryId || undefined,
        thumbnailFile,
      })
    }
  }

  const currentThumbnailUrl = thumbnailPreviewUrl ?? null

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full space-y-4">
        <div className="grid w-full gap-4 sm:grid-cols-2">
          <div className="w-full space-y-2">
            {/* Plain <label>, not FormLabel/FormItem — brand selection drives
                selectedBrandId (plain useState), not an RHF-registered field,
                so there's no enclosing <FormField> to supply useFormField's
                context (same reasoning as the thumbnail upload block below). */}
            <label className="text-sm font-medium leading-none">Brand</label>
            <Select value={selectedBrandId} onValueChange={handleBrandChange} disabled={brandsLoading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={brandsLoading ? "Loading..." : "Select a brand"} />
              </SelectTrigger>
              <SelectContent>
                {brands?.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Choosing a brand loads its categories below.</p>
          </div>

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedBrandId || categoriesLoading}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          !selectedBrandId
                            ? "Select a brand first"
                            : categoriesLoading
                              ? "Loading..."
                              : "Select a category"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Only categories under the selected brand are shown.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input className="w-full" placeholder="iPad Pro 13&quot; M5 (2025)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input className="w-full" placeholder="ipad-pro-13-m5-2025" disabled={isEditing} {...field} />
              </FormControl>
              <FormDescription>
                {isEditing
                  ? "Slug can't be changed after creation — it's part of the storefront URL."
                  : "Used in the storefront URL /products/<slug>. Lowercase, hyphen-separated."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="w-full space-y-2">
          {/* Plain <label>, not FormLabel — thumbnailFile/previewUrl are
              useState, not react-hook-form fields (same reasoning as
              category-form.tsx's image block). */}
          <label className="text-sm font-medium leading-none">Product Thumbnail</label>

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
            {currentThumbnailUrl ? (
              <div className="relative p-4">
                <img
                  src={currentThumbnailUrl}
                  alt="Product thumbnail preview"
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

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

          <p className="text-xs text-muted-foreground">
            {isEditing
              ? "Uploading replaces the current thumbnail. Processing happens in the background — refresh in a moment to see it."
              : "Uploaded after the product is created. Processing happens in the background."}
          </p>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea className="w-full" placeholder="Product description" rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid w-full gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="priceCents"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Price (cents)</FormLabel>
                <FormControl>
                  <Input className="w-full" type="number" min={0} placeholder="99900" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="compareAtCents"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Compare-at price (cents)</FormLabel>
                <FormControl>
                  <Input className="w-full" type="number" min={0} placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input className="w-full" type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="availabilityStatus"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Availability</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="in_stock">In stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of stock</SelectItem>
                    <SelectItem value="preorder">Preorder</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input className="w-full" placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Barcode</FormLabel>
                <FormControl>
                  <Input className="w-full" placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="manufactureCountry"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Manufacture country</FormLabel>
                <FormControl>
                  <Input className="w-full" placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input className="w-full" placeholder="wireless, noise-cancelling" {...field} />
                </FormControl>
                <FormDescription>Comma-separated.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="warrantyInformation"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Warranty information</FormLabel>
              <FormControl>
                <Input className="w-full" placeholder="Optional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shippingInformation"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Shipping information</FormLabel>
              <FormControl>
                <Input className="w-full" placeholder="Optional" {...field} />
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
                  Inactive products are hidden from the storefront entirely.
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
