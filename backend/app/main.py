import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.endpoints import shadows, chapters, decision_points, upload, auth
from app.core.config import settings
from app.core.exceptions import setup_exception_handlers

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

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(shadows.router, prefix="/api/shadows", tags=["shadows"])
app.include_router(chapters.router, prefix="/api/chapters", tags=["chapters"])
app.include_router(decision_points.router, prefix="/api/decision-points", tags=["decision-points"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])

# Serve uploaded videos as static files
os.makedirs(settings.video_storage_path, exist_ok=True)
app.mount("/storage/videos", StaticFiles(directory=settings.video_storage_path), name="videos")


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
