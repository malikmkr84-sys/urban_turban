"""FastAPI dependencies for authentication and database sessions."""
from fastapi import Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models import User
from app.storage import Storage
from app.core.session import get_cart_id_from_session, set_cart_id_in_session
from app.config import settings


def get_storage(db: Session = Depends(get_db)) -> Storage:
    """Get storage instance."""
    return Storage(db)


def get_current_user(
    request: Request,
    storage: Storage = Depends(get_storage)
) -> Optional[User]:
    """
    Get current authenticated user from session.
    Returns None if not authenticated (for optional auth endpoints).
    """
    user_id = request.session.get("user_id")
    if user_id:
        return storage.get_user(user_id)
    return None


def require_auth(
    current_user: Optional[User] = Depends(get_current_user)
) -> User:
    """Require authenticated user, raise 401 if not."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Must be logged in"
        )
    return current_user


async def get_or_create_cart_id(
    request: Request,
    response: Response,
    current_user: Optional[User] = Depends(get_current_user),
    storage: Storage = Depends(get_storage)
) -> int:
    """
    Get or create cart ID for current user/guest.
    Matches Express.js getCartId logic.
    """
    # If user is logged in, use their cart
    if current_user:
        cart = storage.get_cart(current_user.id)
        if not cart:
            cart = storage.create_cart(current_user.id)
        return cart.id
    
    # For guests, use session cart
    cart_id = get_cart_id_from_session(request, settings.SESSION_SECRET)
    if cart_id:
        return cart_id
    
    # Create new guest cart
    cart = storage.create_cart()
    set_cart_id_in_session(response, cart.id, settings.SESSION_SECRET)
    return cart.id

