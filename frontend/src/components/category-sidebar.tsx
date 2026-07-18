import { fetchSidebar } from "@/lib/navigation";
import { CategorySidebarView } from "@/components/category-sidebar-view";

export async function CategorySidebar() {
  const brands = await fetchSidebar();
  return <CategorySidebarView brands={brands} />;
}
