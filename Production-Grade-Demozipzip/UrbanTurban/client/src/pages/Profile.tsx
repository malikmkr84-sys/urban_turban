import { useAuth } from "@/hooks/use-auth";
import { useOrderList } from "@/hooks/use-orders";
import { useLocation, Link } from "wouter";
import { useEffect } from "react";
import { Loader2, Package } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../../../shared/routes";

export default function Profile() {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const { data: orders, isLoading: isOrdersLoading } = useOrderList();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      setLocation("/login");
    }
  }, [user, isAuthLoading, setLocation]);

  if (isAuthLoading) return <div className="min-h-screen pt-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-border pb-6 gap-4">
        <div className="w-full">
          <h1 className="font-display text-3xl md:text-4xl mb-2">My Account</h1>
          <p className="text-sm md:text-base text-muted-foreground">Welcome back, {user.name}</p>
        </div>
        <button 
          onClick={() => logout()}
          className="w-full md:w-auto px-6 py-3 md:py-2 border border-border hover:border-destructive hover:text-destructive transition-colors text-xs font-bold uppercase tracking-widest"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">
        {/* Sidebar info */}
        <div className="lg:col-span-1 space-y-8">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest mb-4 opacity-70">Account Details</h3>
            <div className="p-5 bg-secondary/20 text-sm space-y-4">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-tight mb-1">Email</span>
                <span className="break-all font-medium">{user.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-tight mb-1">Member since</span>
                <span className="font-medium">{new Date().getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-3">
          <h2 className="font-display text-2xl mb-6">Order History</h2>
          
          {isOrdersLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : !orders || orders.length === 0 ? (
             <div className="text-center py-16 bg-secondary/10 border border-dashed border-border px-4">
               <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
               <p className="text-muted-foreground mb-4 text-sm">You haven't placed any orders yet.</p>
               <Link href="/shop" className="text-primary font-bold hover:underline text-sm">Start Shopping</Link>
             </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className={`border border-border p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-black transition-colors ${
                  order.status === 'paid' ? 'bg-emerald-50/30' : 
                  order.status === 'cancelled' ? 'bg-red-50/30' : 
                  'bg-secondary/10'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4 flex-1 w-full">
                    <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                      <span className="font-bold text-sm md:text-base">Order #{order.id}</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm whitespace-nowrap ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                        'bg-secondary text-foreground'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-medium">
                      {new Date(order.createdAt!).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 md:gap-8 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                    <span className="font-bold text-sm md:text-base">₹{Number(order.totalAmount).toFixed(2)}</span>
                    <Link href={`/orders/${order.id}`} className="text-xs font-bold border-b border-black pb-0.5 hover:opacity-60 uppercase tracking-widest">
                      Track
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
