import { useCart } from "@/hooks/use-cart";
import { Link, useLocation } from "wouter";
import { Loader2, Trash2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const { cart, isLoading, updateItem, removeItem } = useCart();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const total = (cart?.items || []).reduce((sum, item) => {
    return sum + (Number(item.variant.product.price) * item.quantity);
  }, 0);

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="min-h-screen pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl mb-12">Shopping Cart</h1>

      {isEmpty ? (
        <div className="text-center py-24 bg-secondary/20 border border-dashed border-border">
          <p className="text-xl text-muted-foreground mb-6">Your cart is empty.</p>
          <Link href="/shop" className="inline-block bg-primary text-primary-foreground px-8 py-3 font-medium hover:bg-primary/90 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence initial={false}>
              {cart?.items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-6 py-6 border-b border-border"
                >
                  <div className="w-24 h-32 bg-secondary/30 flex-shrink-0 overflow-hidden">
                    <img
                      src={item.variant.product.images?.[0] || "/products/placeholder.jpg"}
                      alt={item.variant.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-display text-xl">
                          <Link href={`/products/${item.variant.product.slug}`} className="hover:underline">
                            {item.variant.product.name}
                          </Link>
                        </h3>
                        <p className="font-medium">₹{Number(item.variant.product.price).toFixed(2)}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Color: {item.variant.color}</p>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-muted-foreground">Qty:</label>
                        <select
                          value={item.quantity}
                          onChange={(e) => updateItem({ id: item.id, quantity: parseInt(e.target.value) })}
                          className="bg-transparent border border-border rounded-none px-2 py-1 text-sm focus:border-primary focus:ring-0"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-secondary/20 p-8 sticky top-32">
              <h2 className="font-display text-2xl mb-6">Summary</h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="pt-4 border-t border-border flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setLocation("/checkout")}
                className="w-full mt-8 bg-black text-white py-4 font-bold tracking-wide hover:bg-black/90 transition-colors flex items-center justify-center gap-2"
              >
                CHECKOUT <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
