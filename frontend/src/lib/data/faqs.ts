export interface Faq {
  question: string
  answer: string
}

export const faqs: Faq[] = [
  {
    question: "How long does delivery take?",
    answer:
      "Orders placed before 6pm ship the same day and arrive the next working day. Delivery is free on orders over $50; below that a flat $4.90 applies.",
  },
  {
    question: "Can I return something I've opened?",
    answer:
      "Yes. You have 30 days from delivery to return any item, opened or not, as long as it's undamaged and includes its accessories. We refund to the original payment method within five working days of receiving it.",
  },
  {
    question: "What warranty do products come with?",
    answer:
      "Every product carries the manufacturer's warranty — typically two years — and we handle the claim on your behalf. Out-of-warranty repairs are available in store using genuine replacement parts.",
  },
  {
    question: "Do you offer trade-in on old devices?",
    answer:
      "We do. Bring in your old phone, laptop, or tablet and we'll assess it in store, then apply its value directly against your new purchase. Devices that no longer power on are still accepted for recycling.",
  },
  {
    question: "Which payment methods do you accept?",
    answer:
      "All major credit and debit cards, Apple Pay, Google Pay, and bank transfer. Orders over $200 can be split into interest-free instalments at checkout.",
  },
  {
    question: "Can I collect my order in store?",
    answer:
      "Yes — choose click and collect at checkout and we'll have it ready the same day. You'll get an email as soon as it's waiting for you at the counter.",
  },
]
