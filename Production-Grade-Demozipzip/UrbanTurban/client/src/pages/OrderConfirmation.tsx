import { useRoute, Link } from "wouter";
import { useOrder } from "@/hooks/use-orders";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function OrderConfirmation() {
  const [, params] = useRoute("/orders/:id/confirmation");
  const id = parseInt(params?.id || "0");
  const { data: order, isLoading } = useOrder(id);

  if (isLoading) {
    return <div className="min-h-screen pt-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!order) {
    return <div className="min-h-screen pt-32 text-center">Order not found</div>;
  }

  return (
    <div className="min-h-screen pt-32 pb-24 max-w-2xl mx-auto px-4 text-center">
      <div className="mb-8 flex justify-center text-primary">
        <CheckCircle2 className="w-20 h-20" />
      </div>
      
      <h1 className="font-display text-4xl mb-4">Order Confirmed</h1>
      <p className="text-lg text-muted-foreground mb-12">
        Thank you for your purchase. Your order #{order.id} has been received.
      </p>

      <div className="bg-secondary/20 p-8 text-left mb-12">
        <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
          <span className="font-bold">Order ID</span>
          <span className="font-mono">{order.id}</span>
        </div>
        <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
          <span className="font-bold">Status</span>
          <span className="uppercase text-sm tracking-wider bg-primary/10 text-primary px-3 py-1">{order.status}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-bold">Total Amount</span>
          <span className="font-bold text-lg">₹{Number(order.totalAmount).toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-4 flex-col sm:flex-row">
        <Link href="/shop" className="flex-1 bg-primary text-primary-foreground py-3 px-6 font-bold tracking-wide hover:bg-primary/90 transition-colors text-center">
          CONTINUE SHOPPING
        </Link>
        <Link href={`/orders/${order.id}`} className="flex-1 border border-border py-3 px-6 font-bold tracking-wide hover:bg-secondary/30 transition-colors text-center">
          TRACK ORDER
        </Link>
      </div>
    </div>
  );
}
