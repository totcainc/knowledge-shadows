"""
Script to create sample data for Knowledge Shadows
Run this after creating the database schema
"""
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models import Shadow, Chapter, DecisionPoint, User, ShadowStatus

def create_sample_data():
    db = SessionLocal()
    
    try:
        # Create a test user
        user = User(
            id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
            email="demo@knowledgeshadows.com",
            name="Demo User",
            shadows_created_count=2,
            total_impact_score=150.5,
            current_streak_days=5,
            badges=["First Shadow", "10 Shadows"],
        )
        db.add(user)
        
        # Shadow 1: Pipeline Debugging Session (PUBLISHED)
        shadow1_id = uuid.uuid4()
        shadow1 = Shadow(
            id=shadow1_id,
            title="Pipeline Debugging Session",
            creator_id=user.id,
            created_at=datetime.utcnow() - timedelta(days=2),
            duration_seconds=1475,  # 24:35
            raw_video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            thumbnail_url="https://via.placeholder.com/640x360/5845BA/ffffff?text=Pipeline+Debugging",
            status=ShadowStatus.PUBLISHED,
            processing_completed_at=datetime.utcnow() - timedelta(days=2, hours=1),
            transcript="This is a sample transcript of the pipeline debugging session...",
            executive_summary="A comprehensive walkthrough of debugging a CI/CD pipeline failure, covering log analysis, dependency resolution, and configuration fixes.",
            key_takeaways=[
                "Always check environment variables first",
                "Use verbose logging for better debugging",
                "Test configuration changes in staging before production"
            ],
            quality_score=87,
            view_count=12,
            average_completion_rate=0.78,
            total_watch_time_seconds=8500,
            tags=["debugging", "ci/cd", "devops"],
        )
        db.add(shadow1)
        
        # Chapters for Shadow 1
        chapters1 = [
            Chapter(
                shadow_id=shadow1_id,
                title="Introduction and Problem Overview",
                start_timestamp_seconds=0,
                end_timestamp_seconds=180,
                order_index=0,
                transcript_segment="Let me show you how I debugged this pipeline issue...",
                summary="Overview of the pipeline failure and initial investigation approach",
            ),
            Chapter(
                shadow_id=shadow1_id,
                title="Log Analysis",
                start_timestamp_seconds=180,
                end_timestamp_seconds=480,
                order_index=1,
                transcript_segment="Looking at the logs, we can see the error occurs during...",
                summary="Deep dive into error logs to identify the root cause",
            ),
            Chapter(
                shadow_id=shadow1_id,
                title="Dependency Resolution",
                start_timestamp_seconds=480,
                end_timestamp_seconds=900,
                order_index=2,
                transcript_segment="The issue is a version conflict between...",
                summary="Fixing package version conflicts and dependency issues",
            ),
            Chapter(
                shadow_id=shadow1_id,
                title="Configuration Updates",
                start_timestamp_seconds=900,
                end_timestamp_seconds=1200,
                order_index=3,
                transcript_segment="Now we need to update the pipeline configuration...",
                summary="Updating pipeline configuration files",
            ),
            Chapter(
                shadow_id=shadow1_id,
                title="Testing and Verification",
                start_timestamp_seconds=1200,
                end_timestamp_seconds=1475,
                order_index=4,
                transcript_segment="Let's run the pipeline again to verify the fix...",
                summary="Running tests to verify the fix works correctly",
            ),
        ]
        for chapter in chapters1:
            db.add(chapter)
        
        # Decision Points for Shadow 1
        decision_points1 = [
            DecisionPoint(
                shadow_id=shadow1_id,
                timestamp_seconds=245,
                decision_description="Chose to use verbose logging instead of debug mode",
                reasoning="Verbose logging provides better context without the overhead of full debug mode, which can slow down the pipeline significantly.",
                alternatives_considered=["Full debug mode", "Standard logging", "No logging changes"],
                context_before="Pipeline was failing silently without clear error messages",
                confidence_score=0.92,
                user_verified=True,
            ),
            DecisionPoint(
                shadow_id=shadow1_id,
                timestamp_seconds=650,
                decision_description="Decided to pin dependency versions rather than use ranges",
                reasoning="Version ranges can introduce unexpected breaking changes. Pinning ensures reproducible builds.",
                alternatives_considered=["Use version ranges", "Lock file only", "Latest versions"],
                context_after="Build became more stable and predictable",
                confidence_score=0.88,
                user_verified=False,
            ),
        ]
        for dp in decision_points1:
            db.add(dp)
        
        # Shadow 2: API Integration Walkthrough (PROCESSING)
        shadow2_id = uuid.uuid4()
        shadow2 = Shadow(
            id=shadow2_id,
            title="API Integration Walkthrough",
            creator_id=user.id,
            created_at=datetime.utcnow() - timedelta(hours=3),
            duration_seconds=1102,  # 18:22
            raw_video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            thumbnail_url="https://via.placeholder.com/640x360/9061F9/ffffff?text=API+Integration",
            status=ShadowStatus.PROCESSING,
            processing_started_at=datetime.utcnow() - timedelta(hours=2, minutes=50),
            tags=["api", "integration", "backend"],
        )
        db.add(shadow2)
        
        # Shadow 3: Database Migration Guide (PUBLISHED)
        shadow3_id = uuid.uuid4()
        shadow3 = Shadow(
            id=shadow3_id,
            title="Database Migration Guide",
            creator_id=user.id,
            created_at=datetime.utcnow() - timedelta(days=5),
            duration_seconds=892,  # 14:52
            raw_video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            thumbnail_url="https://via.placeholder.com/640x360/AC94FA/ffffff?text=Database+Migration",
            status=ShadowStatus.PUBLISHED,
            processing_completed_at=datetime.utcnow() - timedelta(days=5, hours=1),
            transcript="In this session, I'll walk through our database migration process...",
            executive_summary="Step-by-step guide for safely migrating database schemas in production, including rollback strategies and zero-downtime techniques.",
            key_takeaways=[
                "Always test migrations in staging first",
                "Use transactions for rollback safety",
                "Monitor query performance after migration"
            ],
            quality_score=94,
            view_count=28,
            average_completion_rate=0.85,
            total_watch_time_seconds=18500,
            tags=["database", "migration", "postgresql"],
        )
        db.add(shadow3)
        
        # Commit all changes
        db.commit()
        print("✅ Sample data created successfully!")
        print(f"   - Created user: {user.email}")
        print(f"   - Created 3 Shadows")
        print(f"   - Created {len(chapters1)} chapters for Shadow 1")
        print(f"   - Created {len(decision_points1)} decision points for Shadow 1")
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Creating sample data for Knowledge Shadows...")
    create_sample_data()
