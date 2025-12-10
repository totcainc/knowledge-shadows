"""
Video upload endpoint
"""
import os
import shutil
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Shadow, ShadowStatus, User
from app.core.config import settings
from app.schemas.shadow import ShadowResponse
from app.core.deps import get_current_user

router = APIRouter()

# Ensure storage directory exists
os.makedirs(settings.video_storage_path, exist_ok=True)

# Maximum file size: 500MB
MAX_FILE_SIZE = 500 * 1024 * 1024


def get_user_shadow(shadow_id: UUID, db: Session, current_user: User) -> Shadow:
    """Get a shadow and verify ownership."""
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


@router.post("/{shadow_id}/video", response_model=ShadowResponse)
async def upload_video(
    shadow_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a video file for a shadow.
    Only the shadow owner can upload videos.
    This should be called after ending capture to attach the recorded video.
    """
    # Verify ownership
    shadow = get_user_shadow(shadow_id, db, current_user)

    # Validate file type
    allowed_types = [
        "video/webm", "video/mp4", "video/quicktime",
        "audio/webm", "audio/mp4", "audio/m4a", "audio/x-m4a", "audio/mpeg", "audio/wav"
    ]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )

    # Generate unique filename
    extension = file.filename.split(".")[-1] if file.filename else "webm"
    # Sanitize extension to prevent path traversal
    extension = extension.replace("/", "").replace("\\", "").replace("..", "")[:10]
    filename = f"{shadow_id}.{extension}"
    file_path = os.path.join(settings.video_storage_path, filename)

    # Save file with size check
    try:
        total_size = 0
        with open(file_path, "wb") as buffer:
            while chunk := file.file.read(1024 * 1024):  # Read 1MB chunks
                total_size += len(chunk)
                if total_size > MAX_FILE_SIZE:
                    # Clean up partial file
                    buffer.close()
                    os.remove(file_path)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
                    )
                buffer.write(chunk)
    except HTTPException:
        raise
    except Exception as e:
        # Clean up on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    finally:
        file.file.close()

    # Update shadow with video URL (relative URL for static file serving)
    shadow.raw_video_url = f"/storage/videos/{filename}"
    db.commit()
    db.refresh(shadow)

    return shadow


@router.get("/{shadow_id}/video")
async def get_video(
    shadow_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get video file path for a shadow.
    Only the shadow owner can access video URLs.
    In production, this would return a signed URL or stream the video.
    """
    shadow = get_user_shadow(shadow_id, db, current_user)

    if not shadow.raw_video_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No video uploaded for this shadow"
        )

    return {"video_url": shadow.raw_video_url}


@router.delete("/{shadow_id}/video")
async def delete_video(
    shadow_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete the video file for a shadow.
    Only the shadow owner can delete videos.
    """
    shadow = get_user_shadow(shadow_id, db, current_user)

    if not shadow.raw_video_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No video uploaded for this shadow"
        )

    # Extract filename from URL and delete file
    filename = shadow.raw_video_url.split("/")[-1]
    file_path = os.path.join(settings.video_storage_path, filename)

    if os.path.exists(file_path):
        os.remove(file_path)

    # Clear video URL from shadow
    shadow.raw_video_url = None
    db.commit()

    return {"message": "Video deleted successfully"}
