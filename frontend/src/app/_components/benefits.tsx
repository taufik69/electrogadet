import { benefits } from "@/lib/data/homepage"

export function Benefits() {
  return (
    <section
      aria-labelledby="benefits-heading"
      className="w-full px-4 py-16 sm:px-6 lg:px-6"
    >
      <h2 id="benefits-heading" className="mb-8 text-h3 text-text-primary">
        Why ElectroGadget
      </h2>

      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {benefits.map((benefit) => {
          const Icon = benefit.icon
          return (
            <li
              key={benefit.title}
              className="flex flex-col gap-3 rounded-md bg-bg-section p-5 transition-shadow duration-200 hover:shadow-e1"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-surface">
                <Icon className="size-5 text-brand-primary" />
              </span>
              <h3 className="text-small-semibold text-text-primary">{benefit.title}</h3>
              <p className="text-small text-text-secondary">{benefit.description}</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
