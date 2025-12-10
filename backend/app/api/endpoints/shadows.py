from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.db.session import get_db
from app.db.models import Shadow, ShadowStatus, User
from app.schemas.shadow import ShadowCreate, ShadowUpdate, ShadowResponse
from app.core.deps import get_current_user

router = APIRouter()


def get_user_shadow(
    shadow_id: UUID,
    db: Session,
    current_user: User,
    require_ownership: bool = True
) -> Shadow:
    """
    Helper to get a shadow and verify ownership.

    Args:
        shadow_id: The shadow UUID
        db: Database session
        current_user: The authenticated user
        require_ownership: If True, raises 403 if user doesn't own the shadow

    Returns:
        The Shadow object

    Raises:
        HTTPException 404 if shadow not found
        HTTPException 403 if user doesn't own shadow (when require_ownership=True)
    """
    shadow = db.query(Shadow).filter(Shadow.id == shadow_id).first()
    if not shadow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shadow not found"
        )

    if require_ownership and shadow.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this shadow"
        )

    return shadow


@router.post("/start", response_model=ShadowResponse)
def start_shadow(
    shadow: ShadowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start capturing a new Shadow for the authenticated user."""
    db_shadow = Shadow(
        title=shadow.title,
        creator_id=current_user.id,
        status=ShadowStatus.CAPTURING,
        user_notes=shadow.user_notes,
        tags=shadow.tags or [],
    )
    db.add(db_shadow)

    # Update user's shadow count
    current_user.shadows_created_count += 1

    db.commit()
    db.refresh(db_shadow)
    return db_shadow


@router.post("/{shadow_id}/end", response_model=ShadowResponse)
def end_shadow(
    shadow_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """End Shadow capture and trigger processing. Only the owner can end their shadow."""
    shadow = get_user_shadow(shadow_id, db, current_user)

    shadow.status = ShadowStatus.PROCESSING
    db.commit()
    db.refresh(shadow)

    # Trigger Celery task for AI processing
    from app.tasks.processing import process_shadow
    process_shadow.delay(str(shadow_id))

    return shadow


@router.get("/", response_model=List[ShadowResponse])
def list_shadows(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[ShadowStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List shadows owned by the authenticated user."""
    query = db.query(Shadow).filter(Shadow.creator_id == current_user.id)

    if status_filter:
        query = query.filter(Shadow.status == status_filter)

    shadows = query.order_by(Shadow.created_at.desc()).offset(skip).limit(limit).all()
    return shadows


@router.get("/{shadow_id}", response_model=ShadowResponse)
def get_shadow(
    shadow_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific Shadow. Only accessible by the owner."""
    shadow = get_user_shadow(shadow_id, db, current_user)
    return shadow


@router.patch("/{shadow_id}", response_model=ShadowResponse)
def update_shadow(
    shadow_id: UUID,
    shadow_update: ShadowUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a Shadow. Only the owner can update their shadow."""
    shadow = get_user_shadow(shadow_id, db, current_user)

    update_data = shadow_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(shadow, field, value)

    db.commit()
    db.refresh(shadow)
    return shadow


@router.delete("/{shadow_id}")
def delete_shadow(
    shadow_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a Shadow. Only the owner can delete their shadow."""
    shadow = get_user_shadow(shadow_id, db, current_user)

    # Decrement user's shadow count
    if current_user.shadows_created_count > 0:
        current_user.shadows_created_count -= 1

    db.delete(shadow)
    db.commit()
    return {"message": "Shadow deleted successfully"}


@router.post("/{shadow_id}/retry", response_model=ShadowResponse)
def retry_processing(
    shadow_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retry processing for a failed Shadow. Only the owner can retry."""
    shadow = get_user_shadow(shadow_id, db, current_user)

    if shadow.status != ShadowStatus.FAILED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Can only retry failed shadows. Current status: {shadow.status.value}"
        )

    # Reset status to processing
    shadow.status = ShadowStatus.PROCESSING
    shadow.processing_started_at = None
    shadow.processing_completed_at = None
    db.commit()
    db.refresh(shadow)

    # Trigger Celery task for AI processing
    from app.tasks.processing import process_shadow
    process_shadow.delay(str(shadow_id))

    return shadow


@router.post("/{shadow_id}/process-sync", response_model=ShadowResponse)
def process_shadow_sync(
    shadow_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Process a shadow synchronously (for development/testing without Redis/Celery).
    Only the owner can trigger processing.

    This endpoint runs transcription and analysis in the same request.
    Use for testing - in production, use the async Celery-based processing.
    """
    from datetime import datetime
    from app.db.models import Chapter, DecisionPoint
    from app.services.transcription import transcribe_audio_with_timestamps, get_speakers
    from app.services.analysis import get_analysis_service
    from app.core.config import settings
    import logging

    logger = logging.getLogger(__name__)

    shadow = get_user_shadow(shadow_id, db, current_user)

    if not shadow.raw_video_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No video uploaded. Upload a video first."
        )

    # Update status
    shadow.status = ShadowStatus.PROCESSING
    shadow.processing_started_at = datetime.utcnow()
    db.commit()

    try:
        # Step 1: Transcribe
        video_url = shadow.raw_video_url
        if video_url.startswith("/storage/videos/"):
            filename = video_url.replace("/storage/videos/", "")
            video_path = f"{settings.video_storage_path}/{filename}"
        else:
            video_path = video_url

        logger.info(f"Transcribing: {video_path}")
        transcript_data = transcribe_audio_with_timestamps(video_path)
        shadow.transcript = transcript_data["text"]

        if transcript_data.get("duration"):
            shadow.duration_seconds = int(transcript_data["duration"])

        speakers = get_speakers(transcript_data)
        logger.info(f"Detected {len(speakers)} speakers")

        # Step 2: Analyze with Gemini
        logger.info("Starting Gemini analysis...")
        analyzer = get_analysis_service()
        analysis = analyzer.analyze_shadow(
            transcript=shadow.transcript,
            duration_seconds=shadow.duration_seconds or 300
        )

        # Update shadow
        shadow.executive_summary = analysis.get("executive_summary", "")
        shadow.key_takeaways = analysis.get("key_takeaways", [])
        shadow.quality_score = analysis.get("quality_score", 0)

        # Create chapters
        for i, chapter_data in enumerate(analysis.get("chapters", [])):
            chapter = Chapter(
                shadow_id=shadow.id,
                title=chapter_data["title"],
                start_timestamp_seconds=chapter_data["start_seconds"],
                end_timestamp_seconds=chapter_data["end_seconds"],
                order_index=i,
                summary=chapter_data.get("summary", "")
            )
            db.add(chapter)

        # Create decision points
        for dp_data in analysis.get("decision_points", []):
            decision_point = DecisionPoint(
                shadow_id=shadow.id,
                timestamp_seconds=dp_data["timestamp_seconds"],
                decision_description=dp_data["decision_description"],
                reasoning=dp_data["reasoning"],
                alternatives_considered=dp_data.get("alternatives_considered", []),
                context_before=dp_data.get("context_before"),
                confidence_score=dp_data.get("confidence_score", 0.5)
            )
            db.add(decision_point)

        # Mark complete
        shadow.status = ShadowStatus.READY_FOR_REVIEW
        shadow.processing_completed_at = datetime.utcnow()
        db.commit()
        db.refresh(shadow)

        logger.info(f"Processing complete: {len(analysis.get('chapters', []))} chapters, "
                   f"{len(analysis.get('decision_points', []))} decision points")

        return shadow

    except Exception as e:
        logger.error(f"Processing failed: {e}", exc_info=True)
        shadow.status = ShadowStatus.FAILED
        db.commit()
        db.refresh(shadow)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Processing failed: {str(e)}"
        )
