import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { Loader2 } from "lucide-react";

export default function Shop() {
  const { data: products, isLoading, error } = useProducts();

  if (error) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-4 text-center">
        <h1 className="font-display text-2xl mb-4">Something went wrong</h1>
        <p className="text-muted-foreground">Unable to load products. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-16 text-center">
        <h1 className="font-display text-4xl md:text-6xl mb-4">The Collection</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Our core range of essentials. Available in our signature palette of earth tones.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8">
          {/* Displaying exactly 3 variants matching Home page */}
          {products && products.length > 0 ? (
            <>
              {/* Variant 1: Black */}
              <ProductCard
                product={{
                  ...products[0],
                  name: "The Urban Essential (Black)",
                  images: products[0].images && products[0].images.length > 0 ? [products[0].images[0]] : []
                }}
              />
              {/* Variant 2: Beige */}
              <ProductCard
                product={{
                  ...products[0],
                  name: "The Urban Essential (Beige)",
                  images: products[0].images && products[0].images.length > 1 ? [products[0].images[1]] : (products[0].images ? [products[0].images[0]] : [])
                }}
              />
              {/* Variant 3: Olive (Sold Out) */}
              <ProductCard
                product={{
                  ...products[0],
                  name: "The Urban Essential (Olive)",
                  is_active: false,
                  images: products[0].images && products[0].images.length > 2 ? [products[0].images[2]] : (products[0].images ? [products[0].images[0]] : [])
                }}
              />
            </>
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-24">
              <p>No products found. Please check back later.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
