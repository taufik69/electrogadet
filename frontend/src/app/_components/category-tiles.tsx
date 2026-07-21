import { CategoryCarousel } from "@/app/_components/category-carousel"
import { fetchCategoryTiles } from "@/lib/categories"

/**
 * How many categories the row shows. There are far more than fit a browsable
 * row, and the backend has no "featured" flag yet, so this trims by sortOrder.
 */
const TILE_LIMIT = 12

/**
 * Server component: fetches the categories and hands them to the client-side
 * carousel, which owns only the scroll/drag/arrow interaction.
 *
 * Only the name and image are shown, so a category with no image still renders
 * a labelled tile rather than a broken one — no category currently has an
 * `imageUrl` (the backend stores the column but nothing writes it yet).
 */
export async function CategoryTiles() {
  const categories = (await fetchCategoryTiles()).slice(0, TILE_LIMIT)

  if (categories.length === 0) return null

  return (
    <section
      aria-labelledby="category-tiles-heading"
      className="w-full px-4 py-12 sm:px-6 lg:px-6"
    >
      <h2 id="category-tiles-heading" className="mb-6 text-h3 text-text-primary">
        Shop by category
      </h2>

      <CategoryCarousel categories={categories} />
    </section>
  )
}
