# UrbanTurban

E-commerce platform backend built with FastAPI and PostgreSQL.

## Project Structure

```
UrbanTurban/
├── backend-python/          # FastAPI backend
│   ├── app/                 # Application code
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment variables template
│   └── README.md           # Backend setup guide
└── client/                  # Frontend (React + Vite)
```

## Quick Start

### Prerequisites

- Python 3.10+
- PostgreSQL 12+
- pip

### Backend Setup

**Full path:** `/Users/bytenomad./Documents/UrbanTurban/backend-python/`

1. **Navigate to backend directory**
   ```bash
   cd /Users/bytenomad./Documents/UrbanTurban/backend-python
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and settings
   ```

5. **Set up database** (choose one):
   
   **Option A: Docker**
   ```bash
   docker run --name urbanturban-db \
     -e POSTGRES_USER=user \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=urbanturban \
     -p 5432:5432 \
     -d postgres:15
   ```
   
   **Option B: Local PostgreSQL**
   ```sql
   CREATE DATABASE urbanturban;
   ```

6. **Run the server**
   ```bash
   python -m app.main
   ```
   
   **Or with auto-reload:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
   ```

The API will be available at `http://localhost:5000`

**📖 For detailed setup instructions, see [SETUP.md](./SETUP.md)**

### API Documentation

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

## Database Setup

### Using Docker

```bash
docker run --name urbanturban-db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=urbanturban \
  -p 5432:5432 \
  -d postgres:15
```

### Manual Setup

1. Create database:
   ```sql
   CREATE DATABASE urbanturban;
   ```

2. Tables are created automatically on first startup.

## Environment Variables

Required environment variables (see `.env.example`):

- `PORT` - Server port (default: 5000)
- `HOST` - Server host (default: 0.0.0.0)
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret key for session encryption
- `ENVIRONMENT` - Environment (development/production)

## Development

### Running in Development Mode

```bash
cd backend-python
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

### Running Tests

```bash
cd backend-python
source venv/bin/activate
pytest
```

## Production Deployment

### Using Gunicorn

```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:5000
```

### Using Docker Compose (Recommended)

```bash
cd backend-python
docker-compose up -d
```

This starts both PostgreSQL and the FastAPI backend.

### Using Docker Only

```bash
cd backend-python
docker build -t urbanturban-backend .
docker run -p 5000:5000 \
  -e DATABASE_URL=postgresql://user:password@host:5432/urbanturban \
  -e SESSION_SECRET=your-secret \
  urbanturban-backend
```

## License

MIT

