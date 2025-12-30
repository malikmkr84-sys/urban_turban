import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type AddToCartRequest, type UpdateCartItemRequest } from "@shared/routes";
import { type CartResponse } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useCart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cart, isLoading } = useQuery({
    queryKey: [api.cart.get.path],
    queryFn: async () => {
      const res = await fetch(api.cart.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cart");
      return (await res.json()) as CartResponse;
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (data: AddToCartRequest) => {
      // Performance logging
      const isEnabled = typeof window !== 'undefined' && localStorage.getItem('ENABLE_PERFORMANCE_LOGGING') === 'true';
      const start = isEnabled ? performance.now() : 0;

      const res = await fetch(api.cart.addItem.path, {
        method: api.cart.addItem.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (isEnabled) {
        console.log(`[PERF] Added item to cart in ${(performance.now() - start).toFixed(2)}ms`);
      }

      if (!res.ok) throw new Error("Failed to add item");
      return (await res.json()) as CartResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cart.get.path] });
      toast({ title: "Added to cart", description: "Item added successfully" });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateCartItemRequest) => {
      const url = buildUrl(api.cart.updateItem.path, { id });
      const res = await fetch(url, {
        method: api.cart.updateItem.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update item");
      return (await res.json()) as CartResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cart.get.path] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.cart.removeItem.path, { id });
      const res = await fetch(url, {
        method: api.cart.removeItem.method,
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to remove item");
      return (await res.json()) as CartResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cart.get.path] });
    },
  });

  return {
    cart,
    isLoading,
    addItem: addItemMutation.mutate,
    isAdding: addItemMutation.isPending,
    updateItem: updateItemMutation.mutate,
    removeItem: removeItemMutation.mutate,
  };
}
