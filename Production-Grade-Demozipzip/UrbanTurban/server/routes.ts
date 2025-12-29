import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "../shared/routes";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Auth Helper Functions
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePassword(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // === SEEDING ===
  await storage.seedProducts();

  // === AUTHENTICATION SETUP ===
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "urban-turban-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production" },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user || !(await comparePassword(password, user.password))) {
          return done(null, false, { message: "Invalid credentials" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // === AUTH ROUTES ===

  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByEmail(input.email);
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({ ...input, password: hashedPassword });
      
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({ id: user.id, email: user.email, name: user.name });
      });
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      next(err);
    }
  });

  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    const user = req.user as any;
    res.json({ id: user.id, email: user.email, name: user.name });
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.user) return res.json(null);
    const user = req.user as any;
    res.json({ id: user.id, email: user.email, name: user.name });
  });

  // === PRODUCT ROUTES ===

  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProductBySlug(req.params.slug);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  // === CART ROUTES ===

  // Middleware to get/create cart ID
  // For this demo, we'll store cartId in session for guests, or use userId if logged in
  const getCartId = async (req: any): Promise<number> => {
    if (req.user) {
      let cart = await storage.getCart(req.user.id);
      if (!cart) cart = await storage.createCart(req.user.id);
      return cart.id;
    }
    
    // Guest cart logic (simplified)
    if (req.session.cartId) return req.session.cartId;
    const cart = await storage.createCart();
    req.session.cartId = cart.id;
    return cart.id;
  };

  app.get(api.cart.get.path, async (req, res) => {
    const cartId = await getCartId(req);
    const cart = await storage.getCart(req.user?.id); // Refresh to get details if needed
    const items = await storage.getCartItems(cartId);
    
    // Calculate totals
    const total = items.reduce((sum, item) => {
      return sum + (Number(item.variant.product.price) * item.quantity);
    }, 0);

    res.json({ id: cartId, items, total });
  });

  app.post(api.cart.addItem.path, async (req, res) => {
    const cartId = await getCartId(req);
    const { variantId, quantity } = api.cart.addItem.input.parse(req.body);
    await storage.addItemToCart(cartId, variantId, quantity);
    
    // Return updated cart
    const items = await storage.getCartItems(cartId);
    res.json({ id: cartId, items });
  });

  app.patch(api.cart.updateItem.path, async (req, res) => {
    const cartId = await getCartId(req);
    const { quantity } = api.cart.updateItem.input.parse(req.body);
    if (quantity === 0) {
      await storage.removeCartItem(Number(req.params.id));
    } else {
      await storage.updateCartItem(Number(req.params.id), quantity);
    }
    
    const items = await storage.getCartItems(cartId);
    res.json({ id: cartId, items });
  });

  app.delete(api.cart.removeItem.path, async (req, res) => {
    const cartId = await getCartId(req);
    await storage.removeCartItem(Number(req.params.id));
    
    const items = await storage.getCartItems(cartId);
    res.json({ id: cartId, items });
  });

  app.post(api.cart.clear.path, async (req, res) => {
    const cartId = await getCartId(req);
    await storage.clearCart(cartId);
    res.json({ id: cartId, items: [] });
  });

  // === ORDER ROUTES ===

  app.post(api.orders.create.path, async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Must be logged in" });
      
      const cartId = await getCartId(req);
      const items = await storage.getCartItems(cartId);
      
      if (items.length === 0) return res.status(400).json({ message: "Cart is empty" });
      
      const totalAmount = items.reduce((sum, item) => {
        return sum + (Number(item.variant.product.price) * item.quantity);
      }, 0);

      const { paymentProvider } = api.orders.create.input.parse(req.body);

      // Mock Payment Processing
      // In a real app, we'd interact with Razorpay/Stripe here
      const paymentStatus = paymentProvider === "cod" ? "pending" : "success";
      const externalId = paymentProvider === "cod" ? null : `mock_${paymentProvider}_${Date.now()}`;

      // Create Order
      const order = await storage.createOrder({
        userId: req.user.id,
        totalAmount: totalAmount.toString(),
        paymentProvider,
        status: paymentProvider === "cod" ? "pending" : "paid"
      });

      // Create Order Items
      await storage.createOrderItems(items.map(item => ({
        orderId: order.id,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        priceAtPurchase: item.variant.product.price
      })));

      // Record Payment
      if (paymentProvider !== "cod") {
        await storage.createPayment({
          orderId: order.id,
          provider: paymentProvider,
          status: paymentStatus,
          externalId: externalId!
        });
      }

      // === DEMO: Email Notification ===
      console.log(`
        [DEMO EMAIL SERVICE]
        To: ${req.user.email}
        Subject: Order Confirmation #${order.id}
        Body: Thank you for your order! Your payment of ₹${totalAmount} via ${paymentProvider} was successful.
        We will ship your items soon.
      `);

      // Clear Cart
      await storage.clearCart(cartId);

      res.status(201).json({ ...order, items });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      next(err);
    }
  });

  app.get(api.orders.list.path, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Must be logged in" });
    const orders = await storage.getOrders(req.user.id as number);
    res.json(orders);
  });

  app.get(api.orders.get.path, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Must be logged in" });
    const order = await storage.getOrder(Number(req.params.id));
    if (!order || order.userId !== (req.user as any).id) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  });

  app.post("/api/orders/:id/cancel", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Must be logged in" });
    const orderId = Number(req.params.id);
    const order = await storage.getOrder(orderId);
    
    if (!order || order.userId !== (req.user as any).id) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only allow cancellation for pending or paid states
    if (!["pending", "paid"].includes(order.status)) {
      return res.status(400).json({ message: "Order cannot be cancelled in its current state" });
    }

    const updatedOrder = await storage.updateOrderStatus(orderId, "cancelled", {
      cancellationReason: req.body.reason || "User cancelled",
      refundStatus: order.status === "paid" ? "processing" : "none"
    });

    res.json(updatedOrder);
  });

  return httpServer;
}
