"""FastAPI application entry point."""
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from contextlib import asynccontextmanager
import time
import logging

from app.config import settings
from app.database import engine, Base
from app.storage import Storage
from app.database import SessionLocal
from app.api.routes import auth, products, cart, orders, users
from fastapi.staticfiles import StaticFiles
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events for startup and shutdown."""
    # Startup: Create tables and seed products
    logger.info("Starting up FastAPI application...")
    
    # Create tables if they don't exist (works for both PostgreSQL and SQLite)
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created/verified")
    except Exception as e:
        logger.warning(f"Could not create tables: {e}")
    
    # Seed products
    db = SessionLocal()
    try:
        storage = Storage(db)
        storage.seed_products()
        logger.info("Products seeded")
        
        # Seed users (admin)
        storage.seed_users()
        logger.info("Admin user seeded")
    except Exception as e:
        logger.error(f"Error seeding data: {e}")
    finally:
        db.close()
    
    yield
    
    # Shutdown
    logger.info("Shutting down FastAPI application...")


# Create FastAPI app
app = FastAPI(
    title="UrbanTurban API",
    description="FastAPI backend for UrbanTurban e-commerce platform",
    version="1.0.0",
    lifespan=lifespan
)

# Add session middleware (matching Express.js session behavior)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SESSION_SECRET,
    max_age=86400,  # 24 hours
    same_site="lax"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware (matching Express.js behavior)
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log API requests matching Express.js logging format."""
    start_time = time.time()
    path = request.url.path
    
    response = await call_next(request)
    
    duration = int((time.time() - start_time) * 1000)
    
    import os
    if os.getenv("ENABLE_PERFORMANCE_LOGGING", "false").lower() == "true":
        if path.startswith("/api"):
            status_code = response.status_code
            log_line = f"{request.method} {path} {status_code} in {duration}ms"
            
            # Format time like Express.js
            from datetime import datetime
            formatted_time = datetime.now().strftime("%I:%M:%S %p").lstrip("0")
            logger.info(f"{formatted_time} [fastapi] {log_line}")
    
    return response


# Include routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(users.router)

# Mount static files
static_path = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_path):
    os.makedirs(static_path)
app.mount("/static", StaticFiles(directory=static_path), name="static")


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "UrbanTurban API", "version": "1.0.0"}


# Health check
@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development"
    )

