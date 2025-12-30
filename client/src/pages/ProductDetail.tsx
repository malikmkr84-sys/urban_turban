import { useRoute, useLocation } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:slug");
  const slug = params?.slug || "";
  const { data: product, isLoading } = useProduct(slug);
  const { addItem, isAdding } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product && selectedVariantId === null && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id);
    }
  }, [product, selectedVariantId]);

  // Early returns must happen AFTER hooks
  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return <div className="min-h-screen pt-32 text-center">Product not found</div>;
  }

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login or register to add items to your cart.",
        action: (
          <button
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive"
            onClick={() => setLocation("/login?returnUrl=" + encodeURIComponent(window.location.pathname))}
          >
            Login
          </button>
        ),
      });
      return;
    }

    if (!selectedVariantId) return;
    addItem({ variantId: selectedVariantId, quantity });
  };

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-secondary/30 w-full overflow-hidden">
              <motion.img
                key={selectedVariant?.color}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={product.images?.[0] || "https://placehold.co/600x800?text=No+Image"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnails if we had multiple images per variant, just using same array for demo */}
            <div className="grid grid-cols-4 gap-4">
              {(product.images || []).map((img, idx) => (
                <div key={idx} className="aspect-square bg-secondary/30 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="lg:py-8 space-y-8">
            <div>
              <h1 className="font-display text-4xl md:text-5xl mb-2">{product.name}</h1>
              <p className="text-2xl font-medium">₹{Number(product.price).toFixed(2)}</p>
            </div>

            <div className="prose prose-stone text-muted-foreground">
              <p>{product.micro_story}</p>
            </div>

            {/* Variants */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-3">Color</label>
              <div className="flex flex-wrap gap-3">
                {(product.variants || []).map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`
                      px-4 py-2 border text-sm font-medium transition-all
                      ${selectedVariantId === variant.id
                        ? "border-black bg-black text-white"
                        : "border-border hover:border-black/50 text-foreground"}
                    `}
                  >
                    {variant.color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Add */}
            <div className="space-y-4 pt-6 border-t border-border">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-secondary transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-secondary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || !product.is_active || (selectedVariant?.stock_quantity ?? 0) === 0}
                  className="flex-1 bg-primary text-primary-foreground py-3 px-6 font-medium tracking-wide hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                    </>
                  ) : !product.is_active || (selectedVariant?.stock_quantity ?? 0) === 0 ? (
                    "OUT OF STOCK"
                  ) : (
                    "ADD TO CART"
                  )}
                </button>
              </div>
            </div>

            {/* Description Accordion style */}
            <div className="pt-8 border-t border-border space-y-4">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wide mb-2">Details</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wide mb-2">Shipping & Returns</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Free standard shipping on all orders over ₹5000. Returns accepted within 30 days of delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
