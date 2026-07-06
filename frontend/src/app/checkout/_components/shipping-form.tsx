"use client"

import type { UseFormReturn } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { CheckoutFormValues } from "./checkout-schema"

interface ShippingFormProps {
  form: UseFormReturn<CheckoutFormValues>
}

export function ShippingForm({ form }: ShippingFormProps) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <div className="shadow-e1 flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-h4 text-text-primary">Shipping Details</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full Name" required error={errors.fullName?.message}>
          <Input placeholder="Jane Doe" {...register("fullName")} />
        </Field>

        <Field label="Phone Number" required error={errors.phone?.message}>
          <Input placeholder="+1 555 123 4567" {...register("phone")} />
        </Field>

        <Field label="Email" required error={errors.email?.message} className="sm:col-span-2">
          <Input type="email" placeholder="jane@example.com" {...register("email")} />
        </Field>

        <Field label="Street Address" required error={errors.addressLine?.message} className="sm:col-span-2">
          <Input placeholder="123 Main St, Apt 4B" {...register("addressLine")} />
        </Field>

        <Field label="City" required error={errors.city?.message} className="sm:col-span-2">
          <Input placeholder="New York" {...register("city")} />
        </Field>

        <Field label="Order Notes" optional error={errors.notes?.message} className="sm:col-span-2">
          <textarea
            placeholder="Leave at the front door, ring bell twice…"
            rows={3}
            className="flex w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...register("notes")}
          />
        </Field>
      </div>
    </div>
  )
}

function Field({
  label,
  required,
  optional,
  error,
  className,
  children,
}: {
  label: string
  required?: boolean
  optional?: boolean
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-small-semibold flex items-center gap-1 text-text-primary">
        {label}
        {required && (
          <span className="text-danger" aria-hidden="true">
            *
          </span>
        )}
        {optional && <span className="text-caption font-normal text-text-secondary">(optional)</span>}
      </Label>
      {children}
      {error && <span className="text-caption text-danger">{error}</span>}
    </div>
  )
}
