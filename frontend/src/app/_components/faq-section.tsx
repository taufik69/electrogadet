"use client"

import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { Minus, Plus } from "lucide-react"

interface FaqItem {
  question: string
  answer: string
}

const faqItems: FaqItem[] = [
  {
    question: "What is Electrogadget?",
    answer:
      "Electrogadget is an online marketplace for electronics, gadgets, cameras and smart home devices across Russia. We bring genuine products from verified sellers into one trusted place, with fast delivery nationwide.",
  },
  {
    question: "Does Electrogadget deliver all over Russia?",
    answer:
      "Yes. We deliver to Moscow, St. Petersburg and every region across Russia. Delivery times vary by location and are always shown at checkout before you confirm your order.",
  },
  {
    question: "What payment methods does Electrogadget accept?",
    answer:
      "You can pay by bank card, SBP (Faster Payments System), or choose cash on delivery for eligible orders. All payment options are shown at checkout.",
  },
  {
    question: "How much does delivery cost?",
    answer:
      "Standard delivery starts from ₽199 within city limits and ₽399 for other regions. The exact charge for your address is always shown at checkout before you confirm the order.",
  },
  {
    question: "Can I return a product or get a refund?",
    answer:
      "Yes, most products can be returned within 14 days of delivery if unused and in original packaging. Refunds are processed back to your original payment method once the return is verified.",
  },
  {
    question: "What can I buy on Electrogadget?",
    answer:
      "Cameras and lenses, smartphones, smartwatches, audio gear, gaming accessories, smart home devices, power banks, and other electronics and gadgets from verified sellers.",
  },
  {
    question: "How do I track my Electrogadget order?",
    answer:
      "Once your order ships, you'll receive a tracking link by email and SMS. You can also track any order in real time from the \"Track your order\" page using your order number.",
  },
  {
    question: "Are the sellers on Electrogadget verified?",
    answer:
      "Yes. Every seller goes through a verification process before listing products, and we monitor reviews and ratings continuously to keep quality high across the marketplace.",
  },
]

export function FaqSection() {
  return (
    <section className="flex flex-col items-center gap-3 text-center">
      <span className="text-caption inline-flex w-fit items-center gap-1.5 rounded-full bg-danger/10 px-3 py-1.5 font-bold uppercase tracking-wide text-danger">
        <span className="h-1.5 w-1.5 rounded-full bg-danger" />
        Help center
      </span>

      <h2 className="text-h2 font-bold text-text-primary">
        Frequently asked questions
      </h2>
      <p className="text-small max-w-xl text-text-secondary">
        Everything you need to know about shopping, delivery and payments on
        Electrogadget.
      </p>

      <AccordionPrimitive.Root
        type="single"
        collapsible
        className="mt-4 grid w-full grid-cols-1 gap-3 text-left sm:grid-cols-2"
      >
        {faqItems.map((item, index) => (
          <AccordionPrimitive.Item
            key={item.question}
            value={`item-${index}`}
            className="group self-start rounded-xl border border-border bg-surface transition-shadow data-[state=open]:border-l-4 data-[state=open]:border-l-text-primary data-[state=open]:shadow-e2"
          >
            <AccordionPrimitive.Header>
              <AccordionPrimitive.Trigger className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                <span className="text-small-semibold text-text-primary">
                  {item.question}
                </span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg-section text-text-primary transition-colors group-data-[state=open]:bg-text-primary group-data-[state=open]:text-white">
                  <Plus
                    size={14}
                    aria-hidden="true"
                    className="group-data-[state=open]:hidden"
                  />
                  <Minus
                    size={14}
                    aria-hidden="true"
                    className="hidden group-data-[state=open]:block"
                  />
                </span>
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <p className="text-small px-5 pb-4 text-text-secondary">
                {item.answer}
              </p>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        ))}
      </AccordionPrimitive.Root>
    </section>
  )
}
