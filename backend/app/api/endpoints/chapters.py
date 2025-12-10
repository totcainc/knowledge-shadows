from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from app.db.session import get_db
from app.db.models import Chapter, Shadow, User
from app.schemas.shadow import ChapterResponse
from app.core.deps import get_current_user

router = APIRouter()


class ChapterUpdate(BaseModel):
    title: Optional[str] = None
    user_notes: Optional[str] = None


def verify_shadow_ownership(shadow_id: UUID, db: Session, current_user: User) -> Shadow:
    """Verify that the current user owns the shadow."""
    shadow = db.query(Shadow).filter(Shadow.id == shadow_id).first()
    if not shadow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shadow not found"
        )
    if shadow.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this shadow"
        )
    return shadow


def get_chapter_with_ownership(
    chapter_id: UUID,
    db: Session,
    current_user: User
) -> Chapter:
    """Get a chapter and verify ownership through its parent shadow."""
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )

    # Verify ownership through shadow
    shadow = db.query(Shadow).filter(Shadow.id == chapter.shadow_id).first()
    if not shadow or shadow.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this chapter"
        )

    return chapter


@router.get("/shadows/{shadow_id}/chapters", response_model=List[ChapterResponse])
def get_shadow_chapters(
    shadow_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all chapters for a Shadow. Only accessible by the shadow owner."""
    # Verify ownership
    verify_shadow_ownership(shadow_id, db, current_user)

    chapters = (
        db.query(Chapter)
        .filter(Chapter.shadow_id == shadow_id)
        .order_by(Chapter.order_index)
        .all()
    )
    return chapters


@router.get("/{chapter_id}", response_model=ChapterResponse)
def get_chapter(
    chapter_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific chapter. Only accessible by the shadow owner."""
    chapter = get_chapter_with_ownership(chapter_id, db, current_user)
    return chapter


@router.patch("/{chapter_id}", response_model=ChapterResponse)
def update_chapter(
    chapter_id: UUID,
    chapter_update: ChapterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a chapter. Only the shadow owner can update chapters."""
    chapter = get_chapter_with_ownership(chapter_id, db, current_user)

    if chapter_update.title is not None:
        chapter.title = chapter_update.title
    if chapter_update.user_notes is not None:
        chapter.user_notes = chapter_update.user_notes

    db.commit()
    db.refresh(chapter)
    return chapter
