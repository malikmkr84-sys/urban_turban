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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-border pb-6">
        <div>
          <h1 className="font-display text-4xl mb-2">My Account</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}</p>
        </div>
        <button 
          onClick={() => logout()}
          className="mt-4 md:mt-0 px-6 py-2 border border-border hover:border-destructive hover:text-destructive transition-colors text-sm font-bold uppercase tracking-wide"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar info */}
        <div className="lg:col-span-1 space-y-8">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide mb-4">Account Details</h3>
            <div className="p-4 bg-secondary/20 text-sm space-y-2">
              <p><span className="text-muted-foreground block text-xs">Email</span> {user.email}</p>
              <p><span className="text-muted-foreground block text-xs">Member since</span> {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-3">
          <h2 className="font-display text-2xl mb-6">Order History</h2>
          
          {isOrdersLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : !orders || orders.length === 0 ? (
             <div className="text-center py-16 bg-secondary/10 border border-dashed border-border">
               <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
               <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
               <Link href="/shop" className="text-primary font-bold hover:underline">Start Shopping</Link>
             </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className={`border border-border p-6 flex flex-row justify-between items-center gap-4 hover:border-black transition-colors ${
                  order.status === 'paid' ? 'bg-emerald-50/30' : 
                  order.status === 'cancelled' ? 'bg-red-50/30' : 
                  'bg-secondary/10'
                }`}>
                  <div className="flex flex-row items-center gap-4 flex-1">
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold whitespace-nowrap">Order #{order.id}</span>
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

                    <p className="hidden sm:block text-xs text-muted-foreground whitespace-nowrap">
                      Placed on {new Date(order.createdAt!).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-8 shrink-0">
                    <span className="font-medium whitespace-nowrap">₹{Number(order.totalAmount).toFixed(2)}</span>
                    <Link href={`/orders/${order.id}`} className="text-sm font-bold border-b border-black pb-0.5 hover:opacity-60 whitespace-nowrap">
                      TRACK ORDER
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
