"""
History and Statistics Routes for RentIQ Rwanda
Handles prediction history retrieval and analytics
"""
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.models.database import (
    get_db, get_prediction_history, get_prediction_by_id,
    get_statistics, export_predictions_to_csv
)
from app.models.schemas import PredictionHistoryResponse, PredictionHistoryItem

router = APIRouter(prefix="/api/history", tags=["History"])


@router.get(
    "",
    response_model=PredictionHistoryResponse,
    summary="Get prediction history",
    description="Retrieve historical predictions with optional filtering"
)
async def get_history(
    limit: int = Query(20, ge=1, le=100, description="Number of records to return"),
    skip: int = Query(0, ge=0, description="Number of records to skip (pagination)"),
    district: Optional[str] = Query(None, description="Filter by district"),
    db: Session = Depends(get_db)
):
    """
    **Get prediction history**
    
    Returns a list of past predictions with filtering and pagination support.
    
    **Use cases:**
    - Track pricing trends over time
    - Analyze predictions by district
    - Export data for reporting
    
    **Pagination:**
    - Use `skip` and `limit` for pagination
    - Example: skip=0, limit=20 (first page)
    - Example: skip=20, limit=20 (second page)
    """
    try:
        predictions, total = get_prediction_history(
            db=db,
            limit=limit,
            district=district,
            skip=skip
        )
        
        # Convert to response format
        history_items = [
            PredictionHistoryItem(
                id=p.id,
                district=p.district,
                sector=p.sector,
                num_bedrooms=p.num_bedrooms,
                floor_area_sqm=p.floor_area_sqm,
                predicted_rent_rwf=p.predicted_rent_rwf,
                r2_score=p.r2_score,
                created_at=p.created_at
            )
            for p in predictions
        ]
        
        return PredictionHistoryResponse(
            total=total,
            limit=limit,
            predictions=history_items
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve history: {str(e)}"
        )


@router.get(
    "/{prediction_id}",
    summary="Get specific prediction",
    description="Retrieve a single prediction by ID with full details"
)
async def get_prediction_detail(
    prediction_id: str,
    db: Session = Depends(get_db)
):
    """
    **Get prediction details by ID**
    
    Returns the complete prediction record including:
    - All input features
    - Predicted rent (RWF and USD)
    - Confidence interval
    - SHAP explanations
    - Model metadata
    """
    prediction = get_prediction_by_id(db, prediction_id)
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction with ID {prediction_id} not found"
        )
    
    return {
        "id": prediction.id,
        "input_features": prediction.input_features,
        "predicted_rent_rwf": prediction.predicted_rent_rwf,
        "predicted_rent_usd": prediction.predicted_rent_usd,
        "confidence_range": {
            "low": prediction.confidence_low,
            "high": prediction.confidence_high
        },
        "model_name": prediction.model_name,
        "r2_score": prediction.r2_score,
        "shap_explanations": prediction.shap_explanations,
        "created_at": prediction.created_at
    }


@router.get(
    "/statistics/summary",
    summary="Get prediction statistics",
    description="Get aggregate statistics about stored predictions"
)
async def get_prediction_statistics(db: Session = Depends(get_db)):
    """
    **Get prediction statistics**
    
    Returns aggregate metrics:
    - Total number of predictions
    - Average predicted rent
    - Predictions by district
    - Recent activity (last 24 hours)
    
    Useful for:
    - Dashboard analytics
    - Market trend analysis
    - System health monitoring
    """
    try:
        stats = get_statistics(db)
        return {
            "statistics": stats,
            "timestamp": "now"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve statistics: {str(e)}"
        )


@router.get(
    "/export/csv",
    summary="Export predictions to CSV",
    description="Export all predictions to CSV file for analysis"
)
async def export_history_csv(db: Session = Depends(get_db)):
    """
    **Export predictions to CSV**
    
    Generates a CSV file containing all predictions.
    Useful for:
    - Model retraining with real data
    - External analytics
    - Reporting to stakeholders
    
    The CSV includes all input features and predictions.
    """
    try:
        output_path = './data/predictions_export.csv'
        export_predictions_to_csv(db, output_path)
        
        return {
            "message": "Export successful",
            "file_path": output_path,
            "format": "CSV"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export data: {str(e)}"
        )


@router.delete(
    "/clear",
    summary="Clear prediction history (Admin)",
    description="Delete all prediction records - USE WITH CAUTION"
)
async def clear_history(
    confirm: bool = Query(False, description="Must be true to confirm deletion"),
    db: Session = Depends(get_db)
):
    """
    **Clear all prediction history**
    
    ⚠️ WARNING: This permanently deletes all prediction records.
    
    Requires `confirm=true` query parameter to prevent accidental deletion.
    
    Use case: Clean up test data before production deployment
    """
    if not confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must set confirm=true to delete history"
        )
    
    try:
        from app.models.database import Prediction
        
        count = db.query(Prediction).count()
        db.query(Prediction).delete()
        db.commit()
        
        return {
            "message": f"Deleted {count} prediction records",
            "count": count
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear history: {str(e)}"
        )
