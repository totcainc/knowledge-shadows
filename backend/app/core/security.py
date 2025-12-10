"""
Security utilities for authentication
"""
import secrets
from datetime import datetime, timedelta
from typing import Optional, Tuple
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

# Password hashing - use bcrypt with truncate_error=False to handle long passwords
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    # Truncate to 72 bytes for bcrypt compatibility
    return pwd_context.verify(plain_password[:72], hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    # Truncate to 72 bytes for bcrypt compatibility
    return pwd_context.hash(password[:72])


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )
        return payload
    except JWTError:
        return None


def create_refresh_token() -> Tuple[str, datetime]:
    """
    Create a secure refresh token.

    Returns:
        Tuple of (token_string, expiration_datetime)
    """
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    return token, expires_at


def verify_refresh_token(stored_token: str, provided_token: str, expires_at: datetime) -> bool:
    """
    Verify a refresh token is valid and not expired.

    Args:
        stored_token: The token stored in the database
        provided_token: The token provided by the client
        expires_at: When the token expires

    Returns:
        True if token is valid and not expired
    """
    if not stored_token or not provided_token:
        return False
    if datetime.utcnow() > expires_at:
        return False
    return secrets.compare_digest(stored_token, provided_token)
