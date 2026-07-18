import { cached } from "../../shared/utils/cache.js"
import { CACHE_TTL } from "../../shared/constant/cache.js"
import { navigationRepository } from "./navigation.repository.js"
import { NAVIGATION_CACHE_NAMESPACE } from "./navigation.constant.js"
import type { SidebarBrand } from "./navigation.types.js"

export const navigationService = {
  async getSidebarTree(): Promise<SidebarBrand[]> {
    return cached(
      { namespace: NAVIGATION_CACHE_NAMESPACE, key: "sidebar", ttlSeconds: CACHE_TTL.LONG },
      async () => {
        const brands = await navigationRepository.findSidebarTree()

        // Flatten ProductCategory join rows (`{ product: { id, name, slug } }`)
        // into the flat SidebarProduct[] the frontend's Brand.categories[].products
        // shape expects — see navigation.types.ts.
        return brands.map((brand) => ({
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          iconKey: brand.iconKey,
          imageUrl: brand.imageUrl,
          categories: brand.categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            products: category.products.map(({ product }) => product),
          })),
        }))
      },
    )
  },
}
