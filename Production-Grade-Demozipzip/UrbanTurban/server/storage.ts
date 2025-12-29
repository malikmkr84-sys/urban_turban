import { db } from "./db";
import { 
  users, products, productVariants, carts, cartItems, orders, orderItems, payments,
  type User, type InsertUser, type Product, type ProductWithVariants, 
  type Cart, type CartItem, type Order, type OrderItem
} from "../shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Products
  getProducts(): Promise<ProductWithVariants[]>;
  getProduct(id: number): Promise<ProductWithVariants | undefined>;
  getProductBySlug(slug: string): Promise<ProductWithVariants | undefined>;
  
  // Cart
  getCart(userId?: number): Promise<Cart | undefined>;
  createCart(userId?: number): Promise<Cart>;
  getCartItems(cartId: number): Promise<(CartItem & { variant: any })[]>;
  addItemToCart(cartId: number, variantId: number, quantity: number): Promise<CartItem>;
  updateCartItem(itemId: number, quantity: number): Promise<CartItem>;
  removeCartItem(itemId: number): Promise<void>;
  clearCart(cartId: number): Promise<void>;
  assignCartToUser(cartId: number, userId: number): Promise<void>;

  // Orders
  createOrder(order: any): Promise<Order>;
  createOrderItems(items: any[]): Promise<OrderItem[]>;
  createPayment(payment: any): Promise<any>;
  getOrders(userId: number): Promise<(Order & { items: any[] })[]>;
  getOrder(id: number): Promise<(Order & { items: any[] }) | undefined>;
  updateOrderStatus(orderId: number, status: string, additionalData?: Partial<Order>): Promise<Order>;
  
  // Seeding helper
  seedProducts(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getProducts(): Promise<ProductWithVariants[]> {
    const allProducts = await db.select().from(products);
    const results = [];
    
    for (const prod of allProducts) {
      const variants = await db.select().from(productVariants).where(eq(productVariants.productId, prod.id));
      results.push({ ...prod, variants });
    }
    
    return results;
  }

  async getProduct(id: number): Promise<ProductWithVariants | undefined> {
    const [prod] = await db.select().from(products).where(eq(products.id, id));
    if (!prod) return undefined;
    
    const variants = await db.select().from(productVariants).where(eq(productVariants.productId, prod.id));
    return { ...prod, variants };
  }

  async getProductBySlug(slug: string): Promise<ProductWithVariants | undefined> {
    const [prod] = await db.select().from(products).where(eq(products.slug, slug));
    if (!prod) return undefined;
    
    const variants = await db.select().from(productVariants).where(eq(productVariants.productId, prod.id));
    return { ...prod, variants };
  }

  async getCart(userId?: number): Promise<Cart | undefined> {
    if (!userId) return undefined;
    // Simple logic: get the most recent cart for the user
    // In a real app, you might check for 'active' carts
    const [cart] = await db.select().from(carts)
      .where(eq(carts.userId, userId))
      .orderBy(carts.createdAt); // descending order would be better but simple is fine
      
    return cart;
  }

  async createCart(userId?: number): Promise<Cart> {
    const [cart] = await db.insert(carts).values({ userId }).returning();
    return cart;
  }

  async assignCartToUser(cartId: number, userId: number): Promise<void> {
    await db.update(carts).set({ userId }).where(eq(carts.id, cartId));
  }

  async getCartItems(cartId: number): Promise<(CartItem & { variant: any })[]> {
    const items = await db.select({
      id: cartItems.id,
      cartId: cartItems.cartId,
      productVariantId: cartItems.productVariantId,
      quantity: cartItems.quantity,
      variant: {
        id: productVariants.id,
        productId: productVariants.productId,
        color: productVariants.color,
        sku: productVariants.sku,
        stockQuantity: productVariants.stockQuantity,
        product: products
      }
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(cartItems.cartId, cartId));
    
    return items;
  }

  async addItemToCart(cartId: number, variantId: number, quantity: number): Promise<CartItem> {
    // Check if item exists
    const [existing] = await db.select().from(cartItems)
      .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productVariantId, variantId)));
      
    if (existing) {
      const [updated] = await db.update(cartItems)
        .set({ quantity: existing.quantity + quantity })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    }
    
    const [item] = await db.insert(cartItems).values({
      cartId,
      productVariantId: variantId,
      quantity
    }).returning();
    return item;
  }

  async updateCartItem(itemId: number, quantity: number): Promise<CartItem> {
    const [item] = await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, itemId))
      .returning();
    return item;
  }

  async removeCartItem(itemId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
  }

  async clearCart(cartId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  }

  async createOrder(orderData: any): Promise<Order> {
    const [order] = await db.insert(orders).values(orderData).returning();
    return order;
  }

  async createOrderItems(itemsData: any[]): Promise<OrderItem[]> {
    return await db.insert(orderItems).values(itemsData).returning();
  }

  async createPayment(paymentData: any): Promise<any> {
    const [payment] = await db.insert(payments).values(paymentData).returning();
    return payment;
  }

  async getOrders(userId: number): Promise<(Order & { items: any[] })[]> {
    const userOrders = await db.select().from(orders).where(eq(orders.userId, userId));
    const results = [];
    
    for (const order of userOrders) {
      const items = await db.select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        priceAtPurchase: orderItems.priceAtPurchase,
        variant: {
          color: productVariants.color,
          product: products
        }
      })
      .from(orderItems)
      .innerJoin(productVariants, eq(orderItems.productVariantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(eq(orderItems.orderId, order.id));
      
      results.push({ ...order, items });
    }
    
    return results;
  }

  async getOrder(id: number): Promise<(Order & { items: any[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;
    
    const items = await db.select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      priceAtPurchase: orderItems.priceAtPurchase,
      variant: {
        color: productVariants.color,
        product: products
      }
    })
    .from(orderItems)
    .innerJoin(productVariants, eq(orderItems.productVariantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(orderItems.orderId, order.id));
    
    return { ...order, items };
  }

  async updateOrderStatus(orderId: number, status: string, additionalData: Partial<Order> = {}): Promise<Order> {
    const [updated] = await db.update(orders)
      .set({ status, ...additionalData })
      .where(eq(orders.id, orderId))
      .returning();
    return updated;
  }

  // Seeding helper - Populates initial product catalog
  async seedProducts(): Promise<void> {
    const existing = await db.select().from(products);
    if (existing.length > 0) return;

    // Seed Data - Add initial cap product
    const cap = await db.insert(products).values({
      name: "The Urban Essential",
      slug: "urban-essential-cap",
      price: "799.00",
      description: "A minimalist dad cap designed for the modern urban explorer. Crafted from 100% premium cotton twill with an adjustable strap.",
      microStory: "Inspired by the concrete jungle, built for comfort. The Urban Essential isn't just a cap; it's a statement of calm confidence amidst the chaos.",
      images: ["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800"],
      isActive: true
    }).returning();

    // Create color variants for the seeded product
    await db.insert(productVariants).values([
      { productId: cap[0].id, color: "Black", sku: "UE-BLK-001", stockQuantity: 100 },
      { productId: cap[0].id, color: "Beige", sku: "UE-BGE-001", stockQuantity: 100 },
      { productId: cap[0].id, color: "Olive", sku: "UE-OLV-001", stockQuantity: 100 },
    ]);
  }
}

export const storage = new DatabaseStorage();
