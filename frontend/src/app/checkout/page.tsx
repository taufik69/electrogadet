"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { CheckCircle2, ShoppingBag } from "lucide-react"
import { Container } from "@/components/layout/container"
import { useCart } from "@/hooks/use-cart"
import { ShippingForm } from "./_components/shipping-form"
import { PaymentNotice } from "./_components/payment-notice"
import { OrderReview } from "./_components/order-review"
import { CheckoutSummary } from "./_components/checkout-summary"
import { checkoutSchema, defaultCheckoutValues, type CheckoutFormValues } from "./_components/checkout-schema"

function generateOrderId() {
  return `NV-${Math.floor(100000 + Math.random() * 900000)}`
}

export default function CheckoutPage() {
  const { items, itemCount, subtotalCents, savingsCents, clear } = useCart()
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState("")

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: defaultCheckoutValues,
  })

  async function onSubmit() {
    await new Promise((resolve) => setTimeout(resolve, 800))
    setOrderId(generateOrderId())
    setOrderPlaced(true)
    clear()
  }

  if (orderPlaced) {
    return (
      <Container className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 size={32} aria-hidden="true" />
        </span>
        <h1 className="text-h3 text-text-primary">Order placed successfully!</h1>
        <p className="text-body text-text-secondary">
          Your order <span className="font-semibold text-text-primary">{orderId}</span> has been confirmed.
          We&apos;ll send updates as it ships.
        </p>
        <Link
          href="/"
          className="text-small-semibold mt-2 flex h-11 items-center justify-center rounded-xl bg-brand-primary px-6 text-white transition-colors hover:bg-brand-hover"
        >
          Continue Shopping
        </Link>
      </Container>
    )
  }

  if (items.length === 0) {
    return (
      <Container className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-section text-text-secondary">
          <ShoppingBag size={28} aria-hidden="true" />
        </span>
        <h1 className="text-h3 text-text-primary">Your cart is empty</h1>
        <p className="text-body text-text-secondary">Add items to your cart before checking out.</p>
        <Link
          href="/"
          className="text-small-semibold mt-2 flex h-11 items-center justify-center rounded-xl bg-brand-primary px-6 text-white transition-colors hover:bg-brand-hover"
        >
          Continue Shopping
        </Link>
      </Container>
    )
  }

  return (
    <Container className="flex flex-col gap-6 py-8 md:py-10">
      <h1 className="text-h3 sm:text-h2 text-text-primary">Checkout</h1>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]"
      >
        <div className="flex flex-col gap-6">
          <ShippingForm form={form} />
          <PaymentNotice />
          <OrderReview items={items} />
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <CheckoutSummary
            itemCount={itemCount}
            subtotalCents={subtotalCents}
            savingsCents={savingsCents}
            isSubmitting={form.formState.isSubmitting}
          />
        </div>
      </form>
    </Container>
  )
}
