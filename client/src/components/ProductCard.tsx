import { Link } from "wouter";
import { type ProductWithVariants } from "@shared/schema";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: ProductWithVariants;
}

export function ProductCard({ product }: ProductCardProps) {
  // Use first image if array exists, otherwise placeholder
  const PLACEHOLDER_IMAGE = "/products/placeholder.jpg";
  const mainImage = product.images?.[0] || PLACEHOLDER_IMAGE;
  const hoverImage = product.images?.[1] || mainImage;

  return (
    <Link href={`/products/${product.slug}`} className="group block cursor-pointer">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary/30 mb-4">
        {/* Main Image */}
        <motion.img
          src={mainImage}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
        />
        {/* Hover Image */}
        <motion.img
          src={hoverImage}
          alt={`${product.name} - view 2`}
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        {/* Badges or Overlays could go here */}
        {!product.is_active && (
          <div className="absolute top-4 right-4 bg-background/90 px-3 py-1 text-xs font-bold uppercase tracking-widest">
            Sold Out
          </div>
        )}
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-display text-lg leading-tight group-hover:underline decoration-1 underline-offset-4">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {product.variants.length} Colors
          </p>
        </div>
        <p className="font-medium text-sm">
          ₹{Number(product.price).toFixed(2)}
        </p>
      </div>
    </Link>
  );
}
