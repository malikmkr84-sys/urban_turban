# UrbanTurban FastAPI Backend

Production-ready FastAPI backend for the UrbanTurban e-commerce platform.

## Features

- ✅ RESTful API with FastAPI
- ✅ Session-based authentication
- ✅ PostgreSQL database with SQLAlchemy ORM
- ✅ Request/response validation with Pydantic
- ✅ CORS support
- ✅ Request logging
- ✅ Product seeding on startup
- ✅ Docker support

## Prerequisites

- Python 3.10 or higher
- PostgreSQL 12 or higher
- pip (Python package manager)

## Quick Start

### 1. Create Virtual Environment

```bash
cd backend-python
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
HOST=0.0.0.0
ENVIRONMENT=development
DATABASE_URL=postgresql://user:password@localhost:5432/urbanturban
SESSION_SECRET=your-secret-key-here
```

### 4. Set Up Database

Create database:
```sql
CREATE DATABASE urbanturban;
```

Tables are created automatically on first startup.

### 5. Run the Application

```bash
python -m app.main
```

Or using uvicorn:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

API available at: `http://localhost:5000`

## API Documentation

- **Swagger UI**: http://localhost:5000/docs
- **ReDoc**: http://localhost:5000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List all products
- `GET /api/products/{slug}` - Get product by slug

### Cart
- `GET /api/cart` - Get current cart
- `POST /api/cart/items` - Add item to cart
- `PATCH /api/cart/items/{id}` - Update cart item
- `DELETE /api/cart/items/{id}` - Remove cart item
- `POST /api/cart/clear` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List user orders
- `GET /api/orders/{id}` - Get order details
- `POST /api/orders/{id}/cancel` - Cancel order

## Project Structure

```
backend-python/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration
│   ├── database.py          # Database connection
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── storage.py           # Data access layer
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py          # Dependencies
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── auth.py      # Auth routes
│   │       ├── products.py # Product routes
│   │       ├── cart.py      # Cart routes
│   │       └── orders.py   # Order routes
│   └── core/
│       ├── __init__.py
│       ├── security.py      # Password hashing
│       └── session.py       # Session utilities
├── requirements.txt
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .gitignore
└── README.md
```

## Database Schema

- `users` - User accounts
- `products` - Product catalog
- `product_variants` - Product color variants
- `carts` - Shopping carts
- `cart_items` - Cart line items
- `orders` - Customer orders
- `order_items` - Order line items
- `payments` - Payment records

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

This starts both the database and backend services.

### Using Docker Only

```bash
# Build image
docker build -t urbanturban-backend .

# Run container
docker run -p 5000:5000 \
  -e DATABASE_URL=postgresql://user:password@host:5432/urbanturban \
  -e SESSION_SECRET=your-secret \
  urbanturban-backend
```

## Production Deployment

### Using Gunicorn

```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:5000
```

### Environment Variables

Required for production:
- `ENVIRONMENT=production`
- `DATABASE_URL` - Production database URL
- `SESSION_SECRET` - Strong random secret
- `PORT` - Server port (default: 5000)

## Development

### Running Tests

```bash
pip install pytest pytest-asyncio
pytest
```

### Code Formatting

```bash
pip install black
black app/
```

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- Ensure database exists

### Port Already in Use
- Change `PORT` in `.env`
- Or stop the process using port 5000

### Import Errors
- Activate virtual environment: `source venv/bin/activate`
- Reinstall dependencies: `pip install -r requirements.txt`
- Check Python version: `python --version` (should be 3.10+)

## License

MIT
