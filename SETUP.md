# Setup and Run Guide

## Project Location

```
/Users/bytenomad./Documents/UrbanTurban/
```

## Quick Start (5 Steps)

### Step 1: Navigate to Backend Directory

```bash
cd /Users/bytenomad./Documents/UrbanTurban/backend-python
```

### Step 2: Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` file:
```env
PORT=5000
HOST=0.0.0.0
ENVIRONMENT=development
DATABASE_URL=postgresql://user:password@localhost:5432/urbanturban
SESSION_SECRET=your-secret-key-here
```

### Step 5: Run the Server

```bash
python -m app.main
```

**Or with auto-reload:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

## Database Setup

### Option A: Using Docker (Easiest)

```bash
# From backend-python directory
docker run --name urbanturban-db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=urbanturban \
  -p 5432:5432 \
  -d postgres:15
```

### Option B: Local PostgreSQL

1. Install PostgreSQL (if not installed)
2. Start PostgreSQL service
3. Create database:
```sql
CREATE DATABASE urbanturban;
```

## Verify Installation

1. **Check server is running:**
   ```bash
   curl http://localhost:5000/health
   ```
   Expected: `{"status":"healthy"}`

2. **Access API Documentation:**
   - Swagger UI: http://localhost:5000/docs
   - ReDoc: http://localhost:5000/redoc

3. **Test API endpoint:**
   ```bash
   curl http://localhost:5000/api/products
   ```

## Using Docker Compose (All-in-One)

### From project root:

```bash
cd /Users/bytenomad./Documents/UrbanTurban/backend-python
docker-compose up -d
```

This starts:
- PostgreSQL database
- FastAPI backend

**Stop services:**
```bash
docker-compose down
```

## Full Path Reference

- **Project root:** `/Users/bytenomad./Documents/UrbanTurban/`
- **Backend directory:** `/Users/bytenomad./Documents/UrbanTurban/backend-python/`
- **Application code:** `/Users/bytenomad./Documents/UrbanTurban/backend-python/app/`
- **Environment file:** `/Users/bytenomad./Documents/UrbanTurban/backend-python/.env`
- **Requirements:** `/Users/bytenomad./Documents/UrbanTurban/backend-python/requirements.txt`

## Troubleshooting

### Port 5000 already in use
```bash
# Change PORT in .env file to another port (e.g., 5001)
# Or kill the process using port 5000
lsof -ti:5000 | xargs kill -9
```

### Database connection error
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format in `.env`
- Ensure database exists

### Python version error
```bash
# Check Python version
python3 --version  # Should be 3.10+

# If using wrong version, specify:
python3.10 -m venv venv
```

### Import errors
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

## Production Run

```bash
# Using Gunicorn (recommended for production)
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:5000
```

## Complete Command Sequence

```bash
# 1. Navigate to backend
cd /Users/bytenomad./Documents/UrbanTurban/backend-python

# 2. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Setup environment
cp .env.example .env
# Edit .env with your database credentials

# 5. Start database (if using Docker)
docker run --name urbanturban-db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=urbanturban \
  -p 5432:5432 \
  -d postgres:15

# 6. Run the server
python -m app.main
```

## API Endpoints

Once running, test these endpoints:

```bash
# Health check
curl http://localhost:5000/health

# List products
curl http://localhost:5000/api/products

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

