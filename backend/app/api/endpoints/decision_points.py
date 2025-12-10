from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from app.db.session import get_db
from app.db.models import DecisionPoint, Shadow, User
from app.schemas.shadow import DecisionPointResponse
from app.core.deps import get_current_user

router = APIRouter()


class DecisionPointUpdate(BaseModel):
    decision_description: Optional[str] = None
    reasoning: Optional[str] = None
    user_verified: Optional[bool] = None


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


def get_decision_point_with_ownership(
    decision_point_id: UUID,
    db: Session,
    current_user: User
) -> DecisionPoint:
    """Get a decision point and verify ownership through its parent shadow."""
    dp = db.query(DecisionPoint).filter(DecisionPoint.id == decision_point_id).first()
    if not dp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Decision point not found"
        )

    # Verify ownership through shadow
    shadow = db.query(Shadow).filter(Shadow.id == dp.shadow_id).first()
    if not shadow or shadow.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this decision point"
        )

    return dp


@router.get("/shadows/{shadow_id}/decision-points", response_model=List[DecisionPointResponse])
def get_shadow_decision_points(
    shadow_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all decision points for a Shadow. Only accessible by the shadow owner."""
    # Verify ownership
    verify_shadow_ownership(shadow_id, db, current_user)

    decision_points = (
        db.query(DecisionPoint)
        .filter(DecisionPoint.shadow_id == shadow_id)
        .order_by(DecisionPoint.timestamp_seconds)
        .all()
    )
    return decision_points


@router.get("/{decision_point_id}", response_model=DecisionPointResponse)
def get_decision_point(
    decision_point_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific decision point. Only accessible by the shadow owner."""
    dp = get_decision_point_with_ownership(decision_point_id, db, current_user)
    return dp


@router.patch("/{decision_point_id}", response_model=DecisionPointResponse)
def update_decision_point(
    decision_point_id: UUID,
    update: DecisionPointUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a decision point. Only the shadow owner can update."""
    dp = get_decision_point_with_ownership(decision_point_id, db, current_user)

    if update.decision_description is not None:
        dp.decision_description = update.decision_description
    if update.reasoning is not None:
        dp.reasoning = update.reasoning
    if update.user_verified is not None:
        dp.user_verified = update.user_verified

    db.commit()
    db.refresh(dp)
    return dp


@router.post("/{decision_point_id}/verify", response_model=DecisionPointResponse)
def verify_decision_point(
    decision_point_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a decision point as user-verified. Only the shadow owner can verify."""
    dp = get_decision_point_with_ownership(decision_point_id, db, current_user)

    dp.user_verified = True
    db.commit()
    db.refresh(dp)
    return dp


@router.post("/{decision_point_id}/unverify", response_model=DecisionPointResponse)
def unverify_decision_point(
    decision_point_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove user verification from a decision point. Only the shadow owner can unverify."""
    dp = get_decision_point_with_ownership(decision_point_id, db, current_user)

    dp.user_verified = False
    db.commit()
    db.refresh(dp)
    return dp
