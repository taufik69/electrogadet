import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  WishlistButton,
  CompareButton,
  AddToCartButton,
} from "@/components/product-card-actions";
import { formatPriceCents } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductCardData } from "@/lib/types/product";

const BADGE_LABEL: Record<NonNullable<ProductCardData["badge"]>, string> = {
  new: "New",
  bestseller: "Bestseller",
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const discountedCents = product.discountPercent
    ? Math.round(product.priceCents * (1 - product.discountPercent / 100))
    : null;

  const gallery = product.imageUrls?.length
    ? product.imageUrls
    : [product.imageUrl];

  return (
    <article className="group flex h-full flex-col rounded-md border border-transparent bg-surface p-4 transition-colors duration-200 hover:border-border">
      {/* Media */}
      <div className="relative">
        <Link
          href={`/products/${product.slug}`}
          className="block aspect-square overflow-hidden rounded-md"
        >
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={320}
            height={320}
            className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        </Link>

        {(product.badge || product.discountPercent) && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            {product.badge && (
              <Badge
                variant={product.badge === "new" ? "outline" : "default"}
                className={cn(
                  "border-none",
                  product.badge === "new" && "bg-accent-subtle text-accent",
                )}
              >
                {BADGE_LABEL[product.badge]}
              </Badge>
            )}
            {product.discountPercent && (
              <Badge className="border-none bg-danger text-white">
                -{product.discountPercent}%
              </Badge>
            )}
          </div>
        )}

        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <WishlistButton productName={product.name} />
          <CompareButton productName={product.name} />
        </div>
      </div>

      {/* Gallery dots — only meaningful with more than one image */}
      {gallery.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
          {gallery.map((src, index) => (
            <span
              key={src}
              className={cn(
                "size-1.5 rounded-full",
                index === 0 ? "bg-brand-primary" : "bg-border",
              )}
            />
          ))}
        </div>
      )}

      {/* Meta */}
      <div className="mt-4 flex flex-1 flex-col gap-2">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-small text-text-secondary transition-colors duration-200 hover:text-text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-h4 text-text-primary">
            {formatPriceCents(discountedCents ?? product.priceCents)}
          </span>
          {discountedCents !== null && (
            <span className="text-small text-text-secondary line-through">
              {formatPriceCents(product.priceCents)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {product.rating && (
            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-warning text-warning" />
              <span className="text-caption text-text-secondary">
                {product.rating.toFixed(1)}
                {product.reviewCount ? ` (${product.reviewCount})` : ""}
              </span>
            </span>
          )}
          {product.inStock !== undefined && (
            <span
              className={cn(
                "text-caption",
                product.inStock ? "text-success" : "text-text-secondary",
              )}
            >
              {product.inStock ? "In stock" : "Out of stock"}
            </span>
          )}
        </div>

        {/* Actions pinned to the card foot so cards in a row line up */}
        <div className="mt-auto flex flex-col gap-2 pt-3">
          <Button variant="outline" asChild className="w-full">
            <Link href={`/products/${product.slug}`}>Learn more</Link>
          </Button>
          <AddToCartButton productName={product.name} />
        </div>
      </div>
    </article>
  );
}
