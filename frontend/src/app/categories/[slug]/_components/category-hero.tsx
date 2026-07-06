import Link from "next/link"
import { ChevronRight, CreditCard, LayoutGrid, ShieldCheck, Truck } from "lucide-react"

interface CategoryHeroProps {
  categoryName: string
  parentName: string | null
  parentSlug: string | null
  productCount: number
}

export function CategoryHero({ categoryName, parentName, parentSlug, productCount }: CategoryHeroProps) {
  return (
    <div className="flex flex-col gap-3">
      <nav aria-label="Breadcrumb" className="text-small flex items-center gap-1.5 text-text-secondary">
        <Link href="/" className="transition-colors hover:text-brand-primary">
          Home
        </Link>
        <ChevronRight size={14} aria-hidden="true" />
        <Link href="/categories" className="transition-colors hover:text-brand-primary">
          Categories
        </Link>
        {parentName && parentSlug && (
          <>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href={`/categories/${parentSlug}`} className="transition-colors hover:text-brand-primary">
              {parentName}
            </Link>
          </>
        )}
        <ChevronRight size={14} aria-hidden="true" />
        <span className="text-text-primary">{categoryName}</span>
      </nav>

      <div className="shadow-e2 relative overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_top_right,_#1e293b,_#0b1120_60%)] px-6 py-8 sm:px-10 sm:py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_20%_120%,_theme(colors.brand-primary)_0%,_transparent_45%)]"
        />
        <div className="relative flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <span className="text-caption inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-semibold uppercase tracking-wide text-white/80">
              <LayoutGrid size={12} aria-hidden="true" />
              Department
            </span>
            <h1 className="text-h1 sm:text-display text-white">{categoryName}</h1>
            <p className="text-small sm:text-body max-w-xl text-white/60">
              Browse {categoryName} on Electrogadget — authentic products with fast delivery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-small-semibold flex items-center gap-1.5 rounded-full bg-danger px-4 py-2 text-white">
              <LayoutGrid size={14} aria-hidden="true" />
              {productCount} products
            </span>
            <span className="text-small flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-white/80">
              <CreditCard size={14} aria-hidden="true" />
              100% Cash on Delivery
            </span>
            <span className="text-small flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-white/80">
              <Truck size={14} aria-hidden="true" />
              Nationwide delivery
            </span>
            <span className="text-small flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-white/80">
              <ShieldCheck size={14} aria-hidden="true" />
              Verified sellers
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
