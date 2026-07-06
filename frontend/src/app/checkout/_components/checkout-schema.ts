import { z } from "zod"

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  phone: z
    .string()
    .trim()
    .min(10, "Enter a valid phone number")
    .regex(/^[0-9+\s-]+$/, "Enter a valid phone number"),
  email: z.email("Enter a valid email address"),
  addressLine: z.string().trim().min(5, "Enter your street address"),
  city: z.string().trim().min(2, "Enter your city"),
  notes: z.string().trim().optional(),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>

export const defaultCheckoutValues: CheckoutFormValues = {
  fullName: "",
  phone: "",
  email: "",
  addressLine: "",
  city: "",
  notes: "",
}
