# UrbanTurban

## Overview

UrbanTurban is a premium e-commerce platform for minimalist headwear. It's a full-stack TypeScript application with a React frontend and Express backend, featuring user authentication, product catalog, shopping cart, and order management with mock payment processing.

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

The frontend follows a pages-based structure under `client/src/pages/` with reusable components in `client/src/components/`. Custom hooks in `client/src/hooks/` handle data fetching and business logic (auth, cart, orders, products).

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

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migrations with `npm run db:push`

### Authentication
- **Passport.js**: Authentication middleware
- **passport-local**: Email/password strategy
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### UI Components
- **shadcn/ui**: Full component library (accordion, dialog, toast, forms, etc.)
- **Radix UI**: Underlying primitives for shadcn/ui components
- **Lucide React**: Icon library

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption (optional, has default for development)

### Payment Integration
The system includes mock payment providers (`upi_mock`, `razorpay_mock`, `stripe_mock`) - these are placeholders for future real payment integration.