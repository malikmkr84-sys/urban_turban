# UrbanTurban

## Overview

UrbanTurban is a premium e-commerce platform for minimalist headwear. It's a full-stack TypeScript application with a React frontend and Express backend, featuring user authentication, product catalog with variants, shopping cart (guest and authenticated), checkout with mock payment providers, and order tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, local React state for UI
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Build Tool**: Vite with custom development server integration

The frontend follows a pages-based structure under `client/src/pages/` with reusable components in `client/src/components/`. Custom hooks in `client/src/hooks/` handle data fetching and business logic.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Passport.js with local strategy (email/password)
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session storage
- **Password Hashing**: Node.js crypto module with scrypt

The backend uses a storage pattern (`server/storage.ts`) that abstracts database operations. Routes are defined in `server/routes.ts` with typed API contracts in `shared/routes.ts`.

### Shared Code
- **Schema**: `shared/schema.ts` defines all database tables and Zod validation schemas using drizzle-zod
- **API Contracts**: `shared/routes.ts` defines typed API endpoints with input/output schemas

### Database Schema
Tables include:
- `users` - Customer accounts with email/password authentication
- `products` - Product catalog with name, price, description, images
- `productVariants` - Color variants with SKU and stock quantity
- `carts` - Shopping carts (supports guest and authenticated users)
- `cartItems` - Items in cart with quantity
- `orders` - Order records with status tracking
- `orderItems` - Individual items in an order
- `payments` - Payment records for orders

### Development vs Production
- Development: Vite dev server with HMR integrated into Express
- Production: Static file serving from built `dist/public` directory

### Key Design Decisions
1. **Shared type definitions**: Both frontend and backend consume the same Zod schemas, ensuring type safety across the stack
2. **Storage abstraction**: Database operations are abstracted through an interface, making it easier to test or swap implementations
3. **Guest cart support**: Carts can exist without a user, allowing anonymous shopping that merges on login
4. **Mock payment providers**: Checkout supports multiple mock payment methods (UPI, Razorpay, Stripe) for demo purposes

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Schema management and queries
- **connect-pg-simple**: Session storage in PostgreSQL

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption (falls back to default in development)

### Third-Party Libraries
- **Radix UI**: Headless UI primitives for accessible components
- **Framer Motion**: Animation library
- **TanStack React Query**: Server state management
- **Passport.js**: Authentication middleware

### Build & Development
- **Vite**: Frontend build tool with HMR
- **tsx**: TypeScript execution for development
- **Drizzle Kit**: Database migrations (`npm run db:push`)