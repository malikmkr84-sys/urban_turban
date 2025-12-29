import { useRoute, Link } from "wouter";
import { useOrder } from "@/hooks/use-orders";
import { Loader2, CheckCircle2, Package, Truck, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";

export default function OrderTracking() {
  const [, params] = useRoute("/orders/:id");
  const id = parseInt(params?.id || "0");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const cancelOrderMutation = useMutation({
    mutationFn: async (reason: string) => {
      const res = await fetch(`/api/orders/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to cancel order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.get.path, id] });
      toast({ title: "Order Cancelled", description: "Your refund is being processed." });
    },
  });

  const { data: order, isLoading } = useOrder(id);

  if (isLoading) {
    return <div className="min-h-screen pt-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!order) {
    return <div className="min-h-screen pt-32 text-center">Order not found</div>;
  }

  const statuses = ["placed", "processing", "shipped", "out_for_delivery", "delivered"];
  const currentStatusIndex = statuses.indexOf(order.status.toLowerCase());

  const statusSteps = [
    { status: "placed", label: "Order Placed", icon: CheckCircle2, description: "Your order has been confirmed" },
    { status: "paid", label: "Paid", icon: CheckCircle2, description: "Payment successful" },
    { status: "processing", label: "Processing", icon: Package, description: "We're preparing your items" },
    { status: "shipped", label: "Shipped", icon: Truck, description: "Your package is on its way" },
    { status: "delivered", label: "Delivered", icon: CheckCircle2, description: "Order received successfully" },
  ];

  return (
    <div className="min-h-screen pt-32 pb-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-block">
        ← Back to Orders
      </Link>

      <div className="mb-12 flex justify-between items-start">
        <div>
          <h1 className="font-display text-4xl mb-2">Order Tracking</h1>
          <p className="text-muted-foreground">Order #{order.id}</p>
        </div>
        {["pending", "paid"].includes(order.status) && (
          <button
            onClick={() => cancelOrderMutation.mutate("User requested cancellation")}
            disabled={cancelOrderMutation.isPending}
            className="px-4 py-2 bg-destructive text-destructive-foreground text-xs font-bold tracking-widest hover:bg-destructive/90 transition-colors disabled:opacity-50"
          >
            CANCEL ORDER
          </button>
        )}
      </div>

      {order.status === "cancelled" ? (
        <div className="bg-destructive/10 p-8 rounded-none mb-12 border border-destructive/20">
          <div className="flex gap-4 items-center text-destructive mb-2">
            <Clock className="w-6 h-6" />
            <h3 className="font-bold text-lg">Order Cancelled</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{order.cancellationReason}</p>
          {order.refundStatus && order.refundStatus !== "none" && (
            <div className="pt-4 border-t border-destructive/10">
              <span className="text-xs font-bold uppercase tracking-widest opacity-60 block mb-1">Refund Status</span>
              <span className="font-bold text-destructive uppercase">{order.refundStatus}</span>
            </div>
          )}
        </div>
      ) : (
        /* Order Status Timeline */
        <div className="bg-secondary/20 p-8 rounded-none mb-12">
          <div className="space-y-8 relative flex flex-col items-center">
            {/* Vertical Progress Line Background */}
            <div className="absolute left-1/2 top-6 bottom-6 w-1 bg-border -translate-x-1/2" />
            
            {/* Vertical Progress Line Highlight (Below current icon) */}
            {currentStatusIndex >= 0 && currentStatusIndex < statusSteps.length - 1 && (
              <div 
                className="absolute left-1/2 w-1 bg-emerald-500 -translate-x-1/2 transition-all duration-500"
                style={{ 
                  top: `${(currentStatusIndex / (statusSteps.length - 1)) * 100 + 8}%`, 
                  height: `${(1 / (statusSteps.length - 1)) * 100}%` 
                }}
              />
            )}

            {statusSteps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = idx <= currentStatusIndex;
              const isCurrent = idx === currentStatusIndex;

              return (
                <motion.div
                  key={step.status}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col items-center relative z-10 w-full"
                >
                  {/* Timeline Circle */}
                  <div
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                      isCurrent
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200"
                        : isCompleted
                          ? "bg-black border-black text-white"
                          : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Step Content */}
                  <div className="text-center mt-4">
                    <div className="flex flex-col items-center gap-1">
                      <h3 className={`font-bold text-lg ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </h3>
                      {isCurrent && (
                        <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 font-bold uppercase tracking-wider rounded-full">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground max-w-xs">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="border border-border p-6">
          <h2 className="font-bold text-sm uppercase tracking-wide mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-muted-foreground">{item.quantity}x Product</span>
                <span className="font-medium">₹{(Number(item.priceAtPurchase) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-border flex justify-between font-bold">
              <span>Total</span>
              <span>₹{Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="border border-border p-6">
          <h2 className="font-bold text-sm uppercase tracking-wide mb-4">Shipping Address</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Demo Delivery Address</p>
            <p>123 Fashion Street</p>
            <p>Design District, NY 10012</p>
            <p>United States</p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="border border-border p-6 mb-8">
        <h2 className="font-bold text-sm uppercase tracking-wide mb-4">Payment Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-medium capitalize">{order.paymentProvider === "upi_mock" ? "UPI" : order.paymentProvider === "cod" ? "COD" : "Razorpay"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className={`font-bold uppercase ${order.status === "delivered" || order.status === "paid" ? "text-emerald-600" : "text-orange-600"}`}>
              {order.status}
            </span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex gap-4 flex-col sm:flex-row">
        <Link
          href="/shop"
          className="flex-1 bg-black text-white py-3 px-6 font-bold tracking-wide hover:bg-black/90 transition-colors text-center"
        >
          CONTINUE SHOPPING
        </Link>
        <Link
          href="/profile"
          className="flex-1 border border-border py-3 px-6 font-bold tracking-wide hover:bg-secondary/30 transition-colors text-center"
        >
          BACK TO ORDERS
        </Link>
      </div>
    </div>
  );
}
