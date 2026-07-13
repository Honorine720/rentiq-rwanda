"""
Prediction Route for RentIQ Rwanda API
Handles POST /api/predict endpoint
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
import sys
from pathlib import Path
from typing import Optional
from jose import jwt, JWTError
import os

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent.parent))

from app.models.schemas import (
    PredictionRequest, 
    PredictionResponse, 
    ErrorResponse,
    prediction_request_to_dict,
    ConfidenceRange,
    ShapExplanation
)
from app.models.database import get_db, create_prediction_record
from app.ml.predict import get_predictor

# Create router
router = APIRouter(prefix="/api", tags=["Prediction"])

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "rentiq-rwanda-secret-change-in-prod")
ALGORITHM = "HS256"


def _get_user_id(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """Extract user_id from Bearer token if present."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        payload = jwt.decode(authorization.split(" ", 1)[1], SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


@router.post(
    "/predict",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict house rent price",
    description="Predict monthly rent price for a property in Rwanda with SHAP-based explanations",
    responses={
        200: {
            "description": "Successful prediction with explanations",
            "model": PredictionResponse
        },
        400: {
            "description": "Invalid input data",
            "model": ErrorResponse
        },
        422: {
            "description": "Validation error",
            "model": ErrorResponse
        },
        500: {
            "description": "Internal server error",
            "model": ErrorResponse
        },
        503: {
            "description": "Model not available",
            "model": ErrorResponse
        }
    }
)
async def predict_rent(
    request: PredictionRequest,
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(_get_user_id)
):
    """
    **Predict monthly rent price for a property in Rwanda**
    
    This endpoint takes property characteristics and returns:
    - Predicted monthly rent in RWF and USD
    - Confidence interval (68% range)
    - Top 5 features influencing the price (SHAP values)
    - Model accuracy metrics
    
    **Input validation:**
    - All 18 features are required
    - Numerical values must be within realistic ranges
    - Categorical values must match Rwanda administrative divisions
    
    **Example use case:**
    A landlord in Nyamasheke wants to know fair rent for a 2-bedroom
    brick house with electricity and water, located 5km from town.
    """
    try:
        # Convert Pydantic model to dict
        input_data = prediction_request_to_dict(request)
        
        # Get predictor instance
        pred = get_predictor()
        if pred is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={"error": "Model not available", "code": 503, "detail": "ML model failed to load"}
            )
        
        # Make prediction
        result = pred.predict(input_data)
        
        # Generate unique prediction ID
        prediction_id = str(uuid.uuid4())
        
        # Add prediction ID and timestamp
        result['prediction_id'] = prediction_id
        result['timestamp'] = datetime.utcnow()
        
        # Convert SHAP explanations to Pydantic models
        shap_explanations = [
            ShapExplanation(**exp) for exp in result['shap_explanations']
        ]
        
        # Build response
        response = PredictionResponse(
            predicted_rent_rwf=result['predicted_rent_rwf'],
            predicted_rent_usd=result['predicted_rent_usd'],
            confidence_range=ConfidenceRange(
                low=result['confidence_range']['low'],
                high=result['confidence_range']['high']
            ),
            model_used=result['model_name'],
            r2_score=result['model_r2_score'],
            shap_explanations=shap_explanations,
            prediction_id=prediction_id,
            timestamp=result['timestamp']
        )
        
        # Log prediction to database
        try:
            create_prediction_record(db, input_data, result, user_id=user_id)
        except Exception as db_error:
            # Don't fail the request if database logging fails
            print(f"Warning: Failed to log prediction to database: {db_error}")
        
        return response
        
    except ValueError as e:
        # Input validation errors
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Invalid input data",
                "code": 400,
                "detail": str(e)
            }
        )
    
    except Exception as e:
        # Unexpected errors
        print(f"Prediction error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Prediction failed",
                "code": 500,
                "detail": str(e)
            }
        )


