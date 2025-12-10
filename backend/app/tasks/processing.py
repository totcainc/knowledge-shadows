"""
Celery tasks for shadow processing

Processing pipeline:
1. AssemblyAI - Transcription with speaker diarization
2. Google Gemini - Analysis (chapters, decision points, summary)
"""
import logging
from datetime import datetime
from uuid import UUID
from app.celery_app import celery_app
from app.db.session import SessionLocal
from app.db.models import Shadow, Chapter, DecisionPoint, ShadowStatus
from app.services.transcription import transcribe_audio_with_timestamps, get_speakers
from app.services.analysis import AnalysisService, get_analysis_service

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3)
def process_shadow(self, shadow_id: str):
    """
    Main processing task for a Shadow.

    This task:
    1. Transcribes the video using AssemblyAI (with speaker diarization)
    2. Analyzes the transcript using Google Gemini
    3. Creates chapters and decision points
    4. Updates the shadow with AI-generated content
    """
    db = SessionLocal()
    analysis = None
    transcript_data = None

    try:
        # Get the shadow
        shadow = db.query(Shadow).filter(Shadow.id == UUID(shadow_id)).first()
        if not shadow:
            raise ValueError(f"Shadow not found: {shadow_id}")

        logger.info(f"Starting processing for shadow: {shadow_id}")

        # Update status to processing
        shadow.processing_started_at = datetime.utcnow()
        db.commit()

        # Step 1: Transcribe the video with AssemblyAI
        if shadow.raw_video_url:
            video_url = shadow.raw_video_url

            # Convert URL path to local file path
            # URL format: /storage/videos/{filename}
            # Local format: ./storage/videos/{filename}
            if video_url.startswith("/storage/videos/"):
                filename = video_url.replace("/storage/videos/", "")
                from app.core.config import settings
                video_path = f"{settings.video_storage_path}/{filename}"
            elif video_url.startswith("/"):
                video_path = video_url
            else:
                shadow.transcript = "[Demo transcript - remote URL not supported yet]"
                shadow.status = ShadowStatus.READY_FOR_REVIEW
                shadow.processing_completed_at = datetime.utcnow()
                db.commit()
                return {"status": "skipped", "reason": "remote URL not supported yet"}

            try:
                logger.info(f"Transcribing video: {video_path}")
                transcript_data = transcribe_audio_with_timestamps(video_path)
                shadow.transcript = transcript_data["text"]

                # Update duration from transcription if available
                if transcript_data.get("duration"):
                    shadow.duration_seconds = int(transcript_data["duration"])

                # Log speaker info
                speakers = get_speakers(transcript_data)
                if speakers:
                    logger.info(f"Detected {len(speakers)} speakers: {speakers}")

                logger.info(f"Transcription complete: {len(shadow.transcript)} chars")

            except Exception as e:
                logger.error(f"Transcription failed: {e}")
                shadow.transcript = f"[Transcription failed: {str(e)}]"
        else:
            # No video uploaded yet - use demo content
            logger.info("No video uploaded, using demo transcript")
            shadow.transcript = generate_demo_transcript()

        # Step 2: Analyze with Gemini
        try:
            logger.info("Starting Gemini analysis...")
            analyzer = get_analysis_service()

            # If we have AssemblyAI auto-chapters, we can use them as hints
            # but Gemini will do its own analysis for consistency
            analysis = analyzer.analyze_shadow(
                transcript=shadow.transcript,
                duration_seconds=shadow.duration_seconds or 300  # Default 5 min
            )

            # Update shadow with summary
            shadow.executive_summary = analysis.get("executive_summary", "")
            shadow.key_takeaways = analysis.get("key_takeaways", [])
            shadow.quality_score = analysis.get("quality_score", 0)

            # Create chapters from Gemini analysis
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

            # Create decision points from Gemini analysis
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

            logger.info(f"Analysis complete: {len(analysis.get('chapters', []))} chapters, "
                       f"{len(analysis.get('decision_points', []))} decision points")

        except Exception as e:
            logger.error(f"Gemini analysis failed: {e}")
            # If analysis fails, create default content
            shadow.executive_summary = "Analysis pending - please check API configuration."
            shadow.key_takeaways = ["Content will be analyzed when AI services are configured"]
            shadow.quality_score = 50

        # Mark as ready for review
        shadow.status = ShadowStatus.READY_FOR_REVIEW
        shadow.processing_completed_at = datetime.utcnow()
        db.commit()

        logger.info(f"Shadow processing complete: {shadow_id}")

        return {
            "status": "completed",
            "shadow_id": shadow_id,
            "transcript_length": len(shadow.transcript or ""),
            "chapters_created": len(analysis.get("chapters", [])) if analysis else 0,
            "decision_points_created": len(analysis.get("decision_points", [])) if analysis else 0,
            "quality_score": shadow.quality_score
        }

    except Exception as e:
        logger.error(f"Error processing shadow {shadow_id}: {e}", exc_info=True)
        db.rollback()

        # Update shadow status to indicate failure
        try:
            shadow = db.query(Shadow).filter(Shadow.id == UUID(shadow_id)).first()
            if shadow:
                shadow.status = ShadowStatus.FAILED
                db.commit()
        except Exception as inner_e:
            logger.error(f"Failed to update shadow status: {inner_e}")
            db.rollback()

        raise self.retry(exc=e, countdown=60)  # Retry after 1 minute

    finally:
        db.close()


def generate_demo_transcript() -> str:
    """Generate a demo transcript for testing purposes."""
    return """
Welcome to this demonstration of debugging a CI/CD pipeline failure.
Today I'll walk you through the systematic approach I use to identify and resolve pipeline issues.

Let's start by looking at the error logs. The first thing I always check is the environment variables.
This is crucial because many pipeline failures are caused by missing or incorrect environment configuration.

Now, here's a key decision point. I could either enable full debug mode, or use verbose logging.
I'm choosing verbose logging because debug mode generates too much noise and slows down the pipeline significantly.
The tradeoff is that we get slightly less detail, but the logs are much more readable.

Looking at the logs now, I can see there's a dependency version conflict. The package manager is trying to install
two incompatible versions of the same library. This is a common issue when using version ranges.

Here's another important decision. We could either use version ranges for flexibility, or pin exact versions.
I prefer pinning versions because it ensures reproducible builds. When something breaks, you know exactly
what changed. The downside is more maintenance, but the stability is worth it.

Let me update the configuration file now. I'm removing the version ranges and specifying exact versions.
This should resolve the conflict and make our builds more predictable.

Finally, let's run the pipeline again to verify the fix. Always test your changes in staging before production.
This is a fundamental principle - never deploy untested changes directly to production.

And there we go - the pipeline is now passing. To summarize, we diagnosed the issue through log analysis,
made deliberate decisions about logging and versioning, and verified our fix before considering it complete.
"""
