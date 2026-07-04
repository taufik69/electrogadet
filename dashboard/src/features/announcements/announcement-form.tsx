import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { AnnouncementBar, AnnouncementInput } from "./types"

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
  linkUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  linkText: z.string().optional(),
  isActive: z.boolean(),
  backgroundColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color like #RRGGBB")
    .or(z.literal(""))
    .optional(),
})

type FormValues = z.infer<typeof formSchema>

const defaultValues: FormValues = {
  message: "",
  linkUrl: "",
  linkText: "",
  isActive: false,
  backgroundColor: "",
}

interface AnnouncementFormProps {
  announcement?: AnnouncementBar
  isPending: boolean
  onSubmit: (input: AnnouncementInput) => void
  onCancel: () => void
  submitLabel: string
}

export function AnnouncementForm({ announcement, isPending, onSubmit, onCancel, submitLabel }: AnnouncementFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: announcement
      ? {
          message: announcement.message,
          linkUrl: announcement.linkUrl ?? "",
          linkText: announcement.linkText ?? "",
          isActive: announcement.isActive,
          backgroundColor: announcement.backgroundColor ?? "",
        }
      : defaultValues,
  })

  function handleSubmit(values: FormValues) {
    onSubmit({
      message: values.message,
      linkUrl: values.linkUrl || undefined,
      linkText: values.linkText || undefined,
      isActive: values.isActive,
      backgroundColor: values.backgroundColor || undefined,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-2xl space-y-4">
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea placeholder="Free shipping over $50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="linkUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link URL (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="linkText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link text (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Shop now" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="backgroundColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background color (optional)</FormLabel>
              <FormControl>
                <Input placeholder="#111827" {...field} />
              </FormControl>
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
                  Activating this bar will deactivate any other currently active bar.
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
