"""Authentication routes matching Express.js implementation."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session

from app.api.deps import get_storage, get_current_user, require_auth
from app.storage import Storage
from app.schemas import RegisterRequest, LoginRequest, AuthResponse, MessageResponse, ErrorResponse
from app.models import User
from app.core.security import hash_password, verify_password
from app.database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: RegisterRequest,
    request: Request,
    response: Response,
    storage: Storage = Depends(get_storage)
):
    """
    Register a new user.
    Matches POST /api/auth/register
    """
    # Check if email already exists
    existing = storage.get_user_by_email(user_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already in use"
        )
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user
    user = storage.create_user(user_data, hashed_password)
    
    # Set session
    request.session["user_id"] = user.id
    
    return AuthResponse(id=user.id, email=user.email, name=user.name, role=user.role)


@router.post("/login", response_model=AuthResponse)
async def login(
    credentials: LoginRequest,
    request: Request,
    storage: Storage = Depends(get_storage)
):
    """
    Login with email and password.
    Matches POST /api/auth/login
    """
    user = storage.get_user_by_email(credentials.email)
    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Set session
    request.session["user_id"] = user.id
    
    # Handle cart merging
    from app.core.session import get_cart_id_from_session
    from app.config import settings
    
    guest_cart_id = get_cart_id_from_session(request, settings.SESSION_SECRET)
    if guest_cart_id:
        # Check if user has an existing cart
        user_cart = storage.get_cart(user.id)
        if user_cart:
            # Merge guest cart into user cart
            # But only if they are different carts (prevent self-merge)
            if guest_cart_id != user_cart.id:
                 storage.merge_carts(guest_cart_id, user_cart.id)
        else:
            # Check if guest cart exists in DB and assign it
            storage.assign_cart_to_user(guest_cart_id, user.id)
             
    return AuthResponse(id=user.id, email=user.email, name=user.name, role=user.role)


@router.post("/logout", response_model=MessageResponse)
async def logout(request: Request):
    """
    Logout current user.
    Matches POST /api/auth/logout
    """
    request.session.clear()
    
    return MessageResponse(message="Logged out")


@router.get("/me", response_model=Optional[AuthResponse])
async def get_current_user_info(
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Get current authenticated user.
    Matches GET /api/auth/me
    """
    if not current_user:
        return None
    
    return AuthResponse(id=current_user.id, email=current_user.email, name=current_user.name, role=current_user.role)

