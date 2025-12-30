import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type ProductWithVariants } from "@shared/schema";

export function useProducts() {
  return useQuery({
    queryKey: [api.products.list.path],
    queryFn: async () => {
      const res = await fetch(api.products.list.path);
      if (!res.ok) throw new Error("Failed to fetch products");
      // Cast to expected type since schema response is strictly typed in implementation but 'any' in manifest for complexity reasons
      return (await res.json()) as ProductWithVariants[];
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: [api.products.get.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.products.get.path, { slug });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch product");
      return (await res.json()) as ProductWithVariants;
    },
    enabled: !!slug,
  });
}
