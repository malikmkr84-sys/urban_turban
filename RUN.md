# Run Instructions

## ✅ Backend (FastAPI) - VERIFIED

### Path
```
/Users/bytenomad./Documents/UrbanTurban/backend-python/
```

### Steps

1. **Navigate to backend**
   ```bash
   cd /Users/bytenomad./Documents/UrbanTurban/backend-python
   ```

2. **Activate virtual environment**
   ```bash
   source venv/bin/activate
   ```

3. **Run server**
   ```bash
   python3 -m app.main
   ```

**Backend runs on:** `http://localhost:5000`

**Verify:**
```bash
curl http://localhost:5000/health
# Expected: {"status":"healthy"}

curl http://localhost:5000/api/products
# Returns product list
```

**API Docs:**
- Swagger UI: http://localhost:5000/docs
- ReDoc: http://localhost:5000/redoc

---

## ⚠️ Frontend (React + Vite)

### Path
```
/Users/bytenomad./Documents/UrbanTurban/client/
```

### Status
Frontend code exists but requires setup (no package.json found).

### Setup Required

1. **Navigate to client**
   ```bash
   cd /Users/bytenomad./Documents/UrbanTurban/client
   ```

2. **Initialize (if needed)**
   ```bash
   npm init -y
   npm install react react-dom @tanstack/react-query wouter
   npm install -D vite @vitejs/plugin-react typescript
   ```

3. **Create vite.config.ts** (with proxy to backend):
   ```typescript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     server: {
       proxy: {
         '/api': 'http://localhost:5000'
       }
     }
   })
   ```

4. **Run dev server**
   ```bash
   npm run dev
   ```

---

## Environment Variables

### Backend (.env in backend-python/)
```env
PORT=5000
HOST=0.0.0.0
ENVIRONMENT=development
# SQLite (default) - no DATABASE_URL needed
# For PostgreSQL: DATABASE_URL=postgresql://user:password@localhost:5432/urbanturban
SESSION_SECRET=urban-turban-secret-dev
```

**Note:** SQLite database file: `backend-python/urbanturban.db`

### Frontend
No environment variables required. Uses relative API paths (`/api/*`).

---

## Database

**Current:** SQLite (file-based, compatible with PostgreSQL)

- **SQLite:** No setup needed (default)
- **PostgreSQL:** Set `DATABASE_URL` in `.env` file

---

## Quick Verification

### Backend
```bash
# Health check
curl http://localhost:5000/health

# Products
curl http://localhost:5000/api/products

# Auth (me)
curl http://localhost:5000/api/auth/me
```

### Frontend-Backend Communication
Frontend uses relative paths (`/api/*`), so:
- Vite proxy configured → Works automatically
- No proxy → Set `VITE_API_URL=http://localhost:5000` and update fetch calls
