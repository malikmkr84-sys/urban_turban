import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CheckoutRequest } from "../../../shared/routes";
import { type OrderResponse } from "../../../shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function useOrders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutRequest) => {
      const res = await fetch(api.orders.create.path, {
        method: api.orders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create order");
      }
      return (await res.json()) as OrderResponse;
    },
    onSuccess: (order) => {
      // Cache the order data immediately so OrderConfirmation page loads instantly
      queryClient.setQueryData([api.orders.get.path, order.id], order);
      queryClient.invalidateQueries({ queryKey: [api.cart.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      
      // Show success toast with brand colors, auto-dismiss in 2 seconds
      toast({ 
        title: "Order placed!", 
        description: `Order #${order.id} confirmed.`,
        duration: 2000,
        className: "bg-primary text-primary-foreground border-primary"
      });
      
      setLocation(`/orders/${order.id}/confirmation`);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Checkout failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  return {
    createOrder: createOrderMutation.mutate,
    isCreatingOrder: createOrderMutation.isPending,
  };
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: [api.orders.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.orders.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch order");
      return (await res.json()) as OrderResponse;
    },
    enabled: !!id,
  });
}

export function useOrderList() {
  return useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.orders.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return (await res.json()) as OrderResponse[];
    },
  });
}
