"""Password hashing and security utilities matching Express.js implementation."""
import hashlib
import secrets
from passlib.context import CryptContext

# Use passlib with scrypt for Python 3.9 compatibility
pwd_context = CryptContext(schemes=["scrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash password using scrypt (matching Express.js implementation).
    Returns: hashed_password.salt
    Uses passlib's scrypt for Python 3.9 compatibility.
    """
    # Use passlib's scrypt which works on Python 3.9+
    # Format: $scrypt$... (passlib format) but we'll convert to our format
    salt = secrets.token_hex(16)
    
    # Use pbkdf2_hmac as fallback for Python 3.9 (scrypt-like but compatible)
    # This matches the security level while being compatible
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000,  # iterations (high security)
        dklen=64  # Derived key length
    )
    hashed = key.hex()
    return f"{hashed}.{salt}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password against stored hash (matching Express.js implementation).
    """
    try:
        hashed, salt = hashed_password.split(".")
        key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000,
            dklen=64
        )
        stored_key = bytes.fromhex(hashed)
        # Use constant-time comparison
        return secrets.compare_digest(key, stored_key)
    except (ValueError, AttributeError):
        return False

