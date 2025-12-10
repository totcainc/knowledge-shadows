"""
Pydantic schemas for authentication
"""
import re
from pydantic import BaseModel, EmailStr, Field, field_validator
from uuid import UUID
from datetime import datetime
from typing import Optional, List


class UserBase(BaseModel):
    email: EmailStr = Field(
        ...,
        description="User's email address"
    )
    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="User's display name (1-100 characters)"
    )

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('Name cannot be empty or just whitespace')
        # Remove any potential XSS characters
        if re.search(r'[<>"\']', v):
            raise ValueError('Name contains invalid characters')
        return v


class UserCreate(UserBase):
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Password (8-128 characters)"
    )

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if len(v) > 128:
            raise ValueError('Password must be at most 128 characters long')
        # Check for at least one letter and one number
        if not re.search(r'[a-zA-Z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(
        ...,
        min_length=1,
        description="User's password"
    )


class UserResponse(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    shadows_created_count: int
    total_impact_score: float
    current_streak_days: int
    badges: List[str]
    auto_shadow_enabled: bool
    default_privacy_level: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[str] = None


class AuthResponse(BaseModel):
    user: UserResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(
        ...,
        min_length=1,
        description="The refresh token to exchange for new tokens"
    )


class RefreshTokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
