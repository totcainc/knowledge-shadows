from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime
from uuid import UUID
import re


class ShadowBase(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Title of the shadow (1-200 characters)"
    )
    user_notes: Optional[str] = Field(
        None,
        max_length=5000,
        description="User notes for the shadow (max 5000 characters)"
    )
    tags: Optional[List[str]] = Field(
        None,
        max_length=20,
        description="Tags for categorizing the shadow (max 20 tags)"
    )

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        # Strip whitespace and ensure not empty
        v = v.strip()
        if not v:
            raise ValueError('Title cannot be empty or just whitespace')
        return v

    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is None:
            return v
        # Validate each tag
        validated_tags = []
        for tag in v:
            tag = tag.strip().lower()
            if not tag:
                continue
            if len(tag) > 50:
                raise ValueError(f'Tag "{tag[:20]}..." is too long (max 50 characters)')
            # Only allow alphanumeric, hyphens, and underscores
            if not re.match(r'^[a-z0-9_-]+$', tag):
                raise ValueError(f'Tag "{tag}" contains invalid characters. Use only letters, numbers, hyphens, and underscores.')
            validated_tags.append(tag)
        return validated_tags


class ShadowCreate(ShadowBase):
    pass


class ShadowUpdate(BaseModel):
    title: Optional[str] = Field(
        None,
        min_length=1,
        max_length=200,
        description="Title of the shadow (1-200 characters)"
    )
    user_notes: Optional[str] = Field(
        None,
        max_length=5000,
        description="User notes for the shadow (max 5000 characters)"
    )
    tags: Optional[List[str]] = Field(
        None,
        max_length=20,
        description="Tags for categorizing the shadow (max 20 tags)"
    )
    status: Optional[str] = Field(
        None,
        description="Shadow status"
    )

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not v:
            raise ValueError('Title cannot be empty or just whitespace')
        return v

    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is None:
            return v
        validated_tags = []
        for tag in v:
            tag = tag.strip().lower()
            if not tag:
                continue
            if len(tag) > 50:
                raise ValueError(f'Tag "{tag[:20]}..." is too long (max 50 characters)')
            if not re.match(r'^[a-z0-9_-]+$', tag):
                raise ValueError(f'Tag "{tag}" contains invalid characters')
            validated_tags.append(tag)
        return validated_tags

    @field_validator('status')
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        allowed_statuses = ['capturing', 'processing', 'ready_for_review', 'published', 'archived']
        if v.lower() not in allowed_statuses:
            raise ValueError(f'Invalid status. Must be one of: {", ".join(allowed_statuses)}')
        return v.lower()


class ShadowResponse(ShadowBase):
    id: UUID
    creator_id: UUID
    created_at: datetime
    updated_at: datetime
    duration_seconds: int
    raw_video_url: Optional[str]
    thumbnail_url: Optional[str]
    status: str
    transcript: Optional[str]
    executive_summary: Optional[str]
    key_takeaways: Optional[List[str]]
    quality_score: int
    view_count: int
    average_completion_rate: float

    class Config:
        from_attributes = True


class ChapterResponse(BaseModel):
    id: UUID
    shadow_id: UUID
    title: str
    start_timestamp_seconds: float
    end_timestamp_seconds: float
    order_index: int
    summary: Optional[str]
    user_notes: Optional[str]

    class Config:
        from_attributes = True


class DecisionPointResponse(BaseModel):
    id: UUID
    shadow_id: UUID
    timestamp_seconds: float
    decision_description: str
    reasoning: str
    alternatives_considered: List[str]
    context_before: Optional[str]
    context_after: Optional[str]
    confidence_score: float
    user_verified: bool

    class Config:
        from_attributes = True
