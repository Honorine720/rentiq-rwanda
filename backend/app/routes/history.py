"""
History and Statistics Routes for RentIQ Rwanda
"""
from fastapi import APIRouter, Depends, Query, HTTPException, status, Header
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from jose import jwt, JWTError
import os
import csv
import io
from fastapi.responses import StreamingResponse

from app.models.database import (
    get_db, get_prediction_history, get_prediction_by_id,
    get_statistics, Prediction, User
)
from app.models.schemas import PredictionHistoryResponse, PredictionHistoryItem

router = APIRouter(prefix="/api/history", tags=["History"])

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "rentiq-rwanda-secret-change-in-prod")
ALGORITHM = "HS256"


def _get_token_payload(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """Decode token if present, return None if missing/invalid."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        return jwt.decode(authorization.split(" ", 1)[1], SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


def _require_admin(authorization: Optional[str] = Header(None),
                   db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(authorization.split(" ", 1)[1], SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("", response_model=PredictionHistoryResponse)
async def get_history(
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0),
    district: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Returns predictions scoped to the logged-in user.
    Admins see all predictions when no user_id filter is applied.
    """
    payload = _get_token_payload(authorization)
    user_id = None

    if payload:
        role = payload.get("role", "user")
        if role != "admin":
            # Regular users only see their own predictions
            user_id = payload.get("sub")
    else:
        # Unauthenticated — return empty
        return PredictionHistoryResponse(total=0, limit=limit, predictions=[])

    try:
        predictions, total = get_prediction_history(
            db=db, limit=limit, district=district, skip=skip, user_id=user_id
        )
        history_items = [
            PredictionHistoryItem(
                id=p.id, district=p.district, sector=p.sector,
                num_bedrooms=p.num_bedrooms, floor_area_sqm=p.floor_area_sqm,
                predicted_rent_rwf=p.predicted_rent_rwf,
                r2_score=p.r2_score, created_at=p.created_at
            ) for p in predictions
        ]
        return PredictionHistoryResponse(total=total, limit=limit, predictions=history_items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve history: {str(e)}")


@router.get("/statistics/summary")
async def get_prediction_statistics(db: Session = Depends(get_db)):
    try:
        stats = get_statistics(db)
        return {"statistics": stats, "timestamp": "now"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve statistics: {str(e)}")


@router.get("/admin/stats")
async def admin_stats(admin: User = Depends(_require_admin), db: Session = Depends(get_db)):
    """Full stats for admin dashboard."""
    from datetime import timedelta
    total = db.query(func.count(Prediction.id)).scalar() or 0
    avg_rent = db.query(func.avg(Prediction.predicted_rent_rwf)).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0

    yesterday = __import__('datetime').datetime.utcnow() - timedelta(days=1)
    recent = db.query(func.count(Prediction.id)).filter(Prediction.created_at >= yesterday).scalar() or 0

    by_district = db.query(Prediction.district, func.count(Prediction.id)).group_by(Prediction.district).all()
    by_type = db.query(Prediction.house_type, func.count(Prediction.id)).group_by(Prediction.house_type).all()

    # Monthly trend (last 6 months)
    monthly = db.query(
        func.strftime('%Y-%m', Prediction.created_at).label('month'),
        func.count(Prediction.id).label('count'),
        func.avg(Prediction.predicted_rent_rwf).label('avg_rent')
    ).group_by('month').order_by('month').limit(6).all()

    return {
        "total_predictions": total,
        "average_rent_rwf": round(avg_rent, 0),
        "total_users": total_users,
        "active_users": active_users,
        "predictions_last_24h": recent,
        "by_district": {d: c for d, c in by_district},
        "by_house_type": {t: c for t, c in by_type},
        "monthly_trend": [{"month": m, "count": c, "avg_rent": round(r or 0, 0)} for m, c, r in monthly],
    }


@router.get("/export/csv")
async def export_history_csv(admin: User = Depends(_require_admin), db: Session = Depends(get_db)):
    """Export all predictions as CSV — admin only."""
    predictions = db.query(Prediction).order_by(Prediction.created_at.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "user_id", "district", "sector", "house_type", "num_bedrooms",
                     "floor_area_sqm", "urban_rural", "predicted_rent_rwf",
                     "predicted_rent_usd", "r2_score", "created_at"])
    for p in predictions:
        writer.writerow([p.id, p.user_id, p.district, p.sector, p.house_type,
                         p.num_bedrooms, p.floor_area_sqm, p.urban_rural,
                         p.predicted_rent_rwf, p.predicted_rent_usd,
                         p.r2_score, p.created_at])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=predictions_export.csv"}
    )


@router.get("/{prediction_id}")
async def get_prediction_detail(prediction_id: str, db: Session = Depends(get_db)):
    prediction = get_prediction_by_id(db, prediction_id)
    if not prediction:
        raise HTTPException(status_code=404, detail=f"Prediction {prediction_id} not found")
    return {
        "id": prediction.id,
        "input_features": prediction.input_features,
        "predicted_rent_rwf": prediction.predicted_rent_rwf,
        "predicted_rent_usd": prediction.predicted_rent_usd,
        "confidence_range": {"low": prediction.confidence_low, "high": prediction.confidence_high},
        "model_name": prediction.model_name,
        "r2_score": prediction.r2_score,
        "shap_explanations": prediction.shap_explanations,
        "created_at": prediction.created_at,
    }


@router.delete("/clear")
async def clear_history(
    confirm: bool = Query(False),
    admin: User = Depends(_require_admin),
    db: Session = Depends(get_db)
):
    if not confirm:
        raise HTTPException(status_code=400, detail="Must set confirm=true")
    count = db.query(Prediction).count()
    db.query(Prediction).delete()
    db.commit()
    return {"message": f"Deleted {count} prediction records", "count": count}
