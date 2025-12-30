"""Session management utilities."""
from typing import Optional
from fastapi import Request
from itsdangerous import URLSafeSerializer, BadSignature


def get_session_serializer(secret_key: str) -> URLSafeSerializer:
    """Create a session serializer."""
    return URLSafeSerializer(secret_key)


def get_cart_id_from_session(request: Request, secret_key: str) -> Optional[int]:
    """Get cart ID from session cookie."""
    cart_id_cookie = request.cookies.get("cart_id")
    if not cart_id_cookie:
        return None
    
    serializer = get_session_serializer(secret_key)
    try:
        return serializer.loads(cart_id_cookie)
    except BadSignature:
        return None


def set_cart_id_in_session(response, cart_id: int, secret_key: str) -> None:
    """Set cart ID in session cookie."""
    serializer = get_session_serializer(secret_key)
    signed_cart_id = serializer.dumps(cart_id)
    response.set_cookie(
        key="cart_id",
        value=signed_cart_id,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax"
    )