@router.post(
    "/predict/batch",
    summary="Batch predict multiple properties",
    description="Predict rent prices for multiple properties in a single request",
    status_code=status.HTTP_200_OK
)
async def batch_predict(
    requests: list[PredictionRequest],
    db: Session = Depends(get_db)
):
    """
    **Batch prediction endpoint**
    
    Predict rent prices for multiple properties at once.
    Useful for:
    - Real estate agencies evaluating multiple properties
    - Researchers analyzing market trends
    - Bulk data processing
    
    Returns a list of predictions, one for each input property.
    If any prediction fails, it returns an error object for that item.
    """
    if len(requests) > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Too many requests",
                "code": 400,
                "detail": "Maximum 100 properties per batch request"
            }
        )
    
    results = []
    
    for req in requests:
        try:
            # Reuse single prediction logic
            result = await predict_rent(req, db)
            results.append(result)
        except HTTPException as e:
            # Include error in results instead of failing entire batch
            results.append({
                "error": e.detail,
                "status_code": e.status_code
            })
    
    return {
        "total": len(requests),
        "successful": len([r for r in results if not isinstance(r, dict) or "error" not in r]),
        "failed": len([r for r in results if isinstance(r, dict) and "error" in r]),
        "results": results
    }


@router.get(
    "/predict/examples",
    summary="Get example prediction inputs",
    description="Returns example property configurations for testing",
    status_code=status.HTTP_200_OK
)
async def get_prediction_examples():
    """
    **Get example prediction inputs**
    
    Returns pre-configured property examples representing different
    market segments in Rwanda:
    - Rural basic housing
    - Peri-urban moderate housing
    - Urban quality housing
    - Premium Kigali apartment
    """
    examples = [
        {
            "name": "Rural Nyamasheke - Basic",
            "description": "Simple mud brick house in rural area",
            "data": {
                "district": "Nyamasheke",
                "sector": "Mahembe",
                "house_type": "standalone",
                "num_bedrooms": 1,
                "num_rooms_total": 3,
                "floor_area_sqm": 35.0,
                "wall_material": "mud_brick",
                "floor_material": "earth",
                "roof_material": "iron_sheet",
                "has_electricity": 0,
                "has_piped_water": 0,
                "has_indoor_toilet": 0,
                "has_kitchen": 1,
                "has_parking": 0,
                "distance_to_town_km": 15.0,
                "road_access": "footpath",
                "is_near_lake": 0,
                "urban_rural": "rural"
            }
        },
        {
            "name": "Peri-urban Nyamasheke - Moderate",
            "description": "Brick house with basic utilities",
            "data": {
                "district": "Nyamasheke",
                "sector": "Kagano",
                "house_type": "standalone",
                "num_bedrooms": 2,
                "num_rooms_total": 5,
                "floor_area_sqm": 65.0,
                "wall_material": "brick",
                "floor_material": "cement",
                "roof_material": "iron_sheet",
                "has_electricity": 1,
                "has_piped_water": 0,
                "has_indoor_toilet": 1,
                "has_kitchen": 1,
                "has_parking": 0,
                "distance_to_town_km": 4.5,
                "road_access": "murram",
                "is_near_lake": 1,
                "urban_rural": "peri_urban"
            }
        },
        {
            "name": "Urban Musanze - Quality",
            "description": "Modern house with all amenities",
            "data": {
                "district": "Musanze",
                "sector": "Muhoza",
                "house_type": "standalone",
                "num_bedrooms": 3,
                "num_rooms_total": 7,
                "floor_area_sqm": 110.0,
                "wall_material": "concrete",
                "floor_material": "tiles",
                "roof_material": "tiles",
                "has_electricity": 1,
                "has_piped_water": 1,
                "has_indoor_toilet": 1,
                "has_kitchen": 1,
                "has_parking": 1,
                "distance_to_town_km": 1.5,
                "road_access": "tarmac",
                "is_near_lake": 0,
                "urban_rural": "urban"
            }
        },
        {
            "name": "Kigali - Premium Apartment",
            "description": "Modern apartment in capital city",
            "data": {
                "district": "Kigali",
                "sector": "Kimironko",
                "house_type": "apartment",
                "num_bedrooms": 4,
                "num_rooms_total": 8,
                "floor_area_sqm": 140.0,
                "wall_material": "concrete",
                "floor_material": "tiles",
                "roof_material": "concrete",
                "has_electricity": 1,
                "has_piped_water": 1,
                "has_indoor_toilet": 1,
                "has_kitchen": 1,
                "has_parking": 1,
                "distance_to_town_km": 0.8,
                "road_access": "tarmac",
                "is_near_lake": 0,
                "urban_rural": "urban"
            }
        }
    ]
    
    return {
        "examples": examples,
        "usage": "Copy the 'data' field and POST to /api/predict"
    }
