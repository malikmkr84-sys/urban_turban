import { useCart } from "@/hooks/use-cart";
import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Loader2, CreditCard, Lock } from "lucide-react";

export default function Checkout() {
  const { cart, isLoading: isCartLoading } = useCart();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { createOrder, isCreatingOrder } = useOrders();
  const [, setLocation] = useLocation();
  const [paymentProvider, setPaymentProvider] = useState<"upi_mock" | "razorpay_mock" | "cod">("upi_mock");

  // Auth Guard
  useEffect(() => {
    if (!isAuthLoading && !user) {
      setLocation("/login?redirect=/checkout");
    }
  }, [user, isAuthLoading, setLocation]);

  if (isCartLoading || isAuthLoading) {
    return <div className="min-h-screen pt-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!cart || cart.items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const total = cart.items.reduce((sum, item) => sum + (Number(item.variant.product.price) * item.quantity), 0);

  const handlePlaceOrder = () => {
    createOrder({ paymentProvider });
  };

  return (
    <div className="min-h-screen pt-32 pb-24 max-w-4xl mx-auto px-4">
      <h1 className="font-display text-4xl mb-12">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="space-y-12">
          
          {/* Shipping Mock */}
          <section>
            <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
            <div className="p-4 border border-border bg-secondary/10">
              <p className="font-medium">{user?.name}</p>
              <p className="text-muted-foreground mt-1">123 Fashion Street<br/>Design District, NY 10012<br/>United States</p>
              <p className="text-xs text-muted-foreground mt-4 italic">Address is pre-filled for this demo</p>
            </div>
          </section>

          {/* Payment Method */}
          <section>
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            <div className="space-y-4">
              <div 
                className={`p-4 border cursor-pointer transition-colors flex items-center justify-between ${paymentProvider === "upi_mock" ? "border-primary bg-primary/5" : "border-border"}`}
                onClick={() => setPaymentProvider("upi_mock")}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border border-current flex items-center justify-center ${paymentProvider === "upi_mock" ? "text-primary" : "text-muted-foreground"}`}>
                    {paymentProvider === "upi_mock" && <div className="w-2 h-2 bg-current rounded-full" />}
                  </div>
                  <div>
                    <span className="font-medium block">UPI Payment</span>
                    <span className="text-xs text-muted-foreground">For Indian Users</span>
                  </div>
                </div>
                <CreditCard className="w-5 h-5 text-muted-foreground" />
              </div>

              <div 
                className={`p-4 border cursor-pointer transition-colors flex items-center justify-between ${paymentProvider === "razorpay_mock" ? "border-primary bg-primary/5" : "border-border"}`}
                onClick={() => setPaymentProvider("razorpay_mock")}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border border-current flex items-center justify-center ${paymentProvider === "razorpay_mock" ? "text-primary" : "text-muted-foreground"}`}>
                    {paymentProvider === "razorpay_mock" && <div className="w-2 h-2 bg-current rounded-full" />}
                  </div>
                  <div>
                    <span className="font-medium block">Razorpay</span>
                    <span className="text-xs text-muted-foreground">Global Payments</span>
                  </div>
                </div>
                <CreditCard className="w-5 h-5 text-muted-foreground" />
              </div>

              <div 
                className={`p-4 border cursor-pointer transition-colors flex items-center justify-between ${paymentProvider === "cod" ? "border-primary bg-primary/5" : "border-border"}`}
                onClick={() => setPaymentProvider("cod")}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border border-current flex items-center justify-center ${paymentProvider === "cod" ? "text-primary" : "text-muted-foreground"}`}>
                    {paymentProvider === "cod" && <div className="w-2 h-2 bg-current rounded-full" />}
                  </div>
                  <div>
                    <span className="font-medium block">Cash on Delivery</span>
                    <span className="text-xs text-muted-foreground">Pay when you receive</span>
                  </div>
                </div>
                <CreditCard className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <div className="bg-secondary/20 p-8 h-fit">
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {cart.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.quantity}x {item.variant.product.name} ({item.variant.color})</span>
                <span>₹{(Number(item.variant.product.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t border-border flex justify-between font-bold text-lg mb-8">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isCreatingOrder}
            className="w-full bg-black text-white py-4 font-bold tracking-wide hover:bg-black/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isCreatingOrder ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />}
            {isCreatingOrder ? "PROCESSING..." : `PAY ₹${total.toFixed(2)}`}
          </button>
          
          <p className="text-xs text-center text-muted-foreground mt-4">
            This is a secure mock payment. No real money will be charged.
          </p>
        </div>
      </div>
    </div>
  );
}
