import logging
import os
from pathlib import Path
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from app.api.endpoints import shadows, chapters, decision_points, upload, auth
from app.core.config import settings
from app.core.exceptions import setup_exception_handlers
from app.core.deps import get_current_user
from app.db.session import get_db
from app.db.models import Shadow, User
from sqlalchemy.orm import Session

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Knowledge Shadows API",
    description="API for capturing and sharing procedural knowledge",
    version="1.0.0",
    debug=settings.debug,
)

# Setup global exception handlers
setup_exception_handlers(app)

# CORS middleware - use configurable origins with explicit methods/headers
allowed_origins = [origin.strip() for origin in settings.allowed_origins.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(shadows.router, prefix="/api/shadows", tags=["shadows"])
app.include_router(chapters.router, prefix="/api/chapters", tags=["chapters"])
app.include_router(decision_points.router, prefix="/api/decision-points", tags=["decision-points"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])

# Ensure storage directory exists
os.makedirs(settings.video_storage_path, exist_ok=True)


# Secure video serving endpoint - validates ownership before serving
@app.get("/storage/videos/{filename}")
async def serve_video(
    filename: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Serve video files with ownership validation.
    Only the owner of a shadow can access its video.
    """
    # Security: Prevent path traversal
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename"
        )

    # Find the shadow that owns this video
    video_url = f"/storage/videos/{filename}"
    shadow = db.query(Shadow).filter(Shadow.raw_video_url == video_url).first()

    if not shadow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )

    # Check ownership
    if shadow.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this video"
        )

    # Serve the file
    storage_path = Path(settings.video_storage_path).resolve()
    file_path = (storage_path / filename).resolve()

    # Double-check path is within storage directory
    if not str(file_path).startswith(str(storage_path)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file path"
        )

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video file not found"
        )

    return FileResponse(file_path)


@app.get("/")
def read_root():
    return {"message": "Knowledge Shadows API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.on_event("startup")
async def startup_event():
    logger.info("Knowledge Shadows API starting up...")
    logger.info(f"Debug mode: {settings.debug}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Knowledge Shadows API shutting down...")
