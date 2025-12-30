// Type definitions matching backend schemas
export type ProductVariant = {
  id: number;
  product_id: number;
  color: string;
  sku: string;
  stock_quantity: number;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  price: string;
  description: string;
  micro_story: string;
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductWithVariants = Product & {
  variants: ProductVariant[];
};

export type CartItem = {
  id: number;
  cart_id: number;
  product_variant_id: number;
  quantity: number;
  variant: ProductVariant & {
    product: Product;
  };
};

export type CartResponse = {
  id: number;
  items: CartItem[];
  total?: number;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_variant_id: number;
  quantity: number;
  price_at_purchase: string;
  variant?: ProductVariant & {
    product: Product;
  };
};

export type OrderResponse = {
  id: number;
  user_id: number;
  status: string;
  total_amount: string;
  payment_provider: string;
  tracking_number?: string | null;
  cancellation_reason?: string | null;
  refund_status?: string | null;
  created_at: string;
  items: OrderItem[];
};

export type User = {
  id: number;
  email: string;
  name: string;
  role: 'customer' | 'admin' | 'employee';
};

