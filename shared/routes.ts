import { z } from "zod";

// Type definitions for API requests
export type CheckoutRequest = {
  paymentProvider: "upi_mock" | "razorpay_mock" | "stripe_mock" | "cod";
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};

export type AddToCartRequest = {
  variantId: number;
  quantity: number;
};

export type UpdateCartItemRequest = {
  quantity: number;
};

// Shared Error Schemas
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const API_BASE = import.meta.env.VITE_API_URL;


export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register',
      input: z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
      }),
      responses: {
        201: z.object({ id: z.number(), email: z.string(), name: z.string(), role: z.string() }),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({
        email: z.string().email(),
        password: z.string(),
      }),
      responses: {
        200: z.object({ id: z.number(), email: z.string(), name: z.string(), role: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me',
      responses: {
        200: z.object({ id: z.number(), email: z.string(), name: z.string(), role: z.string() }).nullable(),
      },
    },
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      responses: {
        200: z.any(),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:slug',
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
  },
  cart: {
    get: {
      method: 'GET' as const,
      path: '/api/cart',
      responses: {
        200: z.any(),
      },
    },
    addItem: {
      method: 'POST' as const,
      path: '/api/cart/items',
      input: z.object({
        variantId: z.number(),
        quantity: z.number().min(1),
      }),
      responses: {
        200: z.any(),
      },
    },
    updateItem: {
      method: 'PATCH' as const,
      path: '/api/cart/items/:id',
      input: z.object({
        quantity: z.number().min(0),
      }),
      responses: {
        200: z.any(),
      },
    },
    removeItem: {
      method: 'DELETE' as const,
      path: '/api/cart/items/:id',
      responses: {
        200: z.any(),
      },
    },
    clear: {
      method: 'POST' as const,
      path: '/api/cart/clear',
      responses: {
        200: z.any(),
      },
    },
  },
  orders: {
    create: {
      method: 'POST' as const,
      path: '/api/orders',
      input: z.object({
        paymentProvider: z.enum(["upi_mock", "razorpay_mock", "stripe_mock", "cod"]),
      }),
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/orders',
      responses: {
        200: z.array(z.any()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/orders/:id',
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
  },
  users: {
    create: {
      method: 'POST' as const,
      path: '/api/users',
      input: z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
        role: z.enum(["customer", "employee", "admin"]),
      }),
      responses: {
        201: z.object({ id: z.number(), email: z.string(), name: z.string(), role: z.string() }),
        400: errorSchemas.validation,
        403: errorSchemas.unauthorized,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/users',
      responses: {
        200: z.array(z.object({ id: z.number(), email: z.string(), name: z.string(), role: z.string() })),
        403: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/users/:id',
      responses: {
        204: z.null(),
        400: errorSchemas.validation,
        403: errorSchemas.unauthorized,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return `${API_BASE}${url}`;
}

