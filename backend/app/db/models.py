import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import enum
from app.db.session import Base

class ShadowStatus(str, enum.Enum):
    CAPTURING = "capturing"
    PROCESSING = "processing"
    READY_FOR_REVIEW = "ready_for_review"
    PUBLISHED = "published"
    FAILED = "failed"
    ARCHIVED = "archived"

class Shadow(Base):
    __tablename__ = "shadows"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Capture metadata
    duration_seconds = Column(Integer, default=0)
    raw_video_url = Column(Text)
    thumbnail_url = Column(Text)
    
    # Processing status
    status = Column(SQLEnum(ShadowStatus), default=ShadowStatus.CAPTURING, nullable=False)
    processing_started_at = Column(DateTime)
    processing_completed_at = Column(DateTime)
    
    # AI-generated content
    transcript = Column(Text)
    executive_summary = Column(Text)
    key_takeaways = Column(JSONB)
    quality_score = Column(Integer, default=0)
    
    # User enhancements
    user_notes = Column(Text)
    tags = Column(JSONB, default=list)
    
    # Analytics
    view_count = Column(Integer, default=0)
    average_completion_rate = Column(Float, default=0.0)
    total_watch_time_seconds = Column(Integer, default=0)
    
    # Relationships
    chapters = relationship("Chapter", back_populates="shadow", cascade="all, delete-orphan")
    decision_points = relationship("DecisionPoint", back_populates="shadow", cascade="all, delete-orphan")
    creator = relationship("User", back_populates="shadows")

class Chapter(Base):
    __tablename__ = "chapters"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    shadow_id = Column(UUID(as_uuid=True), ForeignKey("shadows.id", ondelete="CASCADE"), nullable=False)
    
    # Chapter metadata
    title = Column(String, nullable=False)
    start_timestamp_seconds = Column(Float, nullable=False)
    end_timestamp_seconds = Column(Float, nullable=False)
    order_index = Column(Integer, nullable=False)
    
    # Content
    transcript_segment = Column(Text)
    summary = Column(Text)
    
    # User enhancements
    user_notes = Column(Text)
    
    # Relationships
    shadow = relationship("Shadow", back_populates="chapters")

class DecisionPoint(Base):
    __tablename__ = "decision_points"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    shadow_id = Column(UUID(as_uuid=True), ForeignKey("shadows.id", ondelete="CASCADE"), nullable=False)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("chapters.id", ondelete="SET NULL"))
    
    # Timing
    timestamp_seconds = Column(Float, nullable=False)
    
    # Content
    decision_description = Column(Text, nullable=False)
    reasoning = Column(Text, nullable=False)
    alternatives_considered = Column(JSONB, default=list)
    
    # Context
    context_before = Column(Text)
    context_after = Column(Text)
    
    # Metadata
    confidence_score = Column(Float, default=0.0)
    user_verified = Column(Boolean, default=False)
    
    # Relationships
    shadow = relationship("Shadow", back_populates="decision_points")

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Refresh token storage
    refresh_token = Column(String, nullable=True)
    refresh_token_expires_at = Column(DateTime, nullable=True)

    # Mastery tracking
    shadows_created_count = Column(Integer, default=0)
    total_impact_score = Column(Float, default=0.0)
    current_streak_days = Column(Integer, default=0)
    badges = Column(JSONB, default=list)

    # Preferences
    auto_shadow_enabled = Column(Boolean, default=False)
    default_privacy_level = Column(String, default="TEAM")

    # Relationships
    shadows = relationship("Shadow", back_populates="creator")

class ShadowView(Base):
    __tablename__ = "shadow_views"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    shadow_id = Column(UUID(as_uuid=True), ForeignKey("shadows.id", ondelete="CASCADE"), nullable=False)
    viewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Session tracking
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_position_seconds = Column(Float, default=0.0)
    completion_percentage = Column(Float, default=0.0)
    
    # Engagement
    chapters_viewed = Column(JSONB, default=list)
    decision_points_viewed = Column(JSONB, default=list)
    playback_speed = Column(Float, default=1.0)
