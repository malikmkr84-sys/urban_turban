# UrbanTurban

## Overview

UrbanTurban is a premium e-commerce platform for minimalist headwear. It's a full-stack TypeScript application with a React frontend and Express backend, featuring user authentication, product catalog with variants, shopping cart (supports guest and authenticated users), checkout with mock payment providers, and order tracking.

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
- Development: Vite dev server with HMR integrated into Express via `server/vite.ts`
- Production: Static file serving from built `dist/public` directory via `server/static.ts`

### Key Design Decisions

1. **Typed API Contracts**: All API endpoints are defined with Zod schemas in `shared/routes.ts`, enabling type-safe requests and responses across frontend and backend.

2. **Storage Abstraction**: Database operations are abstracted through an `IStorage` interface in `server/storage.ts`, making it easier to test and potentially swap storage implementations.

3. **Guest Cart Support**: Carts can exist without a user ID, allowing guest checkout. Carts are assigned to users upon authentication.

4. **Product Variants**: Products have multiple color variants with separate stock tracking, enabling inventory management per variant.

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Schema defined in `shared/schema.ts`, migrations in `./migrations`

### Authentication
- **Passport.js**: Local strategy for email/password authentication
- **express-session**: Session management with `connect-pg-simple` for PostgreSQL session storage
- **SESSION_SECRET**: Environment variable required for session encryption

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **Framer Motion**: Animation library for transitions
- **shadcn/ui**: UI component library built on Radix UI primitives
- **Wouter**: Lightweight React router

### Build & Development
- **Vite**: Frontend build tool with HMR support
- **tsx**: TypeScript execution for development server
- **Drizzle Kit**: Database schema management (`npm run db:push`)

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption (defaults to "urban-turban-secret" in development)