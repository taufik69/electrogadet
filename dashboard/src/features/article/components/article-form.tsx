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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Article, CreateArticleInput, UpdateArticleInput } from "../types/article.types"

// Caps mirror the backend's zod schema (article.validation.ts). max(160) on
// title is card-driven: the storefront card clamps it to 2 lines.
const schema = z.object({
  title: z.string().min(1, "Title is required").max(160, "Max 160 characters"),
  content: z.string().min(1, "Content is required"),
  authorName: z.string().max(80, "Max 80 characters"),
  tags: z.string(),
  status: z.enum(["draft", "published", "archived"]),
})

type FormValues = z.infer<typeof schema>

/** Red asterisk suffix for labels of required fields. */
function Required() {
  return <span className="text-destructive"> *</span>
}

export interface ArticleFormSubmitValues {
  input: CreateArticleInput | UpdateArticleInput
  coverFile: File | null
}

interface ArticleFormProps {
  article?: Article
  isPending: boolean
  onSubmit: (values: ArticleFormSubmitValues) => void
  onCancel: () => void
  submitLabel: string
  /** Bump this after a successful create to blank the form for the next entry. */
  resetSignal?: number
}

export function ArticleForm({
  article,
  isPending,
  onSubmit,
  onCancel,
  submitLabel,
  resetSignal,
}: ArticleFormProps) {
  const isEditing = !!article
  const hasExistingCover = article?.coverImage != null

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [coverError, setCoverError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: article
      ? {
          title: article.title,
          content: article.content ?? "",
          authorName: article.authorName ?? "",
          tags: article.tags.join(", "),
          status: article.status,
        }
      : { title: "", content: "", authorName: "", tags: "", status: "draft" },
  })

  useEffect(() => {
    if (resetSignal === undefined) return
    form.reset()
    setFile(null)
    setCoverError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal])

  function setFile(file: File | null) {
    setCoverFile(file)
    setCoverPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return file ? URL.createObjectURL(file) : null
    })
    if (file) setCoverError(null)
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
    // The cover isn't an RHF field, so its required check can't live in the
    // zod schema — gate the submit here instead (spec §7.3).
    if (!coverFile && !hasExistingCover) {
      setCoverError("Cover image is required")
      return
    }

    const tags = values.tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)

    onSubmit({
      input: {
        title: values.title,
        content: values.content,
        // Omitted rather than sent as "" — the backend types authorName as
        // optional, and an empty string would store a blank byline.
        ...(values.authorName.trim() ? { authorName: values.authorName.trim() } : {}),
        tags,
        status: values.status,
      },
      coverFile,
    })
  }

  const currentCoverUrl =
    coverPreviewUrl ?? (article?.coverImage?.status === "uploaded" ? article.coverImage.url : null)

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
                <Textarea
                  className="w-full rounded-lg"
                  placeholder="iPhone 17 Pro vs iPhone 16 Pro: is the upgrade worth it in 2026?"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Clamped to two lines on the storefront card. Max 160 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* The slug is generated by the backend from the title and never
            regenerated afterward (spec §2.10), so it's shown read-only here
            rather than as an editable field — an author still needs to know
            the article's URL. */}
        {isEditing && (
          <div className="w-full space-y-2">
            <label className="mb-2 block text-sm leading-none font-medium">URL slug</label>
            <Input value={article.slug} readOnly disabled className="w-full rounded-lg font-mono text-sm" />
            <p className="text-xs text-muted-foreground">
              Generated from the title when the article was created. It stays fixed so published links keep
              working.
            </p>
          </div>
        )}

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="mb-2">
                Content
                <Required />
              </FormLabel>
              <FormControl>
                <Textarea
                  className="w-full rounded-lg font-mono text-sm"
                  placeholder={"## The short answer\n\nFor most people, no…"}
                  rows={14}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Markdown. Headings, lists, links and bold/italic are supported.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="w-full space-y-2">
          {/* Plain <label>, not FormLabel — coverFile/previewUrl are useState,
              not react-hook-form fields, so there's no useFormField context. */}
          <label className="mb-2 block text-sm leading-none font-medium">
            Cover Image
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
            {currentCoverUrl ? (
              <div className="relative w-full p-4">
                <img
                  src={currentCoverUrl}
                  alt="Cover preview"
                  className="mx-auto aspect-video max-h-48 rounded-md border object-cover"
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
                <p className="text-xs text-muted-foreground">PNG, JPG or WEBP — recommended 1200×675 (16:9)</p>
              </>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

          {coverError && <p className="text-sm font-medium text-destructive">{coverError}</p>}

          <p className="text-xs text-muted-foreground">
            {isEditing
              ? "Uploading a new image replaces the current one — the old file is removed automatically. Processing happens in the background."
              : "Uploaded after the article is created. Processing happens in the background."}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="authorName"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="mb-2">Author</FormLabel>
                <FormControl>
                  <Input className="w-full rounded-lg" placeholder="Jane Doe" {...field} />
                </FormControl>
                <FormDescription>Optional byline. Max 80 characters.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="mb-2">Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Publishing stamps the date shown on the card. Archived articles leave the listing but keep
                  their URL working.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="mb-2">Tags</FormLabel>
              <FormControl>
                <Input className="w-full rounded-lg" placeholder="iphone, comparison, buying-guide" {...field} />
              </FormControl>
              <FormDescription>Comma-separated, lowercased automatically. Up to 10.</FormDescription>
              <FormMessage />
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
