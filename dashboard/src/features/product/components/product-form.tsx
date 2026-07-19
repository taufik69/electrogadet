import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus, X } from "lucide-react"
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

const availabilityStatusSchema = z.enum(["in_stock", "out_of_stock", "preorder"])

const schema = z.object({
  brandId: z.string().optional(),
  categoryId: z.string().min(1, "Please select a category"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  priceCents: z
    .string()
    .min(1, "Price is required")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, "Price must be a whole number, 0 or more"),
  sku: z.string().optional(),
  barcode: z.string().min(1, "Barcode is required"),
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
  metaTitle: z.string().min(1, "Meta title is required").max(70, "Max 70 characters"),
  metaDescription: z.string().min(1, "Meta description is required").max(200, "Max 200 characters"),
  metaKeywords: z.string().optional(),
  ogTitle: z.string().max(70, "Max 70 characters").optional(),
  ogDescription: z.string().max(200, "Max 200 characters").optional(),
  canonicalUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

type FormValues = z.infer<typeof schema>

export const MAX_PRODUCT_GALLERY_IMAGES = 10

/** Red asterisk suffix for labels of fields the backend actually requires. */
function Required() {
  return <span className="text-destructive"> *</span>
}

export interface ProductFormSeoValues {
  metaTitle: string
  metaDescription: string
  metaKeywords?: string[]
  ogTitle?: string
  ogDescription?: string
  canonicalUrl?: string
}

export interface ProductFormSubmitValues {
  input: CreateProductInput | UpdateProductInput
  categoryId: string | undefined
  thumbnailFile: File | null
  galleryFiles: File[]
  seo: ProductFormSeoValues
}

interface ProductFormProps {
  product?: Product
  /** Count of gallery images already uploaded — used to cap new selections at MAX_PRODUCT_GALLERY_IMAGES total. */
  existingGalleryCount?: number
  isPending: boolean
  onSubmit: (values: ProductFormSubmitValues) => void
  onCancel: () => void
  submitLabel: string
  /** Bump this (e.g. a counter) after a successful create to blank out the form for the next entry. */
  resetSignal?: number
}

export function ProductForm({
  product,
  existingGalleryCount = 0,
  isPending,
  onSubmit,
  onCancel,
  submitLabel,
  resetSignal,
}: ProductFormProps) {
  const isEditing = !!product
  const existingCategory = product?.categories?.[0]?.category
  const seo = product?.seo

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
  const [thumbnailError, setThumbnailError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasExistingThumbnail = product?.thumbnail != null

  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>([])
  const [isGalleryDragOver, setIsGalleryDragOver] = useState(false)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const remainingGallerySlots = MAX_PRODUCT_GALLERY_IMAGES - existingGalleryCount - galleryFiles.length

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          brandId: product.brandId ?? "",
          categoryId: existingCategory?.id ?? "",
          name: product.name,
          description: product.description ?? "",
          priceCents: String(product.priceCents),
          sku: product.sku ?? "",
          barcode: product.barcode ?? "",
          stock: String(product.stock),
          availabilityStatus: product.availabilityStatus,
          warrantyInformation: product.warrantyInformation ?? "",
          shippingInformation: product.shippingInformation ?? "",
          manufactureCountry: product.manufactureCountry ?? "",
          tags: product.tags.join(", "),
          isActive: product.isActive,
          metaTitle: seo?.metaTitle ?? "",
          metaDescription: seo?.metaDescription ?? "",
          metaKeywords: seo?.metaKeywords?.join(", ") ?? "",
          ogTitle: seo?.ogTitle ?? "",
          ogDescription: seo?.ogDescription ?? "",
          canonicalUrl: seo?.canonicalUrl ?? "",
        }
      : {
          brandId: "",
          categoryId: "",
          name: "",
          description: "",
          priceCents: "",
          sku: "",
          barcode: "",
          stock: "",
          availabilityStatus: "in_stock",
          warrantyInformation: "",
          shippingInformation: "",
          manufactureCountry: "",
          tags: "",
          isActive: true,
          metaTitle: "",
          metaDescription: "",
          metaKeywords: "",
          ogTitle: "",
          ogDescription: "",
          canonicalUrl: "",
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

  useEffect(() => {
    // Only wired up on the create page (see resetSignal prop doc) — bumping
    // this after a successful create blanks the form for the next entry
    // instead of navigating away.
    if (resetSignal === undefined) return
    form.reset()
    setSelectedBrandId(undefined)
    setFile(null)
    setGalleryPreviewUrls((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url))
      return []
    })
    setGalleryFiles([])
    setThumbnailError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal])

  function setFile(file: File | null) {
    setThumbnailFile(file)
    setThumbnailPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return file ? URL.createObjectURL(file) : null
    })
    if (file) setThumbnailError(null)
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

  function addGalleryFiles(files: File[]) {
    const accepted = files.filter((f) => f.type.startsWith("image/")).slice(0, Math.max(remainingGallerySlots, 0))
    if (accepted.length === 0) return
    setGalleryFiles((prev) => [...prev, ...accepted])
    setGalleryPreviewUrls((prev) => [...prev, ...accepted.map((f) => URL.createObjectURL(f))])
  }

  function handleGalleryFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    addGalleryFiles(Array.from(e.target.files ?? []))
    e.target.value = ""
  }

  function handleGalleryDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsGalleryDragOver(false)
    addGalleryFiles(Array.from(e.dataTransfer.files ?? []))
  }

  function removeGalleryFile(index: number) {
    setGalleryPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(values: FormValues) {
    // Thumbnail isn't an RHF field (see setFile/thumbnailFile above), so its
    // required check can't live in the zod schema — gate the submit here instead.
    if (!thumbnailFile && !hasExistingThumbnail) {
      setThumbnailError("Thumbnail is required")
      return
    }

    const tags = values.tags
      ? values.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : []
    const metaKeywords = values.metaKeywords
      ? values.metaKeywords
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : []

    const input = {
      name: values.name,
      description: values.description || undefined,
      priceCents: Number(values.priceCents),
      sku: values.sku || undefined,
      barcode: values.barcode,
      stock: Number(values.stock),
      availabilityStatus: values.availabilityStatus,
      warrantyInformation: values.warrantyInformation || undefined,
      shippingInformation: values.shippingInformation || undefined,
      manufactureCountry: values.manufactureCountry || undefined,
      tags,
      isActive: values.isActive,
      brandId: values.brandId || undefined,
    }

    onSubmit({
      input,
      categoryId: values.categoryId || undefined,
      thumbnailFile,
      galleryFiles,
      seo: {
        metaTitle: values.metaTitle,
        metaDescription: values.metaDescription,
        metaKeywords,
        ogTitle: values.ogTitle || undefined,
        ogDescription: values.ogDescription || undefined,
        canonicalUrl: values.canonicalUrl || undefined,
      },
    })
  }

  const currentThumbnailUrl = thumbnailPreviewUrl ?? null

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full space-y-6">
        <div className="grid w-full gap-4 sm:grid-cols-2">
          <div className="w-full space-y-2">
            {/* Plain <label>, not FormLabel/FormItem — brand selection drives
                selectedBrandId (plain useState), not an RHF-registered field,
                so there's no enclosing <FormField> to supply useFormField's
                context (same reasoning as the thumbnail upload block below). */}
            <label className="text-sm font-medium leading-none mb-[3px] block">Brand</label>
            <Select value={selectedBrandId} onValueChange={handleBrandChange} disabled={brandsLoading}>
              <SelectTrigger className="h-11 w-full rounded-lg">
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
                <FormLabel className="mb-2">
                  Category
                  <Required />
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedBrandId || categoriesLoading}
                >
                  <FormControl>
                    <SelectTrigger className="h-11 w-full rounded-lg">
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
              <FormLabel>
                Product Name
                <Required />
              </FormLabel>
              <FormControl>
                <Input className="h-11 w-full rounded-lg" placeholder="Product title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEditing && (
          <div className="w-full space-y-2">
            {/* Plain <label>, not FormField — slug isn't user-editable, so
                it's not registered with react-hook-form at all. It's
                generated server-side from the name and shown here read-only. */}
            <label className="text-sm font-medium leading-none mb-[3px] block">Slug</label>
            <Input className="h-11 w-full rounded-lg" value={product.slug} disabled readOnly />
            <p className="text-sm text-muted-foreground">
              Generated automatically from the name. Used in the storefront URL /products/&lt;slug&gt; and can&apos;t
              be changed.
            </p>
          </div>
        )}

        <div className="w-full space-y-2">
          {/* Plain <label>, not FormLabel — thumbnailFile/previewUrl are
              useState, not react-hook-form fields (same reasoning as
              category-form.tsx's image block). Required manually in
              handleSubmit below since there's no RHF field to attach a zod
              rule to. */}
          <label className="mb-2 block text-sm font-medium leading-none">
            Product Thumbnail
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

          {thumbnailError && <p className="text-sm font-medium text-destructive">{thumbnailError}</p>}

          <p className="text-xs text-muted-foreground">
            {isEditing
              ? "Uploading replaces the current thumbnail. Processing happens in the background — refresh in a moment to see it."
              : "Uploaded after the product is created. Processing happens in the background."}
          </p>
        </div>

        <div className="w-full space-y-2">
          {/* Plain <label>, not FormField — gallery files are useState, not
              react-hook-form fields (same reasoning as the thumbnail block above). */}
          <label className="text-sm font-medium leading-none mb-[3px] block">Product Gallery</label>

          <div
            role="button"
            tabIndex={0}
            onClick={() => remainingGallerySlots > 0 && galleryInputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && remainingGallerySlots > 0 && galleryInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              if (remainingGallerySlots > 0) setIsGalleryDragOver(true)
            }}
            onDragLeave={() => setIsGalleryDragOver(false)}
            onDrop={handleGalleryDrop}
            className={cn(
              "flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center transition-colors",
              remainingGallerySlots > 0 ? "cursor-pointer" : "cursor-not-allowed opacity-50",
              isGalleryDragOver ? "border-foreground bg-accent" : "border-input hover:bg-accent/50",
            )}
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-accent">
              <Plus className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">
              {remainingGallerySlots > 0 ? "Click to upload or drag and drop" : "Gallery limit reached"}
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG or WEBP (Max: 5MB) — {remainingGallerySlots} of {MAX_PRODUCT_GALLERY_IMAGES} slots left
            </p>
          </div>

          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryFileChange}
            className="hidden"
          />

          {galleryPreviewUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {galleryPreviewUrls.map((url, index) => (
                <div key={url} className="relative">
                  <img src={url} alt="" className="aspect-square w-full rounded-md border object-cover" />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute top-1 right-1 size-5"
                    onClick={() => removeGalleryFile(index)}
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Uploaded {isEditing ? "on save" : "after the product is created"}. Processing happens in the background.
          </p>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="mb-2">
                Product Description
                <Required />
              </FormLabel>
              <FormControl>
                <Textarea className="w-full rounded-lg" placeholder="Detailed product description" rows={4} {...field} />
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
                <FormLabel>
                  Price (cents)
                  <Required />
                </FormLabel>
                <FormControl>
                  <Input className="h-11 w-full rounded-lg" type="number" min={0} placeholder="Product price" {...field} />
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
                <FormLabel>
                  Stock
                  <Required />
                </FormLabel>
                <FormControl>
                  <Input className="h-11 w-full rounded-lg" type="number" min={0} placeholder="Available quantity" {...field} />
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
                    <SelectTrigger className="h-11 w-full rounded-lg">
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
                  <Input className="h-11 w-full rounded-lg" placeholder="Product SKU" {...field} />
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
                <FormLabel>
                  Barcode
                  <Required />
                </FormLabel>
                <FormControl>
                  <Input className="h-11 w-full rounded-lg" placeholder="Product barcode" {...field} />
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
                  <Input className="h-11 w-full rounded-lg" placeholder="Country of origin" {...field} />
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
                  <Input className="h-11 w-full rounded-lg" placeholder="wireless, noise-cancelling" {...field} />
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
                <Input className="h-11 w-full rounded-lg" placeholder="e.g. 1 year manufacturer warranty" {...field} />
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
                <Input className="h-11 w-full rounded-lg" placeholder="e.g. Ships within 3-5 business days" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="w-full space-y-4 rounded-lg border p-4">
          <div>
            <h3 className="text-sm font-semibold">SEO</h3>
            <p className="text-sm text-muted-foreground">
              Controls how this product appears in search results and link previews.
            </p>
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Meta title
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input className="h-11 w-full rounded-lg" placeholder="Title shown in search results" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="canonicalUrl"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Canonical URL</FormLabel>
                  <FormControl>
                    <Input className="h-11 w-full rounded-lg" placeholder="https://example.com/products/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="metaDescription"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>
                  Meta description
                  <Required />
                </FormLabel>
                <FormControl>
                  <Textarea className="w-full rounded-lg" placeholder="Description shown in search results" rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metaKeywords"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Meta keywords</FormLabel>
                <FormControl>
                  <Input className="h-11 w-full rounded-lg" placeholder="wireless, noise-cancelling" {...field} />
                </FormControl>
                <FormDescription>Comma-separated.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid w-full gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="ogTitle"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Social share title</FormLabel>
                  <FormControl>
                    <Input className="h-11 w-full rounded-lg" placeholder="Optional — defaults to meta title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ogDescription"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Social share description</FormLabel>
                  <FormControl>
                    <Input className="h-11 w-full rounded-lg" placeholder="Optional — defaults to meta description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

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
